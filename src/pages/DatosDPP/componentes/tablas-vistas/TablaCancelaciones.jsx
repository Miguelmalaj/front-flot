import React, { Component } from 'react'

import swal from 'sweetalert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { axiosPatchService } from '../../../../services/asignacionLoteService/AsignacionLoteService'
import { ApiUrl } from '../../../../services/ApiRest'

import { validarFecha } from '../../../../helpers/fecha'

class TablaCancelacionesClass extends Component {

  render() {
    const DPP = 'DPP'
    const Contado = 'Contado'
    const data = this.props.data;
    const permdesv = this.props.valorPermisoDesvio;
    return (
      permdesv === Contado ?
      <div className='table-responsive'>
          <table className='table display compact'>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>VIN</th>
                <th>Fecha Vencimiento</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              data.length 
              > 0 ?
              data
              .map((registro) => {
                return (
                  <tr className='text-center'>
                    <td>{registro.VIN}</td>
                    <td>{validarFecha(registro.FechaVencimiento)}</td>
                  </tr>
                )
              })
              :
              <tr className='p-2'>
                  <td>No existen registros para el cliente seleccionado.</td>
                  <td></td>
              </tr>
            }
            </tbody>
          </table>
          </div>
          :
      
          <div className='table-responsive'>
            <table className='table display compact'>
              <thead style={{backgroundColor:'#1565C0', color:'white'}}>
                <tr className='text-center'>
                  <th>VIN</th>
                  <th>Folio DPP</th>
                  <th>Fecha Vencimiento</th>
                  <th>Fecha Vencimiento DPP 1</th>
                </tr>
              </thead>
              <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
              {
                data.length 
                > 0 ?
                data
                .map((registro) => {
                  return (
                    <tr className='text-center'>
                      <td>{registro.VIN}</td>
                      <td>{registro.FolioDPP}</td>
                      <td>{validarFecha(registro.FechaVencimiento)}</td>
                      <td>{validarFecha(registro.FechaVencimientoDPP1)}</td>
                    </tr>
                  )
                })
                :
                <tr className='p-2'>
                    <td>No existen registros para el cliente seleccionado.</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
              }
              </tbody>
            </table>
          </div>
      
    )
  }
}

const TablaCancelaciones = ({
    data, 
    agencia, 
    isPreviewTable,
    valorPermisoDesvio,
    afterCancel
}) => {
  let url = "";

  const handleVINSCancels = async () => {
   swal({
      text:"¿Estás seguro que deseas cancelar los vins seleccionados?",
      icon:"warning",
      buttons:["No","Si"]
   }).then( respuesta => {
      if ( respuesta ) {
        cancelarFoliosPermisoDesvio()
      }
   })
  }

  const cancelarFoliosPermisoDesvio = async () => {
    url = ApiUrl + "api/dpp_contado/cancelfoliodesvio"; 
    const body = { Agencia: agencia, data: data }
    const response = await axiosPatchService( url, body );
    if ( response.isCanceled ) {
      swal({text: "Los folios fueron cancelados exitosamente.", icon:"success", timer:"1200"})
      afterCancel();
      return;
    }

    swal({text: "Ocurrió un error con el servidor.", icon:"error", timer:"2000"})

  }

  return (
    isPreviewTable &&
    <>
        <div className='row m-2'>
            <TablaCancelacionesClass
              data={data}
              agencia={agencia}
              valorPermisoDesvio={valorPermisoDesvio}
            />
        </div>

        <button
        title='Cancelar VINS'
        type='button'
        className='btn btn-danger  mt-2 mb-2 ml-2'
        onClick={handleVINSCancels}
        disabled={data.length === 0} 
        >
            <FontAwesomeIcon  icon={faUpload} />
            <small className='ml-2'>Cancelar VINS</small>
        </button>
    </>
  )
}

export default TablaCancelaciones