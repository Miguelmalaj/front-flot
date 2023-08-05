import { useState, useEffect, useRef }  from 'react'

import { toast } from 'react-toastify';
import $ from 'jquery';

import { TablaAsignadosCDOS } from './tablas-vistas/TablaAsignadosCDOS';
import { ApiUrl } from '../../../services/ApiRest';
import { axiosGetService, axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { statusGPSDataTable } from '../../../components/datatable/conf';
import { isNumber, isASpaceValue, isADotValue, hasPointTheInputValue } from '../../../helpers';

let url = '';
const emptyString = ''

const AsignadosCDOS = ({ agencia, clientes }) => {
    const [writtendata, setWrittendata] = useState({
        NumeroCliente       :  0,
        Ubicacion           :  emptyString,
        NombreCliente       :  emptyString 
    })
    const [typeOrders, setTypeOrders] = useState([])
    const [ordenesDeCompra, setOrdenesDeCompra] = useState([])
    const [asigCDOS, setAsigCDOS] = useState([])
    const [asigCDOSAltered, setAsigCDOSAltered] = useState([]);
    const [OrdenCompra, setOrdenCompra] = useState('')
    const [isPreviewTable, setIsPreviewTable] = useState(false)
    const [updatedInBD, setUpdatedInBD] = useState(false)
    const [numClienteState, setNumClienteState] = useState(0)
    const ordenInputRef = useRef();

    /* useEffect(() => {
        if ( clientes.length > 0 ) {
            setWrittendata({
                ...writtendata, 
                Ubicacion         : clientes[0].Ubicacion,
                NombreCliente     : clientes[0].Nombre_corto, 
                NumeroCliente     : clientes[0].Num_cliente,
              })
            getOrdenesDeCompraByCliente( clientes[0].Nombre_corto, clientes[0].Ubicacion, clientes[0].Num_cliente )
        }
     
    }, [clientes]) */
    
    /* useEffect(() => {
        
    }, [asigCDOSAltered]) */

    useEffect(() => {

      getAsignadosCDOS();

    }, [])
    
    const getAsignadosCDOS = async () => {
        url = `${ ApiUrl }api/ordencompra/get_asig_cdo`;
        
        const asigCDOList = await axiosGetService( url );

        try {

            dataTableDestroy();
            setAsigCDOS( asigCDOList );
            dataTable();

        } catch ( error ) {
            toast.error("Error al cargar registros en tabla.");
        }

    }
    
    const getOrdenesDeCompraByCliente = async ( NombreCliente, UbicacionCliente, numeroCliente ) => {
        /* url = ApiUrl + "api/asignarvins/get_ordenes_de_compra"
        const body_cliente = { 
            Agencia          : agencia, 
            NombreCliente    : NombreCliente, 
            UbicacionCliente : UbicacionCliente,
            Num_cliente      : numeroCliente 
        };
        setNumClienteState(numeroCliente)

        const total_ordenes_compra = await axiosPostService( url, body_cliente );

        if ( total_ordenes_compra.length === 0 ) {
            setOrdenesDeCompra(total_ordenes_compra);
            setTypeOrders([])
            setOrdenCompra('');
            return;
        }

        let ord = total_ordenes_compra[0].OrdenCompra;
        let tiposYCant = total_ordenes_compra[0].TiposYCantidades;
        let currentRef = '';
        
        if ( ordenInputRef.current.value !== '' && writtendata.NombreCliente == NombreCliente && writtendata.Ubicacion == UbicacionCliente ) {
            const foundOrder = total_ordenes_compra.find( order => order.OrdenCompra === ordenInputRef.current.value )
            if ( foundOrder !== undefined ) {
                ord = foundOrder.OrdenCompra;
                tiposYCant = foundOrder.TiposYCantidades;
                ordenInputRef.current.value = foundOrder.OrdenCompra;
                currentRef = foundOrder.OrdenCompra;
            }
        }
        
        setOrdenesDeCompra([]);
        setOrdenesDeCompra(total_ordenes_compra);
        setOrdenCompra(ord);
        setTypeOrders( tiposYCant )
        if ( currentRef !== '' && writtendata.NombreCliente == NombreCliente && writtendata.Ubicacion == UbicacionCliente) ordenInputRef.current.value = currentRef;
         */
    }

    const OnChange = (e) => {
        /* const propertyName = e.target.name;
        const propertyValue = e.target.value;

        if ( propertyName === 'ordenDeCompra' ) {
           const selectedOrder = ordenesDeCompra.find( obj => obj.OrdenCompra === propertyValue);
           setTypeOrders( selectedOrder.TiposYCantidades )
           setOrdenCompra(propertyValue);
        }

        if ( propertyName ===  'Cliente') {
            const [ Ubicacion, Nombre_cliente, numeroCliente ] = e.target.value.split("|");
            setWrittendata({
                ...writtendata, 
                NombreCliente     : Nombre_cliente, 
                Ubicacion         : Ubicacion,
                numeroCliente     : numeroCliente
            })
            getOrdenesDeCompraByCliente( Nombre_cliente, Ubicacion, numeroCliente )
            setUpdatedInBD(false)
        } */
        
    }

    const onChangeAsignadosCDO = ( e, { TipoVehiculo, Num_cliente, OrdenCompra } ) => {
        
        const propertyName = e.target.name;
        
        const propertyValue = e.target.value;

        if ( !isNumber( propertyValue ) ) return;

        setUpdatedInBD(false);

        updateAsigCDOSAltered( TipoVehiculo, Num_cliente, OrdenCompra );


        const updateAsigList = asigCDOS.map( (order) => {
            if ( 
                order.TipoVehiculo === TipoVehiculo && 
                order.OrdenCompra  === OrdenCompra && 
                order.Num_cliente  === Num_cliente && 
                propertyValue <= order.Cantidad && propertyValue >= 0 
            ) return { ...order, [propertyName] : propertyValue }

            return order
        })

        setAsigCDOS( updateAsigList );
        
    }

    const handleGuardarTipos = () => {
        setUpdatedInBD( true );
        getAsignadosCDOS();

    }

    const updateAsigCDOSAltered = ( TipoVehiculo, Num_cliente, OrdenCompra ) => {

        if ( asigCDOSAltered.length > 0 ) {

            const searchObject = asigCDOSAltered.find( obj => obj.TipoVehiculo === TipoVehiculo && obj.OrdenCompra === OrdenCompra && obj.Num_cliente === Num_cliente);
            
            if ( searchObject === undefined ) setAsigCDOSAltered([...asigCDOSAltered, { TipoVehiculo, Num_cliente, OrdenCompra }]);

            return;
        }

        setAsigCDOSAltered([{ TipoVehiculo, Num_cliente, OrdenCompra }]);

    }

    const onGenerateTable = () => {

        setIsPreviewTable(!isPreviewTable)

        if ( isPreviewTable ) {
            
            if ( updatedInBD ) setAsigCDOSAltered([]);

            try {
                dataTableDestroy();
                dataTable();
                
            } catch (error) {
                toast.error("Error al cargar registros en tabla.");
            }

        }

    }
      
    const dataTable = () => {
        setTimeout(() => {
          $('#asigCDOTable').DataTable(statusGPSDataTable);
        }, 500);
    }

    const dataTableDestroy = () => {
        $("#asigCDOTable").DataTable().destroy();
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
                        disabled={ isPreviewTable }
                        >
                        {
                            clientes
                            .map(cliente => (
                                <option
                                value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                                >
                                    {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                                </option>
                            ))
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
                    <h6 className='mr-4'>Pedido GM: </h6>
                    <select 
                        name='ordenDeCompra' 
                        className='form-select select-class-1' 
                        tabIndex={2} 
                        onChange={OnChange}
                        disabled={ ordenesDeCompra.length === 0 || isPreviewTable}
                        ref={ordenInputRef}
                    >
                        {
                        ordenesDeCompra.map( orden => (
                            <option value={`${orden.OrdenCompra}`}>
                                { orden.OrdenCompra }
                            </option>
                        ))
                        }
                    </select>
                </div>
            </div>
            <div className="col-6">
                
            </div> 
        </div> */}

        <div className="row m-2 d-flex justify-content-between">
            <div className="col-6">
                
            </div>
                
            <button
                title="Vista Previa"
                type="button"
                className="btn btn-info mt-2 mb-2 ml-2"
                onClick={onGenerateTable}
                disabled={ asigCDOSAltered.length === 0 && !isPreviewTable }
            >
                <small className="ml-2">{ isPreviewTable ? 'Regresar' : 'Vista Previa'}</small>    
            </button>
        </div>

        {
            !isPreviewTable
            &&
            <div className="row mt-2 mb-2">
                <div className="row table-responsive ml-2 mr-2 animate__animated animate__fadeIn">
                <table id='asigCDOTable' className='table display compact' style={{width:'100%', fontSize:11}}>
                    <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                        <tr className='text-center'>
                            <th className='text-center' style={{width:'12.5%'}}>Cliente</th>
                            <th className='text-center' style={{width:'12.5%'}}>OC</th>
                            <th className='text-center' style={{width:'12.5%'}}>Unidad</th>
                            <th className='text-center' style={{width:'12.5%'}}>Cantidad</th>
                            <th className='text-center' style={{width:'12.5%'}}>Asignados</th>
                            <th className='text-center' style={{width:'12.5%'}}>CDO</th>
                            <th className='text-center' style={{width:'12.5%'}}>Sin Asignar</th>
                            <th className='text-center' style={{width:'12.5%'}}>Sin CDO</th>
                        </tr>
                    </thead>
                    <tbody style={{backgroundColor:'#FFFFE0'}}>
                        {
                            asigCDOS.length > 0 &&
                            asigCDOS.map((type) => (
                                <tr className='text-center'>
                                    <td style={{width:'12.5%'}}>{ type.Nombre_corto }</td>
                                    <td style={{width:'12.5%'}}>{ type.OrdenCompra }</td>
                                    <td style={{width:'12.5%'}}>{ type.TipoVehiculo }</td>
                                    <td style={{width:'12.5%'}}>{ type.Cantidad }</td>
                                    <td style={{width:'12.5%'}}>
                                        <input
                                            autoComplete='off' 
                                            className="form-control mb-2"
                                            name="Asignados" 
                                            onChange={ (e) => onChangeAsignadosCDO( e, type ) } 
                                            type="text" 
                                            // type="number" 
                                            value={type.Asignados}
                                            // onKeyDown={test}
                                        />
                                    </td>
                                    <td style={{width:'12.5%'}}>
                                        <input
                                            autoComplete='off' 
                                            className="form-control mb-2"
                                            name="CDO" 
                                            onChange={ (e) => onChangeAsignadosCDO( e, type ) }  
                                            type="text" 
                                            // type="number" 
                                            value={ type.CDO }
                                        />
                                    </td>
                                    <td style={{width:'12.5%'}}>{ type.Cantidad - type.Asignados }</td>
                                    <td style={{width:'12.5%'}}>{ type.Cantidad - type.CDO }</td>
                                </tr>
                            ))
                            
                        }
                    </tbody>
                </table>       
                </div>
            </div>
        }

        <TablaAsignadosCDOS
            agencia = { agencia }
            asigCDOS = { asigCDOS }
            asigCDOSAltered = { asigCDOSAltered }
            handleGuardarTipos = { handleGuardarTipos }
            isPreviewTable = { isPreviewTable }
            numCliente = { numClienteState }
            // typeOrders = { typeOrders }
            updatedInBD = { updatedInBD }
        />


        <button
            title="Vista Previa"
            type="button"
            className="btn btn-info mt-2 mb-2 ml-2"
            onClick={onGenerateTable}
            disabled={ asigCDOSAltered.length === 0 && !isPreviewTable }
        >
          <small className="ml-2">{ isPreviewTable ? 'Regresar' : 'Vista Previa'}</small>   
        </button>


    </div>
  )
}

export default AsignadosCDOS