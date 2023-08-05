import React, { useRef, Component } from 'react'

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faUpload, faPrint, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from "xlsx"

import { ApiUrl } from '../../../../services/ApiRest';
import { validarFecha, isDefaultDate } from '../../../../helpers/fecha';
import { axiosPatchService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { ErrorConexion, RegistroExitoso, FechasExisten } from '../../../../constantes/constantesAxios/mensajesAxios';
import { upperCase } from '../../../../helpers/converToUpperCase';

class TablaDPP2_ExtensionClass extends Component {

    render() {
        const DPP = 'DPP'
        const Contado = 'Contado'
        const data = this.props.data;
        const permdesv = this.props.valorPermisoDesvio;
        const documentoPDF = this.props.documentoPDF;

        const showPDF = () => {
          if ( documentoPDF !== "" ) {
            if ( documentoPDF.type !== "application/pdf") {
              toast.info('El archivo seleccionado no es un formato válido, Favor de seleccionar formato PDF.');
              return;
            }
            const fileUrl = window.URL.createObjectURL( documentoPDF )
            window.open(fileUrl, '_blank');
          }
        }

        return (
            permdesv === Contado ?
            <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>{`VINS (${data.length})`}</th>
                <th>Permiso Desvío</th>
                <th>Folio Desvío</th>
                <th>Fecha Vencimiento</th>
                <th>Fecha Solicitud Ext.</th>
                <th>Fecha Vencimiento Ext.</th>
                <th>PDF</th>
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
                    <td>{validarFecha(registro.FechaVencimiento)}</td>
                    <td>{validarFecha(registro.FechaSolicitudExtP)}</td>
                    <td>{validarFecha(registro.FechaVencimientoExtP)}</td>
                    <td>
                    {
                     documentoPDF !== undefined && documentoPDF !== "" ?
                     documentoPDF.type === "application/pdf" &&
                    <button
                      title='Visualizar PDF'
                      type='button'
                      className='btn btn-outline-danger'
                      onClick={() => showPDF()}
                    ><FontAwesomeIcon icon={faFilePdf}/></button> 
                    : 
                    ""
                    }
                    </td>
                  </tr>
                )
              })
              :
              <tr className='p-2'>
                  <td>No existen registros para el cliente seleccionado.</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
              </tr>
            }
            </tbody>
          </table>
          :
          <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>{`VINS (${data.length})`}</th>
                <th>Permiso Desvío</th>
                <th>Folio DPP</th>
                <th>Fecha Vencimiento</th>
                <th>Fecha Vencimiento DPP1</th>
                <th>Fecha Solicitud DPP 2</th>
                <th>Fecha Vencimiento DPP 2</th>
                {/* <th>Folio DPP 2</th> */}
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}

            { 
            data.length > 0 
              ?
              data
              .map((registro) => {
                return (
                  <tr className='text-center'>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.PermisoDesvio ) }</td>
                    <td>{ upperCase( registro.FolioDPP ) }</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaSolicitudFase2))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoFase2))}</td>
                    {/* <td>{registro.FolioDPP2}</td> */}
                  </tr>
                )
              })
              :
              <tr className='p-2'>
                  <td>No existen registros para el cliente seleccionado.</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
              </tr> 
            } 
            </tbody>
          </table>
        )
    }
}

