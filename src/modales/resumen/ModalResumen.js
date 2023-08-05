import React, { useState, useEffect } from 'react'

import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'

import { ApiUrl } from '../../services/ApiRest'
import { validarFecha, isDefaultDate } from '../../helpers/fecha';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';

export const ModalResumen = ({
    extensionOrDPP2ByVIN,
    onSubmit,
    agencia
}) => {
    
    let url = '';
    const Contado = "Contado"
    const [data, setData] = useState([])

    useEffect(() => {
      if ( extensionOrDPP2ByVIN.PermisoDesvio === Contado ) {
        getFechasExtensionPermisos()
      }
    }, [extensionOrDPP2ByVIN])

    const getFechasExtensionPermisos = async () => {
        url = ApiUrl + "api/dpp_contado/getFechasExtensionesByVIN";
        let body = { 
            agencia: agencia, 
            VIN: extensionOrDPP2ByVIN.data.VIN, 
            FolioDesvio: extensionOrDPP2ByVIN.data.FolioDesvio 
        }
        const extPermList = await axiosPostService( url, body );
        setData( extPermList );
    }

    const downloadPDF = async ( Id ) => {
        url = ApiUrl + "api/dpp_contado/downloadPDF"
        let body = {Id, agencia}
        await axios.post(url, body, {responseType:'blob'})
        .then(response => {
            const fileUrl = window.URL.createObjectURL(response['data']);
            window.open(fileUrl, '_blank');
        })
        .catch(err => {
            console.log(err);
        })
    }

    return (
        <div className='bg-white-modal'>
            <h5 className='text-center text-dark mt-4'>{ extensionOrDPP2ByVIN.PermisoDesvio === Contado ? 'EXTENSIONES PERMISO' : 'DPP FASE 2'}</h5>
            <h5 className='text-center text-dark'>VIN: <span className='badge text-bg-secondary'>{extensionOrDPP2ByVIN.data.VIN}</span></h5>
            <div className="row">
                <div className="container mt-4">    
                    <table className='table table-bordered table-striped compact'>
                        <thead>
                            <tr className='text-center'>
                                <th>Fecha Solicitud</th>
                                <th>Fecha Vencimiento</th>
                                {extensionOrDPP2ByVIN.PermisoDesvio === Contado && <th>PDF</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                extensionOrDPP2ByVIN.PermisoDesvio === Contado ?
                                data.length > 0 ?
                                data.map( row => {
                                    return (
                                        <tr className='text-center'>
                                            <td>{ validarFecha(row.FechaSolicitudExtP) }</td>
                                            <td>{ validarFecha(row.FechaVencimientoExtP) }</td>
                                            <td>{
                                                row.DocumentoAdjunto === "1" 
                                                ? 
                                                    <button
                                                        title='Visualizar PDF'
                                                        type='button'
                                                        className='btn btn-outline-danger'
                                                        onClick={() => downloadPDF(row.Id)}
                                                    ><FontAwesomeIcon icon={faFilePdf}/></button> 
                                                    : 
                                                    ""
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                                :
                                <tr>
                                    <td>No hay extensiones</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                :
                                <tr className='text-center'>
                                   <td>{ validarFecha( isDefaultDate(extensionOrDPP2ByVIN.data.FechaSolicitudFase2) ) }</td>
                                   <td>{ validarFecha( isDefaultDate(extensionOrDPP2ByVIN.data.FechaVencimientoFase2) ) }</td> 
                                </tr>
                                
                            }

                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row justify-content-center mt-2">
                <div className='col-auto'>
                    <button
                    className='btn btn-info text-light font-italic mt-2'
                    type='button'
                    tabIndex={1}
                    onClick={ onSubmit }
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}