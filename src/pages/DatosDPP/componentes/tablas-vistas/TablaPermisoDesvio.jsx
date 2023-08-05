import React, { useRef, Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faUpload, faPrint } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from "xlsx"

import { ApiUrl } from '../../../../services/ApiRest';
import { validarFecha } from '../../../../helpers/fecha';
import { axiosPatchService, axiosPostService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { upperCase } from '../../../../helpers/converToUpperCase';

class TablaPermisoDesvioClass extends Component {
    render() {
        const data = this.props.data;
        const valorPermiso = this.props.valorPermisoDesvio;
        return (
            <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>
                {`VINS (${data.length})`}
                </th>
                <th>Permiso Desvío</th>
                <th>Folio Desvío</th>
                <th>Fecha Salida</th>
                <th>Fecha Llegada</th>
                <th>Fecha Entrega</th>
                <th>Fecha Vencimiento</th>
                {
                valorPermiso === "DPP" && 
                <>
                  <th>Folio DPP</th>
                  <th>Fecha Solicitud DPP</th>
                  <th>Fecha Entrega DPP</th>
                  <th>Fecha Vencimiento DPP</th>
                </>
                }
                <th>Orden Compra</th>
                <th>Folio Compra</th>
                <th>Precio Factura</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              data.length > 0 
              ? data.map((registro) => {
                return (
                  <tr className='text-center'>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.PermisoDesvio ) }</td>
                    <td>{ upperCase( registro.FolioDesvio ) }</td>
                    <td>{validarFecha(registro.FechaSalida)}</td>
                    <td>{validarFecha(registro.FechaLlegada)}</td>
                    <td>{validarFecha(registro.FechaEntrega)}</td>
                    <td>{validarFecha(registro.FechaVencimiento)}</td>
                    {/* <td>{registro.FolioDPP}</td> */}
                    {
                    valorPermiso === "DPP" && 
                    <>
                      <th className='font-weight-normal'>{ upperCase( registro.FolioDPP ) }</th>
                      <td className='font-weight-normal'>{ validarFecha(registro.FechaSolicitudDPP) }</td>
                      <td className='font-weight-normal'>{ validarFecha(registro.FechaDeEntregaDPP) }</td>
                      <td className='font-weight-normal'>{ validarFecha(registro.FechaVencimientoDPP1) }</td>
                    </>
                    }
                    <th class="font-weight-normal">{ upperCase( registro.OrdenDeCompra ) }</th>
                    <th class="font-weight-normal">{ upperCase( registro.Folio_compra_contrato ) }</th>
                    <th class="font-weight-normal">{new Intl.NumberFormat('es-MX').format(registro.PrecioFactura)}</th>
                    <th class="font-weight-normal">{ upperCase( registro.Observaciones ) }</th>
                  </tr>
                )
              })
              :
              <tr className='p-2'>
                  {
                    ""
                  }
              </tr>
            }
            </tbody>
          </table>
        )
    }
}

class TablaPermisoDesvioClassToPrint extends Component {
  render() {
    const data = this.props.data;
    const valorPermiso = this.props.valorPermisoDesvio;
    return (
        <table className='table display compact'>
        <thead style={{backgroundColor:'#1565C0', color:'black'}}>
          <tr className='text-center' style={{fontSize:11}}>
            <th>VIN</th>
            <th>Permiso Desvío</th>
            <th>Folio Desvío</th>
            <th>Fecha Salida</th>
            <th>Fecha Llegada</th>
            <th>Fecha Entrega</th>
            <th>Fecha Vencimiento</th>
            {
            valorPermiso === "DPP" && 
            <>
             <th>Folio DPP</th>
             <th>Fecha Solicitud DPP</th>
             <th>Fecha Entrega DPP</th>
             <th>Fecha Vencimiento DPP</th>
            </>
            }
          </tr>
        </thead>
        <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
        {
          data.length > 0 
          ? data.map((registro) => {
            return (
              <tr className='text-center' style={{fontSize:11}}>
                <td>{registro.VIN}</td>
                <td>{ upperCase( registro.PermisoDesvio ) }</td>
                <td>{ upperCase( registro.FolioDesvio ) }</td>
                <td>{validarFecha(registro.FechaSalida)}</td>
                <td>{validarFecha(registro.FechaLlegada)}</td>
                <td>{validarFecha(registro.FechaEntrega)}</td>
                <td>{validarFecha(registro.FechaVencimiento)}</td>
                {
                valorPermiso === "DPP" && 
                <>
                  <th className='font-weight-normal'>{ upperCase( registro.FolioDPP ) }</th>
                  <td className='font-weight-normal'>{validarFecha(registro.FechaSolicitudDPP)}</td>
                  <td className='font-weight-normal'>{validarFecha(registro.FechaDeEntregaDPP)}</td>
                  <td className='font-weight-normal'>{validarFecha(registro.FechaVencimientoDPP1)}</td>
                </>
                }
              </tr>
            )
          })
          :
          <tr className='p-2'>
              {
                ""
              }
          </tr>
        }
        </tbody>
      </table>
    )
}
}