class TablaDPP2_ExtensionClassToPrint extends Component {
  render() {
    const DPP = 'DPP'
    const Contado = 'Contado'
    const data = this.props.data;
    const permdesv = this.props.valorPermisoDesvio;
    const Cliente = this.props.Cliente;


    return (
        permdesv === Contado ?
        <table className='table display compact' style={{fontSize:11}}>
          <thead style={{backgroundColor:'#1565C0', color:'black'}}>
            <tr className='text-center'>
              <th>Cliente</th>
              <th>VIN</th>
              <th>Permiso Desvío</th>
              <th>Folio Desvío</th>
              <th>Fecha Vencimiento</th>
              <th>Fecha Solicitud Ext.</th>
              <th>Fecha Vencimiento Ext.</th>
            </tr>
          </thead>
        <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
        {
          data.length > 0 
          && data.map((registro) => {
            return (
              <tr className='text-center'>
                <td>{ upperCase( Cliente ) }</td>
                <td>{registro.VIN}</td>
                <td>{ upperCase( registro.PermisoDesvio ) }</td>
                <td>{ upperCase( registro.FolioDesvio ) }</td>
                <td>{validarFecha(registro.FechaVencimiento)}</td>
                <td>{validarFecha(registro.FechaSolicitudExtP)}</td>
                <td>{validarFecha(registro.FechaVencimientoExtP)}</td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
      :
      <table className='table display compact' style={{fontSize:11}}>
        <thead style={{backgroundColor:'#1565C0', color:'black'}}>
          <tr className='text-center'>
            <th>Cliente</th>
            <th>VIN</th>
            <th>Permiso Desvío</th>
            <th>Folio DPP</th>
            <th>Fecha Vencimiento</th>
            <th>Fecha Vencimiento DPP 1</th>
            <th>Fecha Solicitud DPP 2</th>
            <th>Fecha Vencimiento DPP 2</th>
            {/* <th>Folio DPP 2</th> */}
          </tr>
        </thead>
        <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
          { 
          data.length > 0 
            &&
            data
            .map((registro) => {
              return (
                <tr className='text-center'>
                  <th className='font-weight-normal'>{Cliente}</th>
                  <td>{registro.VIN}</td>
                  <td>{ upperCase( registro.PermisoDesvio ) }</td>
                  <td>{ upperCase( registro.FolioDPP ) }</td>
                  <td>{validarFecha(registro.FechaVencimiento)}</td>
                  <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                  <td>{validarFecha(isDefaultDate(registro.FechaSolicitudFase2))}</td>
                  <td>{validarFecha(isDefaultDate(registro.FechaVencimientoFase2))}</td>
                  {/* <td>{registro.FolioDPP2}</td> */}
                </tr>
              )
            })
          } 
        </tbody>
      </table>
    )
}
}

const TablaDPP2_Extension = ({
    data, 
    agencia, 
    isPreviewTable,
    valorPermisoDesvio,
    Cliente,
    documentoPDF,
    afterRegister,
    isExcelAndPrintButtonEneabled
}) => {
    let url = '';
    const DPP = 'DPP'
    const Contado = 'Contado'
    const tableRef = useRef();

    const onGuardarFase2_Extension = async () => {

       if ( valorPermisoDesvio === DPP ) {
        url = `${ApiUrl}api/dpp_contado/createDPPFase2`
        const result = await axiosPatchService( url, { data: data, agencia: agencia } )
        if ( result.isCreated ) {
          if ( result.errorMessage ) toast.info(FechasExisten)
          else toast.success(RegistroExitoso)
          afterRegister();
        }
        return;
       }

       if ( valorPermisoDesvio === Contado ) {
        if ( documentoPDF !== "" && documentoPDF !== undefined ) {
          if ( documentoPDF.type !== "application/pdf") {
            toast.info('El archivo seleccionado no es un formato válido, Favor de seleccionar formato PDF.');
            return;
          }
        }
        url = `${ApiUrl}api/dpp_contado/createExtensionPermiso`
        const formData = new FormData();
        formData.append( 'agencia', JSON.stringify( agencia ) );
        formData.append( 'body',    JSON.stringify( data ) );
        formData.append( 'file',    documentoPDF )
        const result = await postData( url, formData ); 
        if ( result.isCreated ) {
          toast.success(RegistroExitoso)
          afterRegister();
        }
       }

    }

    const postData = async ( url, formData ) => {
      let data;
      await axios.post( url, formData, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      })
      .then( response => {
          data = response['data'];
      })
      .catch(err => {
        toast.error(ErrorConexion)
        data = []
      })
      return data;

    }

    const handlePrint = useReactToPrint({
      content: () => tableRef.current
    })

    const dataExcelFile = () => {
      let selectFieldsData = [];

      if ( valorPermisoDesvio === DPP ) {
        selectFieldsData = data.map((row) => {
          return {
            "Cliente"                : Cliente,
            "VIN"                    : row.VIN,
            "Permiso Desvio"         : row.PermisoDesvio,
            "Folio Desvio"           : row.FolioDesvio,
            "Folio DPP"              : row.FolioDPP,
            "Fecha Vencimiento"      : validarFecha(row.FechaVencimiento),
            "Fecha Vencimiento DPP1" : validarFecha(row.FechaVencimientoDPP1),
            "Fecha Solicitud DPP2"   : validarFecha(row.FechaSolicitudFase2),
            "Fecha Vencimiento DPP2" : validarFecha(row.FechaVencimientoFase2),
            // "Folio DPP2"             : row.FolioDPP2
          }
        })
      }
      
      if ( valorPermisoDesvio === Contado ) {
        selectFieldsData = data.map((row) => {
          return {
            "Cliente"                : Cliente,
            "VIN"                    : row.VIN,
            "Permiso Desvio"         : row.PermisoDesvio,
            "Folio Desvio"           : row.FolioDesvio,
            "Fecha Vencimiento"      : validarFecha(row.FechaVencimiento),
            "Fecha Solicitud Ext"    : validarFecha(row.FechaSolicitudExtP),
            "Fecha Vencimiento Ext"  : validarFecha(row.FechaVencimientoExtP),
          }
        })
      }

      return selectFieldsData;
    }

    const onExportToExcel = () => {
      const dataExcel = dataExcelFile();
      const Header =  valorPermisoDesvio === DPP
      ? ["Cliente", "VIN", "Permiso Desvio", "Folio Desvio", "Folio DPP", "Fecha Vencimiento", "Fecha Vencimiento DPP1", "Fecha Solicitud DPP2", "Fecha Vencimiento DPP2"]
      : ["Cliente", "VIN", "Permiso Desvio", "Folio Desvio", "Fecha Vencimiento", "Fecha Solicitud Ext", "Fecha Vencimiento Ext"]
      const fileName = valorPermisoDesvio === DPP ? "DPP Fase 2" : "Extensión Permiso";
      const fileNameExtension = valorPermisoDesvio === DPP ? "DPP_Fase_2.xlsx" : "Extensión_Permiso.xlsx";
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
    isPreviewTable &&
    <div>
        <div className='row m-2'>
            <TablaDPP2_ExtensionClass
            data={data}
            agencia={agencia}
            valorPermisoDesvio={valorPermisoDesvio}
            documentoPDF={documentoPDF}
            />

            <style type="text/css" media="print">{"\
                  @page {\ size: landscape; margin: 4 0 14 0 !important;\ }\
                "}
                <TablaDPP2_ExtensionClassToPrint 
                data={data}
                agencia={agencia}
                ref={tableRef} 
                valorPermisoDesvio={valorPermisoDesvio}
                Cliente={Cliente}
                />
            </style>

        </div>

        <button
        title='Registrar'
        type='button'
        className='btn btn-info  mt-2 mb-2 ml-2'
        onClick={onGuardarFase2_Extension}
        disabled={data.length === 0} 
        >
            <FontAwesomeIcon  icon={faUpload} />
            <small className='ml-2'>Guardar</small>
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
        onClick={handlePrint}
        disabled={( data.length === 0 ) || ( ! isExcelAndPrintButtonEneabled )}
        >
            <FontAwesomeIcon icon={faPrint}/>
        </button>

    </div>
  )
}

export default TablaDPP2_Extension