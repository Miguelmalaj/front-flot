import React, { useRef, Component, useState } from 'react'

import { useReactToPrint } from 'react-to-print';
import * as XLSX from "xlsx"
import { toast } from "react-toastify"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faPrint } from '@fortawesome/free-solid-svg-icons';
import { invertirCadenaFecha, isDefaultDate, validarFecha } from '../../../../helpers/fecha';
import { upperCase } from '../../../../helpers/converToUpperCase';
import { ValidTwoDecimals } from '../../../../helpers/formatoMoneda';
// import '../../../../css/asignacionContratos/asignacionContratos.css'

class SummaryTable extends Component {
    render() {
        const data = this.props.data;
        const color = this.props.colorHeader;
        return (
            <div className='mr-2'>
            <table className='table display compact'>
                <thead style={{backgroundColor:'#1565C0', color:`${color}`}}>
                    <tr className='text-center' style={{ fontSize: "12px" }}>
                        <th className='noselect'>Cliente</th>     
                        <th className='noselect'>Marca</th>     
                        <th className='noselect'>Unidad</th>     
                        <th className='noselect'>Paquete</th>     
                        <th className='noselect'>Modelo</th>     
                        <th>Serie</th>     
                        <th className='noselect'>No. Factura</th>     
                        <th className='noselect text-right'>Precio Factura</th>     
                        <th className='noselect'>Orden Compra</th>     
                        <th className='noselect'>Referencia</th>
                        <th className='noselect'>Firma Contrato</th>
                        <th className='noselect'>Compra Contrato</th>
                        <th className='noselect'>Fecha Compra</th>
                        <th className='noselect'>Plan Piso</th>
                        <th className='noselect'>Cuenta Cheques</th>
                        <th className='noselect'>Porcentaje Enganche</th> {/*  Tasa */}
                        <th className='noselect'>Inversión Inicial</th>
                        <th className='noselect'>Monto a Financiar</th>
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                    {
                        data.length > 0 ?
                        data.map((registro) => {
                            return (
                                <tr className='text-center' style={{ fontSize: "12px" }}>
                                  <td className='noselect'>{ upperCase( registro.Nombre_cliente ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Marca ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Unidad ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Paquete ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Modelo ) }</td>
                                  <td>{registro.VIN}</td>
                                  <td className='noselect'>{ upperCase( registro.Numero_factura ) }</td>
                                  <td className='noselect text-right'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Precio_factura) ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Orden_compra ) }</td>
                                  <td className='noselect'>{ upperCase( registro.Referencia ) }</td>
                                  <td className='noselect'>{validarFecha(isDefaultDate(registro.Fecha_firma_contrato))}</td>
                                  <td className='noselect'>{ upperCase( registro.Folio_compra_contrato ) }</td>
                                  <td className='noselect'>{invertirCadenaFecha(registro.Fecha_compra_contrato.substring(0,10))}</td>
                                  <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Monto_plan_piso) ) }</td>
                                  <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Monto_deposito_cuenta_cheques) ) }</td>
                                  <td className='noselect'>{registro.Tasa_porcentaje_enganche}</td>
                                  <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Inversion_inicial) ) }</td>
                                  <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Monto_total) ) }</td>
                                </tr>
                            )
                        })
                        :
                        ""
                    }
                </tbody>
            </table>
            </div>
        );
    }
}

