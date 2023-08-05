import React, { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

import TablaResumenGeneral from './tablas-vistas/TablaResumenGeneral';
import { ModalResumen } from '../../../modales/resumen/ModalResumen';
import Modal from '../../../modales/shared/Modal';
import { useModal } from '../../../modales/shared/useModal';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { ApiUrl } from '../../../services/ApiRest';
import { validarFecha, isDefaultDate } from '../../../helpers/fecha';
import { upperCase } from '../../../helpers/converToUpperCase';

const ResumenGeneral = ({
  agencia,
  clientes
}) => {
  let url = '';
  const DPP = 'DPP'
  const Ambos = 'Ambos'
  const Todos = 'Todos'
  const Contado = 'Contado'
  const defaultDate = '1900-01-01'
  const permisoDesvioInicial = 'Ambos'
  const [handleSelects, setHandleSelects] = useState({
    NumeroCliente     : clientes.length > 0 ? `${clientes[0].Num_cliente}`  : 0,
    PermisoDesvio     : permisoDesvioInicial,
    FolioDesvio       : "",
    FolioDPP          : ""
  })
  const [data, setData] = useState([])
  const [foliosDesvioList, setFoliosDesvioList] = useState([])
  const [ isOpenModal, openModal, closeModal ] = useModal(false);
  const [extensionOrDPP2ByVIN, setExtensionOrDPP2ByVIN] = useState({data:{},PermisoDesvio:""})
  const [cliente, setCliente] = useState(clientes.length > 0 ? `${clientes[0].Nombre_corto}` : "")

  useEffect(() => {
    if ( clientes.length > 0 ) {
      setHandleSelects({
        ...handleSelects, 
        NumeroCliente     : clientes[0].Num_cliente, 
      })
      setCliente(clientes[0].Nombre_corto)
      getFoliosDesvioByClienteAndPermiso( clientes[0].Num_cliente, handleSelects.PermisoDesvio )
    }
  }, [clientes])

  const getFoliosDesvioByClienteAndPermiso = async ( ncliente, permisoDesvio ) => { 

    url = ApiUrl + "api/dpp_contado/getfoliosdesviobycliente"
    const body_cliente = { Agencia: agencia, NumCliente: ncliente, permisoDesvio:permisoDesvio, pestana: "Resumen" };
    let total_folios_desvio = await axiosPostService( url, body_cliente );

    if ( total_folios_desvio.length === 0 ) {
      setData([])
      setFoliosDesvioList(total_folios_desvio)
      setHandleSelects({ ...handleSelects, NumeroCliente: ncliente, FolioDesvio: "", FolioDPP: "", PermisoDesvio: permisoDesvio })
      return;
    }

    total_folios_desvio = [ {FolioDesvio:'Todos', FolioDPP:'', PermisoDesvio:permisoDesvio, Cliente:ncliente }, ...total_folios_desvio ]
    setFoliosDesvioList([])
    setFoliosDesvioList(total_folios_desvio)

    const firstFolioOfList = total_folios_desvio[0].FolioDesvio;
    const firstFolioDPPOfList = total_folios_desvio[0].FolioDPP;
    getVinsByFolioDesvioAndFolioDPP( firstFolioOfList, ncliente, permisoDesvio, firstFolioDPPOfList )

  }
  
  const getVinsByFolioDesvioAndFolioDPP = async ( folioDesvio, NumCliente, permisoDesvio, folioDPP ) => {
    url = ApiUrl + "api/dpp_contado/getvinsclienttoresumen"
    const body_cliente = { 
      Agencia       : agencia, 
      NumCliente    : NumCliente, 
      PermisoDesvio : permisoDesvio,
      folioDesvio   : folioDesvio,
      FolioDPP      : folioDPP
    };
    const total_vins_to_show = await axiosPostService( url, body_cliente );

    setData(total_vins_to_show);
    setHandleSelects({ ...handleSelects, FolioDesvio: folioDesvio, PermisoDesvio: permisoDesvio, NumeroCliente: NumCliente, FolioDPP: folioDPP })
  }

  const showDetails = ( registro ) => {
    
    if ( registro.PermisoDesvio === DPP ) setExtensionOrDPP2ByVIN({ data: registro, PermisoDesvio: DPP })
    if ( registro.PermisoDesvio === Contado ) setExtensionOrDPP2ByVIN({ data: registro, PermisoDesvio: Contado })
    openModal();
  }

  const OnChangeHandler = (e) => {
    const selectedSelect = e.target.name;
    if ( selectedSelect === 'PermisoDesvio' ) {
      const permisodesv = e.target.value;
      getFoliosDesvioByClienteAndPermiso( handleSelects.NumeroCliente, permisodesv )
      return;
    }
    if ( selectedSelect === 'FolioDesvio' ) {
      const [ foldesv, permdesv, numclient, folDPP ] = e.target.value.split("|");
      getVinsByFolioDesvioAndFolioDPP( foldesv, handleSelects.NumeroCliente, handleSelects.PermisoDesvio, folDPP )
      return;
    }
    if ( selectedSelect === 'Cliente' ) {
      const [ Ubicacion, Nombre_cliente, Num_cliente ] = e.target.value.split("|");
      setCliente(Nombre_cliente);
      getFoliosDesvioByClienteAndPermiso( Num_cliente, handleSelects.PermisoDesvio );
    }
  }

  const showIcons =( registro ) => { 
    if ( registro.PermisoDesvio ===  DPP ) {
      if ( registro.FechaSolicitudFase2 !== null && registro.FechaVencimientoFase2 !== null ) return true;
      return false;
    }

    if ( registro.PermisoDesvio ===  Contado ) {
      if ( registro.numExtensiones > 0 ) return true;
      return false;
    }
  }

  const cerrarModalExt = () => {
    closeModal()
  }

  return (
    <>
      <div className="row m-2">
        <Modal isOpen={isOpenModal} closeModal={closeModal}>
          <ModalResumen
            extensionOrDPP2ByVIN={extensionOrDPP2ByVIN}
            onSubmit={cerrarModalExt}
            agencia={agencia}
          />
        </Modal>
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            
            <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
            
            <select
              name='Cliente'
              className='form-select select-class-1 width__label-input mt-2'
              onChange={OnChangeHandler}
              // onChange={(e) => changeSelectClientes(e)}
              tabIndex={1}
              // disabled={isPreviewTable}
            >
              {
                clientes
                .map(cliente => {
                  return (
                    <option 
                    value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                    >
                        {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                    </option>
                  )
                })
              }
            </select>

          </div>
        </div>
      </div>

      <div className="row m-2">
        
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            
            <h6 className='mr-4 width__label-input-min'>Permiso Desvío: </h6>
            
            <select
              name='PermisoDesvio'
              className='form-select select-class-1 width__label-input mt-2'
              tabIndex={2}
              onChange={OnChangeHandler}
            // disabled={isPreviewTable}
            >
              <option value="Ambos"> DPP Y CONTADO </option>
              <option value="DPP">     DPP FASE 1 - DPP FASE 2     </option>
              <option value="Contado"> CONTADO - EXTENSIÓN PERMISO </option>
            </select>

          </div>
        </div>

      </div>

      <div className="row m-2">
        <div className="col-6">
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Folio Desvío | Folio DPP : </h6>
              
              <select
                name='FolioDesvio'
                className='form-select select-class-1 width__label-input mt-2'
                tabIndex={2}
                onChange={OnChangeHandler}
                disabled={foliosDesvioList.length === 0 }
              >
                {
                  foliosDesvioList.map(foliod => {
                    return (
                      <option 
                        selected={ foliod.FolioDesvio === Todos }
                        value={`${foliod.FolioDesvio}|${foliod.PermisoDesvio}|${foliod.Cliente}|${foliod.FolioDPP}`}
                      >
                        { `${foliod.FolioDesvio} - ${foliod.FolioDPP}` }
                      </option>
                    )
                  })
                }
              </select>

            </div>
          </div>
        </div>

        <div className="row m-2 d-flex justify-content-between">
          <h6 className='ml-2'>Total de registros encontrados:</h6>
        </div>

        <div className="row">
          <div className="table-responsive">
            <table className='table display compact' style={{fontSize:11}}>
                <thead style={{backgroundColor:'#1565C0', color:'white'}}>
                  <tr className='text-center'>
                    <th>VIN</th>
                    <th>Permiso Desvío</th>
                    <th>Folio Desvío</th>
                    <th>Folio DPP</th>
                    <th>Fecha Vencimiento</th>
                    <th>Fecha Vencimiento DPP</th>
                    <th>Orden Compra</th>
                    <th>Folio Compra</th>
                    <th>Ver Detalles</th>
                  </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                  {
                    data.length > 0 
                    ? data.map(( registro ) => {
                      return (
                        <tr className='text-center'>
                          <td>{registro.VIN}</td>
                          <td>{ upperCase( registro.PermisoDesvio ) }</td>
                          <td>{ upperCase( registro.FolioDesvio ) }</td>
                          <td>{ upperCase( registro.FolioDPP ) }</td>
                          <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                          <td>{ registro.FechaVencimientoFase2 === null ? validarFecha(isDefaultDate(registro.FechaVencimientoDPP1)) : validarFecha(isDefaultDate(registro.FechaVencimientoFase2))}</td>
                          <td>{ upperCase( registro.OrdenDeCompra ) }</td>
                          <td>{ upperCase( registro.Folio_compra_contrato ) }</td>
                          <td>
                            {showIcons( registro ) &&
                            <button
                            // title='Ver las fechas de las extensiones || DPP'
                            title={registro.PermisoDesvio === DPP ? 'Fechas DPP Fase 2' : 'Fechas Extensiones Permiso'}
                            type='button'
                            className='btn btn-outline-dark'
                            onClick={() => showDetails(registro)}
                            >
                              <FontAwesomeIcon icon={faEye}/>
                            </button>}
                          </td>
                        </tr>
                      )
                    })
                    :
                    <tr className='p-2'>
                      <td>No se encontraron registros</td>
                      <td></td>
                      <td></td>
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
          </div>
        </div>
        <TablaResumenGeneral
          handleSelects={handleSelects}
          agencia={agencia}
          Cliente={cliente}
        />
    </>
  )
}

export default ResumenGeneral