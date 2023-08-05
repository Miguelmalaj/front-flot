import React,{ useState, useEffect, useRef } from 'react'

// import { generate as id } from 'shortid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAdd } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import '../../css/modales/ModalClientes.css'
import '../../css/modales/ModalOrdenCompra.css'
import { isADotValue, isASpaceValue, isNumber } from '../../helpers';
// import { isADotValue, isNumber } from '../../helpers/validarInputs';

const Add = 'Add'
const Delete = 'Delete'
const Tipo = 'Tipo'
const Cantidad = 'Cantidad'

export const ModalOrdenDeCompra = ({ 
    cities,
    data, 
    directories, 
    editMode, 
    isCreatedUpdated,
    nombreDeClientes, 
    onSubmit, 
    tipoVehiculos, 
}) => {
    const [ordenDeCompra, setOrdenDeCompra] = useState({
        TiposYCantidades     : [],
        InformacionDomicilio : [],
    })
    const [typeAndQuantity, setTypeAndQuantity] = useState({Type:"",Quantity:0})
    const [isAddressDeleted, setIsAddressDeleted] = useState(true);
   
    const Editar = "Editar"
    const Registrar = "Guardar"
    const ref = useRef();
    const refVehicleTypes = useRef();
    const refCities = useRef();
    const refAgency = useRef();

    useEffect(() => {

        if ( tipoVehiculos.length > 0 ) {
            const { NombreTipo } = tipoVehiculos[0];
            setTypeAndQuantity({ ...typeAndQuantity, Type: NombreTipo });
            refVehicleTypes.current.value = NombreTipo;
        }

        if ( !editMode ) {
            setOrdenDeCompra({
                ...data,
                Cliente     : nombreDeClientes.length > 0 ? nombreDeClientes[0].Nombre_corto : "",
                Ubicacion   : nombreDeClientes.length > 0 ? nombreDeClientes[0].Ubicacion    : "",
                Num_cliente : nombreDeClientes.length > 0 ? nombreDeClientes[0].Num_cliente  : 0,
            })
            return;
        }
        setOrdenDeCompra(data)
    }, [data])

    useEffect(() => {
        if ( isCreatedUpdated ) resetFields()
    }, [isCreatedUpdated])
    

    const onChange = async (e) => {

        if ( e.target.name === "Quantity" || e.target.name === "Type" ) {
            setTypeAndQuantity({
                ...typeAndQuantity,
                [e.target.name]: e.target.value
            })
            return;
        }
        
        
        if ( e.target.name === "DocumentoPDF" ) {
            const file = e.target.files[0];
            setOrdenDeCompra({
                ...ordenDeCompra,
                [e.target.name]: file
            })
            return;
        }

        if ( e.target.name === "Cliente" ) {
            const [ nombre_corto, ubicacion, Num_cliente ] = e.target.value.split("|")
            setOrdenDeCompra({
                ...ordenDeCompra,
                Cliente     : nombre_corto,
                Ubicacion   : ubicacion,
                Num_cliente : Num_cliente
            })
            return;
        }

        setOrdenDeCompra({
            ...ordenDeCompra,
            [e.target.name]: e.target.value
        })
    }

    const resetFields = (e) => {
        setOrdenDeCompra({
            Num_cliente          : 0,
            Cliente              : "",
            Ubicacion            : "",
            OrdenCompra          : "",
            Cantidad             : "",
            TiposYCantidades     : [],
            DocumentoPDF         : null,
            InformacionDomicilio : []
        })
        ref.current.value = "";

        setIsAddressDeleted(true);
    }

    const TypeAndQuantity = ( action ) => {

        if ( typeAndQuantity.Quantity === 0 ) {
            toast.info(`Favor de agregar al tipo ${ typeAndQuantity.Type } una cantidad mayor a cero.`);
            return;
        }

        let suma = 0;
        for (const car of ordenDeCompra.TiposYCantidades) {
            suma = suma + Number(car.Cantidad);
        }

        if ( action === Add ) {
            setOrdenDeCompra({
                ...ordenDeCompra,
                Cantidad: Number(suma) + Number(typeAndQuantity.Quantity),
                TiposYCantidades:[
                    ...ordenDeCompra.TiposYCantidades,
                    { 
                        id: `${ordenDeCompra.TiposYCantidades.length + 1}#`, 
                        TipoVehiculo: typeAndQuantity.Type, 
                        Cantidad: typeAndQuantity.Quantity, 
                        Asignados: 0, 
                        CDO: 0 ,
                        Seleccionados: 0
                    }
                ]
            })

            // setTypeAndQuantity({Type:"",Quantity:0});
            setTypeAndQuantity({ ...typeAndQuantity ,Quantity:0 });
            return;
        }
    }

    const addNewAddress = () => {
        
        setOrdenDeCompra({
            ...ordenDeCompra,
            InformacionDomicilio: [
                ...ordenDeCompra.InformacionDomicilio,
                {
                    id: `${ordenDeCompra.InformacionDomicilio.length + 1}#`,
                    PersonaReceptor    : "",
                    CelularDeContacto  : "",
                    Agencia            : "",
                    CiudadDestino      : "",
                    DomicilioDeEntrega : "",
                    NumeroDistribuidor : "",
                    Patio              : "S",
                    agenciasPorCiudad  : []
                }
            ]
        })
    }

    const deleteType = ( row ) => {

        if ( row.Seleccionados > 0 ) {
            toast.error('El tipo vehículo contiene VINS asignados, no puede ser eliminado.');
            return;
        }

        const filterTipoCantidad = ordenDeCompra.TiposYCantidades.filter( obj => obj.id !== row.id );
        ordenDeCompra.TiposYCantidades = filterTipoCantidad;
        setOrdenDeCompra({
            ...ordenDeCompra,
            Cantidad: Number(ordenDeCompra.Cantidad) - Number(row.Cantidad),
            TiposYCantidades: [...ordenDeCompra.TiposYCantidades]
        })
    }

    const deleteAddress = ( row ) => {

        /* if ( existContactsRelated( row.id ) ) {
            toast.info("No es posible eliminar el domicilio, existen contactos relacionados al mismo.");
            return;
        } */

        if ( !isAddressDeleted ) {
            toast.info("Favor de actualizar los contactos de compra actuales, antes de eliminar el domicilio.");
            return;
        }

        const filterDireccion = ordenDeCompra.InformacionDomicilio.filter( obj => obj.id !== row.id );
        ordenDeCompra.InformacionDomicilio = filterDireccion;
        setOrdenDeCompra({
            ...ordenDeCompra,
            InformacionDomicilio: [ ...ordenDeCompra.InformacionDomicilio ]
        })
    }

    const existContactsRelated = ( id ) => {
        /* let response = false;
        let existsRelatedContact = false;
        if ( ordenDeCompra.ContactosDeCompra.length === 0 ) return response;
        ordenDeCompra.ContactosDeCompra.map( contact => {
            const [idContact, , ] = contact.DestinoContacto.split("|");
            if ( idContact == id ) existsRelatedContact = true;
        })

        if ( existsRelatedContact ) response = true;
        return response; */
    }

    const editType = ( e, row ) => {
        let suma = 0;
        const editTipoCantidad = ordenDeCompra.TiposYCantidades.map((obj) => {
            // if ( obj.id == row.id &&  (e.target.value >= obj.Asignados && e.target.value >= obj.CDO && e.target.value >= obj.Seleccionados) ) return {...obj, Cantidad: e.target.value}  
            
            // if ( obj.id == row.id &&  (Number(e.target.value) >= Number(obj.Asignados)) ) return {...obj, Cantidad: e.target.value}  /* original state */
            if ( obj.id == row.id &&  (Number(e.target.value) >= Number(obj.Asignados)) && (Number(e.target.value) >= Number(obj.Seleccionados)) ) return {...obj, Cantidad: e.target.value}  
            
            else return obj
        })

        for (const obj of editTipoCantidad) {
            suma = suma + Number(obj.Cantidad);
        }

        ordenDeCompra.TiposYCantidades = editTipoCantidad;
        setOrdenDeCompra({
            ...ordenDeCompra,
            Cantidad: suma,
            TiposYCantidades: [...ordenDeCompra.TiposYCantidades]
        })
    }

    const editAsignados = ( e, row ) => {
        const editAsignados = ordenDeCompra.TiposYCantidades.map((obj) => {
            if ( ( obj.id == row.id ) && ( Number(e.target.value) <= Number(obj.Cantidad) ) && ( Number(e.target.value) >= 0 ) ) return { ...obj, Asignados: e.target.value }
            else return obj
            
        })

        ordenDeCompra.TiposYCantidades = editAsignados;
        setOrdenDeCompra({
            ...ordenDeCompra,
            TiposYCantidades: [...ordenDeCompra.TiposYCantidades]
        })

    }

    const editAddress = ( e, row ) => {

        if ( e.target.name === 'CelularDeContacto' && ( !isNumber( e.target.value ) || isASpaceValue( e.target.value ) || e.target.value.length === 11 ) ) return;
      
        const editarDireccion = ordenDeCompra.InformacionDomicilio.map((obj) => {
            
            if ( obj.id === row.id ) {  //REFACTORIZAR.
                
                if ( e.target.name === 'Patio' ) {

                            if ( e.target.checked === true ) {
                            
                                return { 
                                    ...obj, 
                                    [e.target.name]: "S",
                                    NumeroDistribuidor : "",
                                    Agencia            : "", 
                                    CiudadDestino      : "",
                                    DomicilioDeEntrega : "", 
                                    PersonaReceptor    : "", 
                                    CelularDeContacto  : "",
                                    agenciasPorCiudad  : []
                                }

                            } 
                            
                            if ( e.target.checked === false ) {

                                const { Destino } = cities[0];
                                
                                const filterAgenciesFromDirectory = directories.filter( directory => directory.Destino === Destino );
                                
                                const { Domicilio, NumeroDistribuidor, Distribuidor } = filterAgenciesFromDirectory[0];

                                return { 
                                    ...obj, 
                                    [e.target.name]    : "N",
                                    CiudadDestino      : Destino,
                                    agenciasPorCiudad  : filterAgenciesFromDirectory,
                                    Agencia            : Distribuidor,
                                    DomicilioDeEntrega : Domicilio, 
                                    NumeroDistribuidor : NumeroDistribuidor,
                                    PersonaReceptor    : "", 
                                    CelularDeContacto  : "",
                                }
                                
                            }

                    // return { ...obj, [e.target.name]: e.target.checked === true ? "S" : "N" }
                
                }

                if ( e.target.name === 'CiudadDestino' && row.Patio === "N" ) {

                    const Destino = e.target.value;

                    const filterAgenciesFromDirectory = directories.filter( directory => directory.Destino === Destino );
                                
                    const { Domicilio, NumeroDistribuidor, Distribuidor } = filterAgenciesFromDirectory[0];
                    
                    return {
                        ...obj,
                        CiudadDestino      : Destino,
                        agenciasPorCiudad  : filterAgenciesFromDirectory,
                        Agencia            : Distribuidor,
                        DomicilioDeEntrega : Domicilio, 
                        NumeroDistribuidor : NumeroDistribuidor
                    }
                }
                
                if ( e.target.name === 'Agencia' && row.Patio === "N" ) {

                    const Agencia = e.target.value;
                    const { CiudadDestino } = row;

                    const filterAgenciesFromDirectory = directories.filter( directory => directory.Destino === CiudadDestino && directory.Distribuidor === Agencia );

                    const { Domicilio, NumeroDistribuidor } = filterAgenciesFromDirectory[0];

                    return {
                        ...obj,
                        Agencia            : Agencia,
                        DomicilioDeEntrega : Domicilio,
                        NumeroDistribuidor : NumeroDistribuidor
                    }

                }

                return {...obj, [e.target.name]: e.target.value.toUpperCase() }
            }
            
            return obj

        })

        ordenDeCompra.InformacionDomicilio = editarDireccion;

        setOrdenDeCompra({
            ...ordenDeCompra,
            InformacionDomicilio : [ ...ordenDeCompra.InformacionDomicilio ]
        })

    }

    const addNewContact = () => { //TODO:this function will not work more in this compoonent
        /* const firstAddress = ordenDeCompra.InformacionDomicilio[0];

        setOrdenDeCompra({
            ...ordenDeCompra,
            ContactosDeCompra: [
                ...ordenDeCompra.ContactosDeCompra,
                {
                    id : `${ordenDeCompra.ContactosDeCompra.length + 1}#`,
                    NombreContacto   : "",
                    CorreoContacto   : "",
                    TelefonoContacto : "",
                    DestinoContacto  : `${firstAddress.id}|${firstAddress.CiudadDestino}|${firstAddress.DomicilioDeEntrega}`,
                }
            ]
        }) */

    }

    const updateContacts = ( nameProperty, valueProperty, id ) => { //TODO:this function will not work more in this compoonent
        /* let isChanged = false;
        if ( ordenDeCompra.ContactosDeCompra.length === 0 ) return [];

        const editarContacto = ordenDeCompra.ContactosDeCompra.map(contact => {
            let newDestination = ''
            let newObject = { ...contact };
            const [idContact, city, address] = contact.DestinoContacto.split("|");

            if ( idContact === id ) {
                isChanged = true;
                if ( nameProperty === "DomicilioDeEntrega" ) newDestination = `${idContact}|${city}|${valueProperty}`	
                if ( nameProperty === "CiudadDestino" ) newDestination = `${idContact}|${valueProperty}|${address}`	
                newObject = { ...contact, DestinoContacto: newDestination };

            }

            return newObject;
        });

        if ( isChanged ) return editarContacto;
        return []; */
    }

    const deleteContact = ( row ) => { //TODO:this function will not work more in this compoonent
        /* if ( isAddressDeleted ) setIsAddressDeleted(false);

        const filterContacts = ordenDeCompra.ContactosDeCompra.filter( obj => obj.id !== row.id );

        ordenDeCompra.ContactosDeCompra = filterContacts;
        setOrdenDeCompra({
            ...ordenDeCompra,
            ContactosDeCompra: [ ...ordenDeCompra.ContactosDeCompra ]
        }) */
    }

    const editContact = ( e, row ) => { //TODO:this function will not work more in this compoonent
        /* const editarContacto = ordenDeCompra.ContactosDeCompra.map((obj) => {
            if ( obj.id == row.id ) return { ...obj, [e.target.name]: e.target.value }
            else return obj
        })

        ordenDeCompra.ContactosDeCompra = editarContacto;
        setOrdenDeCompra({
            ...ordenDeCompra,
            ContactosDeCompra: [ ...ordenDeCompra.ContactosDeCompra ]
        }) */
    }


  return (
    <div className='bg-white-modal'>
        <h5 className='text-center text-dark'>{editMode ? 'EDITAR ORDEN COMPRA' : 'REGISTRAR ORDEN COMPRA'}</h5>
        <div className='row animate__animated animate__fadeIn'>
            <div className='container col-12 mt-3'>
                <form>
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Cliente
                    </label>
                    <select 
                        name='Cliente' 
                        className='form-select seleccionable mb-2 select-class-1' 
                        onChange={(e) => onChange(e)} 
                        disabled={ nombreDeClientes.length === 0 || editMode }
                    >
                        {
                            nombreDeClientes.map(obj => {
                                return (
                                    <option 
                                        selected={ordenDeCompra.Num_cliente === obj.Num_cliente} 
                                        value={`${obj.Nombre_corto}|${obj.Ubicacion}|${obj.Num_cliente}`}
                                    >
                                        {`${obj.Nombre_corto} ${obj.Ubicacion}`}
                                    </option>
                                )
                            })
                        }
                    </select>
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Orden Compra Cliente
                    </label>
                    <input 
                        autoComplete='off' 
                        className="form-control mb-2" 
                        disabled={ editMode }
                        name="OrdenCompra" 
                        onChange={onChange} 
                        tabIndex={2} 
                        type="text" 
                        value={ordenDeCompra.OrdenCompra} 
                    />

                    <label 
                        className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Archivo PDF - Orden Compra Cliente
                    </label>
                    
                    <input 
                        accept='.pdf' 
                        className='custom-file-upload mb-2'
                        name="DocumentoPDF" 
                        onChange={onChange} 
                        ref={ref}
                        type="file"
                    />

                    <label 
                        className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Cantidad
                    </label>
                    <input 
                        autoComplete='off' 
                        className="form-control mb-2" 
                        disabled
                        name="Cantidad" 
                        tabIndex={2} 
                        type="number" 
                        value={ordenDeCompra.Cantidad} 
                    />

                    
                    <div className="row d-flex justify-content-between ">
                        
                        <div className="col-6">
                            <small className="text-bold">Tipo</small>
                            
                            <select 
                                className='form-select seleccionable mb-2 select-class-1'
                                disabled={ tipoVehiculos.length === 0 }
                                id=""
                                name="Type" 
                                onChange={ onChange }
                                ref={ refVehicleTypes }
                             >
                                {
                                    tipoVehiculos.map( type => (
                                        <option value={ type.NombreTipo }>
                                            { type.NombreTipo }
                                        </option>
                                    ))
                                }
                            </select>

                        </div>

                        <div className="col-3">
                            <small className="text-bold">Cantidad</small>
                            
                            <input 
                                autoComplete='off' 
                                className="form-control mb-2" 
                                name={`Quantity`} 
                                onChange={onChange} 
                                tabIndex={2} 
                                type="number" 
                                value={typeAndQuantity.Quantity} 
                            />
                        </div>

                        <div className="col-3">
                            <button
                                className='btn btn-outline-info mt-4'
                                onClick={() => TypeAndQuantity(Add)}
                                title='Agregar Tipo y Cantidad'
                                type='button'
                            >
                                <FontAwesomeIcon icon={faAdd}/>
                            </button>
                        </div>
                        
                    </div>
                        {
                            ordenDeCompra.TiposYCantidades !== undefined && ordenDeCompra.TiposYCantidades.length > 0 &&
                            <div className="row table-responsive ">
                                <table className='table table-bordered table-striped compact'>
                                    <thead>
                                        <tr>
                                            <th className='text-center'><small>Tipo</small></th>
                                            <th className='text-center'><small>Cantidad</small></th>
                                            <th className='text-center'><small>Asignados</small></th>
                                            <th className='text-center'><small>CDO</small></th>
                                            {/* <th className='text-center'><small>Seleccionados</small></th> */}
                                            <th className='text-center'><small>Eliminar</small></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            ordenDeCompra.TiposYCantidades.map(obj => {
                                            return (
                                                <tr>
                                                    <td className='text-center'>{obj.TipoVehiculo}</td>
                                                    <td className='text-center '>
                                                        <input 
                                                            autoComplete='off' 
                                                            className="form-control mb-2 w-100" 
                                                            name="Quantity" 
                                                            onChange={(e) => editType(e, obj)} 
                                                            tabIndex={2} 
                                                            type="number" 
                                                            value={obj.Cantidad} 
                                                        />
                                                      
                                                    </td>
                                                    <td className='text-center'>
                                                        {/* {obj.Asignados} */}
                                                        <input 
                                                            autoComplete='off'
                                                            className='form-control mb-2 w-100'
                                                            name="Asignados"
                                                            onChange={(e) => editAsignados(e, obj)}
                                                            tabIndex={3}
                                                            type="number"
                                                            value={obj.Asignados}
                                                        />
                                                    </td>
                                                    <td className='text-center'>{obj.CDO}</td>
                                                    {/* <td className='text-center'>{obj.Seleccionados}</td> */}
                                                    <td className='text-center'>
                                                        <button
                                                            className='btn btn-outline-danger btn-sm'
                                                            onClick={() => deleteType(obj)}
                                                            title='Eliminar'
                                                            type='button'
                                                        >
                                                            <FontAwesomeIcon icon={faTrash}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        }
                        
                        <hr />
                        <button
                        className='btn btn-info text-light font-italic mt-4'
                        type='button'
                        onClick={() => addNewAddress()}
                        >
                            Agregar Domicilio Entrega
                        </button>

                        {/* Renderizar tabla  InformacionDomicilio */}
                        {
                            ordenDeCompra.InformacionDomicilio !== undefined && ordenDeCompra.InformacionDomicilio.length > 0 &&
                            
                            <div className="row table-responsive mt-2">
                                <table className='table table-bordered table-striped compact'>
                                    <thead>
                                        <tr>
                                            <th className='text-center'><small>Persona Receptora</small></th>
                                            <th className='text-center'><small># Celular</small></th>
                                            <th className='text-center'><small>Numero Distribuidor</small></th>
                                            <th className='text-center'><small>Ciudad Destino</small></th>
                                            <th className='text-center'><small>Agencia</small></th>
                                            <th className='text-center'><small>Domicilio Entrega</small></th>
                                            <th className='text-center'><small>Eliminar</small></th>
                                            <th className='text-center'><small>Patio</small></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                     {
                                        ordenDeCompra.InformacionDomicilio.map(obj => {
                                            return (
                                                <tr>

                                                    <td className='text-center'>
                                                        
                                                        <input 
                                                            // tabIndex={3}
                                                            autoComplete='off'
                                                            className='form-control mb-2' 
                                                            disabled={false}
                                                            name="PersonaReceptor" 
                                                            onChange={(e) => editAddress( e, obj )}
                                                            type="text" 
                                                            value={obj.PersonaReceptor} 
                                                        />
                                                    </td>

                                                    <td className='text-center'>
                                                        {/* {obj.CelularDeContacto} */}
                                                        <input 
                                                            // tabIndex={4}
                                                            autoComplete='off'
                                                            className='form-control mb-2' 
                                                            disabled={false}
                                                            name="CelularDeContacto" 
                                                            onChange={(e) => editAddress( e, obj )}
                                                            type="text" 
                                                            value={obj.CelularDeContacto} 
                                                        />
                                                    </td>

                                                    <td className='text-center'>
                                                        <input 
                                                            // readOnly={ obj.Patio === "S" ? false : true }
                                                            // tabIndex={8}
                                                            autoComplete='off'
                                                            className='form-control mb-2' 
                                                            disabled={false}
                                                            name="NumeroDistribuidor" 
                                                            onChange={(e) => editAddress( e, obj )}
                                                            readOnly
                                                            type="text" 
                                                            value={obj.NumeroDistribuidor} 
                                                        />
                                                    </td>

                                                    <td className='text-center'>

                                                        {
                                                            obj.Patio === "S"
                                                            ?
                                                            (<input 
                                                                className='form-control mb-2' 
                                                                type="text" 
                                                                name="CiudadDestino" 
                                                                value={obj.CiudadDestino} 
                                                                onChange={(e) => editAddress( e, obj )}
                                                                autoComplete='off'
                                                                disabled={false}
                                                            />)
                                                            :
                                                            (<select 
                                                                name="CiudadDestino" 
                                                                className='form-select seleccionable select-class-1'
                                                                ref={ refCities }   
                                                                
                                                                onChange={(e) => editAddress( e, obj )}/* con el e: obtenemos el valor, con el obj: obtenemos si es patio o agencia */
                                                            >
                                                                {
                                                                    cities.map( city => (
                                                                        <option 
                                                                            selected={ editMode && obj.CiudadDestino === city.Destino } 
                                                                            value={ city.Destino }
                                                                        >
                                                                            { city.Destino }
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>)

                                                        }



                                                    </td>

                                                    <td className='text-center'>

                                                        {
                                                            obj.Patio === "S" 
                                                            ?
                                                            (<input 
                                                                autoComplete='off'
                                                                className='form-control mb-2' 
                                                                disabled={false}
                                                                name="Agencia" 
                                                                onChange={(e) => editAddress( e, obj )}
                                                                readOnly
                                                                type="text" 
                                                                value={obj.Agencia} 
                                                            />)
                                                            :
                                                            (<select 
                                                                className='form-select seleccionable select-class-1'
                                                                name="Agencia" 
                                                                onChange={(e) => editAddress( e, obj )}
                                                                ref={ refAgency }    
                                                            >
                                                                {

                                                                    obj.agenciasPorCiudad.map( agency => (
                                                                        <option 
                                                                            selected={ editMode && obj.Agencia === agency.Distribuidor }
                                                                            value={ agency.Distribuidor }/* Considerar agregar las otras propiedades que necesitaremos separadas con | (NumeroDistribuidor,Domicilio). */
                                                                        >
                                                                            { agency.Distribuidor }
                                                                        </option>
                                                                    ))
                                                                    
                                                                }
                                                            </select>)

                                                        }



                                                    </td>

                                                    <td className='text-center'>
                                                        {/* {obj.DomicilioDeEntrega} */}
                                                        <input 
                                                            autoComplete='off'
                                                            className='form-control mb-2' 
                                                            disabled={false}
                                                            name="DomicilioDeEntrega" 
                                                            onChange={(e) => editAddress( e, obj )}
                                                            readOnly={ obj.Patio === "S" ? false : true }
                                                            type="text" 
                                                            value={obj.DomicilioDeEntrega} 
                                                        />
                                                    </td>

                                                    <td className='text-center'>
                                                        <button
                                                            className='btn btn-outline-danger btn-sm'
                                                            onClick={() => deleteAddress(obj)}
                                                            title='Eliminar'
                                                            type='button'
                                                        >
                                                            <FontAwesomeIcon icon={faTrash}/>
                                                        </button>
                                                    </td>

                                                    <td>
                                                        <input 
                                                            checked={ obj.Patio === "S" ? true : false }
                                                            className="form-check-input ml-2"
                                                            name="Patio" 
                                                            onChange={(e) => editAddress( e, obj )}
                                                            type="checkbox" 
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        }) 
                                    }
                                    </tbody>
                                </table>
                            </div>
                        }

                        <hr />

                        {/* <button
                        className='btn btn-info text-light font-italic mt-4'
                        type='button'
                        onClick={() => addNewContact() }
                        disabled={ ordenDeCompra.InformacionDomicilio.length === 0 }
                        >
                            Agregar Contacto Compra
                        </button> */}

                        {/* Rendedizar tabla  ContactoCompra */}
                        {
                            /* ordenDeCompra.ContactosDeCompra !== undefined && ordenDeCompra.ContactosDeCompra.length > 0 &&
                            <div className="row table-responsive mt-2">
                                <table className='table table-bordered table-striped compact'>
                                    <thead>
                                        <tr>
                                            <th className='text-center'><small>Nombre</small></th>   
                                            <th className='text-center'><small>Correo</small></th>   
                                            <th className='text-center'><small>Teléfono</small></th>   
                                            <th className='text-center'><small>Destino</small></th>   
                                            <th className='text-center'><small>Eliminar</small></th>   
                                        </tr>
                                    </thead>
                                    <tbody>
                                      {
                                       ordenDeCompra.ContactosDeCompra.map( obj => (
                                            <tr>
                                                <td className='text-center'>
                                                    
                                                    <input 
                                                    className='form-control mb-2' 
                                                    type="text" 
                                                    name="NombreContacto" 
                                                    value={obj.NombreContacto} 
                                                    autoComplete='off'
                                                    disabled={false}
                                                    onChange={(e) => editContact( e, obj )}
                                                    
                                                    />
                                                </td>  
                                                <td className='text-center'>
                                                    
                                                    <input 
                                                    className='form-control mb-2' 
                                                    type="text" 
                                                    name="CorreoContacto" 
                                                    value={obj.CorreoContacto} 
                                                    autoComplete='off'
                                                    disabled={false}
                                                    onChange={(e) => editContact( e, obj )}
                                                    
                                                    />
                                                </td>  
                                                <td className='text-center'>
                                                    
                                                    <input 
                                                    className='form-control mb-2' 
                                                    type="text" 
                                                    name="TelefonoContacto" 
                                                    value={obj.TelefonoContacto} 
                                                    autoComplete='off'
                                                    disabled={false}
                                                    onChange={(e) => editContact( e, obj )}
                                                    
                                                    />
                                                </td>  
                                                <td className='text-center'>
                                                    <select 
                                                    name='DestinoContacto' 
                                                    className='form-select seleccionable mb-2 select-class-1' 
                                                    onChange={(e) => editContact( e, obj )}
                                                    
                                                    >
                                                        {
                                                            ordenDeCompra.InformacionDomicilio.map(dom => (
                                                                    <option 
                                                                    selected={ dom.id === Number(obj.DestinoContacto.split("|").shift()) } 
                                                                    value={`${dom.id}|${dom.CiudadDestino}|${dom.DomicilioDeEntrega}`}
                                                                    >
                                                                        {`${dom.CiudadDestino} - ${dom.DomicilioDeEntrega.substring(0,10)}...`}
                                                                    </option>
                                                                ))
                                                        }
                                                    </select>
                                                </td>
                                                <td>
                                                    <button
                                                        title='Eliminar'
                                                        type='button'
                                                        className='btn btn-outline-danger btn-sm'
                                                        onClick={() => deleteContact(obj)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash}/>
                                                    </button>        
                                                </td>  
                                            </tr>
                                       )) 
                                      }  
                                    </tbody>
                                </table>    
                            </div> */
                        }

                </form> 
            </div>           
        </div>
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <button
                    className='btn btn-info text-light font-italic mt-4'
                    disabled={ordenDeCompra.TiposYCantidades.length === 0}
                    onClick={ () => { onSubmit(ordenDeCompra) } }
                    tabIndex={6}
                    type='button'
                >
                    {editMode ? 'Guardar Cambios' : Registrar}
                </button>
            </div>
        </div>
    </div>
  )
}
