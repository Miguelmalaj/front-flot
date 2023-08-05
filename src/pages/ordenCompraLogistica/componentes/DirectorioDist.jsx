import { useEffect } from "react"
import { useState } from "react";
import $ from 'jquery';
import { toast } from "react-toastify";

import { ordenDeCompraDataTable } from "../../../components/datatable/conf";
import { axiosPatchService, axiosPostService } from "../../../services/asignacionLoteService/AsignacionLoteService";
import { ApiUrl } from "../../../services/ApiRest";
import ModalGrande from "../../../modales/shared/ModalGrande";
import { useModal } from "../../../modales/shared/useModal";
import { ModalDirectorios } from "../../../modales/ordendecompra/ModalDirectorios";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const reg = /^\d{3}-\d{3}-\d{4}$/

const DirectorioDist = ({
    agencia,
    clientes
}) => {

    let url = '';
    const [directories, setDirectories] = useState( [] );
    const [isOpenModal, openModal, closeModal] = useModal( false );
    const [isEditMode, setIsEditMode] = useState( false );
    const [inputValues, setInputValues] = useState({
        Id                 : 0,
        Destino            : '',
        Distribuidor       : '',
        Nombre             : '',
        Puesto             : '',
        Telefono           : '',
        Contacto2          : '',
        PuestoContacto2    : '',
        Correo             : '',
        Domicilio          : '',
        Extension          : '',
        NumeroDistribuidor : '',
        TelefonoMovil      : ''
    })

    useEffect(() => {
      
        getDirectories();

    }, [ clientes ])

    const getDirectories = async () => {
        
        url = ApiUrl + "api/directory/get_directories";

        const directoryList = await axiosPostService( url, {agencia} );

        console.log({directoryList});

        try {
            dataTableDestroy();
            setDirectories( directoryList );
            dataTable();
            
        } catch (error) {
            toast.error("Error al cargar los directorios")
        }

    }

    const addNewDirectory = () => {
        setIsEditMode( false );
        resetDefaultValues();
        openModal();
    }
    
    const editDirectory = ( directory ) => {
        setIsEditMode( true );
        
        const { 
            Id,
            Destino,
            Distribuidor,
            Nombre,
            Puesto,
            Telefono,
            Contacto2,
            PuestoContacto2,
            Correo,
            Domicilio,
            Extension,
            NumeroDistribuidor,
            TelefonoMovil 
        } = directory;

        setInputValues({
            Id                 ,
            Destino            ,
            Distribuidor       ,
            Nombre             ,
            Puesto             ,
            Telefono           ,
            Contacto2          ,
            PuestoContacto2    ,
            Correo             ,
            Domicilio          ,
            Extension          ,
            NumeroDistribuidor ,
            TelefonoMovil      ,
        })

        openModal();
    }

    const validateField = ( inputValuesObject ) => {
        
        const { //only 3 properties are not validated
            Destino,
            Distribuidor,
            Nombre,
            Puesto,
            Telefono,
            Domicilio,
            Correo,
            NumeroDistribuidor
         } = inputValuesObject;

        if ( 
            Destino.trim()            === '' ||
            Distribuidor.trim()       === '' ||
            Nombre.trim()             === '' ||
            Puesto.trim()             === '' ||
            Telefono.trim()           === '' ||
            Correo.trim()             === '' ||
            Domicilio.trim()          === '' ||
            NumeroDistribuidor.trim() === ''
        ) {
            toast.info("Existen campos vacíos en el formulario, favor de completar correctamente.");
            return;
        }
       

        if ( ! isEditMode ) {
            newRegister( inputValuesObject );
            
            return;
        }

        editRegister( inputValuesObject );
    }

    const newRegister = async ( inputValuesObject ) => {
        url = ApiUrl + "api/directory/create_directory";

        const objJSON = {
            agencia : agencia,
            data    : inputValuesObject
        }

        const { isCreated } = await axiosPostService( url, objJSON);
        
        if ( isCreated ) {
            toast.success("El directorio ha sido creado existosamente.");
            
            closeModal();
            
            getDirectories();
            return;
        }

        toast.error("Ocurrió un error al realizar el nuevo registro");

    }

    const editRegister = async ( inputValuesObject ) => {
        url = ApiUrl + "api/directory/update_directory";
        
        const objJSON = {
            agencia : agencia,
            data    : inputValuesObject
        }

        const { isUpdated } = await axiosPatchService( url, objJSON );

        if ( isUpdated ) {
            toast.success("El directorio ha sido actualizado existosamente.");
            getDirectories();
            setIsEditMode( false );
            closeModal();
            return;
        }

        toast.error("Ocurrió un error al intentar actualizar el directorio.");

    }

    const resetDefaultValues = () => {
        setInputValues({
            Id                 : 0,
            Destino            : '',
            Distribuidor       : '',
            Nombre             : '',
            Puesto             : '',
            Telefono           : '',
            Contacto2          : '',
            PuestoContacto2    : '',
            Correo             : '',
            Domicilio          : '',
            Extension          : '',
            NumeroDistribuidor : '',
            TelefonoMovil      : ''
        })
    }

    const dataTable = () => {
        setTimeout(() => {
            $('#directoriesTable').DataTable(ordenDeCompraDataTable);
          }, 500);
    }

    const dataTableDestroy = () => {
        $('#directoriesTable').DataTable().destroy();
    }
    

    return (
        <div className="row m-2">
            <ModalGrande isOpen={isOpenModal} closeModal={closeModal}>
                <ModalDirectorios
                    inputValues={inputValues}
                    isEditMode={isEditMode}
                    onSubmit={validateField}
                />
            </ModalGrande>

            <div className="row m-2">

                <button
                    type="button"
                    onClick={ addNewDirectory }
                    className="btn btn-info" >

                        Registrar

                </button>

            </div>

            <div className="table-responsive mb-4 animate__animated animate__fadeIn">

                <table 
                    className='table table-bordered table-striped compact' 
                    id="directoriesTable" 
                    style={{width:'100%', fontSize:12}}
                >

                    <thead style={{backgroundColor:'#1565C0', color:'white'}}>

                        <tr className='text-center'>
                            <th className='text-center'>Destino</th>
                            <th className='text-center'>Distribuidor</th>
                            <th className='text-center'>Nombre</th>
                            <th className='text-center'>Teléfono</th>
                            <th className='text-center'>Puesto</th>
                            <th className='text-center'>Contacto 2</th>
                            <th className='text-center'>Puesto Contacto 2</th>
                            <th className='text-center'>Correo</th>
                            <th className='text-center'>Domicilio</th>
                            <th className='text-center'>Extensión</th>
                            <th className='text-center'>Número de Distribuidor</th>
                            <th className='text-center'>Teléfono Móvil</th>
                            <th className='text-center'>Editar</th>
                        </tr>

                    </thead>

                    <tbody style={{backgroundColor:'#FFFFE0'}}>
                        {

                            !!directories && directories.map( directory => (
                                <tr className="text-center" key={ directory.Id }>
                                    <td>{ directory.Destino }</td>
                                    <td>{ directory.Distribuidor }</td>
                                    <td>{ directory.Nombre }</td>
                                    <td>{ directory.Telefono }</td>
                                    <td>{ directory.Puesto }</td>
                                    <td>{ directory.Contacto2 }</td>
                                    <td>{ directory.PuestoContacto2 }</td>
                                    <td>{ directory.Correo }</td>
                                    <td>{ directory.Domicilio }</td>
                                    <td>{ directory.Extension }</td>
                                    <td>{ directory.NumeroDistribuidor }</td>
                                    <td>{ directory.TelefonoMovil }</td>
                                    <td>
                                        <button
                                            type='button'
                                            className='btn btn-outline-dark'
                                            title='Editar'
                                            onClick={() => editDirectory( directory )}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />  
                                        </button>
                                    </td>
                                </tr>
                            ))

                        }
                    </tbody>

                </table>

            </div>

        </div>

    )

}

export default DirectorioDist