class SummaryTableToPrint extends Component {
    render() {
        const data = this.props.data;
        const color = this.props.colorHeader;
        return (
            <div className='m-2 p-2'> {/* mr-2 paddings*/}
            <table className='table display compact' style={{width:'100%'}}>
                <thead style={{backgroundColor:'#1565C0', color:`${color}`}}>
                    <tr className='text-center' style={{ fontSize: "7px" }}>
                        <th style={{width:'5%'}}>Cliente</th>     
                        <th style={{width:'5%'}}>Marca</th>     
                        <th style={{width:'5%'}}>Unidad</th>     
                        <th style={{width:'5%'}}>Paquete</th>     
                        <th style={{width:'5%'}}>Modelo</th>     
                        <th style={{width:'5%'}}>Serie</th>     
                        <th style={{width:'5%'}}>No. Factura</th>     
                        <th style={{width:'5%'}}>Precio Factura</th>     
                        <th style={{width:'5%'}}>Orden Compra</th>     
                        <th style={{width:'5%'}}>Referencia</th>
                        <th style={{width:'5%'}}>Firma Contrato</th>
                        <th style={{width:'5%'}}>Compra Contrato</th>
                        <th style={{width:'10%'}}>Fecha Compra</th>
                        <th style={{width:'5%'}}>Plan Piso</th>
                        <th style={{width:'5%'}}>Cuenta Cheques</th>
                        <th style={{width:'5%'}}>Porcentaje Enganche</th> {/* Tasa */}
                        <th style={{width:'5%'}}>Inversión Inicial</th>
                        <th style={{width:'5%'}}>Monto a Financiar</th>
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                    {
                        data.length > 0 ?
                        data.map((registro) => {
                            return (
                                <tr className='text-center' style={{ fontSize: "6px" }}>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Nombre_cliente ) }</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Marca ) }</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Unidad ) }</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Paquete ) }</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Modelo ) }</td>
                                  <td style={{width:'5%'}}>{registro.VIN}</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Numero_factura ) }</td>
                                  <td style={{width:'5%'}}>{registro.Precio_factura}</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Orden_compra ) }</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Referencia )}</td>
                                  <td style={{width:'5%'}}>{validarFecha(isDefaultDate(registro.Fecha_firma_contrato))}</td>
                                  <td style={{width:'5%'}}>{ upperCase( registro.Folio_compra_contrato ) }</td>
                                  <td style={{width:'10%'}}>{invertirCadenaFecha(registro.Fecha_compra_contrato.substring(0,10))}</td>
                                  <td style={{width:'5%'}}>{registro.Monto_plan_piso}</td>
                                  <td style={{width:'5%'}}>{registro.Monto_deposito_cuenta_cheques}</td>
                                  <td style={{width:'5%'}}>{registro.Tasa_porcentaje_enganche}</td>
                                  <td style={{width:'5%'}}>{registro.Inversion_inicial}</td>
                                  <td style={{width:'5%'}}>{registro.Monto_total}</td>
                                </tr>
                            )
                        })
                        :
                        ""
                    }
                </tbody>
            </table>
            </div>
        );
    }
}

export const ResumenDeContratosTable = ({ data }) => {
    const [colorHeader, setColorHeader] = useState("white")
    const tableRef = useRef();
    let t;

    const dataExcelFile = () => {
        const selectFieldsData = data.map((row) => {
            let newRow = {
                "Cliente": row.Nombre_cliente,
                "Distribuidor"        : 'CULIACAN MOTORS SA DE CV',
                "Marca"  : row.Marca,
                "Unidad"   : row.Unidad,
                "Paquete"             : row.Paquete,
                "Modelo"              : row.Modelo,
                "Serie": row.VIN,
                "No. Factura": row.Numero_factura,
                "Precio Factura": row.Precio_factura,
                "Orden Compra": row.Orden_compra,
                "Referencia": row.Referencia,
                "Compra Contrato": row.Folio_compra_contrato,
                "Fecha Compra": invertirCadenaFecha(row.Fecha_compra_contrato),
                "Plan Piso": row.Monto_plan_piso,
                "Cuenta Cheques": row.Monto_deposito_cuenta_cheques,
                "Porcentaje Enganche": row.Tasa_porcentaje_enganche,
                "Inversion Inicial": row.Inversion_inicial,
                "Monto a Financiar": row.Monto_total,
            }
            return newRow;
        })
        return selectFieldsData;
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
        ];
        const fileName = "Resumen Contrato";
        const fileNameExtension = "Resumen_Contrato.xlsx";
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])
        XLSX.utils.sheet_add_json(ws, dataExcel, {
            header: Header,
            skipHeader: false,
        })

        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, fileNameExtension)
    }

    const handlePrint = useReactToPrint({
        content: () => tableRef.current
    })

    const changeHeaderColor = () => {
        setColorHeader("black");
        clearTimeout(t);
        t = setTimeout(imprimir, 500);
    }

    const imprimir = () => {
        handlePrint();
        setColorHeader("white");
    }

    return (
        <>
            <div className=' table-responsive'> {/* row m-2 */}
        
                <SummaryTable data={data} colorHeader={colorHeader}/> 
                <style type="text/css" media="print">{"\
                    @page {\ size: landscape; margin: 4 0 14 0 !important;\ }\
                "}<SummaryTableToPrint data={data} ref={tableRef} colorHeader={colorHeader}/></style>

            </div>

            <div className='row m-2'>

                <button
                    title='Imprimir'
                    type='button'
                    className='btn btn-outline-dark mt-2 mb-2 ml-2'
                    disabled={data.length === 0}
                    onClick={() => { changeHeaderColor(); }} >
                    <FontAwesomeIcon icon={faPrint}/>

                    <small className="ml-2">Imprimir</small>

                </button>

                <button
                    title="Exportar a Excel"
                    type="button"
                    className="btn btn-outline-success mt-2 mb-2 ml-2"
                    onClick={onExportToExcel}
                    disabled={data.length === 0} >

                    <FontAwesomeIcon icon={faFileExcel} />
                    <small className="ml-2">Excel</small>  

                </button>

            </div>
        </>
    )
}
