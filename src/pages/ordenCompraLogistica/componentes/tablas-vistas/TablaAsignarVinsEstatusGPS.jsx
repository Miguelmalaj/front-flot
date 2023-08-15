import React, { Component, useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { generate as id } from 'shortid'
import { toast } from 'react-toastify';
import axios from 'axios';

import { isDefaultDate, validarFecha } from '../../../../helpers/fecha';
import { ApiUrl } from '../../../../services/ApiRest';
import { axiosPatchService, axiosPostService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { upperCase } from '../../../../helpers/converToUpperCase';

const defaultEstatusPrevia = 'NO APLICA';
const OK = 'OK'
const PATIO = 'REALIZADO EN PATIO'
const DISTRIBUIDOR = 'REALIZADO EN DISTRIBUIDOR'
const SINPREVIA = 'SIN PREVIA'
const CartaCliente = 'CartaCliente';
const FacturaPago = 'FacturaPago';

const pipesStatusPrevia = ( statusPrevia ) => {
  if ( statusPrevia === defaultEstatusPrevia ) return PATIO
  if ( statusPrevia === OK ) return DISTRIBUIDOR
  if ( statusPrevia === SINPREVIA )  return SINPREVIA
}

class TablaAsignarVinsEstatusGPSClass extends Component {

  validDefaultStatusTyT( status ) {
    if ( status === "0" ) return "EN PATIO";

    if ( status.toString().split("|").shift() === "0" ) return "EN PATIO";

    return status.toString().split("|").shift();
  }

  validPatio( patio ){
    return patio.toString().split("|").shift();
  }

  showPDF( PDF ) {
    const file = window.URL.createObjectURL(PDF);
    window.open(file, '_blank');
  }

  downloadPDF = async ( PDF, VIN, agencia ) => {

    let url = ApiUrl + "api/asignarvins/send_pdf"
    let body = {VIN, agencia, PDF}
    await axios.post(url, body, {responseType:'blob'})
    .then(response => {
        const fileUrl = window.URL.createObjectURL(response['data']);
        window.open(fileUrl, '_blank');
    })
    .catch(err => {
        toast.error('Error al descargar carta cliente.')
    })
 }

  render() {
    const data = this.props.data;
    const agencia = this.props.agencia;
    return (
      
      <div className="row table-responsive">
        <table className="table display compact" style={{ fontSize:11 }}>
          
          <thead className="text-center" style={{ backgroundColor:'#1565C0', color:'white' }}>
            
            <tr>
              <th colSpan='15' className='text-center divider__border-right'>GENERALES</th>
              <th colSpan='19' className='text-center divider__border-right'>GM</th>
              <th colSpan='4' className='text-center divider__border-right'>GMF</th>
              <th colSpan='15' className='text-center divider__border-right'>TYT</th>
              <th colSpan='1' className='text-center divider__border-right'>GMF</th>
              <th colSpan='5' className='text-center divider__border-right'>PREVIA ENTREGA DISTRIB.</th>
              <th colSpan='4' className='text-center divider__border-right'>DOCUMENTOS DE ENTREGA</th>
              <th colSpan='4' className='text-center divider__border-right'>INFORMATIVO</th>
            </tr>

            <tr>
              <th></th>
              <th></th>
              <th></th>
              
              <th colSpan="6" className='text-center divider__border-right'>VEHÍCULOS</th>
              <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
              <th colSpan="5" className='text-center divider__border-right'>DESTINO</th>
              <th colSpan="2" className='text-center divider__border-right'>DETENER</th>
              <th colSpan="4" className='text-center divider__border-right'>SEGREGAR/PERMISO</th>
              <th colSpan="3" className='text-center divider__border-right'>PREVIA</th>
              <th colSpan="3" className='text-center divider__border-right'>GPS</th>
              <th colSpan="2" className='text-center divider__border-right'>ACCESO (DUPLIC/FOTO/KIT SEG./POLIZA)</th>
              <th colSpan="2" className='text-center divider__border-right'>LIBERAR</th>
              <th colSpan="2" className='text-center divider__border-right'>CALIDAD</th>
              <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
              <th colSpan="2" className='text-center divider__border-right'>DPP</th>
              <th colSpan="2" className='text-center divider__border-right'>PERMISO</th>
              <th colSpan="4" className='text-center divider__border-right'></th>
              <th colSpan="2" className='text-center divider__border-right'>INTERPLANTA</th>
              <th colSpan="2" className='text-center divider__border-right'>ARMADO DE VIAJE</th>
              <th colSpan="2" className='text-center divider__border-right'>ASIG. SIN MADRINA</th>
              <th colSpan="2" className='text-center divider__border-right'>ASIG. EN MADRINA</th>
              <th colSpan="2" className='text-center divider__border-right'>TRANSITO</th>
              <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
              <th colSpan="1" className='text-center divider__border-right'>FASE 2</th>
              <th colSpan="2" className='text-center divider__border-right'>PAGO</th>
              <th colSpan="1" className='text-center divider__border-right'>FACT</th>
              <th colSpan="1" className='text-center divider__border-right'>PROGRAMACIÓN</th>
              <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
              <th colSpan="1" className='text-center divider__border-right'>ENVÍO</th>
              <th colSpan="1" className='text-center divider__border-right'>RECEP</th>
              <th colSpan="1" className='text-center divider__border-right'>DOC</th>{/* CARTACLIENTE */}
              <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
              <th colSpan="1" className='text-center divider__border-right'>PAGO</th>
              <th colSpan="1" className='text-center divider__border-right'>COMENTARIOS</th>
              <th colSpan="2" className='text-center divider__border-right'>MODIFICADO</th>  
            </tr>
          
            <tr>
              {/* GENERALES */}
              <th className='noselect divider__border-right' style={{fontSize:11}}>#</th>

              <th className='noselect divider__border-right'>Cliente</th>

              <th className='noselect divider__border-right'>OC</th>

              <th className='divider__border-right' style={{position:'sticky', left:'0px', backgroundColor:'#1565C0', zIndex:1}}>
                  VIN
              </th>

              <th className='noselect divider__border-right'>Observaciones VIN</th>

              <th className='noselect divider__border-right'>Tipo/Paquete</th>

              <th className='noselect divider__border-right'>Color</th>

              <th className='noselect divider__border-right'>Inv.</th>

              <th className='noselect divider__border-right'>Factura</th>

              <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Dias</th>

              <th className='noselect divider__border-right' style={{position:'sticky', left:'130px', backgroundColor:'#1565C0', zIndex:1}}>
                  Destino
              </th>

              <th className='noselect divider__border-right'>Dist-Patio</th>

              <th className='noselect divider__border-right'>Domicilio</th>

              <th className='noselect divider__border-right'>Receptor</th>

              <th className='noselect divider__border-right'>Celular</th>

              {/* GM */}

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* FechaDetencionSolic */}

              <th className='noselect divider__border-right'>Fecha Aut.</th> {/* FechaAutSolic */}

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha SegregaciónSolicit */}

              <th className='noselect divider__border-right'>Fecha Aut.</th> {/* Fecha SegregaciónAut */}

              <th className='noselect divider__border-right'>Fecha Instalación</th>

              <th className='noselect divider__border-right'>Retiro Llave</th>

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Previa Slc. */}

              <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha Previa Aut. */}

              <th className='noselect divider__border-right'>Estatus Previa</th>

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha GPS Solic. */}

              <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha GPS Aut. */}

              <th className='noselect divider__border-right'>Estatus GPS</th>

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Acceso Solic. */}

              <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha Acceso Aut. */}

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Liberar Solic. */}

              <th className='noselect divider__border-right'>Fecha Aut</th> {/* Fecha Liberar Aut */}

              <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Calidad Solic */}

              <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Calidad Aut */}

              <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Días</th>

              {/* GMF */}

              <th className='noselect divider__border-right'>Folio</th> {/* Folio DPP */}

              <th className='noselect divider__border-right'>Fecha</th> {/* Fecha DPP 1 */}

              <th className='noselect divider__border-right'>Folio</th> {/* Permiso */}

              <th className='noselect divider__border-right'>Fecha</th> {/* Fecha Vencimiento Permiso */}

              {/* TYT */}

              <th className='noselect divider__border-right' style={{position:'sticky', left:'195px', backgroundColor:'#1565C0', zIndex:1}}>Estatus TyT</th>

              <th className='noselect divider__border-right'>Patio</th>

              <th className='noselect divider__border-right'>Observaciones TyT</th>

              <th className='noselect divider__border-right'>Fecha Estatus TyT</th>

              <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Interplanta Ingr */}

              <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Interplanta Salid */}

              <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha ArmandoViaje Ingr */}

              <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha ArmandoViaje Salid */}

              <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Asig.SinMadrinIngr */}

              <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Asig.SinMadrinSalid */}

              <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Asig.EnMadrinIngr */}

              <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Asig.EnMadrinSalid */}

              <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha TransitoIngreso */}

              <th className='noselect divider__border-right'>Fecha Entrega</th> {/* Fecha TransitoEntrega */}

              <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Días</th>

              {/* GMF */}

              <th className='noselect divider__border-right'>Fecha</th> {/* fecha DPP 2 */}

              {/* PREVIA ENTREGA DISTRIB. */}

              <th className='noselect divider__border-right'>Fecha Solicit.</th>  {/* FechaPagoSolic */}

              <th className='noselect divider__border-right'>Fecha Pago</th>  {/* FechaPago */}

              <th className='noselect divider__border-right'>PDF</th>  {/* PDF Fact */}

              <th className='noselect divider__border-right'>Fecha De Entrega</th> {/* Fecha Entrega Programación */}

              <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>dias</th>

              {/* DOCUMENTOS DE ENTREGA */}

              <th className='noselect divider__border-right'>Fecha</th> {/* Fecha De Envio Docum. */}

              <th className='noselect divider__border-right'>Fecha</th> {/* Fecha De Recepcion */}

              <th className='noselect divider__border-right'>PDF</th> {/* DOC / PDF Carta Cliente */}

              <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>días</th>

              {/* INFORMATIVO */}

              <th className='noselect divider__border-right'>CM</th> {/* PagoCM */}

              <th className='noselect divider__border-right'>Operación</th> {/* Observaciones */}

              <th className='noselect divider__border-right'>Por</th> {/* Modificado Por */}

              <th className='noselect divider__border-right'>Fecha</th> {/* Fecha Modificado */}
            </tr>

          </thead>

          <tbody style={{ backgroundColor:'#FFFFE0' }}>
            {
              data.length > 0 &&
              data.map((registro, index) => {
                  return (
                      <tr className='text-center' style={{fontSize:11}}>

                          <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>

                          <td className='noselect'>{ upperCase( registro.NombreCliente )}</td>

                          <td className='noselect'>{ upperCase( registro.OrdenDeCompra ) }</td>

                          <td style={{position:'sticky', left:'0px', paddingRight:'20px', backgroundColor:'#FFFFE0', zIndex:1}}>
                              {registro.VIN}
                          </td>

                          <td className='noselect'>{ upperCase( registro.ObservacionesVIN )}</td>

                          <td className='noselect'>{ upperCase( registro.Vehiculo ) }</td>

                          <td className='noselect'>{ upperCase( registro.Color ) }</td>

                          <td className='noselect'>{ upperCase( registro.Inventario.split('-').pop() ) }</td>

                          <td className='noselect'>{ upperCase( registro.Factura ) }</td>

                          <td>{ registro.DiasGenerales }</td>
                          
                          <td className='noselect' style={{position:'sticky', left:'130px', backgroundColor:'#FFFFE0', zIndex:1}}>
                              { upperCase( registro.CiudadDestino ) }
                          </td>
                          
                          <td className='noselect'>{ upperCase( registro.Agencia ) }</td>

                          <td className='noselect'>{ upperCase( registro.DomicilioDeEntrega ) }</td>
                          
                          <td className='noselect'>{ upperCase( registro.PersonaReceptor ) }</td>

                          <td className='noselect'>{ registro.CelularDeContacto }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDetencionSolicit)) }</td>
                         
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDetencionAut)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaSolicitudGPS)) }</td>{/* FechaSolicitudGPS corresponde a FechaSegregacionSolicit */}
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaSegregacionAut)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAceptacionGPS)) }</td>{/* FechaAceptacionGPS corresponde a fecha instalación */}

                          <td className='noselect'>

                              <input 
                                  style={{position:'sticky'}} 
                                  // onChange={(e) => handleCheckLlave(e, registro)} 
                                  checked={registro.retiroDuplicadoLlave == 1} 
                                  type="checkbox" 
                                  className="form-check-input" 
                                  name="retiroDuplicadoLlave" 
                                  value="retiroDuplicadoLlave" 
                                  readOnly
                                  // disabled={ radioButton === Asignar && registro.Asignado != 0  || !registro.isVinSelected }
                              />

                          </td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPreviaSolicit)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPreviaAut)) }</td>

                          <td className='noselect'>{ upperCase( pipesStatusPrevia(registro.EstatusPrevia) ) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaGPSSolicit)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaGPSAut)) }</td>

                          <td className='noselect'>{ upperCase( registro.EstatusGPS ) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAccesoSolicit)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAccesoAut)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaLiberacionSolicit)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaLiberacionAut)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaCalidadSolicit)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaCalidadAut)) }</td>

                          <td className='noselect'>{ registro.DiasGM }</td>

                          <td className='noselect'>{ upperCase( registro.FolioDPP ) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencDPP1)) }</td>

                          <td className='noselect'>{ upperCase( registro.FolioDesvio ) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencFD)) }</td>

                          <td className='noselect' style={{position:'sticky', left:'195px', backgroundColor:'#FFFFE0', zIndex:1}}>
                            { upperCase( this.validDefaultStatusTyT(registro.EstatusTyT) ) }
                          </td>

                          <td className='noselect'>{ upperCase( this.validPatio(registro.Patio) )}</td> {/* aplicar validación */}

                          <td className='noselect'>{ upperCase( registro.ObservacionesTyT ) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEstatusTyT)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaInterplantaIngreso)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaInterplantaSalida)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaArmViajeIngreso)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaArmViajeSalida)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigSinMadrinaIngreso)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigSinMadrinaSalida)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigEnMadrinaIngreso)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigEnMadrinaSalida)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaTransitoIngreso)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaTransitoSalida)) }</td>
                          
                          <td className='noselect'>{ registro.DiasTyT }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.DPP2)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPagoSolicit)) }</td>
                          
                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPagoAut)) }</td>

                          <td className='noselect'>
                              {
                                  registro?.FacturaPagoPDF !== null && registro?.FacturaPagoPDF !== undefined 
                                  ?
                                  <button
                                      title='Visualizar Factura Pago'
                                      type='button'
                                      className='btn btn-outline-danger'
                                      onClick={() => this.showPDF(registro.FacturaPagoPDF)}
                                  >
                                    <FontAwesomeIcon icon={faFilePdf}/>
                                  </button> 
                                  :
                                registro.DocFacturaPagoPDF === "1" 
                                  ? 
                                  <button
                                      title='Visualizar Factura Pago'
                                      type='button'
                                      name='FacturaPago'
                                      className='btn btn-outline-danger'
                                      onClick={() => this.downloadPDF(FacturaPago, registro.VIN, agencia)}
                                  >
                                    <FontAwesomeIcon icon={faFilePdf}/>
                                  </button> 
                                  : 
                                  ""
                              }
                          </td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEntregaCliente)) }</td>

                          <td className='noselect'>{ registro.DiasPreviaEntrega }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeEnvioDocum)) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeRecepcion)) }</td>

                          <td className='noselect'>
                              {
                                  registro?.CartaClientePDF !== null && registro?.CartaClientePDF !== undefined 
                                  ?
                                  <button
                                      title='Visualizar Carta Cliente'
                                      type='button'
                                      className='btn btn-outline-danger'
                                      onClick={() => this.showPDF(registro.CartaClientePDF)}
                                  >
                                    <FontAwesomeIcon icon={faFilePdf}/>
                                  </button> 
                                  :
                                registro.DocumentoPDF === "1" 
                                  ? 
                                  <button
                                      title='Visualizar Carta Cliente'
                                      type='button'
                                      name='CartaCliente'
                                      className='btn btn-outline-danger'
                                      onClick={() => this.downloadPDF(CartaCliente, registro.VIN, agencia)}
                                  ><FontAwesomeIcon icon={faFilePdf}/></button> 
                                  : 
                                  ""
                              }
                          </td>

                          <td className='noselect'>{ registro.DiasDocumEntrega }</td>

                          <td className='noselect'>{ upperCase( registro.Pago ) }</td>

                          <td className='noselect'>{ upperCase( registro.Observaciones ) }</td>

                          <td className='noselect'>{ upperCase( registro.UsuarioModificacion ) }</td>

                          <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaModificacion))  }</td>

                          {/* beneath are commoding tags */}
                          
                      </tr>
                  )
              })
            }
          </tbody>

        </table>
      </div>
    );
  }
}

