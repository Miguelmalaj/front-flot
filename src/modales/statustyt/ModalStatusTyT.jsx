import React, { useState } from 'react'

import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ApiUrl } from '../../services/ApiRest';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';

let url = '';

export const ModalStatusTyT = ({
    agencia,
    handleAfterStatusCreated
}) => {
    const [newEstatusTyT, setNewEstatusTyT] = useState('')

    const onChange = ( e ) => setNewEstatusTyT(e.target.value)

    const AddStatusTyT = async () => {
        url = ApiUrl + 'api/asignarvins/create_new_statustyt';
        await axiosPostService( url, { agencia, newEstatusTyT} )
            .then(response => {
                if ( response.isCreated ) {
                    toast.success("El Estatus fue creado exitosamente.")
                    handleAfterStatusCreated();
                    setNewEstatusTyT('')
                    return;
                }

                toast.error("Ya existe un nombre de estatus similiar.")
            })
            .catch(err => {
                
            })
    }

  return (
    <div className='bg-white-modal'>
        <h5 className='text-center text-dark'>Agregar</h5>
        <div className='row'>
            <div className='container col-12 mt-3'>
                <form>
                    <label 
                    className="bg-secondary input-group-text text-light font-weight-normal"
                    >
                        Estatus TyT
                    </label>
                    <input 
                    type="text" 
                    className="form-control mb-2" 
                    onChange={onChange} 
                    name="EstatusTyT" 
                    autoComplete='off' 
                    />
                    
                </form> 
            </div>           
        </div>

        <div className='row justify-content-center'>
            <div className='col-auto'>
                {/* <button
                className='btn btn-info text-light font-italic mt-2'
                type='button'
                tabIndex={6}
                onClick={
                    () => {
                        onSubmit(ordenDeCompra)
                        resetFields()
                    }
                }
                >
                    nameButton
                </button> */}
                <button
                        title='Aceptar'
                        type='button'
                        className='btn btn-outline-success m-2'
                        onClick={AddStatusTyT}
                    >
                        <FontAwesomeIcon icon={faCheck}/> <small>Aceptar</small>
                    </button>
            </div>
        </div>

    </div>
  )
}
