import { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as XLSX from "xlsx"
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

import { ApiUrl } from '../../../services/ApiRest';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { validarFecha, isDefaultDate, dateAndHour } from '../../../helpers/fecha'
import { upperCase } from '../../../helpers/converToUpperCase';
import { statusGPSDataTable } from '../../../components/datatable/conf';
import { toast } from 'react-toastify';
import $ from 'jquery';

let url = '';
const emptyString = '';
const TODOS = 'TODOS';

const BitacoraEstatusTyT = ({ agencia, clientes }) => {

    const [filterData, setFilterData] = useState({
        NumeroCliente       :  0,
        Ubicacion           :  emptyString,
        NombreCliente       :  emptyString,
    })
    const [OrdenCompra, setOrdenCompra] = useState('');
    const [ordenesDeCompra, setOrdenesDeCompra] = useState([]);
    const [VINSVehiclesNames, setVINSVehiclesNames] = useState([]);
    const [historicalVIN, setHistoricalVIN] = useState([]);
    const [tiposVehPaquetes, setTiposVehPaquetes] = useState([]);
    const [paqueteSelected, setPaqueteSelected] = useState('');

    useEffect(() => {
        if ( clientes.length > 0 ) {
            setFilterData({
                ...filterData,
                NumeroCliente     : clientes[0].Num_cliente,
                Ubicacion         : clientes[0].Ubicacion,
                NombreCliente     : clientes[0].Nombre_corto
            })
            // getOrdenesDeCompraByCliente( clientes[0].Nombre_corto, clientes[0].Ubicacion, clientes[0].Num_cliente )
            getAllStatus()
        }
    }, [])
    
    const getOrdenesDeCompraByCliente = async ( NombreCliente, UbicacionCliente, numeroCliente ) => {
        /* url = ApiUrl + "api/asignarvins/get_ordenes_de_compra"
        const body_cliente = { 
            Agencia           : agencia, 
            NombreCliente     : NombreCliente, 
            UbicacionCliente  : UbicacionCliente,
            Num_cliente       : numeroCliente 
        };
        const total_ordenes_compra = await axiosPostService( url, body_cliente );
        setOrdenesDeCompra(total_ordenes_compra)

        if ( total_ordenes_compra.length >   0 ) {
            setFilterData({
                ...filterData,
                NumeroCliente  : numeroCliente,
                Ubicacion      : UbicacionCliente,
                NombreCliente  : NombreCliente,
            })
            setOrdenCompra(total_ordenes_compra[0].OrdenCompra)
            getTiposPaquetesVehiculos( total_ordenes_compra[0].OrdenCompra )
        }
        if ( total_ordenes_compra.length === 0 ) {
            setFilterData({
                ...filterData,
                NumeroCliente  : numeroCliente,
                Ubicacion      : UbicacionCliente,
                NombreCliente  : NombreCliente,
            })
            setOrdenCompra('')
            setHistoricalVIN([])
        } */
    }

    const getTiposPaquetesVehiculos = async ( ordenComp ) => {
        /* url = ApiUrl + "api/resumen/get_tipos_vehiculos"
        const body = { Agencia: agencia, OrdenDeCompra: ordenComp };
        const totalPaquetes = await axiosPostService( url, body );
        
        if ( tiposVehPaquetes.length > 0 ) setTiposVehPaquetes([]);
        setTiposVehPaquetes([{Vehiculo:'TODOS'},...totalPaquetes])

        if ( totalPaquetes.length >   0 ) {
            setPaqueteSelected( TODOS )
            getHistoricalStatusTyT( TODOS, ordenComp )
        }
        if ( totalPaquetes.length === 0 ) {
            setHistoricalVIN([])
            setPaqueteSelected('')
            setTiposVehPaquetes([])
        } */

    }

    const getHistoricalStatusTyT = async ( Paquete, OrdenDeCompra ) => {
        /* url = ApiUrl + "api/bitacora/get_vins_vehicles_historial";
        const body = { Agencia: agencia, Paquete, OrdenDeCompra }
        let historicalVINS = await axiosPostService( url, body );
        setHistoricalVIN(historicalVINS); */

    }

    const getAllStatus = async () => {
        
        url = ApiUrl + "api/bitacora/get_vins_vehicles_historial";
        const body = { Agencia: agencia }
        let historicalVINS = await axiosPostService( url, body );
        // console.log('historicalVINS', historicalVINS);
        
        try {
            dataTableDestroy();
            
            setHistoricalVIN( historicalVINS );
            dataTable();
            
        } catch (error) {
            toast.error("Error al cargar registros en tabla.")
            console.log(error)   
        }
    }

    const OnChange = (e) => {
        const propertyName = e.target.name;
        const propertyValue = e.target.value;

        if ( propertyName === 'tiposVehPaquetes' ) {
            setPaqueteSelected( propertyValue )
            getHistoricalStatusTyT( propertyValue, OrdenCompra )
        }
        if ( propertyName ===  'ordenDeCompra') {
            setOrdenCompra(propertyValue)
            getTiposPaquetesVehiculos( propertyValue )
        }
        if ( propertyName ===  'Cliente') {
            const [ Ubicacion, Nombre_cliente, numeroCliente ] = e.target.value.split("|");
            getOrdenesDeCompraByCliente( Nombre_cliente, Ubicacion, numeroCliente )
        }
    }

    const dataExcelFile = () => {
        return historicalVIN.map((row) => {
            return {
                "VIN"                 : row.VIN,
                "Vehiculo"            : row.Vehiculo,
                "Estatus TyT"         : row.EstatusTyT,
                "Fecha Estatus TyT"   : dateAndHour(row.FechaEstatusTyT),
                "Observaciones"       : row.ObservacionesEstatusTyT,
                "Pedido GM"           : row.OrdenDeCompra
            }
        })
    }

    const onExportToExcel = () => {
        const dataExcel = dataExcelFile();
        const Header = [
            "VIN",
            "Vehiculo",
            "Estatus TyT",
            "Fecha Estatus TyT",
            "Observaciones",
            "Pedido GM"
        ]
        const fileName = "Bitácora Estatus TyT";
        const fileNameExtension = "BitacoraEstatusTyT.xlsx";
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])
        XLSX.utils.sheet_add_json(ws, dataExcel, {
            header: Header,
            skipHeader: false,
        })
        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, fileNameExtension)
    }

    const validateEstatusTyT = ( status ) => {
        return status == 0 ? 'EN PATIO' : status;
    }

    const dataTable = () => {
        setTimeout(() => {
          $('#bitacoraVINSTable').DataTable(statusGPSDataTable);
        }, 500);
    }

    const dataTableDestroy = () => {
        $("#bitacoraVINSTable").DataTable().destroy();
    }

  return (
    <div className='ml-2'>

        {/* <div className="row">
            <div className="col-6">
                <div className="row d-flex justify-content-between pl-2 pr-4">
                    <h6 className='mr-4'>Seleccionar Cliente: </h6>
                    <select 
                        name='Cliente' 
                        className='form-select select-class-1' 
                        onChange={OnChange}
                        tabIndex={1}
                        > */}
                        {
                        /* clientes
                        .map(cliente => {
                            return (
                            <option
                            value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                            >
                                {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                            </option>
                            )
                        }) */
                        }
                    {/* </select>
                </div>
            </div>
            <div className="col-6">
                
            </div> 
        </div> */}

        {/* <div className="row">
            <div className="col-6">
                <div className="row d-flex justify-content-between pl-2 pr-4">
                    <h6 className='mr-4'>Orden Compra Cliente: </h6>
                    <select 
                        name='ordenDeCompra' 
                        className='form-select select-class-1' 
                        tabIndex={2} 
                        onChange={OnChange}
                        disabled={ ordenesDeCompra.length === 0}
                    >
                        {
                        ordenesDeCompra.map( orden => {
                            return (
                            <option value={`${orden.OrdenCompra}`}>
                                { orden.OrdenCompra }
                            </option>
                            )
                        })
                        }
                    </select>
                </div>
            </div>
            <div className="col-6">
                
            </div> 
        </div> */}

        {/* <div className="row">
            <div className="col-6">
                <div className="row d-flex justify-content-between pl-2 pr-4">
                    <h6 className='mr-4'> Tipo | Paquete: </h6> 
                    <select 
                        name='tiposVehPaquetes' 
                        className='form-select select-class-1' 
                        tabIndex={2} 
                        onChange={OnChange}
                        disabled={ ordenesDeCompra.length === 0 || tiposVehPaquetes.length === 0}
                    > */}
                        {
                        /*     tiposVehPaquetes.map( type => (
                                <option value={`${type.Vehiculo}`}>
                                    { type.Vehiculo }
                                </option>
                            )) */
                        }
                    {/* </select>
                </div>
            </div>
            <div className="col-6">
                
            </div> 
        </div> */}

        


        <div className="row">
            <div className="row table-responsive ml-2 mr-2 animate__animated animate__fadeIn">
                <table id='bitacoraVINSTable' className='table display compact' style={{fontSize:11}}>
                    <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                        <tr className='text-center'>
                            <th className='text-center'> Cliente </th>  
                            <th className='text-center'> VIN </th>  
                            <th className='text-center'> Vehiculo </th>  
                            <th className='text-center'> Estatus TyT </th>  
                            <th className='text-center'> Fecha </th>  
                            <th className='text-center'> Observaciones TyT</th>  
                            <th className='text-center'> Orden Compra Cliente </th>  
                        </tr>
                    </thead> 
                    <tbody style={{backgroundColor:'#FFFFE0'}}>
                    {
                      historicalVIN.length > 0 ?
                      historicalVIN.map( ( register ) => {
                        return (
                            <tr className='text-center'>
                                <td>{ register.NombreCliente }</td>
                                <td>{ register.VIN }</td>
                                <td>{ register.Vehiculo }</td>
                                <td>{ validateEstatusTyT(register.EstatusTyT) }</td>
                                {/* <td>{ validarFecha(isDefaultDate(register.FechaEstatusTyT)) }</td> */}
                                <td>{ dateAndHour(register.FechaEstatusTyT) }</td>
                                {/* <td>{ register.ObservacionesEstatusTyT }</td> */}
                                <td>{ upperCase( register.ObservacionesTyT ) }</td>
                                <td>{ upperCase( register.OrdenDeCompra ) }</td>
                            </tr>
                        )
                      })
                      :
                        <tr>
                            <td></td> <td></td> <td></td> <td></td> <td></td> <td></td><td></td>
                        </tr>
                    }
                    </tbody>       
                </table>
            </div>
        </div>
        <button
        title="Exportar a Excel"
        type="button"
        className="btn btn-outline-success mb-2"
        onClick={onExportToExcel}
        disabled={historicalVIN.length === 0}
        >
            <FontAwesomeIcon icon={faFileExcel} />
            <small className="ml-2">Excel</small>
        </button>

    </div>
  )
}

export default BitacoraEstatusTyT