export const TablaAsignarVinsEstatusGPS = ({
    data, 
    agencia, 
    isPreviewTable,
    VINSGeneratedinBD,
    handleUpdateData
}) => {
  let url = '';
  const [isUpatingVins, setIsUpatingVins] = useState(false);

  const onGuardarVinsEstatusGPS = async () => {

    if ( !validationSinisters( data ) ) {
      toast.error("El registro no puede ser completado, existen VINS sin su fecha de siniestro.");
      return;  
    }

    const LoggedUser = window.sessionStorage.getItem('usuario');

    setIsUpatingVins( true );

    for (const obj of data) {

      await updateVinsWithStatus( obj, LoggedUser );

      await updateVinsWithStatusFactura( obj );
      
      await createSinisterLog( obj );

      await createVinsStatusBitacora( obj );

    }

    toast.success("Los VINS han sido actualizados exitosamente."); 
    setIsUpatingVins( false );
    handleUpdateData();

  }

  const updateVinsWithStatus = async ( obj, LoggedUser ) => {
    url = ApiUrl + "api/asignarvins/update_vins_with_status";

    const file = obj.CartaClientePDF;

    const body = {
      VIN                  : obj.VIN,
      NumeroCliente        : obj.NumeroCliente,
      Ubicacion            : obj.Ubicacion,
      NombreCliente        : obj.NombreCliente,
      FechaSolicitudGPS    : obj.FechaSolicitudGPS,
      FechaAceptacionGPS   : obj.FechaAceptacionGPS,
      EstatusGPS           : obj.EstatusGPS,
      EstatusPrevia        : obj.EstatusPrevia,
      EstatusTyT           : obj.EstatusTyT, 
      Patio                : obj.Patio,
      FechaEntregaCliente  : obj.FechaEntregaCliente,
      FechaDeEnvioDocum    : obj.FechaDeEnvioDocum,
      FechaDeRecepcion     : obj.FechaDeRecepcion,
      Observaciones        : obj.Observaciones,
      ObservacionesTyT     : obj.ObservacionesTyT,
      ObservacionesVIN     : obj.ObservacionesVIN,
      retiroDuplicadoLlave : obj.retiroDuplicadoLlave,
      FechaSiniestro       : obj.FechaSiniestro,

      //new properties.
      FechaDetencionSolicit : obj.FechaDetencionSolicit,
      FechaDetencionAut     : obj.FechaDetencionAut,
      FechaGPSSolicit       : obj.FechaGPSSolicit, 
      FechaGPSAut           : obj.FechaGPSAut, 
      FechaSegregacionAut   : obj.FechaSegregacionAut,
      FechaAccesoSolicit    : obj.FechaAccesoSolicit,
      FechaAccesoAut        : obj.FechaAccesoAut,
      FechaPreviaSolicit    : obj.FechaPreviaSolicit,
      FechaPreviaAut        : obj.FechaPreviaAut,
      FechaLiberacionSolicit: obj.FechaLiberacionSolicit,
      FechaLiberacionAut    : obj.FechaLiberacionAut,
      FechaCalidadSolicit   : obj.FechaCalidadSolicit,
      FechaCalidadAut       : obj.FechaCalidadAut,
      FechaPagoSolicit      : obj.FechaPagoSolicit,
      FechaPagoAut          : obj.FechaPagoAut,
      Pago                  : obj.Pago,

      //status tyt dates.
      FechaInterplantaIngreso    : obj.FechaInterplantaIngreso,
      FechaInterplantaSalida     : obj.FechaInterplantaSalida,
      FechaArmViajeIngreso       : obj.FechaArmViajeIngreso,
      FechaArmViajeSalida        : obj.FechaArmViajeSalida,
      FechaAsigSinMadrinaIngreso : obj.FechaAsigSinMadrinaIngreso,
      FechaAsigSinMadrinaSalida  : obj.FechaAsigSinMadrinaSalida,
      FechaAsigEnMadrinaIngreso  : obj.FechaAsigEnMadrinaIngreso,
      FechaAsigEnMadrinaSalida   : obj.FechaAsigEnMadrinaSalida,
      FechaTransitoIngreso       : obj.FechaTransitoIngreso,
      FechaTransitoSalida        : obj.FechaTransitoSalida,
    }

    const formData = new FormData();
    formData.append('agencia', JSON.stringify( agencia ));
    formData.append('body', JSON.stringify( body ));
    formData.append('file', file );
    formData.append('user', JSON.stringify({ "user" : LoggedUser }));

    await axios.patch( url, formData, {       
      headers: { 'content-type': 'multipart/form-data' }
    }).catch(err => {toast.error("No fue posible actualizar el PDF Carta Cliente")});

    formData.delete('agencia');
    formData.delete('body');
    formData.delete('user');
    formData.delete('file');

  }

  const updateVinsWithStatusFactura = async ( obj ) => {

    url = ApiUrl + "api/asignarvins/update_vins_with_status_recibo_factura";

    const body = {
      VIN                  : obj.VIN,
      NumeroCliente        : obj.NumeroCliente,
      NombreCliente        : obj.NombreCliente,
    }
    
    if ( obj.FacturaPagoPDF !== null) {

      const formData = new FormData();

      formData.append('agencia', JSON.stringify( agencia ));
      formData.append('body', JSON.stringify( body ));
      formData.append('file', obj.FacturaPagoPDF );
      formData.append('PDF', JSON.stringify( "FacturaPagoPDF" ));
      
      await axios.patch( url, formData, { 
      headers: { 'content-type': 'multipart/form-data' }
      }).catch(err => {toast.error("No fue posible actualizar el PDF Factura de Pago")});
      
      formData.delete('agencia');
      formData.delete('body');
      formData.delete('file');
      formData.delete('PDF');

    }

  }

  const createVinsStatusBitacora = async ( obj ) => {
    const bodyBitacora = {   
      VIN               : obj.VIN,
      EstatusTyT        : obj.EstatusTyT,
      Observaciones     : obj.Observaciones,
      ObservacionesTyT  : obj.ObservacionesTyT,
      ObservacionesVIN  : obj.ObservacionesVIN, 
      Vehiculo          : obj.Vehiculo,
      OrdenDeCompra     : obj.OrdenDeCompra,
      NumeroCliente     : obj.NumeroCliente
    }

    url = ApiUrl + "api/asignarvins/create_vins_status_bitacora";
    await axiosPostService( url, { body: bodyBitacora, agencia} ).catch( err => toast.error("Error con el servidor."))
  
  }

  const createSinisterLog = async( obj ) => {

    const { EstatusTyT, FechaSiniestro, CiudadDestino, VIN, OrdenDeCompra, NumeroCliente } = obj;
    
    if (EstatusTyT === 0) return;

    if ( EstatusTyT.split('|').shift() === "SINIESTRO" ) {

      url = `${ ApiUrl }api/ordencompra/exist_vin_sinister`;

      const { existVIN } = await axiosPostService( url, { VIN, OrdenDeCompra, Cliente: NumeroCliente } );

      if ( existVIN ) {

        url = `${ ApiUrl }api/ordencompra/update_vin_sinister`; 

        await axiosPatchService( url, { VIN, OrdenDeCompra, NumeroCliente, FechaSiniestro } );

        return;
      }

      url = `${ ApiUrl }api/ordencompra/create_sinister`;

      const body = {
        EstatusTyT, FechaSiniestro, CiudadDestino, VIN, OrdenDeCompra, NumeroCliente, agencia
      }

      await axiosPostService( url, body );

    }

  }

  const validationSinisters = ( data ) => {
    let pass = true;

    for (const obj of data) {

      if ( obj.EstatusTyT !== 0 ) {

        if ( obj.EstatusTyT.split('|').shift() === "SINIESTRO" && obj.FechaSiniestro === "" ) pass = false;

      }


    }

    return pass;

  }


  return (
    isPreviewTable &&
    <>
      {
        isUpatingVins &&
        <div className="row m-2">
          <div className="col">
            <strong>Cargando...</strong>
            <div className="spinner-border ml-4" role="status" aria-hidden="true"></div>
          </div>
        </div>
      }

      <div className='row m-2'>
        <TablaAsignarVinsEstatusGPSClass data={data} agencia={agencia}/>
      </div>

      <button
        className='btn btn-info mt-2 mb-2 ml-2'
        disabled={ data.length === 0 || VINSGeneratedinBD }
        onClick={onGuardarVinsEstatusGPS}
        title='Guardar Permisos en Base de Datos'
        type='button'
      >
          <FontAwesomeIcon  icon={faUpload} />
          <small className='ml-2'>Guardar</small>
      </button>

    </>
  )
}
