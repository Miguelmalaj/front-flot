import React, { useRef, Component, useState } from "react"

import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { axiosDeleteServide, axiosPostService, axiosPatchService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { ApiUrl } from '../../../../services/ApiRest';
import { isDefaultDate, validarFecha } from "../../../../helpers/fecha";
import { upperCase } from "../../../../helpers/converToUpperCase";

class TablaReferencias extends Component {
    render() {
        const data = this.props.data;
        return (
            <table className='table display compact heightTable' style={{width:'2906px', tableLayout:'fixed'}}>
                <thead style={{position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white', fontSize:11}}>
                    <tr className="text-center">
                        <th className='noselect' style={{width:'153.8px'}}>#</th>     
                        <th style={{width:'153.8px'}}>VIN</th>     
                        <th className='noselect' style={{width:'253.8px'}}>Cliente</th>     
                        <th className='noselect' style={{width:'353.8px'}}>Distribuidor</th>     
                        <th className='noselect' style={{width:'153.8px'}}>Marca</th>     
                        <th className='noselect' style={{width:'353.8px'}}>Unidad</th>     
                        <th className='noselect' style={{width:'153px'}}>Paquete</th>     
                        <th className='noselect' style={{width:'253px'}}>Modelo</th>     
                        <th className='noselect' style={{width:'153.8px'}}>No. Factura</th>     
                        <th className='noselect' style={{width:'153.8px'}}>Precio Factura</th>     
                        <th className='noselect' style={{width:'153.8px'}}>Orden Compra</th>
                        <th className='noselect' style={{width:'153.8px'}}>Firma Contrato</th>          
                        <th className='noselect' style={{width:'253.8px'}}>Referencia</th>
                        <th className='noselect' style={{width:'153.8px'}}>Porcentaje Enganche</th>     
                        <th className='noselect' style={{width:'153.8px'}}>Inversión Inicial</th>       
                        <th className='noselect' style={{width:'153.8px'}}>Monto a Financiar</th>     
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
                                    <td className='noselect'>{ upperCase( registro.Nombre_cliente ) }</td>
                                    <td className='noselect'>CULIACAN MOTORS SA DE CV</td>
                                    <td className='noselect'>{ upperCase( registro.Marca ) }</td>
                                    <td className='noselect'>{ upperCase( registro.Unidad ) }</td>
                                    <td className='noselect'>{ upperCase( registro.Paquete ) }</td>
                                    <td className='noselect'>{ upperCase( registro.Modelo ) }</td>
                                    <td className='noselect'>{ upperCase( registro.Numero_factura ) }</td>
                                    <td className='noselect'>{new Intl.NumberFormat('es-MX').format(registro.Precio_factura)}</td>
                                    <td className='noselect'>{ upperCase( registro.Orden_compra ) }</td>
                                    <td className='noselect'>{ validarFecha(isDefaultDate(registro.Fecha_firma_contrato)) }</td>
                                    <td className='noselect'>{ upperCase( registro.Referencia ) }</td>
                                    <td className='noselect'>{registro.Tasa_porcentaje_enganche}</td>
                                    <td className='noselect'>{new Intl.NumberFormat('es-MX').format(registro.Inversion_inicial)}</td>
                                    <td className='noselect'>{new Intl.NumberFormat('es-MX').format(registro.Monto_total)}</td>
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

export const VistaPreviaReferencias = ({ 
    agencia, 
    data, 
    isShowedTable, 
    handleStateButtonUpdateLote,
    isActiveButtonActualizar,
    isActiveButtonExcel }) => {
    
    const tableRef = useRef();
    let url = '';
    
    const onUpdateLote = async() => {
        url = ApiUrl + "api/referencia/updatelotecliente"
        const body = { agencia: agencia, lote: data }
        const updateLotePromise = await axiosPatchService( url, body );

        if ( updateLotePromise.isUpdated ) {
            toast('Las Referencias han sido actualizadas con éxito.')
            handleStateButtonUpdateLote();
        }
        
    }

    const dataExcelFile = () => {
        const selectFieldsdata = data.map((row) => {
            let newRow = {
                "Cliente"            : row.Nombre_cliente,
                "Distribuidor"       : 'CULIACAN MOTORS SA DE CV',
                "Marca"              : row.Marca,
                "Unidad"             : row.Unidad,
                "Paquete"            : row.Paquete,
                "Modelo"             : row.Modelo,
                "Serie"              : row.VIN,
                "No. Factura"        : row.Numero_factura,
                "Precio Factura"     : row.Precio_factura,
                "Orden Compra"       : row.Orden_compra,
                "Fecha Firma"        : validarFecha(isDefaultDate(row.Fecha_firma_contrato)),
                "Referencia"         : row.Referencia,
                "% Enganche"         : row.Tasa_porcentaje_enganche,
                "Monto Total"        : row.Monto_total,
                "Inversión Inicial"  : row.Inversion_inicial,
            }
            return newRow;
        })

        return selectFieldsdata;
    }

    const onExportToExcel = () => {
        const dataExcel = dataExcelFile();
        const Header = ["Cliente", "Distribuidor", "Marca", "Unidad", "Paquete", "Modelo", "Serie", "No. Factura", "Precio Factura", "Orden Compra", "Fecha Firma", "Referencia", "% Enganche", "Monto Total", "Inversión Inicial"]
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
                <TablaReferencias data={data} ref={tableRef}/>
            </div>
            <button
                className="btn btn-info mt-2 mb-2 ml-2"
                disabled={!isActiveButtonActualizar}
                onClick={onUpdateLote}
                type="button"
            >
                Actualizar
            </button>
            <button
                className="btn btn-outline-success mt-2 mb-2 ml-2"
                disabled={!isActiveButtonExcel}
                onClick={onExportToExcel}
                title="Exportar a Excel"
                type="button"
            >
                <FontAwesomeIcon icon={faFileExcel} />
                <small className="ml-2">Excel</small>
            </button>
        </div>
    )
}