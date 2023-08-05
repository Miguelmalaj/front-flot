import React, { useState, useEffect }  from 'react'

import { generate as id } from 'shortid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as XLSX from "xlsx"

import { ApiUrl } from '../../../services/ApiRest';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { validarFecha, isDefaultDate } from '../../../helpers/fecha'
import { pipesStatusPrevia } from '../../../helpers/estatusPrevia';
import { upperCase } from '../../../helpers/converToUpperCase';

let url = '';
const emptyString = ""
const TODOS = 'TODOS';
/* const PENDIENTES = 'PENDIENTES';
const ENTREGADOS = 'ENTREGADOS'; */

const ResumenFinal = ({ agencia, clientes }) => {
    const [writtendata, setWrittendata] = useState({
        NumeroCliente       :  0,
        Ubicacion           :  emptyString,
        NombreCliente       :  emptyString,
        estado              :  TODOS    
    })
    const [VINClientes, setVINClientes] = useState([])
    const [OrdenCompra, setOrdenCompra] = useState('')
    const [paqueteSelected, setPaqueteSelected] = useState('')
    const [ordenesDeCompra, setOrdenesDeCompra] = useState([])
    const [tiposVehPaquetes, setTiposVehPaquetes] = useState([])

    useEffect(() => {
        if ( clientes.length > 0 ) {
            setWrittendata({
                ...writtendata, 
                NumeroCliente     : clientes[0].Num_cliente,
                Ubicacion         : clientes[0].Ubicacion,
                NombreCliente     : clientes[0].Nombre_corto, 
              })
            getOrdenesDeCompraByCliente( clientes[0].Nombre_corto, clientes[0].Ubicacion, clientes[0].Num_cliente )
        }
    }, [clientes])

    const getOrdenesDeCompraByCliente = async ( NombreCliente, UbicacionCliente, numeroCliente ) => {
        url = ApiUrl + "api/asignarvins/get_ordenes_de_compra"
        const body_cliente = { 
            Agencia          : agencia, 
            NombreCliente    : NombreCliente, 
            UbicacionCliente : UbicacionCliente,
            Num_cliente      : numeroCliente 
        };
        const total_ordenes_compra = await axiosPostService( url, body_cliente );
        setOrdenesDeCompra(total_ordenes_compra)

        if ( total_ordenes_compra.length >   0 ) {

            setWrittendata({
              ...writtendata,
              NumeroCliente  : numeroCliente,
              Ubicacion      : UbicacionCliente,
              NombreCliente  : NombreCliente,
            })
            setOrdenCompra(total_ordenes_compra[0].OrdenCompra)
            
            getTiposPaquetesVehiculos( numeroCliente, writtendata.estado, total_ordenes_compra[0].OrdenCompra )
        }

        if ( total_ordenes_compra.length === 0 ) {

            setWrittendata({
              ...writtendata,
              NumeroCliente  : numeroCliente,
              Ubicacion      : UbicacionCliente,
              NombreCliente  : NombreCliente,
            })
            setOrdenCompra('')
            setVINClientes([])
            setPaqueteSelected('')
            setTiposVehPaquetes([])
        }

    }

    const getTiposPaquetesVehiculos = async ( numeroCliente, Estado, ordenComp ) => {
        url = ApiUrl + "api/resumen/get_tipos_vehiculos"
        const body = { Agencia: agencia, OrdenDeCompra: ordenComp };
        const totalPaquetes = await axiosPostService( url, body );
        
        setTiposVehPaquetes([{Vehiculo:'TODOS',Cantidad:0},...totalPaquetes])

        if ( totalPaquetes.length >   0 ) {
            setPaqueteSelected( TODOS ) 
            getVinsResumen( numeroCliente, Estado, ordenComp, TODOS  ); 
        }

        if ( totalPaquetes.length === 0 ) {
            setVINClientes([])
            setPaqueteSelected('')
            setTiposVehPaquetes([])
        }

    }

    const getTotalCantidad = () => {
        let sumaCantidades = 0;
        tiposVehPaquetes.map( tipo => {
            sumaCantidades += Number(tipo.Cantidad);
        })
        return sumaCantidades;
    }

    const getVinsResumen = async ( numeroCliente, Estado, ordenComp, tipoVeh ) => {
        url = ApiUrl + "api/asignarvins/get_vins_to_resumen";
        const body = { Agencia: agencia, Cliente: numeroCliente, Estado, OrdenDeCompra: ordenComp, Vehiculo: tipoVeh }
        let total_vins_resumen = await axiosPostService( url, body );

        setVINClientes(total_vins_resumen)

    }

    const OnChange = (e) => {
        
        if ( e.target.name ===  'tiposVehPaquetes') {
            setPaqueteSelected(e.target.value)
            getVinsResumen( writtendata.NumeroCliente, writtendata.estado, OrdenCompra, e.target.value )
        }

        if ( e.target.name ===  'Estado') {
            setWrittendata({
                ...writtendata,
                estado: e.target.value
            })
            getVinsResumen( writtendata.NumeroCliente, e.target.value, OrdenCompra, paqueteSelected )

        }
        
        if ( e.target.name ===  'ordenDeCompra') {
            setOrdenCompra( e.target.value )
            // getVinsResumen( writtendata.NumeroCliente, writtendata.estado, e.target.value )
            getTiposPaquetesVehiculos( writtendata.NumeroCliente, writtendata.estado, e.target.value )
        }
        
        if ( e.target.name ===  'Cliente') {
            const [ Ubicacion, Nombre_cliente, numeroCliente ] = e.target.value.split("|");
            setWrittendata({
                ...writtendata,
                NumeroCliente : numeroCliente,
                Ubicacion     : Ubicacion,
                NombreCliente : Nombre_cliente
            })
            // getVinsResumen( numeroCliente, writtendata.estado )
            getOrdenesDeCompraByCliente( Nombre_cliente, Ubicacion, numeroCliente )
        }
    }

    const downloadPDF = async ( VIN ) => {
        url = ApiUrl + "api/asignarvins/send_pdf"
        let body = {VIN, agencia}
        await axios.post(url, body, {responseType:'blob'})
        .then(response => {
            const fileUrl = window.URL.createObjectURL(response['data']);
            window.open(fileUrl, '_blank');
        })
        .catch(err => {
            toast.error('Error al descargar carta cliente.')
        })
    }

    const validDefaultStatusTyT = ( status ) => ( status === "0" ) ? "" : status.toString().split("|").shift();
    
    const dataExcelFile = () => {
        const selectFieldsData = VINClientes.map((row) => {
            let newRow = {
                "Persona Receptor"               : row.PersonaReceptor,
                "Celular"                        : row.CelularDeContacto,
                "Orden De Compra"                : row.OrdenDeCompra,
                "Agencia"                        : row.Agencia,
                "Empresa"                        : row.NombreCliente,
                "Ciudad Destino"                 : row.CiudadDestino,
                "Vehiculo"                       : row.Vehiculo,
                "Inventario"                     : row.Inventario,
                // "Ubicacion"                      : row.Ubicacion,
                "VIN"                            : row.VIN,
                "Observaciones VIN"              : row.ObservacionesVIN,
                "Factura"                        : row.Factura,
                "Retiro Llave"                   : row.retiroDuplicadoLlave == 1 ? 'Si' : 'No',
                "Fecha Segregacion"              : validarFecha(isDefaultDate(row.FechaSolicitudGPS)),
                "Fecha Instalacion"              : validarFecha(isDefaultDate(row.FechaAceptacionGPS)),
                "Estatus GPS"                    : row.EstatusGPS,
                "Estatus Previa"                 : pipesStatusPrevia(row.EstatusPrevia),
                "Folio DPP"                      : row.FolioDPP,
                "Permiso"                        : row.FolioDesvio,
                "Fecha Vencimiento Folio Desvio" : validarFecha(row.FechaVencimiento),
                "Fecha Vencimiento DPP 1"        : validarFecha( row.FechaVencimientoDPP1 ),
                "Fecha Vencimiento DPP 2"        : validarFecha( row.FechaVencimientoFase2 ),
                "Domicilio De Entrega"           : row.DomicilioDeEntrega,
                "Estatus TyT"                    : validDefaultStatusTyT(row.EstatusTyT),
                "FechaEstatus TyT"               : validarFecha(isDefaultDate(row.FechaEstatusTyT)),
                "Fecha Entrega Cliente"          : validarFecha(isDefaultDate(row.FechaEntregaCliente)),
                "Fecha De Envio Docum"           : validarFecha(isDefaultDate(row.FechaDeEnvioDocum)),
                "Fecha De Recepcion"             : validarFecha(isDefaultDate(row.FechaDeRecepcion)),
                "Observaciones"                  : row.Observaciones,
            }
            return newRow;
        })
        return selectFieldsData;
    }

    const onExportToExcel = () => {
        const dataExcel = dataExcelFile();
        const Header = [
            // "Cliente",
            // "Ubicacion",
            "Persona Receptor",
            "Celular",
            "Orden De Compra",
            "Agencia",
            "Empresa",
            "Ciudad Destino",
            "Vehiculo",
            "Inventario",
            "VIN",
            "Observaciones VIN",
            "Factura",
            "Retiro Llave",
            "Fecha Segregacion",
            "Fecha Instalacion",
            "Estatus GPS",
            "Estatus Previa",
            "Folio DPP",
            "Permiso",
            "Fecha Vencimiento Folio Desvio",
            "Fecha Vencimiento DPP 1",
            "Fecha Vencimiento DPP 2",
            "Domicilio De Entrega",
            "Estatus TyT",
            "FechaEstatus TyT",
            "Fecha Entrega Cliente",
            "Fecha De Envio Docum",
            "Fecha De Recepcion",
            "Observaciones",
        ];
       
        const fileName = "Resumen Final";
        const fileNameExtension = "Resumen_Final.xlsx";
        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])
        XLSX.utils.sheet_add_json(ws, dataExcel, {
            header: Header,
            skipHeader: false,
        })

        XLSX.utils.book_append_sheet(wb, ws, fileName);
        XLSX.writeFile(wb, fileNameExtension)
    }

    const earliestDateDPP = ( fDPP1, fDPP2 ) =>  fDPP2 !== null ? fDPP2 : fDPP1;

  return (
    <div className='ml-2 mt-2'>

        <div className="row">
            <div className="col-6">
                <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                    
                    <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
                    
                    <select 
                        name='Cliente' 
                        className='form-select select-class-1 width__label-input mt-2' 
                        onChange={OnChange}
                        tabIndex={1}
                        // disabled={ isPreviewTable }
                        >
                        {
                        clientes
                        .map(cliente => {
                            return (
                            <option
                            value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                            >
                                {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                            </option>
                            )
                        })
                        }
                    </select>

                </div>
            </div>
            <div className="col-6">
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                    <h6 className='mr-4 width__label-input-min'>Orden Compra Cliente: </h6>
                    <select 
                        name='ordenDeCompra' 
                        className='form-select select-class-1 width__label-input mt-2' 
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
        </div>

        <div className="row">
            <div className="col-6">
                <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                    <h6 className='mr-4 width__label-input-min'>Tipo | Paquete: </h6>
                    {
                    <select 
                     name='tiposVehPaquetes' 
                     className='form-select select-class-1 width__label-input mt-2' 
                     tabIndex={2} 
                     onChange={OnChange}
                     disabled={ ordenesDeCompra.length === 0 || tiposVehPaquetes.length === 0}
                    >
                        {
                        tiposVehPaquetes.map( type => {
                            return (
                            <option value={`${type.Vehiculo}`}>
                                { type.Vehiculo }
                            </option>
                            )
                        })
                        }
                    </select>
                    }
                </div>
            </div>
            <div className="col-6">
                <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                    <h6 className='mr-4 width__label-input-min'>Estado: </h6>
                    <select 
                        name='Estado' 
                        className='form-select select-class-1 width__label-input mt-2' 
                        onChange={OnChange}
                        tabIndex={2}
                        disabled={ ordenesDeCompra.length === 0 || tiposVehPaquetes.length === 0 }
                    >
                        <option value="TODOS"> TODOS </option>
                        <option value="PENDIENTES"> PENDIENTES </option>
                        <option value="ENTREGADOS"> ENTREGADOS </option>
                    </select>
                </div>
            </div> 
        </div>

          <div className="row mt-4">
            <div className="col-4">
             <table className='table table-sm table-bordered table-striped compact'>
                <thead>
                    <tr className='text-center' style={{backgroundColor:'lightskyblue' }}>
                        <th><small>TIPO</small></th>
                        <th><small>CANTIDAD</small></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tiposVehPaquetes.length > 0 &&
                        tiposVehPaquetes.reverse().map( tipo => (

                            tipo.Vehiculo === "TODOS" ?
                            <tr className='text-center' style={{backgroundColor:'mediumaquamarine'}}>
                                <td>{tipo.Vehiculo}</td>
                                {/* <td>{tipo.Cantidad}</td> */}
                                <td>{getTotalCantidad()}</td>
                            </tr>
                            :
                            <tr className='text-center' style={{backgroundColor:'lightskyblue'}}>
                                <td>{tipo.Vehiculo}</td>
                                <td>{tipo.Cantidad}</td>
                            </tr>

                        ))    
                    }    
                </tbody>
             </table>
            </div>
            <div className="col-4"> </div>
            <div className="col-4"> </div>
          </div>

          <div className="row mt-4 mb-4">
            <div className="row table-responsive ml-2 mr-2 animate__animated animate__fadeIn">
                <table className='table display compact' style={{width:'189%', fontSize:11, tableLayout:'fixed'}}>
                    <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                        <tr className='text-center'>
                            <th className='noselect' style={{width:'2%'}}>#</th>
                            <th className='noselect' style={{width:'7%'}}>Persona Receptor</th>
                            <th className='noselect' style={{width:'7%'}}>Celular</th>
                            <th className='noselect' style={{width:'5%'}}>Orden Compra Cliente</th>
                            <th className='noselect' style={{width:'7%'}}>Agencia</th>
                            <th className='noselect' style={{width:'7%'}}>Empresa</th>
                            <th className='noselect' style={{width:'7%'}}>Ciudad Destino</th>
                            <th className='noselect' style={{width:'7%'}}>Vehículo</th>
                            <th className='noselect' style={{width:'7%'}}>Color</th>
                            <th className='noselect' style={{width:'5%'}}>Inventario</th>
                            <th style={{width:'7%'}}>VIN</th>
                            <th style={{width:'7%'}}>Observaciones VIN</th>
                            <th className='noselect' style={{width:'7%'}}>Factura</th>
                            <th className='noselect' style={{width:'7%'}}>Retiro Llave</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha Segregación</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha Instalación</th>
                            <th className='noselect' style={{width:'7%'}}>Estatus GPS</th>
                            <th className='noselect' style={{width:'7%'}}>Estatus Previa</th>
                            <th className='noselect' style={{width:'7%'}}>Folio DPP</th>
                            <th className='noselect' style={{width:'7%'}}>Permiso</th>
                            <th className='noselect' style={{width:'7%'}}>Vencimiento Folio Desvío</th>
                            <th className='noselect' style={{width:'7%'}}>DPP 1</th>
                            <th className='noselect' style={{width:'7%'}}>DPP 2</th>
                            <th className='noselect' style={{width:'7%'}}>Estatus TyT</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha Estatus TyT</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha Entrega Cliente</th>

                            <th className='noselect' style={{width:'13%'}}>Domicilio De Entrega</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha De Envio Docum</th>
                            <th className='noselect' style={{width:'7%'}}>Fecha De Recepcion</th>
                            <th className='noselect' style={{width:'7%'}}>Observaciones</th>
                            <th className='noselect' style={{width:'5%'}}>Carta Cliente</th>
                        </tr>
                    </thead>
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                    {
                    VINClientes.length > 0 ?
                    VINClientes.map((registro, index) => {
                        return (
                        <tr className='text-center' style={{fontSize:11}} key={id()}>
                            <td className='noselect'>{ index + 1 }</td>
                            <td className='noselect'>{ upperCase( registro.PersonaReceptor ) }</td>
                            <td className='noselect'>{registro.CelularDeContacto}</td>
                            <td className='noselect'>{ upperCase( registro.OrdenDeCompra ) }</td>
                            <td className='noselect'>{ upperCase( registro.Agencia ) }</td>
                            <td className='noselect'>{ upperCase( writtendata.NombreCliente ) }</td>
                            <td className='noselect'>{ upperCase( registro.CiudadDestino ) }</td>
                            <td className='noselect'>{ upperCase( registro.Vehiculo ) }</td>
                            <td className='noselect'>{ upperCase( registro.Color ) }</td>
                            <td className='noselect'>{registro.Inventario}</td>
                            <td>{registro.VIN}</td>
                            <td>{ upperCase( registro.ObservacionesVIN ) }</td>
                            <td className='noselect'>{ upperCase( registro.Factura) }</td>
                            <td className='noselect'>
                                <input 
                                 style={{position:'sticky'}} 
                                 checked={registro.retiroDuplicadoLlave == 1} 
                                 type="checkbox" 
                                 className="form-check-input" 
                                />
                            </td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaSolicitudGPS)) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAceptacionGPS)) }</td>
                            <td className='noselect'>{ upperCase( registro.EstatusGPS ) }</td>
                            <td className='noselect'>{ upperCase( pipesStatusPrevia(registro.EstatusPrevia) ) }</td>
                            <td className='noselect'>{ upperCase( registro.FolioDPP ) }</td>
                            <td className='noselect'>{ upperCase( registro.FolioDesvio ) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencimiento)) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencimientoDPP1)) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencimientoFase2)) }</td>
                            <td className='noselect'>{ upperCase( validDefaultStatusTyT(registro.EstatusTyT) ) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEstatusTyT)) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEntregaCliente)) }</td>
                            <td className='noselect'>{ upperCase( registro.DomicilioDeEntrega ) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeEnvioDocum)) }</td>
                            <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeRecepcion)) }</td>
                            <td className='noselect'>{ upperCase( registro.Observaciones ) }</td>
                            <td className='noselect'>{
                                registro.DocumentoPDF === "1" 
                                ? 
                                <button
                                    title='Visualizar Carta Cliente'
                                    type='button'
                                    className='btn btn-outline-danger'
                                    onClick={() => downloadPDF(registro.VIN)}
                                ><FontAwesomeIcon icon={faFilePdf}/></button> 
                                : 
                                ""
                            }</td>
                            
                        </tr>
                        )
                    })
                    :
                    <tr className='p-2'>
                        <td>No existen registros.</td>
                        <td></td> <td></td> <td></td> <td></td> <td></td> <td></td>
                        <td></td> <td></td> <td></td> <td></td> <td></td> <td></td>
                        <td></td> <td></td> <td></td> <td></td> <td></td> <td></td>
                        <td></td> <td></td> <td></td> <td></td> <td></td> <td></td>
                        <td></td> <td></td> <td></td> <td></td> <td></td><td></td>
                    </tr>
                    }
                </tbody>
                </table>
            </div>
            <button
            title="Exportar a Excel"
            type="button"
            className="btn btn-outline-success mt-4 mb-2 ml-2"
            onClick={onExportToExcel}
            disabled={VINClientes.length === 0}
            >
                <FontAwesomeIcon icon={faFileExcel} />
                <small className="ml-2">Excel</small>   
            </button>
          </div>

    </div>
  )
}

export default ResumenFinal
