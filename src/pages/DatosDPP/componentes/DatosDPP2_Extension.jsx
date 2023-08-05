import React, { useState, useEffect, useRef } from 'react'

import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'

import TablaDPP2_Extension from './tablas-vistas/TablaDPP2_Extension'
import { validarFecha, isDefaultDate } from '../../../helpers/fecha'
import { ApiUrl } from '../../../services/ApiRest'
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import Modal from '../../../modales/shared/Modal'
import { useModal } from '../../../modales/shared/useModal'
import { ModalExtensionPermiso } from '../../../modales/extensionpermiso/ModalExtensionPermiso'
import { upperCase } from '../../../helpers/converToUpperCase'

const DatosDPP2_Extension = ({ clientes, agencia }) => {

    let url = ""
    const permisoDesvioInicial = "DPP"
    const DPP = 'DPP'
    const Contado = 'Contado'
    const defaultDate = '1900-01-01'
    const ref = useRef();
    const checkBoxSelectedAll = useRef();
    // const checkBoxSelectedAllContado = useRef();

    const [writtendata, setWrittendata] = useState({
        NumeroCliente     : clientes.length > 0 ? `${clientes[0].Num_cliente}`  : 0,
        PermisoDesvio     : permisoDesvioInicial,
        FolioDesvio       : "",
        FechaSolicitud    : "",
        FechaVencimiento  : "",
        FolioDPP2         : "",
        DocumentoPDF      : "",
        FolioDPP          : "",
    })
    const [cliente, setCliente] = useState(clientes.length > 0 ? `${clientes[0].Nombre_corto}` : "")
    const [isPreviewTable, setIsPreviewTable] = useState(false)
    const [VINClientes, setVINClientes] = useState([])
    const [VINClientesGenerados, setVINClientesGenerados] = useState([])
    const [foliosDesvioList, setFoliosDesvioList] = useState([])
    const [VINSGeneratedinBD, setVINSGeneratedinBD] = useState(false)
    const [table, setTable] = useState(permisoDesvioInicial)
    const [ isOpenModal, openModal, closeModal ] = useModal(false);
    const [extensionesPermisoByVIN, setExtensionesPermisoByVIN] = useState({VIN:"",FolioDesvio:""})
    const [isExcelAndPrintButtonEneabled, setIsExcelAndPrintButtonEneabled]   = useState(false)
    const [checkAll, setCheckAll] = useState(false);
    // const [checkAllContado, setCheckAllContado] = useState(false);

    useEffect(() => {
        if ( clientes.length > 0 ){
           setWrittendata({ 
            ...writtendata, 
            NumeroCliente : clientes[0].Num_cliente, 
          })
          setCliente(clientes[0].Nombre_corto)
          getFoliosDesvioByClienteAndPermiso( clientes[0].Num_cliente, writtendata.PermisoDesvio )
        }
    }, [clientes])

    useEffect(() => {
      if ( ! isPreviewTable ) {
        checkBoxSelectedAll.current.checked = checkAll;
      }
    }, [isPreviewTable])

    const getFoliosDesvioByClienteAndPermiso = async ( ncliente, permisoDesvio ) => {
      url = ApiUrl + "api/dpp_contado/getfoliosdesviobycliente"
      const body_cliente = { Agencia: agencia, NumCliente: ncliente, permisoDesvio:permisoDesvio, pestana: "DPP2_Extensiones" };
      let total_folios_desvio = await axiosPostService( url, body_cliente )
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

    const getVinsByFolioDesvioAndFolioDPP = async ( folioDesvio, ncliente, permisoDesvio, folioDPP ) => {
      url = ApiUrl + "api/dpp_contado/getvinsclientetoDPP2orExt";
      const body_cliente = { 
        Agencia       : agencia, 
        NumCliente    : ncliente, 
        permisoDesvio : permisoDesvio,
        folioDesvio   : folioDesvio,
        folioDPP      : folioDPP   
      }

      if( checkBoxSelectedAll.current?.checked !== null ) {
        if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
        
      }

      if ( !isPreviewTable && VINClientesGenerados.length > 0 ) setVINClientesGenerados([]);
      let vins_by_folio_desvio = await axiosPostService( url, body_cliente )

      if ( vins_by_folio_desvio.length > 0 ) vins_by_folio_desvio = agregarVariableIsSelected( vins_by_folio_desvio );

      setVINClientes( vins_by_folio_desvio )

    }

    const agregarVariableIsSelected = ( vins_by_folio_desvio ) => {
      const list = vins_by_folio_desvio.map((obj) => {
        let addProperty = {
          ...obj,
          isVinSelected :  false,
          isOnBD        : (obj.PermisoDesvio === "DPP" && obj.FechaSolicitudFase2 !== null && obj.FechaVencimientoFase2 !== null) ? true : false
        }
        return addProperty;
      })
      return list;
    }

    const OnChange = ( e ) => {

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

      if ( e.target.name === 'DocumentoPDF' ) {
        setWrittendata({
          ...writtendata,
          [e.target.name] : e.target.files[0]
        })
        return;
      }

      setWrittendata({
        ...writtendata,
        [e.target.name] : e.target.value
      })
    }

    const changeSelectClientes = ( e ) => {
      const [ Ubicacion, Nombre_cliente, Num_cliente ] = e.target.value.split("|");
      getFoliosDesvioByClienteAndPermiso( Num_cliente, writtendata.PermisoDesvio )
      // setWrittendata({...writtendata, Cliente: Nombre_cliente})
      setCliente(Nombre_cliente);
      setVINSGeneratedinBD( false );
      if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    }

    const handleVinSelected = ( e, registro ) => {

      const checked = e.target.checked;
      const updateVIN = VINClientes.map((row) => {
        if ( registro.VIN === row.VIN ) {
          let updateRow = {}

          if ( writtendata.PermisoDesvio ===  DPP ) {
            updateRow = {
              ...row,
              isVinSelected         : checked,
              FechaVencimientoFase2 : !checked ? defaultDate  : writtendata.FechaVencimiento,
              FechaSolicitudFase2   : !checked ? defaultDate  : writtendata.FechaSolicitud,
              FolioDPP              : !checked ? row.FolioDPP : writtendata.FolioDPP2,
              OldFolioDPP           : writtendata.FolioDPP
            }
          }

          if ( writtendata.PermisoDesvio ===  Contado ) {
            updateRow = {
              ...row,
              isVinSelected        : checked,
              FechaVencimientoExtP : !checked ? defaultDate : writtendata.FechaVencimiento,
              FechaSolicitudExtP   : !checked ? defaultDate : writtendata.FechaSolicitud,
              FolioDPP             : ""
              //Documento adjunto se enviará por separado
            }
          }
          insertNewVIN(updateRow, checked)
          return updateRow;
        }
  
        return row;
      })

      if ( VINSGeneratedinBD ) setVINSGeneratedinBD( false )
      setVINClientes(updateVIN)
      if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
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
          Cliente : writtendata.NumeroCliente
        }
      ])
    }

    const showExtensions = (registro) => {
      setExtensionesPermisoByVIN({VIN: registro.VIN , FolioDesvio: registro.FolioDesvio})
      openModal();
    }

    const cerrarModalExt = () => {
      closeModal()
    }

    const onGenerateTable = () => {

      if ( existsSomeEmptyDate() !== undefined) {
        toast.info("Existen vins seleccionados sin fecha solicitud y vencimiento.")
        return;
      }

      if ( writtendata.PermisoDesvio === DPP && existsSomeEmptyFolioDPP2() !== undefined) {
        const addFolioDPPToVINGenerados = VINClientesGenerados.map((row) => ({ ...row, FolioDPP:row.OldFolioDPP }));
        setVINClientesGenerados(addFolioDPPToVINGenerados);
      }

      if ( VINSGeneratedinBD ) setVINClientesGenerados([]);
      setIsPreviewTable( !isPreviewTable )
    }

    const existsSomeEmptyFolioDPP2 = () => {
      return VINClientesGenerados.find( (obj) => {
        if ( obj.FolioDPP === "" ){
          return obj;
        }
      })
    }

    const existsSomeEmptyDate = () => {
      return VINClientesGenerados.find( (obj) => {
        if ( writtendata.PermisoDesvio === Contado ){
          if ( obj.FechaSolicitudExtP === "" || obj.FechaVencimientoExtP === "" ) return obj;
          return;
        }
        if ( obj.FechaSolicitudFase2 === "" || obj.FechaVencimientoFase2 === "" ) return obj;

      })
    }

    const afterRegister = () => {
      if ( ! isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( true );
      const foldes = writtendata.FolioDesvio;
      const numcli = writtendata.NumeroCliente;
      const permdes = writtendata.PermisoDesvio;
      let folDPP = writtendata.FolioDPP;
      // if ( permdes === Contado ) folDPP = writtendata.FolioDPP;


      setVINSGeneratedinBD( true )
      if ( writtendata.PermisoDesvio === Contado ) ref.current.value = "";
      getVinsByFolioDesvioAndFolioDPP( foldes, numcli, permdes, folDPP );
      setCheckAll(false);
      // setCheckAllContado(false);
    }

    const handleVinSelectedAll = ({ target }) => {
      const checked = target.checked;

      const updateVINS = VINClientes.map((row) => {

        if ( writtendata.PermisoDesvio ===  DPP ) {
          if ( row.isOnBD ) {
            return {
              ...row
            }
          }
          if ( !row.isOnBD ) {
            return {
              ...row,
              isVinSelected         : checked,
              FechaVencimientoFase2 : !checked ? defaultDate  : writtendata.FechaVencimiento,
              FechaSolicitudFase2   : !checked ? defaultDate  : writtendata.FechaSolicitud,
              FolioDPP              : !checked ? row.FolioDPP : writtendata.FolioDPP2,
              OldFolioDPP           : writtendata.FolioDPP
            }

          }
        }

        if ( writtendata.PermisoDesvio ===  Contado ) {
          /* Las propiedades FechaVencimientoExtP, FechaSolicitudExtP no vienen en la query, al desplegar la info. */

          return {
            ...row,
            isVinSelected        : checked,
            FechaVencimientoExtP : !checked ? defaultDate : writtendata.FechaVencimiento,
            FechaSolicitudExtP   : !checked ? defaultDate : writtendata.FechaSolicitud,
            FolioDPP             : ""
          }
        }

      })

      setIsExcelAndPrintButtonEneabled(false)
      setVINSGeneratedinBD(false)
      /* Actualizar estado de la lista updateVINS  */
      setVINClientes(updateVINS)

      if ( checked ) {
        const filtrarVINSYaEnLista = updateVINS.filter((obj) =>  VINClientesGenerados.find(row => row.VIN === obj.VIN ) === undefined );
        const filtrarVINYaEnBD = filtrarVINSYaEnLista.filter((obj) => !obj.isOnBD );
        setVINClientesGenerados([ ...VINClientesGenerados, ...filtrarVINYaEnBD ]);
        setCheckAll( checked );
        // setCheckAllContado( checked );
        return;
      }

      
      setCheckAll( checked );
      // setCheckAllContado( checked );
      const filtrarVINYaEnBD = VINClientesGenerados.filter((obj) => obj.isOnBD )
      setVINClientesGenerados(filtrarVINYaEnBD);
    }

  return (
    <>
        <div className="row m-2">
          <Modal isOpen={isOpenModal} closeModal={closeModal}>
            <ModalExtensionPermiso 
              onSubmit={cerrarModalExt}
              extensionesPermisoByVIN={extensionesPermisoByVIN}
              agencia={agencia}
            />
          </Modal>
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
              
              <select 
                className='form-select select-class-1 width__label-input mt-2' 
                onChange={(e) => changeSelectClientes(e)}
                tabIndex={1}
                disabled={isPreviewTable}
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
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              <h6 className='mr-4 width__label-input-min'>Fecha Solicitud: </h6>
              <input 
              className='input-class width__label-input mt-2' 
              type="date" 
              name="FechaSolicitud" 
              value={writtendata.FechaSolicitud} 
              onChange={OnChange}
              disabled={isPreviewTable}
              tabIndex={5}
              min="2022-01-01"
              />
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
              onChange={OnChange}
              disabled={isPreviewTable}
              >
                    <option value="DPP"> DPP Fase 1 a DPP Fase 2 </option>
                    <option value="Contado"> Contado a Extensión Permiso </option>
              </select>
          </div>
        </div>
        
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Fecha Vencimiento: </h6>
              
              <input 
                className='input-class width__label-input mt-2' 
                disabled={isPreviewTable}
                min="2022-01-01"
                name="FechaVencimiento" 
                onChange={OnChange}
                tabIndex={6}
                type="date" 
                value={writtendata.FechaVencimiento} 
              />

          </div>
        </div>
      </div>
      <div className="row m-2">
        <div className="col-6" >
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
        {
          writtendata.PermisoDesvio === DPP ?
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            
            <h6 className='mr-4 width__label-input-min'>Folio DPP Fase 2: </h6>
            
            <input 
              className='input-class width__label-input mt-2' 
              disabled
              name="FolioDPP2" 
              onChange={OnChange}
              tabIndex={8}
              type="text" 
              value={writtendata.FolioDPP2} 
            />

          </div>
        </div>
          :
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Documento PDF: </h6>
              
              <input 
                accept='.pdf'               
                className='custom-file-upload width__label-input mt-2'
                disabled={isPreviewTable}
                name="DocumentoPDF"
                onChange={OnChange}
                ref={ref}
                style={{ border:'none' }}
                tabIndex={8}
                type="file" 
              />

          </div>
        </div>
        }
      </div>


      <div className="row m-2 d-flex justify-content-between">
        { writtendata.PermisoDesvio === DPP 
        ? <h6 className='ml-2'>Seleccionar VIN's que integran el DPP Fase 2</h6>
        : <h6 className='ml-2'>Seleccionar VIN's que integran la Extensión Permiso</h6>}
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        onClick={onGenerateTable}
        disabled={VINClientesGenerados.length === 0}
        >
          { isPreviewTable ? 'Regresar' : writtendata.PermisoDesvio === DPP ? <small>Aplicar DPP Fase 2</small> : <small>Aplicar Extensión Permiso</small>}
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
              
              <tr style={{borderBottom:'2px solid #1565C0'}}>
                <th></th>
                <th>
                  <div style={{paddingBottom:'10px', paddingTop:'0px', paddingLeft:'50%'}}>
                    <input 
                      className="form-check-input" 
                      name="vin_selected_all" 
                      onChange={ handleVinSelectedAll }
                      type="checkbox" 
                      value="vin_selected_all"
                      ref={ checkBoxSelectedAll }
                      disabled={ VINClientes.length === 0 }  
                    />
                  </div>  
                </th>
                <th></th> <th></th> <th></th> <th></th>
                <th></th> <th></th> <th></th> <th></th> <th></th>
              </tr>

              <tr className='text-center' style={{borderTop:'3px solid #1565C0'}}>
                <th className='noselect' style={{fontSize:11}}>#</th>
                <th> { `Seleccionar VINS (${VINClientesGenerados.length})` }</th>
                <th>VIN</th>
                <th>Permiso Desvío</th>
                <th>Folio Desvío</th>
                <th>Fecha Vencimiento</th>
                <th>Fecha Solicitud Ext.</th>
                <th>Fecha Vencimiento Ext.</th>
                <th>Orden Compra</th>
                <th>Folio Compra</th>
                <th>Mostrar Extensiones</th>
              </tr>

            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              VINClientes.length > 0 && table === Contado
              ? VINClientes.map((registro, index) => {
                return (
                  <tr className='text-center'>
                    <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>
                    <td>
                      <input 
                      checked={registro.isVinSelected} 
                      className="form-check-input" 
                      name="vin_selected" 
                      onChange={( e ) => handleVinSelected( e, registro )}
                      type="checkbox" 
                      // disabled={ true } 
                      />
                    </td>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.PermisoDesvio ) }</td>
                    <td>{ upperCase( registro.FolioDesvio ) }</td>
                    <td>{validarFecha(registro.FechaVencimiento)}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaSolicitudExtP))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoExtP))}</td>
                    <td>{ upperCase( registro.OrdenDeCompra ) }</td>
                    <td>{ upperCase( registro.Folio_compra_contrato )}</td>
                    <td>
                      <button
                       title='Ver las fechas de las extensiones'
                       type='button'
                       className='btn btn-outline-dark'
                       onClick={() => showExtensions(registro)}
                       >
                         <FontAwesomeIcon icon={faEye}/>
                      </button>
                    </td>
                    {/* <td>{registro.DocumentoAdjunto}</td> */}
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
              
              <tr style={{borderBottom:'2px solid #1565C0'}}>
                <th></th>
                <th>
                  <div style={{paddingBottom:'10px', paddingTop:'0px', paddingLeft:'50%'}}>
                    <input 
                      className="form-check-input" 
                      name="vin_selected_all" 
                      onChange={ handleVinSelectedAll }
                      type="checkbox" 
                      value="vin_selected_all"
                      ref={ checkBoxSelectedAll }
                      disabled={ VINClientes.length === 0 }  
                    />
                  </div>  
                </th>
                <th></th> <th></th> <th></th> <th></th>
                <th></th> <th></th> <th></th> <th></th> <th></th>
              </tr>
              
              <tr className='text-center' style={{borderTop:'3px solid #1565C0'}}>
                <th className='noselect' style={{fontSize:11}}>#</th>
                <th> { `Seleccionar VINS (${VINClientesGenerados.length})` }</th>
                <th>VIN</th>
                <th>Permiso Desvío</th>
                <th>Folio DPP</th>
                <th>Fecha Vencimiento</th>
                <th>Fecha Vencimiento DPP 1</th>
                <th>Fecha Solicitud DPP 2</th>
                <th>Fecha Vencimiento DPP 2</th>
                <th>Orden Compra</th>
                <th>Folio Compra</th>
                {/* <th>Folio DPP 2</th> */}
              </tr>

            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}

            { 
            VINClientes.length > 0 && table === DPP
              ?
              VINClientes
              .map((registro, index) => {
                return (
                  <tr className='text-center'>
                    <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>
                    <td>
                      <input 
                        checked={registro.isVinSelected}
                        className="form-check-input" 
                        name="vin_selected" 
                        onChange={( e ) => handleVinSelected( e, registro )}
                        type="checkbox" 
                      />
                    </td>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.PermisoDesvio ) }</td>
                    <td>{ upperCase( registro.FolioDPP ) }</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaSolicitudFase2))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimientoFase2))}</td>
                    <td>{ upperCase( registro.OrdenDeCompra ) }</td>
                    <td>{ upperCase( registro.Folio_compra_contrato ) }</td>
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
      }

      <TablaDPP2_Extension
        agencia={agencia}
        data={VINClientesGenerados}
        isPreviewTable={isPreviewTable}
        valorPermisoDesvio={writtendata.PermisoDesvio}
        documentoPDF={writtendata.DocumentoPDF}
        Cliente={cliente}
        afterRegister={afterRegister}
        isExcelAndPrintButtonEneabled={isExcelAndPrintButtonEneabled}
      /> 
     
      <div className="row m-2">
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        onClick={onGenerateTable} 
        disabled={VINClientesGenerados.length === 0} 
        >
          { isPreviewTable ? 'Regresar' : writtendata.PermisoDesvio === DPP ? <small>Aplicar DPP Fase 2</small> : <small>Aplicar Extensión Permiso</small>}
        </button>
      </div>
    </>
  )
}

export default DatosDPP2_Extension