import React,{ useState, useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify';
import { getAgencia } from '../../helpers/getAgencia';

import { ApiUrl } from '../../services/ApiRest';
import OrdenDeCompra1 from './componentes/OrdenDeCompra1';
import AsignarVinsOrdenDeCompra from './componentes/AsignarVinsOrdenDeCompra';
import AsignarVinsEstatusGPS from './componentes/AsignarVinsEstatusGPS';
import ResumenFinal from './componentes/ResumenFinal';
import BitacoraEstatusTyT from './componentes/BitacoraEstatusTyT';
import AsignadosCDOS from './componentes/AsignadosCDOS';
import DirectorioDist from './componentes/DirectorioDist';
import Siniestros from './componentes/Siniestros';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';
import '../../css/ordenDeCompra/ordenDeCompra.css'
import "datatables.net-dt/css/jquery.dataTables.min.css"
import { useVentasFlotillasDMS } from '../../hooks/useVentasFlotillasDMS';
import { CircularProgress } from '@mui/material';

const OrdenDeCompra = () => {
  const ordenDeCompra = 1;
  const asignarVinsOrden = 2;
  const asignarVinsEstatus = 3;
  const resumen = 4;
  const bitacoraEstatusTyT = 5;
  const asignadoCDO = 6;
  const directorioDistribuidores = 7;
  const siniestrosTab = 8;
  const agencia = getAgencia();
  let url = '';

  const [clientes, setClientes] = useState([])
  const [componenteAsignacion, setComponenteAsignacion] = useState(1);

  /* COMENTAR TEMPORALMENTE. */
  // const isUpdated = true;
  const { isUpdated } = useVentasFlotillasDMS( agencia ); //customHook

  useEffect(() => {
    if (clientes.length === 0) getClientes()
  }, [])
  
  const getClientes = async() => {
    url = ApiUrl + "api/clientes_ordered"
    const result = await axiosPostService(url, agencia)
    setClientes(result)
  }

  const onChange = ( value ) => {
    setComponenteAsignacion( value );
  }

  return (
    <div className='content-wrapper'>
      <div className='content-header'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-sm-12'>
              <div className='card card-outline card-primary'>
                <div className='card-header'>
                  <h5 className='m-0 text-dark'>LOGÍSTICA</h5> {/* ORDEN DE COMPRA */}
                </div>
              </div>    
            </div>  
          </div>
        </div>  
      </div>
      {
        !isUpdated ? 
        (<div className="row m-2">
          <div className="col">
            <strong className='mr-2'>Cargando...</strong>
            <div className="spinner-border ml-4" role="status" aria-hidden="true"></div>
          </div>
         </div>) 
        :
        (<div className='container-fluid'>
        
          <div className='row ml-2 mr-2'>

            <ul className="nav nav-tabs mb-3">

              <li className="nav-item" role="presentation" onClick={() => onChange(ordenDeCompra)}>
                <a className={componenteAsignacion === ordenDeCompra ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="fas fa-tasks"/>
                  <small className='ml-2'>ORDEN COMPRA CLIENTE</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(asignarVinsOrden)}>
                <a className={componenteAsignacion === asignarVinsOrden ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="fas fa-list-ol"/>
                  <small className='ml-2'>ASIGNAR VINS - ORDEN COMPRA</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(asignarVinsEstatus)}>
                <a className={componenteAsignacion === asignarVinsEstatus ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="fas fa-check-double"/>
                  <small className='ml-2'>ASIGNAR VINS - ESTATUS DE VEHÍCULOS</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(asignadoCDO)}>
                <a className={componenteAsignacion === asignadoCDO ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="fas fas fa-sliders-h"/>
                  <small className='ml-2'>ASIGNADOS - CDO</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(resumen)}>
                <a className={componenteAsignacion === resumen ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="far fa-list-alt"/>
                  <small className='ml-2'>RESUMEN</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(bitacoraEstatusTyT)}>
                <a className={componenteAsignacion === bitacoraEstatusTyT ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="far fas fa-align-left"/>
                  <small className='ml-2'>BITÁCORA ESTATUS TYT</small>
                </a>
              </li>

              <li className="nav-item" role="presentation" onClick={() => onChange(directorioDistribuidores)}>
                <a className={componenteAsignacion === directorioDistribuidores ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="far fas fa-address-card"/>
                  <small className='ml-2'>DIRECTORIO</small>
                </a>
              </li>
              
              <li className="nav-item" role="presentation" onClick={() => onChange(siniestrosTab)}>
                <a className={componenteAsignacion === siniestrosTab ? "nav-link handpointer active background-tabs" : "nav-link handpointer"}>
                  <i className="far fas fa-car"/>
                  <small className='ml-2'>SINIESTROS</small>
                </a>
              </li>

            </ul>
            
          </div>
          
          
          {
              componenteAsignacion === 1 ?  <OrdenDeCompra1 agencia={agencia}/> :
              componenteAsignacion === 2 ?  <AsignarVinsOrdenDeCompra agencia={agencia} clientes={clientes}/> :
              componenteAsignacion === 3 ?  <AsignarVinsEstatusGPS agencia={agencia} clientes={clientes}/> : 
              componenteAsignacion === 4 ?  <ResumenFinal agencia={agencia} clientes={clientes}/> : 
              componenteAsignacion === 5 ?  <BitacoraEstatusTyT agencia={agencia} clientes={clientes} /> :
              componenteAsignacion === 6 ?  <AsignadosCDOS agencia={agencia} clientes={clientes} /> :
              componenteAsignacion === 7 ?  <DirectorioDist agencia={agencia} clientes={clientes} /> :
              componenteAsignacion === 8 && <Siniestros agencia={agencia} clientes={clientes} />
          }
          
        </div>)
      }
      <ToastContainer />
    </div>
  )
}

export default OrdenDeCompra