export const TablaPermisoDesvio = ({
    agencia, 
    data, 
    handleGuardarPermisoDesvio,
    IndicadoresCliente,
    isExcelAndPrintButtonEneabled,
    isPreviewTable,
    nombreCliente,
    valorPermisoDesvio,
    VINSGeneratedinBD
}) => {
    let url = '';
    const tableRef = useRef();

    const onGuardarPermisoDesvio = async () => {

      if ( valorPermisoDesvio === "DPP" && IndicadoresCliente.MontoVINSSeleccionados > IndicadoresCliente.NuevoLimiteCredito ) {
        toast.info("El Monto VINS es Mayor al Límite de Crédito Actual"); 
        return;
      }

      url = ApiUrl + "api/dpp_contado/createpermisodesvio"
      const body = { agencia: agencia, data: data, limiteCreditoCliente: IndicadoresCliente.NuevoLimiteCredito }
      const result = await axiosPostService(url, body)

      if ( result.isCreated ) {
        if ( result.vinsToUpdateList.length > 0 ) {
          const resultUpdate = await updateVINList( result.vinsToUpdateList )
          if ( resultUpdate.isUpdated === undefined) {
            toast.error("Error con servidor, no fue posible realizar la actualización de vins seleccionados.")
            return;
          }
        } 
        
        handleGuardarPermisoDesvio()
        toast.success("Permisos desvío fueron registrados exitosamente.")
        return;
      }

      toast.error("Error con servidor, no fue posible realizar el registro.")
    }

    const updateVINList = async ( vinList ) => {
      url = ApiUrl + "api/dpp_contado/updatepermisodesvio"
      const body = { agencia: agencia, data: vinList }
      const result = await axiosPatchService( url, body );
      return result;
    } 

    const dataExcelFile = () => {
        const selectFieldsdata = data.map((row) => {
          let newRow = {
              "Cliente"                : nombreCliente, 
              "VIN"                    : row.VIN,
              "Permiso Desvio"         : row.PermisoDesvio,
              "Folio Desvio"           : row.FolioDesvio,
              "Fecha Salida"           : validarFecha(row.FechaSalida),
              "Fecha Llegada"          : validarFecha(row.FechaLlegada),
              "Fecha Entrega"          : validarFecha(row.FechaEntrega),
              "Fecha Vencimiento"      : validarFecha(row.FechaVencimiento),
              "Folio DPP"              : row.FolioDPP,

              "Fecha Solicitud DPP"    : validarFecha(row.FechaSolicitudDPP),
              "Fecha Entrega DPP"      : validarFecha(row.FechaDeEntregaDPP),

              "Fecha Vencimiento DPP1" : validarFecha(row.FechaVencimientoDPP1),
          }
          return newRow;
        })

        return selectFieldsdata;
    }

    const onExportToExcel = () => {
      const dataExcel = dataExcelFile();
      const Header = [
        "Cliente", 
        "VIN", 
        "Permiso Desvio", 
        "Folio Desvio", 
        "Fecha Salida", 
        "Fecha Llegada", 
        "Fecha Entrega", 
        "Fecha Vencimiento", 
        "Folio DPP", 
        "Fecha Solicitud DPP",
        "Fecha Entrega DPP",
        "Fecha Vencimiento DPP1"
      ];

      const fileName = "Permiso Desvío";
      const fileNameExtension = "Permiso_Desvio.xlsx";
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

    return (
      isPreviewTable &&
      <div>
          <div className='row m-2'>

            <TablaPermisoDesvioClass 
            data={data} 
            valorPermisoDesvio={valorPermisoDesvio}
            />
            
            <style type="text/css" media="print">{"\
                  @page {\ size: landscape; margin: 4 0 14 0 !important;\ }\
                "}
                <TablaPermisoDesvioClassToPrint 
                data={data} 
                ref={tableRef} 
                valorPermisoDesvio={valorPermisoDesvio}
                />
            </style>
            

          </div>

          <button
            title='Guardar Permisos en Base de Datos'
            type='button'
            className='btn btn-info  mt-2 mb-2 ml-2'
            onClick={onGuardarPermisoDesvio}
            disabled={data.length === 0 || VINSGeneratedinBD} 
          >
            <FontAwesomeIcon  icon={faUpload} />
            <small className='ml-2'>Guardar Permiso</small>
          </button>

          <button
            onClick={onExportToExcel}
            title='Exportar a excel'
            type='button'
            className="btn btn-outline-success mt-2 mb-2 ml-2"
            disabled={( data.length === 0 ) || ( ! isExcelAndPrintButtonEneabled )}
          >
              <FontAwesomeIcon icon={faFileExcel} />
              <small className='ml-2'>Excel</small>
          </button>

          <button
          title='Imprimir'
          type='button'
          className='btn btn-outline-dark mt-2 mb-2 ml-2'
          disabled={( data.length === 0 ) || ( ! isExcelAndPrintButtonEneabled )}
          onClick={handlePrint}
          >
            <FontAwesomeIcon icon={faPrint}/>
          </button>

      </div>
    )
}
