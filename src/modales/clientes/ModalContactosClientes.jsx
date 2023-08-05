
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"


export const ModalContactosClientes = ({ 
    clientNumber,
    contactsTypesProps, 
    purchaseContactsProps,
    uploadClientContacts 
}) => {

    const [purchaseContacts, setPurchaseContacts] = useState([]);
    const [contactsTypes, setContactsTypes] = useState([]);
    const [deletedContact, setDeletedContact] = useState(false);

    useEffect(() => {
        setPurchaseContacts( purchaseContactsProps );
    }, [ purchaseContactsProps ])

    useEffect(() => {
        setContactsTypes( contactsTypesProps );
    }, [ contactsTypesProps ])
    

    const addNewContact = () => {

        const { Id, NombreTipo } = contactsTypes[0];

        const newContact = {
            Id : `${purchaseContacts.length + 1}#`,
            NombreContacto     : "",
            CorreoContacto     : "",
            TelefonoContacto   : "",
            Num_cliente        : clientNumber,
            TipoContacto       : Id,   
            NombreTipoContacto : NombreTipo,
        }

        setPurchaseContacts([ ...purchaseContacts, {...newContact} ]);

    }

    const deleteContact = ( Id ) => { 

        if ( !deletedContact ) setDeletedContact( true );

        const filterContacts = purchaseContacts.filter( contact => contact.Id != Id);
        setPurchaseContacts(filterContacts);
        
    }

    const editContact = ( { target }, Id ) => {

        const { name, value } = target;
        const alterContact = purchaseContacts.map( contact => {

            if ( name === "TipoContacto" && contact.Id == Id ) {
                const [ Id, NombreTipo ] = value.split("|");
                return { ...contact, TipoContacto: Number(Id), NombreTipoContacto:NombreTipo };

            }

            if ( contact.Id == Id ) return { ...contact, [name]:value };
            return contact;

        })

        setPurchaseContacts( alterContact );

    }

    const uploadContact = () => {

       if ( validEmptyValues(purchaseContacts) ) {
           toast.info("Existen registros con campos vacíos, favor de completarlos.");
           return;
       }

       if ( validDuplicatedNames( purchaseContacts ) ) {
           toast.info("Existen registros con nombres repetidos.");
           return; 
       }

       if ( deletedContact ) setDeletedContact( false );

       uploadClientContacts( purchaseContacts, true );
        
    } 

    const validEmptyValues = ( purchaseContacts ) => {
        let hasEmptyValue = false;

        for (const contact of purchaseContacts) {
            if ( 
                contact.NombreContacto === "" || 
                contact.TelefonoContacto === "" || 
                contact.CorreoContacto === "" ) hasEmptyValue = true;
        }

        return hasEmptyValue;
    }

    const validDuplicatedNames = ( purchaseContacts ) => {
        let hasDuplicateNames = false;
        const set = new Set();

        if ( purchaseContacts.some((contact) => set.size === (set.add(contact.NombreContacto), set.size))) {
            hasDuplicateNames = true;

        }

        return hasDuplicateNames;
    }

    const closeModal = () => {

        if ( deletedContact ) setDeletedContact( false );

        uploadClientContacts( [], false );

    } 

    return (
        <div className='bg-white-modal'>
            <h5 className='text-center text-dark'>Contactos del Cliente</h5>
            <div className='row mt-4 pb-4'>
                <div className="col-3">

                    <button
                        title='Agregar Contacto'
                        type='button'
                        className='btn btn-outline-info mt-4'
                        onClick={ addNewContact } >

                        <FontAwesomeIcon icon={faAdd}/>

                    </button>
                    
                </div>      
            </div>

            <div className="row table-responsive animate__animated animate__fadeIn" style={{ paddingLeft:'6px' }}>
                <table className='table table-bordered table-striped compact'>
                    <thead>
                        <tr>
                            <th className='text-center'><small>Tipo</small></th>
                            <th className='text-center'><small>Nombre</small></th>
                            <th className='text-center'><small>Correo</small></th>
                            <th className='text-center'><small>Teléfono</small></th>
                            <th className='text-center'><small>Eliminar</small></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            !!purchaseContacts && purchaseContacts.map( contact => (
                                <tr key={ contact.Id } className="text-center">
                                    <td>
                                        <select 
                                            name="TipoContacto" 
                                            className='form-select seleccionable mb-2 select-class-1'
                                            onChange={ (e) => editContact( e, contact.Id ) } >

                                                {
                                                    contactsTypes.map( type => (
                                                        <option 
                                                            value={ `${type.Id}|${type.NombreTipo}` }
                                                            selected={ type.Id === contact.TipoContacto }>
                                                                { type.NombreTipo }
                                                        </option>
                                                    ))
                                                }

                                        </select>
                                    </td>
                                    <td>

                                        <input 
                                            autoComplete="off"
                                            className="form-control mb-2"
                                            name="NombreContacto"
                                            onChange={(e) => editContact( e, contact.Id )}
                                            type="text"
                                            value={ contact.NombreContacto } />

                                    </td>
                                    <td>

                                        <input 
                                            autoComplete='off'
                                            className='form-control mb-2' 
                                            name="CorreoContacto" 
                                            onChange={(e) => editContact( e, contact.Id )}
                                            type="text" 
                                            value={contact.CorreoContacto} />

                                    </td>
                                    <td>

                                        <input 
                                            autoComplete='off'
                                            className='form-control mb-2'
                                            name="TelefonoContacto" 
                                            onChange={(e) => editContact( e, contact.Id )} 
                                            type="text" 
                                            value={contact.TelefonoContacto} />

                                    </td>
                                    <td>
                                        <button
                                            title='Eliminar'
                                            type='button'
                                            className='btn btn-outline-danger btn-sm'
                                            onClick={() => deleteContact( contact.Id )}
                                        >
                                            <FontAwesomeIcon icon={faTrash}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                            
                        }
                    </tbody>
                </table>    
            </div>

            <div className="row justify-content-center">
                <div className='col-auto'>

                    <button
                        className="btn btn-info text-light font-italic mt-4 ml-4"
                        disabled={ purchaseContacts.length === 0 && !deletedContact }
                        onClick={ uploadContact }
                        title='Aplicar Cambios'
                        type='button'
                    >

                        Guardar

                    </button>

                    <button
                        onClick={ closeModal }
                        title='Cerrar'
                        type='button'
                        className="btn btn-danger text-light font-italic mt-4 ml-4" >
                        
                        Cerrar

                    </button>  

                </div>
            </div>
        
        </div>
    )
}
