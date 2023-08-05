import React, { useState, useEffect } from 'react'

import { ApiUrl } from '../../../services/ApiRest'
import { axiosPatchService, axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import { validarFecha, isDefaultDate } from '../../../helpers/fecha'
import TablaCancelaciones from './tablas-vistas/TablaCancelaciones'
import { upperCase } from '../../../helpers/converToUpperCase'

const Cancelaciones = ({
  agencia,
  clientes
}) => {

  const permisoDesvioInicial = "DPP"
  /* const DPP = 'DPP'
  const Contado = 'Contado' */
  const [writtendata, setWrittendata] = useState({
    NumeroCliente     : clientes.length > 0 ? `${clientes[0].Num_cliente}`  : 0,
    PermisoDesvio     : permisoDesvioInicial,
    FolioDesvio       : "",
    FolioDPP          : "",
  })
  const [VINClientes, setVINClientes] = useState([])
  const [VINClientesGenerados, setVINClientesGenerados] = useState([])
  const [foliosDesvioList, setFoliosDesvioList] = useState([])
  const [VINSGeneratedinBD, setVINSGeneratedinBD] = useState(false)
  const [isPreviewTable, setIsPreviewTable] = useState(false)
  const [table, setTable] = useState(permisoDesvioInicial)
  let url = '';

  useEffect(() => {
    if ( clientes.length > 0 ) {
      setWrittendata({
        ...writtendata, 
        NumeroCliente     : clientes[0].Num_cliente, 
      })
      getFoliosDesvioByClienteAndPermiso( clientes[0].Num_cliente, writtendata.PermisoDesvio )
    }
  }, [clientes])

  const getFoliosDesvioByClienteAndPermiso = async ( ncliente, permisoDesvio ) => { 
    url = ApiUrl + "api/dpp_contado/getfoliosdesviobycliente"
    const body_cliente = { Agencia: agencia, NumCliente: ncliente, permisoDesvio:permisoDesvio, pestana: "Cancelaciones" };
    let total_folios_desvio = await axiosPostService( url, body_cliente );
    setFoliosDesvioList(total_folios_desvio)

    if ( total_folios_desvio.length > 0 ) {
      let firstFolioOfList = total_folios_desvio[0].FolioDesvio;
      let firstFolioDPPOfList = total_folios_desvio[0].FolioDPP;
      getVinsByFolioDesvioAndFolioDPP( firstFolioOfList, ncliente, permisoDesvio, firstFolioDPPOfList )
      setWrittendata({ ...writtendata, NumeroCliente: ncliente, FolioDesvio: firstFolioOfList, PermisoDesvio: permisoDesvio, FolioDPP: firstFolioDPPOfList })
    }

    if ( total_folios_desvio.length === 0 ) {
      setVINClientes([])
      if ( !isPreviewTable && VINClientesGenerados.length > 0 ) setVINClientesGenerados([]);
      setWrittendata({ ...writtendata, NumeroCliente: ncliente, FolioDesvio: "", PermisoDesvio: permisoDesvio, FolioDPP: "" })
    }

  }

  const getVinsByFolioDesvioAndFolioDPP = async ( folioDesvio, NumCliente, permisoDesvio, folioDPP ) => {
    url = ApiUrl + "api/dpp_contado/getvinsclienttocancel"
    const body_cliente = { 
      Agencia         : agencia, 
      NumCliente      : NumCliente, 
      PermisoDesvio   : permisoDesvio,
      folioDesvio     : folioDesvio,
      folioDPP        : folioDPP  
    };

    if ( !isPreviewTable && VINClientesGenerados.length > 0 ) setVINClientesGenerados([]);
    let total_vins_to_cancel = await axiosPostService( url, body_cliente )

    if ( total_vins_to_cancel.length  > 0 ) total_vins_to_cancel = agregarVariableIsSelected(total_vins_to_cancel);

    setVINClientes(total_vins_to_cancel);

  }

  const insertNewVIN = (object, checked) => {
    if ( !checked ) {
      const updateList = VINClientesGenerados.filter((row) => {
          return row.VIN !== object.VIN
      })

      setVINClientesGenerados(updateList)
      return;
    }

    setVINClientesGenerados([
      ...VINClientesGenerados,
      {
        ...object,
        NumeroCliente     : writtendata.NumeroCliente,
      }
    ])
  }

  const agregarVariableIsSelected = ( total_vins_to_cancel ) => {
    const lista = total_vins_to_cancel.map((obj) => {
      let changeObj = {
        ...obj,
        isVinSelected: false
      }
      return changeObj;
    })
    return lista;
  }

  const handleVinSelected = ( e, registro ) => {
    const checked = e.target.checked;
    const updateVIN = VINClientes.map((row) => {
      if ( registro.VIN === row.VIN ) {
        let updateRow = {
          ...row,
          isVinSelected : checked,
        }
        insertNewVIN(updateRow, checked)
        return updateRow;
      }

      return row;
    })

    if ( VINSGeneratedinBD ) setVINSGeneratedinBD( false )
    setVINClientes( updateVIN )
  }

  const OnChange = (e) => {
    //PermisoDesvio
    if ( e.target.name === 'PermisoDesvio' ) {
      let permisodesv = e.target.value;
      setTable(permisodesv)
      getFoliosDesvioByClienteAndPermiso( writtendata.NumeroCliente, permisodesv )
      setVINSGeneratedinBD( false )
      return;
    }

    if ( e.target.name === 'FolioDesvio' ) {
      const [ foldesv, permdesv, numclient, folDPP ] = e.target.value.split("|");
      getVinsByFolioDesvioAndFolioDPP( foldesv, writtendata.NumeroCliente, writtendata.PermisoDesvio, folDPP )
      setWrittendata({ ...writtendata, FolioDesvio: foldesv, FolioDPP: folDPP })
      setVINSGeneratedinBD( false )
      return;
    }

  }

  const changeSelectClientes = async(e) => {
    const [ Ubicacion, Nombre_cliente, Num_cliente ] = e.target.value.split("|");
    getFoliosDesvioByClienteAndPermiso( Num_cliente, writtendata.PermisoDesvio );
    setVINSGeneratedinBD( false )
    
  }

  const afterCancel = () => {
    const numcli = writtendata.NumeroCliente;
    const permdesv = writtendata.PermisoDesvio;
    const foldesv = writtendata.FolioDesvio;
    const folDPP = writtendata.FolioDPP;
    setVINSGeneratedinBD( true );
    getVinsByFolioDesvioAndFolioDPP( foldesv, numcli, permdesv, folDPP );
  }

  const onGenerateTable = () => {
    if ( VINSGeneratedinBD ) setVINClientesGenerados([]);
    setIsPreviewTable( !isPreviewTable )
  }

  return (
    <>
      <div className="row m-2">
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
              
              <select 
                // name='Cliente' 
                className='form-select select-class-1 width__label-input mt-2' 
                disabled={isPreviewTable}
                onChange={(e) => changeSelectClientes(e)}
                tabIndex={1}
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
                  className='form-select select-class-1 width__label-input mt-2' 
                  disabled={isPreviewTable}
                  name='PermisoDesvio' 
                  onChange={OnChange}
                  tabIndex={2} 
                >
                      <option value="DPP"> DPP </option>
                      <option value="Contado"> Contado </option>
                </select>

            </div>
        </div>
      </div>
      <div className="row m-2">
        <div className="col-6">
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                
                <h6 className='mr-4 width__label-input-min'>Folio Desvío | Folio DPP : </h6>
                
                <select 
                  className='form-select select-class-1 width__label-input mt-2' 
                  disabled={ foliosDesvioList.length === 0 || isPreviewTable}
                  name='FolioDesvio' 
                  onChange={OnChange}
                  tabIndex={2} 
                >
                    {
                      foliosDesvioList.map(foliod => {
                        return (
                          <option value={ `${foliod.FolioDesvio}|${foliod.PermisoDesvio}|${foliod.Cliente}|${foliod.FolioDPP}` }>
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
        <h6 className='ml-2'>Seleccionar Permiso y Folio Desvío, que desea cancelar</h6>
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        // onClick={onCancelFolio}
        onClick={onGenerateTable}
        disabled={VINClientesGenerados.length === 0}
        >
          { isPreviewTable ? <small>Regresar</small> :  <small>Vista previa</small> }
        </button>
      </div>

        {
          !isPreviewTable &&
          table !== "DPP"
          ?
          <div className="row m-2">
          <div className='table-responsive'>
          <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>Seleccionar</th>
                <th>VIN</th>
                <th>Fecha Vencimiento</th>
                <th>Orden Compra</th>
                <th>Folio Compra</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              VINClientes.length 
              > 0 ?
              VINClientes
              .map((registro) => {
                return (
                  <tr className='text-center'>
                    <td>
                      <input 
                      checked={registro.isVinSelected} 
                      className="form-check-input" 
                      name="vin_selected" 
                      onChange={( e ) => handleVinSelected( e, registro )}
                      type="checkbox" 
                      value="vin_selected"
                      disabled={ '' /* disabledVINSelected(registro.vinBlocked) */ } 
                      />
                    </td>
                    <td>{registro.VIN}</td>
                    <td>{validarFecha(registro.FechaVencimiento)}</td>
                    <td>{registro.OrdenDeCompra}</td>
                    <td>{registro.Folio_compra_contrato}</td>
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
              </tr>
            }
            </tbody>
          </table>
          </div>
      </div>
        :
        !isPreviewTable &&
        <div className="row m-2">
          <div className='table-responsive'>
          <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center'>
                <th>Seleccionar</th>
                {/* <th>Permiso Desvio</th> */}
                {/* <th>Folio Desvio</th> */}
                <th>VIN</th>
                <th>Folio DPP</th>
                <th>Fecha Vencimiento</th>
                <th>Fecha Vencimiento DPP 1</th>
                <th>Orden Compra</th>
                <th>Folio Compra</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              VINClientes.length 
              > 0 ?
              VINClientes
              .map((registro) => {
                return (
                  <tr className='text-center'>
                    
                    <td>
                      <input 
                      checked={registro.isVinSelected} 
                      className="form-check-input" 
                      name="vin_selected" 
                      onChange={( e ) => handleVinSelected( e, registro )}
                      type="checkbox" 
                      value="vin_selected"
                      disabled={ '' /* disabledVINSelected(registro.vinBlocked) */ } 
                      />
                    </td>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.FolioDPP ) }</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                    <td>{ upperCase( registro.OrdenDeCompra ) }</td>
                    <td>{ upperCase( registro.Folio_compra_contrato ) }</td>
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
                  {writtendata.PermisoDesvio && <td></td>}
              </tr>
            }
            </tbody>
          </table>
          </div>
      </div>
      }

      <TablaCancelaciones
        agencia={agencia}
        data={VINClientesGenerados}
        isPreviewTable={isPreviewTable}
        valorPermisoDesvio={writtendata.PermisoDesvio}
        afterCancel={afterCancel}
      />


      <div className="row m-2">
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        // onClick={onCancelFolio} 
        onClick={onGenerateTable} 
        disabled={VINClientesGenerados.length === 0}
        >
          { isPreviewTable ? <small>Regresar</small> :  <small>Vista previa</small>}
        </button>
      </div>
      
    </>
  )
}

export default Cancelaciones