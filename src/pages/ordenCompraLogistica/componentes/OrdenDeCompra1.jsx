import React,{ useState, useEffect } from 'react'

// import { generate as id } from 'shortid'
// import { saveAs } from 'file-saver';
// import Modal from '../../../modales/shared/Modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { axiosDeleteServide, axiosGetService, axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { useModal } from '../../../modales/shared/useModal';
import ModalGrande from '../../../modales/shared/ModalGrande';
import { ModalOrdenDeCompra } from '../../../modales/ordendecompra/ModalOrdenDeCompra';
import { ordenDeCompraDataTable } from '../../../components/datatable/conf';
import $ from 'jquery';
import { ApiUrl } from '../../../services/ApiRest';
import { ErrorConexion, RegistroExitoso } from '../../../constantes/constantesAxios/mensajesAxios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faEdit } from '@fortawesome/free-solid-svg-icons';

const OrdenDeCompra1 = ({ agencia }) => {
    let url = '';
    const [ isOpenModal, openModal, closeModal ] = useModal(false);
    const [isEditMode, setisEditMode] = useState(false);
    const [tipoVehiculos, setTipoVehiculos] = useState([]);
    const [nombreDeClientes, setNombreDeClientes] = useState([]);
    const [cities, setCities] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [isCreatedUpdated, setIsCreatedUpdated] = useState(false);
    const [data, setData] = useState([]);

    const [ordenDeCompra, setOrdenDeCompra] = useState({
        //TODO: Agregar el nümero del client.e
        Cliente              : "",
        Ubicacion            : "",
        OrdenCompra          : "",
        Cantidad             : "",
        TiposYCantidades     : [],
        DocumentoPDF         : null,
        InformacionDomicilio : [],
        // ContactosDeCompra    : [], //TODO: delete this property
        /* campos adicionales */
        Num_cliente: 0

    })

    useEffect(() => {
      if ( data.length === 0 ) getRegistrosOrdenesCompra();
      if ( nombreDeClientes.length === 0 ) getNombreDeClientes();
      if ( tipoVehiculos.length === 0 ) getTiposVehiculos();
      if ( cities.length === 0 ) getCitiesDestiny();
      if ( directories.length === 0 ) getDirectories();
    }, [])

    const getCitiesDestiny = async() => {
        url = ApiUrl + "api/directory/get_city_destiny";
        const citiesBD = await axiosGetService(url);

        setCities( citiesBD );
    }

    const getDirectories = async () => {

        url = ApiUrl + "api/directory/get_directories";

        const directoryList = await axiosPostService( url, {agencia} );
        
        setDirectories( directoryList );

    }
    
    const getNombreDeClientes = async () => {
        url = ApiUrl + "api/clientes"
        const clients = await axiosPostService( url, agencia )
        setNombreDeClientes(clients)
    }

    const getRegistrosOrdenesCompra = async() => {
        url = ApiUrl + "api/get_orden_compra"
        const buyorders = await axiosPostService( url, agencia )

        try {
            dataTableDestroy();
            setData(buyorders);
            dataTable();
            
        } catch (error) {
            toast.error("Error al cargar registros en tabla.")
        }
    }

    const getTiposVehiculos = async () => {
        url = ApiUrl + "api/get_tipovehiculos"
        const vehicleTypes = await axiosPostService(url, {});
        
        setTipoVehiculos( vehicleTypes );
    }

    const setValuesWrittenForm = ( ordenCompraObject ) => {
        isEditMode
        ?
        setOrdenDeCompra({
            Num_cliente          : ordenDeCompra.Num_cliente,
            Cliente              : ordenDeCompra.Cliente,
            Ubicacion            : ordenDeCompra.Ubicacion,
            OrdenCompra          : ordenDeCompra.OrdenCompra,
            Cantidad             : ordenDeCompra.Cantidad,
            DocumentoPDF         : ordenDeCompra.DocumentoPDF,
            TiposYCantidades     : ordenDeCompra.TiposYCantidades,
            InformacionDomicilio : ordenDeCompra.InformacionDomicilio,
            // ContactosDeCompra    : ordenDeCompra.ContactosDeCompra, TODO: delete this line
            Id                   : ordenDeCompra.Id
            // InformacionDomicilio: []
        })
        :
        setOrdenDeCompra({
            Num_cliente          : ordenCompraObject.Num_cliente,
            Cliente              : ordenCompraObject.Cliente,
            Ubicacion            : ordenCompraObject.Ubicacion,
            OrdenCompra          : ordenCompraObject.OrdenCompra,
            Cantidad             : ordenCompraObject.Cantidad,
            DocumentoPDF         : ordenCompraObject.DocumentoPDF,
            TiposYCantidades     : ordenCompraObject.TiposYCantidades,
            InformacionDomicilio : ordenCompraObject.InformacionDomicilio,
            // ContactosDeCompra    : ordenCompraObject.ContactosDeCompra TODO: delete this line
            // InformacionDomicilio: []
        })
    }

    const nuevoRegistroOrdenCompra = async ( ordenCompraObject ) => {

         if ( ordenCompraObject.OrdenCompra === "" ) {
            toast.info('El campo Orden de Compra se encuentra vacío.')
            // setValuesWrittenForm( ordenCompraObject )
            return;
        }

        if ( ordenCompraObject.Cantidad === "" ) {
            toast.info('El campo Cantidad se encuentra vacío.')   
            // setValuesWrittenForm( ordenCompraObject )          
            return;
        }

        if ( isEditMode ) {
            if ( ordenCompraObject.DocumentoPDF !== "1" && ordenCompraObject.DocumentoPDF !== "" ) {
                if ( ordenCompraObject.DocumentoPDF.type !== "application/pdf" ) {
                    toast.info('El archivo seleccionado en la orden de compra no es un formato válido, Favor de seleccionar formato PDF.')
                    // setValuesWrittenForm( ordenCompraObject )
                    return;
                }
            }
            
        }

        if ( !isEditMode ) {
            if ( ordenCompraObject.DocumentoPDF !== null) {
                    if ( ordenCompraObject.DocumentoPDF.type !== "application/pdf" ) {
                        toast.info('El archivo seleccionado en la orden de compra no es un formato válido, Favor de seleccionar formato PDF.')
                        // setValuesWrittenForm( ordenCompraObject )
                        return;
                    }
            }

        }
             
        if ( isEditMode ) {
            updateOrderSelected(ordenCompraObject)
            return;
        }
        
        if ( !isEditMode ) {
            createOrderWritten(ordenCompraObject)
        }

    }

    const createOrderWritten = async ( ordenCompraObject ) => {

        url = `${ ApiUrl }api/exists_orden_compra`

        const requestExistsOrder = await axiosPostService( url, 
            {
                agencia, 
                Num_cliente  : ordenCompraObject.Num_cliente,
                Cliente      : ordenCompraObject.Cliente, 
                Ubicacion    : ordenCompraObject.Ubicacion, 
                OrdenCompra  : ordenCompraObject.OrdenCompra
            }
        )

        if ( requestExistsOrder.isRegistered ) {
            toast.error('La orden de compra ya existe, favor de cambiar nombre.');
            return;
        }

        url = `${ ApiUrl }api/create_orden_compra`

        const formData = new FormData();

        formData.append('file', ordenCompraObject.DocumentoPDF)
        formData.append('agencia', JSON.stringify(agencia))
        formData.append('body', JSON.stringify({
            Num_cliente          : ordenCompraObject.Num_cliente,
            Cliente              : ordenCompraObject.Cliente,
            Ubicacion            : ordenCompraObject.Ubicacion,
            OrdenCompra          : ordenCompraObject.OrdenCompra,
            Cantidad             : ordenCompraObject.Cantidad,
            TiposYCantidades     : ordenCompraObject.TiposYCantidades,  
            InformacionDomicilio : ordenCompraObject.InformacionDomicilio,
        }))

        await axios.post(url, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
        .then(response => {
            if ( response['data'].isCreated ) {
                getRegistrosOrdenesCompra(); 
                toast.success(RegistroExitoso);
                setIsCreatedUpdated(true);
                closeModal();
            }
        })
        .catch(err => {
            toast.error(ErrorConexion)
            
        })
        
    }

    const postTipoVeh = async ( ordenCompraObject ) => {
        url = `${ApiUrl}api/post_tipos_orden_compra`;
        const requestServer = await axiosPostService( url, {agencia, OrdenCompra: ordenCompraObject} )
        if ( requestServer.isPosted ) return true;
        return false; 

    }

    const postDomicilios = async ( ordenCompraObject ) => {
        url = `${ ApiUrl }api/post_domicilios_orden_compra`;    

        const requestServer = await axiosPostService( url, {agencia, OrdenCompra: ordenCompraObject} )

        if ( requestServer.isPosted ) return true;

        return false;
    }

    /* const postContactos = async ( ordenCompraObject ) => {
        url = `${ApiUrl}api/post_contactos_entrega`; 
        const requestServer = await axiosPostService( url, {agencia, OrdenCompra: ordenCompraObject} )  
        if ( requestServer.isPosted ) return true;
        return false;
    } */

    const updateOrderSelected = async ( ordenCompraObject ) => {

        url = `${ ApiUrl }api/delete_tipos_orden_compra`;

        const deleteObj = { 
            agencia, 
            OrdenCompra : ordenCompraObject.OldOrdenCompra,
            Num_cliente : ordenCompraObject.Num_cliente, 
        }

        const deleteRequestVeh = await axiosDeleteServide( url, deleteObj );

        if ( ! deleteRequestVeh.isDeleted ) {
            toast.error('Ocurrió un error al actualizar los tipos de vehículos - cantidades');
            return;
        }

        url = `${ ApiUrl }api/delete_domicilios_orden_compra`;

        const deleteDom = { 
            agencia, 
            OrdenCompra : ordenCompraObject.OldOrdenCompra,
            Num_cliente : ordenCompraObject.Num_cliente,  
        }

        const deleteRequestDom = await axiosDeleteServide( url, deleteDom );

        if ( ! deleteRequestDom ) {
            toast.error('Ocurrió un error al actualizar los domicilios');
            return;
        }


       
        url = `${ApiUrl}api/update_orden_compra`

        const formData = new FormData();

        formData.append('file', ordenCompraObject.DocumentoPDF)
        formData.append('agencia', JSON.stringify(agencia))
        formData.append('body', JSON.stringify({
            Num_cliente           : ordenCompraObject.Num_cliente,
            Cliente               : ordenCompraObject.Cliente,
            Ubicacion             : ordenCompraObject.Ubicacion,
            OrdenCompra           : ordenCompraObject.OrdenCompra,
            Cantidad              : ordenCompraObject.Cantidad,
            TiposYCantidades      : ordenCompraObject.TiposYCantidades,
            InformacionDomicilio  : ordenCompraObject.InformacionDomicilio,
            Id                    : ordenCompraObject.Id,
        }))

        await axios.patch(url, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
        .then( async response => {

            if ( response['data'].isUpdated ) {

                const updateTipos = await postTipoVeh( ordenCompraObject );
                const updateDomicilios = await postDomicilios( ordenCompraObject );
               
                if ( updateTipos && updateDomicilios ) { 

                    toast.success(RegistroExitoso)
                    getRegistrosOrdenesCompra()
                    setisEditMode(false)
                    setIsCreatedUpdated(true);
                    closeModal()
                    return;

                }

                toast.error(ErrorConexion);

            }
            

        })
        .catch(err => {
            toast.error(ErrorConexion)
            
        })
    }

    const createOrdenCompra = () => {
        setIsCreatedUpdated(false);
        setisEditMode( false );
        setOrdenDeCompra({
            Num_cliente          : 0,
            Cliente              : "",
            Ubicacion            : "",
            OrdenCompra          : "",
            Cantidad             : "",
            TiposYCantidades     : [],
            DocumentoPDF         : null,
            InformacionDomicilio : [],
            // ContactosDeCompra    : [] //TODO: delete this property
        });
        openModal();
    }

    const downloadPDF = async (Id) => {
        url = ApiUrl + "api/send_pdf"

        let body = {Id, agencia}
        await axios.post(url, body, {responseType:'blob'})
        .then(response => {
            const fileUrl = window.URL.createObjectURL(response['data']);

            window.open(fileUrl, '_blank');
            /*  
            saveAs(response['data'],"filepdf" + ".pdf") ***imprimir con librería
            var link = document.createElement('a'); link.href=window.URL.createObjectURL(response['data']); link.download="mufile.pdf"; link.click();  ***imprimir objeto nativo de javascript
            */
        })
        .catch(err => {
            
        })
    }

    const editOrder = (order_compra) => {

        setIsCreatedUpdated(false);
        setisEditMode(true);
        setOrdenDeCompra({
            Num_cliente          : order_compra.Num_cliente,
            Cliente              : order_compra.Cliente,
            Ubicacion            : order_compra.Ubicacion,
            OrdenCompra          : order_compra.OrdenCompra,
            Cantidad             : order_compra.Cantidad,
            DocumentoPDF         : order_compra.DocumentoPDF,
            TiposYCantidades     : order_compra.TiposYCantidades,
            InformacionDomicilio : order_compra.InformacionDomicilio,
            // ContactosDeCompra    : order_compra.ContactosDeCompra, //TODO: delete this line
            OldOrdenCompra       : order_compra.OrdenCompra,
            Id                   : order_compra.Id,
        })

        openModal()
    }

    const dataTable = () => {
        setTimeout(() => {
            $('#ordenDeCompra').DataTable(ordenDeCompraDataTable);
            
        }, 500);
    }
    
    const dataTableDestroy = () => {
        $('#ordenDeCompra').DataTable().destroy();
    }

  return (
    <div className='row m-2'>
        {/* <Modal isOpen={isOpenModal} closeModal={closeModal}> */}
        <ModalGrande isOpen={isOpenModal} closeModal={closeModal}>
            <ModalOrdenDeCompra
                cities={cities}
                data={ordenDeCompra}
                directories={directories}
                editMode={isEditMode}
                isCreatedUpdated={isCreatedUpdated}
                nombreDeClientes={nombreDeClientes}
                onSubmit={nuevoRegistroOrdenCompra}
                tipoVehiculos={tipoVehiculos}
            />
        </ModalGrande>
        <div className='row m-2'>
            <button 
                type='button' 
                className='btn btn-info'
                onClick={createOrdenCompra}
            >
                Registrar
            </button>
            
        </div>
        
        <div className='table-responsive mb-4 animate__animated animate__fadeIn'>
            <table id='ordenDeCompra' className='table table-bordered table-striped compact' style={{width:'100%', fontSize:12}}>{/* display compact */} 
                <thead style={{backgroundColor:'#1565C0', color:'white'}}>
                    <tr>
                        <th className='text-center' style={{width:'37.28%'}}>Cliente</th>
                        <th className='text-center' style={{width:'37.28%'}}>Matriz</th>
                        <th className='text-center' style={{width:'8.28%'}}>Orden Compra Cliente</th>
                        <th className='text-center' style={{width:'4.28%'}}>Cantidad</th>
                        <th className='text-center' style={{width:'6.28%'}}>PDF</th>
                        <th className='text-center' style={{width:'6.28%'}}>Editar</th>
                        {/* <th className='text-center' style={{width:'30.28%'}}></th> */}
                    </tr>
                </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}> 
                    {
                        data.length > 0 &&
                        data.map(order => {
                            return (
                                <tr>
                                    <td className='text-center'>{order.Cliente}</td>
                                    <td className='text-center'>{order.Ubicacion}</td>
                                    <td className='text-center'>{order.OrdenCompra}</td>
                                    <td className='text-center'>{order.Cantidad}</td>
                                    <td className='text-center'>{
                                    order.DocumentoPDF === "1" 
                                    ? 
                                    <button
                                        title='Descargar PDF'
                                        type='button'
                                        className='btn btn-outline-danger btn-sm'
                                        onClick={() => downloadPDF(order.Id)}
                                    >
                                        <FontAwesomeIcon icon={faFilePdf}/>
                                    </button> 
                                    : 
                                    <small></small>
                                    }</td>
                                    <td className='text-center'>
                                        <button
                                            title='Editar orden de compra'
                                            type='button'
                                            className='btn btn-outline-dark btn-sm'
                                            onClick={() => editOrder(order)}
                                        >
                                            <FontAwesomeIcon icon={faEdit}/>
                                        </button>
                                    </td>
                                    {/* <td></td> */}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default OrdenDeCompra1

