import { useEffect, useState } from "react"


const Editar = 'Editar';
const Registrar = 'Registrar';

export const ModalDirectorios = ({
    inputValues,
    isEditMode,
    onSubmit
}) => {

    const [inputValuesObject, setInputValuesObject] = useState({})

    useEffect(() => {
        setInputValuesObject( inputValues )

    }, [inputValues])
    

    const onChange = ({ target }) => {
        const { name, value } = target;

        setInputValuesObject({
            ...inputValuesObject,
            [name] : value.toUpperCase()
        })
    }

    return (
        <div className="bg-white-modal">
            <h5 className='text-center text-dark'>Directorio</h5>

            <div className="container animate__animated animate__fadeIn">
                <form>
                    <div className="row marginBottomSheet mt-4">

                        <div className="col-4">

                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Destino
                            </label>

                            <input 
                                autoComplete='off'
                                className="form-control mb-2"
                                tabIndex={1}
                                name="Destino"  
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Destino }
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Puesto
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={4}
                                name="Puesto"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Puesto }
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Puesto Contacto 2
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={7}
                                name="PuestoContacto2"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.PuestoContacto2 }
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Extensión
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={10}
                                name="Extension"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Extension }
                            />

                        </div>

                        <div className="col-4">

                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Distribuidor
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={2}
                                name="Distribuidor"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Distribuidor }
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Teléfono
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={5}
                                name="Telefono"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Telefono }
                                
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Correo
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={8}
                                name="Correo"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Correo }
                            />
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Numero Distribuidor
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={11}
                                name="NumeroDistribuidor"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.NumeroDistribuidor }
                            />

                        </div>

                        <div className="col-4">

                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Nombre
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={3}
                                name="Nombre"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Nombre }
                            />
                            
                            
                            {/*  */}

                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Teléfono Móvil
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={6}
                                name="TelefonoMovil"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.TelefonoMovil }
                                
                            />

                            {/*  */}
                            
                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Dirección
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={9}
                                name="Domicilio"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Domicilio }
                            />

                            <label className="bg-secondary input-group-text text-light font-weight-normal" >
                                Nombre Contacto 2
                            </label>

                            <input 
                                autoComplete='off' 
                                className="form-control mb-2"
                                tabIndex={12}
                                name="Contacto2"
                                onChange={ onChange }
                                type="text"
                                value={ inputValuesObject.Contacto2 }
                            />

                        </div>

                    </div>
                </form>
            </div>

            <div className="row justify-content-center">
                <div className="col-auto">
                    <button
                        className='btn btn-info text-light font-italic mt-4'
                        onClick={ () => { onSubmit( inputValuesObject ) } }
                        tabIndex={19}
                        type='button'
                    >
                        { isEditMode ? Editar : Registrar }
                    </button>
                </div>
            </div>

        </div>

    )

}
