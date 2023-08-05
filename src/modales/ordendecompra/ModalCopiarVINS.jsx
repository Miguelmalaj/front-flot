import React from 'react'

import { toast } from 'react-toastify';

export const ModalCopiarVINS = ({ data, finished }) => {

    const copyALLVINS = () => {
        const VINES = data.map(obj => obj.Vin).join('\n');

        navigator.clipboard.writeText(VINES).then(() => {
            toast.success('Los VINS han sido copiados')
            finished()
        }, () => {
            toast.error('No fue posible copiar los VINS')
        })

    }

  return (
    <div className='bg-white-modal'>
        <h5 className='text-center text-dark'>VINS</h5>
        <div className='row'>
            <div className='container col-12 mt-3'>
                {
                    data.map(obj => {
                        return(
                            <div className='text-center'>{obj.Vin}</div>
                        )
                    })
                }
            </div>           
        </div>
        <div className='row justify-content-center'>
            <div className='col-auto'>
                <button
                className='btn btn-info text-light font-italic mt-2'
                type='button'
                tabIndex={6}
                onClick={
                    () => {
                        copyALLVINS();
                    }
                }
                >
                    Copiar todos
                </button>
            </div>
        </div>
    </div>
  )
}
