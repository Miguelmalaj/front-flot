import React, { useState, useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify';
import { ApiUrl } from '../../services/ApiRest';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';
import AsignacionLote from './componentes/AsignacionLote';
import AsignacionReferencia from './componentes/AsignacionReferencia';
import AsignacionFolioCompra from './componentes/AsignacionFolioCompra';
import ResumenDeContratos from './componentes/ResumenDeContratos';
import { getAgencia } from '../../helpers/getAgencia';
import '../../css/asignacionContratos/asignacionContratos.css'
import 'react-toastify/dist/ReactToastify.css';

const AsignacionContratos = () => {
  const asignacionLote = 1;
  const asignacionReferencia = 2;
  const asignacionFolioCompra = 3;
  const resumenDeContratos = 4;
  const agencia = getAgencia();
  let url = '';
  const [Folio_lote, setFolio_lote] = useState(-1);
  const [componenteAsignacion, setComponenteAsignacion] = useState(1);
  const [clientes, setClientes] = useState([]);

  const [fatherInputs, setFatherInputs] = useState({
    NombreCliente : '',
    NombreLote    : '', 
    Ubicacion     : '',
    numCliente    : 0
  });
  
  const onChange = (value) => {
    setComponenteAsignacion(value)
  }

  useEffect(() => {
    getFolioLote()
    getClientes()
  }, [])

  const getClientes = async () => {
    url = ApiUrl + "api/clientes";
    const result = await axiosPostService( url, agencia );
    setClientes(result);
  }

  const getFolioLote = async () => {
    url = ApiUrl + "api/getFoliosLotes";
    const response = await axiosPostService( url, agencia);
    if ( response.length === 0 ) {toast("Error al obtener el Folio Lote"); return;}
    setFolio_lote(response.Folio_lote)
  }

  const incrementarFolioLote = () => {
    getFolioLote();
  }

  const updateMainValues = ( childState ) => {
    
    const { NombreCliente, NombreLote, Ubicacion, numCliente } = childState;

    setFatherInputs({ 
      NombreCliente, 
      NombreLote: fatherInputs.NombreCliente === NombreCliente && NombreLote === '' ? fatherInputs.NombreLote : NombreLote, 
      Ubicacion, 
      numCliente 
    });
  }

  return (
    <div className='content-wrapper'>
      <div className="content-header content-header-padding">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12">
              <div className='card card-outline card-primary'>
                <div className='card-header'>
                  <h5 className="m-0 text-dark">ASIGNACIÓN DE CONTRATOS</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='container-fluid'>
        <div className='row ml-2 mr-2'>

          <ul className="nav nav-tabs mb-3">
            <li className="nav-item" role="presentation" onClick={() => onChange(asignacionLote)}>
              <a className={componenteAsignacion === 1 ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-tasks"/>
                <small className='ml-2'>ASIGNACIÓN BLOQUE</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(asignacionReferencia)}>
              <a className={componenteAsignacion === 2 ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-list-ol"/>
                <small className='ml-2'>ASIGNACIÓN REFERENCIA</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(asignacionFolioCompra)}>
              <a className={componenteAsignacion === 3 ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="fas fa-check-double"/>
                <small className='ml-2'>ASIGNACIÓN FOLIO COMPRA</small>
              </a>
            </li>
            <li className="nav-item" role="presentation" onClick={() => onChange(resumenDeContratos)}>
              <a className={componenteAsignacion === 4 ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                <i className="far fa-list-alt"/>
                <small className='ml-2'>RESUMEN DE CONTRATOS</small>
              </a>
            </li>
          </ul>
          
        </div>
        {
            componenteAsignacion === 1 ?  <AsignacionLote agencia={agencia} Folio_lote={Folio_lote} clientes={clientes} incrementarFolioLote={incrementarFolioLote} updateMainValues={updateMainValues} fatherInputs={fatherInputs}/> :
            componenteAsignacion === 2 ?  <AsignacionReferencia agencia={agencia} clientes={clientes} updateMainValues={updateMainValues} fatherInputs={fatherInputs}/> :
            componenteAsignacion === 3 ? <AsignacionFolioCompra agencia={agencia} clientes={clientes} updateMainValues={updateMainValues} fatherInputs={fatherInputs}/> :
            componenteAsignacion === 4 && <ResumenDeContratos agencia={agencia} clientes={clientes} updateMainValues={updateMainValues} fatherInputs={fatherInputs}/>
        }
      </div>
      <ToastContainer />
    </div>
  )
}

export default AsignacionContratos