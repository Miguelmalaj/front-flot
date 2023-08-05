import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'
import $ from 'jquery'

import { useModal } from '../../modales/shared/useModal';
import Modal from '../../modales/shared/Modal';
import ModalGrande from '../../modales/shared/ModalGrande';
import { ApiUrl } from '../../services/ApiRest';
import { getAgencia } from '../../helpers/getAgencia';
import { clientesDataTable } from '../../components/datatable/conf';
import { ModalClientes } from '../../modales/clientes/ModalClientes';
import { ModalContactosClientes } from '../../modales/clientes/ModalContactosClientes';
import { ErrorConexion, RegistroExitoso } from '../../constantes/constantesAxios/mensajesAxios';
import '../../css/clientes/clientes.css'
import { axiosDeleteServide, axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';

const Clientes = () => {
  const [ isOpenModal, openModal, closeModal ] = useModal(false);
  const [ isOpenModalContactos, openModalContactos, closeModalContactos ] = useModal(false);
  const [isEditMode, setisEditMode] = useState(false)
  const [data, setData] = useState([])
  const [purchaseContacts, setPurchaseContacts] = useState([]);
  const [contactsTypes, setContactsTypes] = useState([]);
  const [cliente, setCliente] = useState({
    RFC           : "",
    Razon_social  : "",
    Nombre_corto  : "",
    Num_cliente   : "",
    Ubicacion     : "",
    LimiteCredito : 0,
    FanCliente    : 0
  })
  const [clientNumber, setClientNumber] = useState(0);
  const agencia = getAgencia();
  let url = "";

  useEffect(() => {
    getClientes();
    getContactsTypes();
    // getPurchaseContacts();
  }, [])

  const getContactsTypes = async () => {
    url = ApiUrl + "api/clientes/contactstypes";  
    const response =  await axiosPostService( url, {} );
    setContactsTypes( response );

  }

  const getPurchaseContacts = async ( clientNumber ) => {

    url = ApiUrl + "api/clientes/purchasecontacts";

    const object = {
      agencia      : agencia,
      clientNumber : clientNumber
    }

    const response =  await axiosPostService( url, object );
    setPurchaseContacts( response );

  }
  
  const getClientes = async () => {
    url = ApiUrl + "api/clientes_catalog"
    const obj = { agencia: agencia, orderByRazon:'S' }
    await axios.post(url, obj)
      .then( response => {
        dataTableDestroy()

        setData(response['data'])
        dataTable()
      })
      .catch( err => {
        toast.error(ErrorConexion)
      })
  }

  const createCliente = () => {
    setisEditMode(false)
    resetFields();
    // setCliente({...cliente})

    openModal()
  }

  const setValuesWrittenForm = (clienteObject) => {
      isEditMode
      ?
      setCliente({
        RFC           : cliente.RFC,
        Razon_social  : cliente.Razon_social,
        Nombre_corto  : cliente.Nombre_corto,
        Num_cliente   : cliente.Num_cliente,
        Ubicacion     : cliente.Ubicacion,
        LimiteCredito : new Intl.NumberFormat('es-MX').format(cliente.LimiteCredito),
        Id            : cliente.Id,
        FanCliente    : cliente.FanCliente
      })
      :
      setCliente({
        RFC           : clienteObject.RFC,
        Razon_social  : clienteObject.Razon_social,
        Nombre_corto  : clienteObject.Nombre_corto,
        Num_cliente   : clienteObject.Num_cliente,
        Ubicacion     : clienteObject.Ubicacion,
        LimiteCredito : new Intl.NumberFormat('es-MX').format(clienteObject.LimiteCredito),
        FanCliente    : clienteObject.FanCliente,
      })
  }

  const nuevoRegistroCliente = (clienteObject) => {
    let body = {}

    if ( clienteObject.Num_cliente === "" ) {
      toast.info('El campo número cliente se encuentra vacío')
      setValuesWrittenForm(clienteObject)
      return;
    }

    /* if ( clienteObject.RFC === "" ) {
      toast.info('El campo RFC se encuentra vacío')
      setValuesWrittenForm(clienteObject)
      return;
    } */

    if ( clienteObject.Razon_social === "" ) {
      toast.info('El campo razón social se encuentra vacío')
      setValuesWrittenForm(clienteObject)
      return;
    }

    if ( clienteObject.Nombre_corto === "" ) {
      toast.info('El campo nombre corto se encuentra vacío')
      setValuesWrittenForm(clienteObject)
      return;
    }

    body = {cliente: clienteObject, agencia}

    if (isEditMode) {
      updateClientSelected(body)
      return;
    }

    createClientWritten(body)

  }

  const updateClientSelected = async( body ) => {

      url = ApiUrl + "api/clientes/update"
      await axios.patch( url, body )
        .then( response => {
          if ( response['data'].isUpdated ) {
            getClientes();
            setisEditMode(false);
            resetFields()
            toast.success(RegistroExitoso);
            closeModal();
          }
          
        })
        .catch( err => {
          toast.error(ErrorConexion)
        })

  }

  const resetFields = () => {
      setCliente({
        RFC           : "",
        Razon_social  : "",
        Nombre_corto  : "",
        Num_cliente   : "",
        Ubicacion     : "",
        LimiteCredito : 0, 
        FanCliente    : 0, 
      })
  }

  const editClient = (clientEdit) => {
    setisEditMode(true);
    setCliente({
      Id            : clientEdit.Id,
      LimiteCredito : new Intl.NumberFormat('es-MX').format(clientEdit.LimiteCredito),
      Nombre_corto  : clientEdit.Nombre_corto,
      Num_cliente   : clientEdit.Num_cliente,
      Razon_social  : clientEdit.Razon_social,
      RFC           : clientEdit.RFC,
      Ubicacion     : clientEdit.Ubicacion,
      FanCliente    : clientEdit.FanCliente,
    });

    openModal();

  }

  const createClientWritten = async ( body ) => {

    url = ApiUrl + "api/clientes/create"
      await axios.post( url, body )
        .then( response => {
          if ( response['data'].isCreated ) {
              getClientes();
              // resetFields();
              toast.success(RegistroExitoso);
              closeModal();
          }
        })
        .catch( err => {

          if ( err.response.data === "Validation failed for parameter 'FanCliente'. Invalid string." ) {
            toast.error('Favor de verificar el número de fan cliente, el valor enviado no es válido.');
            return;
          }
          
          if ( err.response.data === "Violation of PRIMARY KEY constraint 'PK_Clientes_flotillas'. Cannot insert duplicate key in object 'dbo.Clientes_flotillas'." ) {
            toast.error('El número de cliente ya existe.');
            return;
          }

          toast.error(ErrorConexion)
        })
  }

  const dataTable = () => {
    $('#clientes').DataTable(clientesDataTable);
  }
  
  const dataTableDestroy = () => {
    $('#clientes').DataTable().destroy();
    
  }

  const openContacts = ( clientNumber ) => {
      setClientNumber( clientNumber );
      getPurchaseContacts( clientNumber );
      openModalContactos();
  }

  const uploadClientContacts = async ( purchaseContacts, update ) => {

    if ( ! update ) {
      closeModalContactos();
      return;
    }
    
    url = ApiUrl + "api/clientes/delete_contacts"

    const { isDeleted } = await axiosDeleteServide( url, { agencia: agencia, numeroCliente : clientNumber });

    if ( ! isDeleted ) {
      toast.error('Ocurrió un error al actualizar los contactos del cliente.');
      return;
    }
  
    url = ApiUrl + "api/clientes/create_contacts";
    const { isCreated } = await axiosPostService( url, { agencia: agencia, contactos: purchaseContacts } );

    if ( ! isCreated ) {
      toast.error('No fue posible crear los contactos del cliente.');
      return;
    }

    toast.success("Los contactos del cliente fueron registrados exitosamente");
    closeModalContactos();

  }

  return (
    <div className='content-wrapper'>
      <div className='content-header'>
        <div className='container-fluid'>
          <div className='row mb-4'>
            <div className='col-sm-12'>
              <div className='card card-outline card-primary'>
                <div className='card-header'>
                  <h5 className='m-0 text-dark'>CLIENTES</h5>
                </div>
              </div>    
            </div>  
          </div>
          <div className='margin-left-button'>
            <button
              type='button'
              onClick={createCliente}
              className='btn btn-info mt-4 mb-2'
            >
              Registrar Cliente  
            </button>
          </div>    
        </div>  
      </div>
      <div className='container-fluid'>
        <div className='row ml-2 mr-2'>
          
          <Modal 
            closeModal = { closeModal }
            isOpen = { isOpenModal } 
          >

              <ModalClientes
                data = { cliente }
                editMode = { isEditMode } 
                onSubmit = { nuevoRegistroCliente }
              />

          </Modal>

          <ModalGrande 
            closeModal = { closeModalContactos }
            isOpen = { isOpenModalContactos } 
          >

            <ModalContactosClientes
              clientNumber = { clientNumber } 
              contactsTypesProps = { contactsTypes }
              purchaseContactsProps = { purchaseContacts }
              uploadClientContacts = { uploadClientContacts }
            />

          </ModalGrande>

          <div className='table-responsive mb-4 animate__animated animate__fadeIn'>

            <table id='clientes' className='table table-bordered table-striped compact' style={{fontSize:12}}>{/* table-striped table-bordered*/}
              
              <thead style={{backgroundColor:'#1565C0', color:'white'}}>
                
                <tr>
                  <th className='text-center'># Cliente</th>
                  <th className='text-center'>RFC</th>
                  <th className='text-center'>Razón Social</th>
                  <th className='text-center'>Nombre Corto</th>
                  <th className='text-center'>Matriz</th>
                  <th className='text-center'>$ Límite Crédito</th>
                  <th className='text-center'>FAN</th>
                  <th className='text-center'>Editar</th>
                </tr>
              
              </thead>

              <tbody style={{backgroundColor:'#FFFFE0'}}>
                {
                  data.length > 0 ?
                  data.map((cliente) => {
                    return (
                      <tr className='text-center' key={ cliente.Id }>
                        <td>{cliente.Num_cliente}</td>
                        <td>{cliente.RFC}</td>
                        <td 
                          className='cursor-above'
                          onClick={ () => openContacts( cliente.Num_cliente ) } 
                        >
                          {cliente.Razon_social}
                        </td>
                        <td>{cliente.Nombre_corto}</td>
                        <td>{cliente.Ubicacion}</td>
                        <td>{new Intl.NumberFormat('es-MX').format(cliente.LimiteCredito)}</td>
                        <td>{cliente.FanCliente}</td>
                        <td>
                          <button
                            className='btn btn-outline-dark'
                            onClick={() => editClient(cliente)}
                            title='Editar'
                            type='button'
                          >
                            <FontAwesomeIcon icon={faEdit} />  
                          </button>  
                        </td>
                      </tr>
                    )
                  }) : ""
                }  
              </tbody>

            </table>

          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Clientes