import React, { useRef, Component, useState } from 'react'

import * as XLSX from "xlsx"
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { axiosDeleteServide, axiosPostService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { ApiUrl } from '../../../../services/ApiRest';
import { isDefaultDate, validarFecha } from '../../../../helpers/fecha';

class TablaLotes extends Component {
    render() {
        const data = this.props.data;
        return (
            <table className='table display compact heightTable' style={{width:'3330px', tableLayout:'fixed'}}>
                <thead style={{ position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white', fontSize:11}}>
                    <tr className='text-center'>
                        <th className='noselect' style={{width:'130px'}}>{`(${data.length})`}</th>
                        <th style={{width:'134px'}}>VIN</th>
                        <th className='noselect' style={{width:'494px'}}>Cliente</th>
                        <th className='noselect' style={{width:'542px'}}>Distribuidor</th>
                        <th className='noselect' style={{width:'134px'}}>Marca</th>
                        <th className='noselect' style={{width:'594px'}}>Unidad</th>
                        <th className='noselect' style={{width:'134px'}}>Paquete</th>
                        <th className='noselect' style={{width:'130px'}}>Modelo</th>
                        <th className='noselect' style={{width:'134px'}}>Orden Compra</th>
                        <th className='noselect' style={{width:'234px'}}>Fecha Firma</th>  
                        <th className='noselect' style={{width:'134px'}}>No. Factura</th>
                        <th className='noselect' style={{width:'134px'}}>Precio Factura</th>
                        {/* <th className='noselect'>Precio Vehículo</th>   */}
                        <th className='noselect' style={{width:'134px'}}>Porcentaje Enganche</th>  
                        <th className='noselect' style={{width:'134px'}}>Inversión Inicial</th>
                        <th className='noselect' style={{width:'134px'}}>Monto a Financiar</th>  
                        {/* <th>Monto Total</th> */}
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0', fontSize:11}}>
                    {
                        data.length > 0 ?
                            data.map((registro, index) => {
                                return (
                                    <tr className='text-center'>
                                        <td className='noselect'>{ index + 1 }</td>
                                        <td>{registro.VIN}</td>
                                        <td className='noselect'>{registro.cliente}</td>
                                        <td className='noselect'>CULIACAN MOTORS SA DE CV</td>
                                        <td className='noselect'>{registro.Marca}</td>
                                        <td className='noselect'>{registro.Vehiculo}</td>
                                        <td className='noselect'>{registro.Paquete}</td>
                                        <td className='noselect'>{registro.Modelo}</td>
                                        <td className='noselect'>{registro.Orden_compra}</td>
                                        <td className='noselect'>{ validarFecha( isDefaultDate(registro.Fecha_firma_contrato) ) }</td>
                                        <td className='noselect'>{registro.Factura}</td>
                                        {/* <td className='noselect'>{new Intl.NumberFormat('es-MX').format(registro.Venta)}</td> */}
                                        <td className='noselect'>{registro.Venta}</td>
                                        <td className='noselect'>{registro.Tasa_porcentaje_enganche}</td>
                                        <td className='noselect'>{registro.Inversion_inicial}</td>
                                        <td className='noselect'>{registro.Monto_total}</td>
                                        {/* <td>{registro.montoTotal}</td> */}
                                    </tr>
                                )
                            })
                            :
                            ""
                    }
                </tbody>
            </table>
        );
    }
}

export const LoteVehiculosTable = ({
    data,
    agencia,
    isShowedTable,
    Folio_lote,
    isEditMode,
    isActiveButtonGuardarLote,
    isActiveButtonActualizarLote,
    handleStateButtonGuardarLote }) => {

    const tableRef = useRef();
    let url = '';

    const dataExcelFile = () => {
        const selectFieldsdata = data.map((row) => {
            let newRow = {
                "Cliente"             : row.cliente,
                "Distribuidor"        : 'CULIACAN MOTORS SA DE CV',
                "Marca"               : row.Marca,
                "Unidad"              : row.Vehiculo,
                "Paquete"             : row.Paquete,
                "Modelo"              : row.Modelo,
                "Serie"               : row.VIN,
                "No. Factura"         : row.Factura,
                "Precio Factura"      : row.Venta,
                "Orden Compra"        : row.Orden_compra,
                "Fecha Firma"         : validarFecha( isDefaultDate(row.Fecha_firma_contrato) ),
                "Porcentaje Enganche" : row.Tasa_porcentaje_enganche,
                "Inversión Inicial"   : row.Inversion_inicial,
                "Monto a Financiar"   : row.Monto_total,
            }
            return newRow;
        })

        return selectFieldsdata;
    }

    const onGuardarLote = async () => {

        if ( isEditMode ) {
            url = ApiUrl + "api/deleteLote"
            const deleteLote = { agencia: agencia, Folio_lote: Folio_lote, data: data }
            const eliminarLote = await axiosDeleteServide( url, deleteLote );
            
            if ( !eliminarLote.isDeleted ) {
                toast('No fue posible actualizar el bloque, favor de volver a intentar.')
                return;
            }

            // bloque actualizado
            let newData = eliminarLote.data;

            url = ApiUrl + "api/updateLote"
            const editLote = { agencia: agencia, lote: newData, Folio_lote: Folio_lote }
            const result = await axiosPostService(url, editLote);
            if (result.isUpdated) {

                toast('El Bloque ha sido actualizado con éxito.')
            }
            if (!result.isUpdated) {
                toast('Error con el servidor, no fue posible actualizar el bloque.')
            }
           
            handleStateButtonGuardarLote(isActiveButtonGuardarLote)

        }

        if ( !isEditMode ) {

            const response = await nameAlreadyExists(data[0].Cliente, data[0].nombreLote);
            if ( response ) {
                toast(`Ya existe un bloque ${data[0].nombreLote}, favor de indicar otro nombre.`)
                return;
            }

            url = ApiUrl + "api/createLote";
            const newLote = { agencia: agencia, lote: data, Folio_lote: Folio_lote }
            const result = await axiosPostService(url, newLote);

            if ( result.length === 0 ) {
                toast('Error al conectar con el servidor.')
                return;
            }

            if ( !result.isLoteCreated ) {
                toast('Error al crear el bloque: Ya existe un nombre de lote idéntico en el sistema.')
                return;
            }

           
            handleStateButtonGuardarLote( isActiveButtonGuardarLote )
            toast('El Bloque ha sido creado con éxito')
        }
    }

    const nameAlreadyExists = async ( NumCliente, NomLote ) => {
        url = ApiUrl + "api/nameAlreadyExists";
        const { message } = await axiosPostService(url,{NumCliente, NomLote});
        return message;

    }

    const onExportToExcel = () => {
        const dataExcel = dataExcelFile();
        const Header = ["Cliente", "Distribuidor", "Marca", "Unidad", "Paquete", "Modelo", "Serie", "No. Factura", "Precio Factura", "Orden Compra", "Fecha Firma", "Porcentaje Enganche", "Inversión Inicial", "Monto a Financiar"] //, "Monto Total"
        const fileName = "Asignación Contrato";
        const fileNameExtension = "Asignacion_Contrato.xlsx";
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])

        XLSX.utils.sheet_add_json(ws, dataExcel, {
            header: Header,
            skipHeader: false,
        })

        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, fileNameExtension)

    }

    return (

        isShowedTable &&
        <div>
            <div className='row m-2'>
                <TablaLotes data={data} ref={tableRef} />
            </div>

            <button
                type='button'
                className='btn btn-info  mt-2 mb-2 ml-2'
                onClick={onGuardarLote}
                disabled={data.length === 0 || (!isActiveButtonGuardarLote && !isEditMode) || (!isActiveButtonActualizarLote && isEditMode)}
            >
                {isEditMode ? 'Actualizar Lote' : 'Guardar Bloque'}
            </button>

            <button
                onClick={onExportToExcel}
                title='Exportar a excel'
                type='button'
                className="btn btn-outline-success mt-2 mb-2 ml-2"
                disabled={data.length === 0 || (isActiveButtonActualizarLote && isEditMode ) || (isActiveButtonGuardarLote && !isEditMode )}
            >
                <FontAwesomeIcon icon={faFileExcel} />
                <small className='ml-2'>Excel</small>
            </button>
        </div>

    )
}
