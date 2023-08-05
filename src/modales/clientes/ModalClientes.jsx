import React,{useState, useEffect} from 'react'

import { isADotValue, hasPointTheInputValue, isNumber, getTotalPoints } from '../../helpers/validarInputs'
import { removerComas } from '../../helpers/formatoMoneda'
import '../../css/modales/ModalClientes.css'

export const ModalClientes = ({ data, editMode, onSubmit }) => {
    const [cliente, setCliente] = useState({})
    const Editar = 'Editar'
    const Registrar = 'Registrar'

    useEffect(() => {
        setCliente(data)
    }, [data])
    
    const onChange = (e) => {
        setCliente({
            ...cliente,
            [e.target.name]: e.target.value
        })
    }

    const onChangeLimiteCredito = ( e, limCredito ) => validateInput(e, limCredito)

    const validateInput = (e, valorDelCampo) => {
        if (isNumber(e.target.value)) {
            setValor(e.target.name, e.target.value)
            return;
        }
          
        if (!isNumber(e.target.value)) {
            if (isADotValue(e.target.value)) {
                (!hasPointTheInputValue( valorDelCampo ))
                ? setValor(e.target.name, e.target.value)
                : (getTotalPoints(e.target.value) !== 2) && setValor(e.target.name, valorDelCampo.substring(0, valorDelCampo.toString().length - 1))
                
            }
        }    
    }

    const setValor = ( propiedad, valor ) => {
        setCliente({
            ...cliente,
            [propiedad]: valor
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

    const onFocus = ( e ) => {
        setCliente({
            ...cliente,
            [e.target.name]: removerComas(e.target.value)
        })
    }
    
    const onBlur = ( e ) => {
        setCliente({
            ...cliente,
            [e.target.name]: new Intl.NumberFormat('es-MX').format(e.target.value)
        })
    }

  return (
    <div className='bg-white-modal'>
        <h5 className='text-center text-dark'>Clientes</h5>
        <div className='row'>
            <div className='container col-12 mt-3 animate__animated animate__fadeIn'>
                <form>
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Número Cliente
                    </label>
                    <input 
                    type="number" 
                    className="form-control mb-2" 
                    tabIndex={1} 
                    value={cliente.Num_cliente} 
                    onChange={onChange} 
                    name="Num_cliente" 
                    autoComplete='off'
                    readOnly={ editMode } 
                    />
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        RFC
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-2" 
                    tabIndex={2} 
                    value={cliente.RFC} 
                    onChange={onChange} 
                    name="RFC" 
                    autoComplete='off' 
                    />
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Razón Social
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-2" 
                    tabIndex={3} 
                    value={cliente.Razon_social} 
                    onChange={onChange} 
                    name="Razon_social" 
                    autoComplete='off' 
                    />
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Nombre Corto
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-2" 
                    tabIndex={4} 
                    value={cliente.Nombre_corto} 
                    onChange={onChange} 
                    name="Nombre_corto" 
                    autoComplete='off' 
                    />

                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        # FAN
                    </label>
                    <input 
                    type="number" 
                    className="form-control mb-2" 
                    tabIndex={1} 
                    value={cliente.FanCliente} 
                    onChange={onChange} 
                    name="FanCliente" 
                    autoComplete='off' 
                    />
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Matriz
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-2" 
                    tabIndex={5} 
                    value={cliente.Ubicacion} 
                    onChange={onChange} 
                    name="Ubicacion" 
                    autoComplete='off' 
                    />
                    
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Límite de Crédito
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-4" 
                    onFocus={( e ) => onFocus( e )}
                    onBlur={( e ) => onBlur( e )}
                    value={cliente.LimiteCredito} 
                    onChange={( e ) => onChangeLimiteCredito( e, cliente.LimiteCredito )} 
                    name="LimiteCredito" 
                    tabIndex={5} 
                    autoComplete='off' 
                    />

                    

                </form> 
            </div>           
        </div>
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <button
                className='btn btn-info text-light font-italic'
                type='button'
                tabIndex={6}
                onClick={
                    () => {
                        onSubmit(cliente)
                        resetFields()
                    }
                }
                >
                    {editMode ? Editar : Registrar}

                </button>
            </div>
        </div>
    </div>
  )
}
