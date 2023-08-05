import React, { useRef, Component, useEffect, useState } from "react"
import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { axiosPatchService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { ApiUrl } from '../../../../services/ApiRest';
import { invertirCadenaFecha, FechaDeHoyYYMMDD, validarFecha, isDefaultDate } from "../../../../helpers/fecha";
import { removerComas } from "../../../../helpers/formatoMoneda";
import { upperCase } from "../../../../helpers/converToUpperCase";

class TablaFolioCompra extends Component {
    render() {
        const data = this.props.data;
        return (
            <table className='table display compact heightTable' style={{width:'2787px', fontSize:11}}>
                <thead style={{position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white'}}>
                    <tr className="text-center">
                        <th className='noselect' style={{width:'100.6px'}}>#</th>     
                        <th className='noselect' style={{width:'117.6px'}}>VIN</th>     
                        <th className='noselect' style={{width:'207.6px'}}>Cliente</th>  
                        <th className='noselect' style={{width:'307px'}}>Distribuidor</th>    
                        <th className='noselect' style={{width:'117.6px'}}>Marca</th>     
                        <th className='noselect' style={{width:'234.6px'}}>Unidad</th>     
                        <th className='noselect' style={{width:'234px'}}>Paquete</th>     
                        <th className='noselect' style={{width:'234px'}}>Modelo</th>     
                        <th className='noselect' style={{width:'117.6px'}}>No. Factura</th>     
                        <th className='noselect' style={{width:'117.6px'}}>Precio Factura</th>     
                        <th className='noselect' style={{width:'117.6px'}}>Orden Compra</th>     
                        <th className='noselect' style={{width:'157.6px'}}>Referencia</th>
                        <th className='noselect' style={{width:'117.6px'}}>Firma Contrato</th>

                        <th className='noselect' style={{width:'197.6px'}}>Compra Contrato</th>
                        <th className='noselect' style={{width:'117.6px'}}>Fecha Compra</th>
                        <th className='noselect' style={{width:'157.6px'}}>Plan Piso</th>
                        <th className='noselect' style={{width:'157.6px'}}>Cuenta Cheques</th>
                        <th className='noselect' style={{width:'117.6px'}}>Porcentaje Enganche</th> {/* Tasa */}
                        <th className='noselect' style={{width:'117.6px'}}>Inversión Inicial</th>
                        <th className='noselect' style={{width:'117.6px'}}>Monto a Financiar</th>
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                {
                    data.length > 0 ?
                        data.map((registro, index) => {
                            return (
                                <tr className='text-center'>
                                  <td className='noselect'>{ index + 1 }</td>
                                  <td>{registro.VIN}</td>
                                  <td className='noselect'>{ upperCase( registro.Nombre_cliente ) }</td>
                                  <td>CULIACAN MOTORS SA DE CV</td>
                                  <td className='noselect'>{ upperCase( registro.Marca ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Unidad ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Paquete ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Modelo ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Numero_factura ) }</td>
                                  <td className='noselect'>{new Intl.NumberFormat('es-MX').format(registro.Precio_factura)}</td>
                                  <td className='noselect'>{ upperCase( registro.Orden_compra ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Referencia ) }</td>
                                  <td className='noselect'>{ validarFecha(isDefaultDate(registro.Fecha_firma_contrato)) }</td>

                                  <td className='noselect'>{ upperCase( registro.Folio_compra_contrato ) }</td>
                                  <td className='noselect'>{invertirCadenaFecha(registro.Fecha_compra_contrato.substring(0,10))}</td>
                                  <td className='noselect'>{registro.Monto_plan_piso}</td>
                                  <td className='noselect'>{registro.Monto_deposito_cuenta_cheques}</td>
                                  <td className='noselect'>{registro.Tasa_porcentaje_enganche}</td>
                                  <td className='noselect'>{registro.Inversion_inicial}</td>
                                  <td className='noselect'>{registro.Monto_total}</td>
                                </tr>
                            )
                        })
                        :
                        ""
                }
                </tbody>
            </table>
        )
    }
}

export const VistaPreviaFolioCompra = ({
    agencia, 
    data, 
    isShowedTable, 
    handleStateButtonUpdateLote,
    isActiveButtonActualizar,
    isActiveButtonExcel }) => {

    // const [isActiveButtonUpdate, setIsActiveButtonUpdate] = useState(true)
    const tableRef = useRef();
    let url = '';
    // const YYMMDD = FechaDeHoyYYMMDD()

    /* useEffect(() => {
      if ( isShowedTable ) {
        const isFolioCompraEmpty = data.find(row => (row.Folio_compra_contrato === "" && row.Fecha_compra_contrato.substring(0,10) !== YYMMDD));
        if ( isFolioCompraEmpty !== undefined ){
            if ( isActiveButtonUpdate ) setIsActiveButtonUpdate(false)
            toast("El campo Folio Compra Contrato se encuentra vacío")
            return;
        }
        if (!isActiveButtonUpdate) setIsActiveButtonUpdate(true)
      }
      
    }, [isShowedTable]) */
    

    const onUpdateLote = async() => {
        url = ApiUrl + "api/foliocompra/updatelotecliente"
        const body = { agencia: agencia, lote: data }
        const updateLotePromise = await axiosPatchService( url, body )
        if ( updateLotePromise.isUpdated ) {
            toast("El lote ha sido actualizado con éxito.");
            handleStateButtonUpdateLote();
            // onExportToExcel();
        }
    }

    const dataExcelFile = () => {
        const selectFieldsdata = data.map((row) => {
            let newRow = {
                "Cliente"             : row.Nombre_cliente,
                "Distribuidor"        : 'CULIACAN MOTORS SA DE CV',
                "Marca"               : row.Marca,
                "Unidad"              : row.Unidad,
                "Paquete"             : row.Paquete,
                "Modelo"              : row.Modelo,
                "Serie"               : row.VIN,
                "No. Factura"         : row.Numero_factura,
                "Precio Factura"      : row.Precio_factura,
                "Orden Compra"        : row.Orden_compra,
                "Referencia"          : row.Referencia,
                "Compra Contrato"     : row.Folio_compra_contrato, //done
                "Fecha Compra"        : invertirCadenaFecha(row.Fecha_compra_contrato),
                "Plan Piso"           : removerComas(row.Monto_plan_piso),
                "Cuenta Cheques"      : removerComas(row.Monto_deposito_cuenta_cheques),
                "Porcentaje Enganche" : row.Tasa_porcentaje_enganche, /* Tasa  */
                "Inversion Inicial"   : removerComas(row.Inversion_inicial),
                "Monto a Financiar"   : removerComas(row.Monto_total)
            }
            return newRow;
        })

        return selectFieldsdata;
    }

    const onExportToExcel = () => {
        const dataExcel = dataExcelFile();
        const Header = [
            "Cliente", 
            "Distribuidor", 
            "Marca", 
            "Unidad", 
            "Paquete", 
            "Modelo", 
            "Serie", 
            "No. Factura", 
            "Precio Factura", 
            "Orden Compra", 
            "Referencia", 
            "Compra Contrato", 
            "Fecha Compra", 
            "Plan Piso", 
            "Cuenta Cheques", 
            "Porcentaje Enganche", 
            "Inversion Inicial", 
            "Monto a Financiar",
        ]
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
            <div className='row pl-2 table-responsive'>
                <TablaFolioCompra data={data} ref={tableRef}/>
            </div>
            <button
                // disabled={!isActiveButtonUpdate || !isActiveButtonActualizar}
                className="btn btn-info mt-2 mb-2 ml-2"
                disabled={ !isActiveButtonActualizar }
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
                <small className="ml-2">
                    Excel
                </small>
            </button>
        </div>
    )
        
}