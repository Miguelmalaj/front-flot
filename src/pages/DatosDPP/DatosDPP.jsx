import React, { useState, useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify';

import DatosDPP1 from './componentes/DatosDPP1';
import Cancelaciones from './componentes/Cancelaciones';
import DatosDPP2_Extension from './componentes/DatosDPP2_Extension';
import ResumenGeneral from './componentes/ResumenGeneral';
import { getAgencia } from '../../helpers/getAgencia';
import { ApiUrl } from '../../services/ApiRest';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';

const DatosDPP = () => {
    let url = '';
    const DatDPP1 = 1;
    const Cancelado = 2;
    const dpp2_extension = 3;
    const resumen = 4;
    // const DatDPP2 = 2;
    const agencia = getAgencia();
    const [ComponentDatosDPP1, setComponentDatosDPP1] = useState(1)
    const [clientes, setClientes] = useState([])

    useEffect(() => {
      if (clientes.length === 0) getClientes()
    },[])

    const getClientes = async() => {
      url = ApiUrl + "api/clientes"
      const result = await axiosPostService(url, agencia)
      setClientes(result)
    }

    const onChange = ( value ) => {
        setComponentDatosDPP1( value );
    }

  return (
    <div className='content-wrapper'>
      <div className='content-header'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-sm-12'>
              <div className='card card-outline card-primary'>
                <div className='card-header'>
                  <h5 className='m-0 text-dark'>DATOS DPP</h5>
                </div>
              </div>    
            </div>  
          </div>
        </div>  
      </div>
      <div className='container-fluid'>
        <div className='row ml-2 mr-2'>

          <ul className="nav nav-tabs mb-3">
            <li className="nav-item" role="presentation" onClick={() => onChange(DatDPP1)}>
              <a className={ComponentDatosDPP1 === DatDPP1 ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-tasks"/>
                <small className='ml-2'>PERMISO DE DESVÍO</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(Cancelado)}>
              <a className={ComponentDatosDPP1 === Cancelado ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-times-circle"/>
                <small className='ml-2'>CANCELACIONES</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(dpp2_extension)}>
              <a className={ComponentDatosDPP1 === dpp2_extension ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-sliders-h"/>
                <small className='ml-2'>DPP FASE 2 | EXTENSIÓN</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(resumen)}>
              <a className={ComponentDatosDPP1 === resumen ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-chart-bar"/>
                <small className='ml-2'>RESUMEN</small>
              </a>
            </li>
            
          </ul>
          
        </div>
        
        {
            ComponentDatosDPP1 === DatDPP1 ? <DatosDPP1 agencia={agencia} clientes={clientes}/> :
            ComponentDatosDPP1 === Cancelado ?  <Cancelaciones agencia={agencia} clientes={clientes}/> :
            ComponentDatosDPP1 === dpp2_extension ? <DatosDPP2_Extension agencia={agencia} clientes={clientes}/> :
            ComponentDatosDPP1 === resumen && <ResumenGeneral agencia={agencia} clientes={clientes}/>
            /* :
            componenteAsignacion === 2 ?  <Cancelaciones agencia={agencia} clientes={clientes}/> :
            componenteAsignacion === 3 &&  <div>"modulo en construcción"</div>  */
        }
        
      </div>
      <ToastContainer />
    </div>
  )
}

export default DatosDPP