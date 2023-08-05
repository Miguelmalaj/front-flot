import React, { useRef, Component, useState } from 'react'

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faPrint } from '@fortawesome/free-solid-svg-icons';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from "xlsx"

import { ApiUrl } from '../../../../services/ApiRest';
import { validarFecha, isDefaultDate } from '../../../../helpers/fecha';
import {  axiosPostService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { upperCase } from '../../../../helpers/converToUpperCase';

class TablaResumenToPrint extends Component {
    render() {
        const vinsResumenPrint = this.props.vinsResumenPrint;
        const Cliente = this.props.Cliente;

        return(
            <table style={{fontSize:'11px'}}>
                <thead >
                  <tr className='text-center'>
                    <th>Cliente</th>
                    <th>VIN</th>
                    <th>Folio Desvío</th>
                    <th>Permiso Desvío</th>
                    <th>Folio DPP</th>
                    <th>Fecha Vencimiento Folio Desvío</th>
                    <th>Fecha Vencimiento DPP1</th>
                    <th>Fecha Solicitud DPP2</th>
                    <th>Fecha Vencimiento DPP2</th>
                    <th>Fecha Solicitud Extensión</th>
                    <th>Fecha Vencimiento Extensión</th>
                  </tr>
                </thead>
                <tbody>
                    {
                      vinsResumenPrint.map(( registro ) => {
                        return (
                            <tr className='text-center'>
                                <td>{ upperCase( Cliente ) }</td>
                                <td>{registro.VIN}</td>
                                <td>{ upperCase( registro.FolioDesvio ) }</td>
                                <td>{ upperCase( registro.PermisoDesvio ) }</td>
                                <td>{ upperCase( registro.FolioDPP ) }</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaSolicitudFase2))}</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaVencimientoFase2))}</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaSolicitudExtP))}</td>
                                <td>{validarFecha(isDefaultDate(registro.FechaVencimientoExtP))}</td>
                            </tr>
                        )
                     })   
                    }
                </tbody>
            </table>
        )
    }
}

const TablaResumenGeneral = ({
    handleSelects,
    agencia,
    Cliente
}) => {
    let url = '';
    const tableRef = useRef();
    const [vinsResumenPrint, setvinsResumenPrint] = useState([])
    
    const dataExcelFile = ( vins_resumen ) => { 
        return vins_resumen.map((vin) => {
            return {
                "Cliente"                        : Cliente,
                "VIN"                            : vin.VIN,
                "Folio Desvío"                   : vin.FolioDesvio,
                "Permiso Desvío"                 : vin.PermisoDesvio,
                "Folio DPP"                      : vin.FolioDPP,
                "Fecha Vencimiento Folio Desvío" : validarFecha(isDefaultDate(vin.FechaVencimiento)),
                "Fecha Vencimiento DPP1"         : validarFecha(isDefaultDate(vin.FechaVencimientoDPP1)),
                "Fecha Solicitud DPP2"           : validarFecha(isDefaultDate(vin.FechaSolicitudFase2)),
                "Fecha Vencimiento DPP2"         : validarFecha(isDefaultDate(vin.FechaVencimientoFase2)),
                "Fecha Solicitud Extensión"      : validarFecha(isDefaultDate(vin.FechaSolicitudExtP)),
                "Fecha Vencimiento Extensión"    : validarFecha(isDefaultDate(vin.FechaVencimientoExtP)),

            }
        })

    }

    const onExportToExcel = async () => {
        const vins_resumen = await getLogsToResum()
        const dataExcel = dataExcelFile( vins_resumen )
        const Header = ["Cliente", "VIN", "Folio Desvío", "Permiso Desvío", "Folio DPP", "Fecha Vencimiento Folio Desvío", "Fecha Vencimiento DPP1", "Fecha Solicitud DPP2", "Fecha Vencimiento DPP2", "Fecha Solicitud Extensión", "Fecha Vencimiento Extensión"]
        const fileName = 'Resumen'
        const fileNameExtension = 'Resumen.xlsx'
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])
        XLSX.utils.sheet_add_json(ws, dataExcel, {
            header: Header,
            skipHeader: false,
        })

        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, fileNameExtension)
    }

    const getLogsToResum = async () => {
        url = ApiUrl + "api/dpp_contado/getvinsclienttoresumenPrint"
        const { FolioDesvio, NumeroCliente, PermisoDesvio, FolioDPP } = handleSelects;
        const body_cliente = { Agencia: agencia, NumCliente: NumeroCliente, PermisoDesvio: PermisoDesvio, folioDesvio : FolioDesvio, FolioDPP: FolioDPP };
        return await axiosPostService( url, body_cliente );
    }

    const handlePrint = async () => {
        const vins_resumen_print = await getLogsToResum();
        setvinsResumenPrint(vins_resumen_print)
        print();
    }

    const print = useReactToPrint({ content: () => tableRef.current });

    return (
      <div>
        <div className='row m-2'>

            <style type="text/css" media="print">{"\
                  @page {\ size: landscape; margin: 4 0 14 0 !important;\ }\
                "}
                    <TablaResumenToPrint
                        Cliente={Cliente}
                        agencia={agencia}
                        ref={tableRef}
                        vinsResumenPrint={vinsResumenPrint}
                    />
            </style>
        </div>

        <button
        title='Exportar a excel'
        type='button'
        className="btn btn-outline-success mt-2 mb-2 ml-2"
        onClick={onExportToExcel}
        // disabled={data.length === 0}
        >
            <FontAwesomeIcon icon={faFileExcel} />
            <small className='ml-2'>Excel</small>
        </button>

        <button
        title='Imprimir'
        type='button'
        className='btn btn-outline-dark mt-2 mb-2 ml-2'
        onClick={handlePrint}
        // disabled={data.length === 0}
        // disabled={true}
        >
            <FontAwesomeIcon icon={faPrint}/>
        </button>

      </div>
    )
}

export default TablaResumenGeneral