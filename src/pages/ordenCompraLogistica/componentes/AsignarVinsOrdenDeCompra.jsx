import React, { useState, useEffect, useRef, useMemo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faTimesCircle, fas } from '@fortawesome/free-solid-svg-icons';
import { faCircleXmark , } from '@fortawesome/free-solid-svg-icons';
// import { useReactToPrint } from 'react-to-print';

import { ApiUrl } from '../../../services/ApiRest'
import { axiosPatchService, axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
// import { generate as id } from 'shortid'
import { useModal } from '../../../modales/shared/useModal';
import Modal from '../../../modales/shared/Modal';
import ModalGrande from '../../../modales/shared/ModalGrande'
import { ModalCopiarVINS } from '../../../modales/ordendecompra/ModalCopiarVINS';
import { ModalFormatoFactura } from '../../../modales/ordendecompra/ModalFormatoFactura';

import ClearIcon from '@mui/icons-material/Clear';

import { TablaAsignarVinsOrdenDeCompra } from './tablas-vistas/TablaAsignarVinsOrdenDeCompra'
import '../../../css/ordenDeCompra/ordenDeCompra.css'
import { toast } from 'react-toastify';
import { upperCase } from '../../../helpers/converToUpperCase';
import { statusGPSDataTable } from '../../../components/datatable/conf';
import $ from 'jquery';
import { FechaDeHoyYYMMDD } from '../../../helpers/fecha';

/* ====== */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Checkbox, IconButton, TablePagination, TableSortLabel, Tooltip } from '@mui/material';
import { blue, blueGrey } from '@mui/material/colors';
import { visuallyHidden } from '@mui/utils';
import styled from '@emotion/styled';
import { cellsAsignarVINSOC } from '../../../helpers/headCellsTableMUI';
import { descendingComparator, getComparator, stableSort } from '../../../helpers/tableMUI';

const restar = 'restar';
const sumar = 'sumar';
const TODOS = 'TODOS';
const FAN = 'FAN';
const FACTURADOS = 'FACTURADOS';
const FechaDeHoy = FechaDeHoyYYMMDD();

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1565C0',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

/* PESTANA ASIGNAR VINS - PEDIDO A GM */
const AsignarVinsOrdenDeCompra = ({ agencia, clientes }) => {

  const [writtendata, setWrittendata] = useState({
    NumeroCliente       : clientes.length > 0 ? `${clientes[0].Num_cliente}`  : 0,
    Ubicacion           : clientes.length > 0 ? `${clientes[0].Ubicacion}`    : 0,
    NombreCliente       : clientes.length > 0 ? `${clientes[0].Nombre_corto}` : 0,
    FanCliente          : clientes.length > 0 ? `${clientes[0].FanCliente}`   : 0,
    Razon_social        : clientes.length > 0 ? `${clientes[0].Razon_social}` : 0,
    TiposYCantidades    : [],
    // TipoVehiculo        : "",
    OrdenDeCompra       : "",
    PersonaReceptor     : "",
    CelularDeContacto   : "",
    Agencia             : "",
    CiudadDestino       : "",
    DomicilioDeEntrega  : "",
    Cantidad            : "",
    NumeroDistribuidor  : 0,
  })
  const [ esAbiertoModal, abrirModal, cerrarModal ] = useModal(false);
  const [isOpenModal, openModal, closeModal] = useModal(false);
  const [isPreviewTable, setIsPreviewTable] = useState(false)
  const [VINClientes, setVINClientes] = useState([])
  const [VINClientesGenerados, setVINClientesGenerados] = useState([])
  const [VINClientestoDelete, setVINClientestoDelete] = useState([])
  const [VINFacturacion, setVINFacturacion] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState('')
  const [fanCliente, setFanCliente] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [numCliente, setNumCliente] = useState(0);
  const [VINSGeneratedinBD, setVINSGeneratedinBD] = useState(false)
  const [ordenesDeCompra, setOrdenesDeCompra] = useState([])
  const [domiciliosOrdenDeCompra, setDomiciliosOrdenDeCompra] = useState([]);
  const [updateVentasFlotillasDMSTable, setUpdateVentasFlotillasDMSTable] = useState(false)
  // const [filterBy, setFilterBy] = useState(TODOS)
  const [filterBy, setFilterBy] = useState(FAN)
  const [paramFormFacturar, setParamFormFacturar] = useState({
    PrecioFactura       : 0,
    PrecioCDO           : 0,
    BonificacionGeneral : 1.5,
    BonificacionExtra   : 0,
    AdminFlotilla       : '',
    GteFlotilla         : '',
    GteAdmin            : '',
    Logistica           : '',
    ElaboroPedido       : '',
    RevisoPedido        : ''
  })

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('Vin');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
 
  let url = '';
  const checkBoxSelectedAll = useRef();

  useEffect(() => {
    if ( clientes.length > 0 ) {

      setWrittendata({
        ...writtendata, 
        NumeroCliente     : clientes[0].Num_cliente,
        Ubicacion         : clientes[0].Ubicacion,
        NombreCliente     : clientes[0].Nombre_corto, 
        FanCliente        : clientes[0].FanCliente, 
        Razon_social      : clientes[0].Razon_social, 
      })

      
    }
    
    getOrdenesDeCompraByCliente( 
      clientes[0].Nombre_corto, 
      clientes[0].Ubicacion,
      clientes[0].Num_cliente, 
      clientes[0].FanCliente, 
      clientes[0].Razon_social, 
      filterBy 
    );
    
  }, [clientes])


  const getOrdenesDeCompraByCliente = async ( 
    NombreCliente, 
    UbicacionCliente, 
    numeroCliente, 
    FanCliente, 
    Razon_social, 
    filterBy 
  ) => {

    url = ApiUrl + "api/asignarvins/get_ordenes_de_compra"
    const body_cliente = { 
      Agencia          : agencia, 
      NombreCliente    : NombreCliente, 
      UbicacionCliente : UbicacionCliente,
      Num_cliente      : numeroCliente
    };
    const total_ordenes_compra = await axiosPostService( url, body_cliente );

    setOrdenesDeCompra([]);
    setOrdenesDeCompra(total_ordenes_compra);
    
    if ( total_ordenes_compra.length > 0 ) {
      let ordenSelected = total_ordenes_compra[0];

      if ( writtendata.OrdenDeCompra !== "" && writtendata.TiposYCantidades.length > 0 && writtendata.NumeroCliente == numeroCliente ) {
        ordenSelected = total_ordenes_compra.find(orderObj => orderObj.OrdenCompra === writtendata.OrdenDeCompra );
      }

      setWrittendata({
        ...writtendata,
        OrdenDeCompra        : validateProperty(ordenSelected.OrdenCompra),
        Cantidad             : ordenSelected.Cantidad,
        TiposYCantidades     : ordenSelected.TiposYCantidades,
        InformacionDomicilio : ordenSelected.InformacionDomicilio,
        NumeroCliente        : numeroCliente,
        Ubicacion            : UbicacionCliente,
        NombreCliente        : NombreCliente,
        Razon_social         : Razon_social,
        FanCliente           : FanCliente, 
        PersonaReceptor      : containsAddresses(ordenSelected.InformacionDomicilio, 'PersonaReceptor'),
        CelularDeContacto    : containsAddresses(ordenSelected.InformacionDomicilio, 'CelularDeContacto'),
        Agencia              : containsAddresses(ordenSelected.InformacionDomicilio, 'Agencia'),
        CiudadDestino        : containsAddresses(ordenSelected.InformacionDomicilio, 'CiudadDestino'),
        DomicilioDeEntrega   : containsAddresses(ordenSelected.InformacionDomicilio, 'DomicilioDeEntrega'),
        NumeroDistribuidor   : containsAddresses(ordenSelected.InformacionDomicilio, 'NumeroDistribuidor')
        // Cantidad             : containsAddresses(ordenSelected.InformacionDomicilio, 'Cantidad'),

      })
      setDomiciliosOrdenDeCompra([])
      setDomiciliosOrdenDeCompra(total_ordenes_compra[0].InformacionDomicilio)

      getVINSByCliente( numeroCliente, ordenSelected.OrdenCompra, ordenSelected.TiposYCantidades, FanCliente, filterBy )
    }

    if ( total_ordenes_compra.length === 0 ) {

      setWrittendata({
        ...writtendata,
        OrdenDeCompra        : "",
        Cantidad             : "",
        TiposYCantidades     : [],
        InformacionDomicilio : [],
        NumeroCliente        : numeroCliente,
        Ubicacion            : UbicacionCliente,
        NombreCliente        : NombreCliente,
        Razon_social         : Razon_social,
        FanCliente           : FanCliente,
        PersonaReceptor      : "",
        CelularDeContacto    : "",
        Agencia              : "",
        CiudadDestino        : "",
        DomicilioDeEntrega   : "",
        NumeroDistribuidor   : 0
      })
      setVINClientesGenerados([]);
      resetValuesFormFact();
      dataTableDestroy();
      setVINClientes([]);
      dataTable();
    }

  }
  
  const getVINSByCliente = async ( 
    numeroCliente, 
    ordenComp, 
    tiposCantidades, 
    FanCliente, 
    filterBy 
    ) => {

    //let newFan = FanCliente.length === 0 || FanCliente.length === 3 ? FanCliente  : FanCliente.substring(3,7);  
    
    url = ApiUrl + 'api/asignarvins/get_vins_to_orden_compra';
    const body = {Agencia: agencia, NumeroCliente: numeroCliente};

    let total_vins_orden_compra = await axiosPostService( url, body );

    //console.log('total_vins_orden_compra**', total_vins_orden_compra);
    
    if ( VINClientesGenerados.length > 0 && !isPreviewTable ) setVINClientesGenerados([]);
    if ( VINFacturacion.length > 0 && !isPreviewTable ) resetValuesFormFact();

    if ( total_vins_orden_compra.length > 0 ) total_vins_orden_compra = agregarVariableIsSelected( total_vins_orden_compra, ordenComp, tiposCantidades, FanCliente, filterBy, numeroCliente );

    try {
      dataTableDestroy();
      setVINClientes(total_vins_orden_compra);
      dataTable();

    } catch (error) {
      toast.error("Error al cargar registros en tabla.");
      console.log('error en funcion getVINSByCliente');
      
    }

  }

  const agregarVariableIsSelected = ( 
    total_vins_orden_compra, 
    ordenComp, 
    tiposCantidades, 
    FanCliente, 
    filterBy, 
    numeroCliente 
    ) => {

    
    /* el siguiente .map() asigna variables a los VINS ya registrados en la tabla [AsignacionVins_OrdenDeCompra] */
    let list = total_vins_orden_compra.map((obj) => {
      return {
        ...obj,
        isVinSelected     : obj.OrdenDeCompra !== null ? true : false,
        isDisabled        : obj.OrdenDeCompra !== null ? true : false,
        isOnBD            : obj.OrdenDeCompra !== null ? true : false,
        FanCliente        : obj.OrdenDeCompra !== null ? FanCliente : obj.FanCliente, //TODO: at this point still not should split the fan.
        isVINFactDisable  : obj.OrdenDeCompra !== null ? obj.Impreso === 'S' ? true : false : true,
        isVINFactSelected : obj.OrdenDeCompra !== null ? obj.Impreso === 'S' ? true : false : false
      }
    })

    list = filterVINSBy(filterBy, list, FanCliente);

    const orderedList = ordenarVinesDeshabilitadosAlFinal( list, ordenComp, tiposCantidades, numeroCliente );
    addVINSOrdenCompraToVINSGenerados( list, ordenComp, numeroCliente );

    return orderedList;
  }

  const addVINSOrdenCompraToVINSGenerados = ( list, ordenComp, numeroCliente ) => {

    setVINClientesGenerados( list.filter(row => row.OrdenDeCompra !== null).filter(row => row.OrdenDeCompra === ordenComp && row.NumCliente === Number(numeroCliente)) );
  }

  const ordenarVinesDeshabilitadosAlFinal = ( list, ordenComp, tiposCantidades, numeroCliente ) => {

    const mixedList = [
      /* filtra los vins con los tipos de vehiculos registrados en la orden de c. */
      ...getVehicleTypesList( tiposCantidades.length, list, tiposCantidades ), 
      /* filtra los vins que contiene ya una orden de compra asignada, registrados en BD */
      ...list.filter((row) => row.OrdenDeCompra !== null && row.NumCliente === Number(numeroCliente) ).map((row) => ({...row, isDisabled: row.OrdenDeCompra === ordenComp ? false : true})).filter(row => !row.isDisabled)
    ]

    return mixedList;
  }

  const getVehicleTypesList = ( TotalQuantity, list, tiposCantidades ) => {
    return TotalQuantity === 0 
    /* regresa todos los tipos */
    ? list.filter((row) => { return row.OrdenDeCompra === null })
    /* regresa todos los tipos encontrados en la lista de tiposCantidades orden de compra */
    : list.filter((row) => row.OrdenDeCompra === null ).filter((row) => tiposCantidades.find( type => row.Vehiculo.includes(type.TipoVehiculo) ) !== undefined )
  }

  const filterVINSBy = ( valorFiltro, list, fanCli ) => {

    let fanClient = splitFanClient(fanCli);

    let newList = [];
    if ( valorFiltro === "FAN" ) {
      newList = list.filter((row) => {
        /* retorna los que están en tabla logistica y los que corresponden al FanCliente (Inventario) */ 
        if ( (row.OrdenDeCompra !== null) || ( row.Factura === '' && row.NumCliente === 0  && splitFanClient(row.FanCliente) === fanClient)) return true;
        return false;
      })
    }
    if ( valorFiltro === "FACTURADOS" ) {
      newList = list.filter((row) => {
        /* retorna los que están en tabla logistica y los que han sido facturados */
        if ( (row.OrdenDeCompra !== null) || ( splitFanClient(row.FanCliente) == 0)) return true; 
        return false;
      })
    }
    if ( valorFiltro === "TODOS" ) {
      newList = list.filter((row) => {
        /* retorna los que están en tabla logistica y los que corresponden al FanCliente (Inventario) y Facturados*/
        if ( 
          ( row.OrdenDeCompra !== null ) || 
          ( row.Factura === '' && row.NumCliente === 0  && splitFanClient(row.FanCliente) === fanClient ) || 
          ( splitFanClient(row.FanCliente) == 0)
          ) return true;
        return false;
      })
    }
    
    return newList;
  }

  const validateFan = ( value ) => {
    return value == 0 ? '' : value;
  }

  const handleVinFact = ( e, registro ) => {
    const checked = e.target.checked;

     if ( VINFacturacion.length === 0 ) {   // Cuando la lista está vacía, toma los valores del primer VIN agregado.
        setTipoVehiculo(registro.Vehiculo);
        setFanCliente(registro.FanCliente);
        setRazonSocial(writtendata.Razon_social);
        setNumCliente(writtendata.NumeroCliente)
     }

    const vinSelected = {
      Vin           : registro.Vin.trim(),
      Inv           : registro.Inventario.replace('  ','-').split('-').pop().trim(),
      Color         : registro.Color.trim(),
      Modelo        : registro.Inventario.replace('  ','-').split('-')[1].trim(),
      Factura       : registro.Factura.trim(),
      CiudadDestino : registro.CiudadDestino.trim()
    }

    //Agregar
    if ( checked ) {
      const sorted = [ ...VINFacturacion, {...vinSelected} ].sort((a,b) => Number(a.Inv) - Number(b.Inv)); //ordenamiento por número inventario.

      setVINFacturacion([...sorted ]);

    }

    //Remover
    if ( ! checked ) {
      const updateList = VINFacturacion.filter((row) => {
        return row.Vin !== registro.Vin
      });
      setVINFacturacion(updateList);
    }

    //updateMainList
    const updateVINClientes = VINClientes.map((row) => {
      if ( registro.Vin === row.Vin ) {
        return { ...row, isVINFactSelected : checked === true ? true : false }
      }
      return row;
    })

    setVINClientes(updateVINClientes);

  }

  const handleVinFactAll = ( e ) => {
    
    const checked = e.target.checked;
    
    console.log('all selected', e);

    //extraer VINS Disponibles.
    let extractVINS = VINClientes.filter( obj => !obj.isVINFactDisable );
      
    //extraer Propiedades por VIN
    extractVINS = extractVINS.map(obj => {
      return {
        Vin           : obj.Vin.trim(),
        Inv           : obj.Inventario.replace('  ','-').split('-').pop().trim(),
        Color         : obj.Color.trim(),
        Modelo        : obj.Inventario.replace('  ','-').split('-')[1].trim(),
        Factura       : obj.Factura.trim(),
        CiudadDestino : obj.CiudadDestino.trim(),
        FanCliente    : obj.FanCliente,
        Vehiculo      : obj.Vehiculo.trim()
      }
    })

    //ordenar por INV.
    extractVINS.sort((a,b) => Number(a.Inv) - Number(b.Inv));

    if ( checked ) {
      const { Vehiculo, FanCliente } = extractVINS[0]; //del primer objecto extraermos props
      setTipoVehiculo( Vehiculo );
      setFanCliente( FanCliente );
      setRazonSocial( writtendata.Razon_social );
      setNumCliente(writtendata.NumeroCliente);

      setVINFacturacion( extractVINS );
    }
    
    if ( !checked ) {
      setVINFacturacion([]);
    }

    const updateVINSClientes = VINClientes.map( obj => {

      if( !obj.isVINFactSelected && !obj.isVINFactDisable && checked ) { //no esta seleccionado, //no esta deshabilitado, //seleccionado
        return { ...obj, isVINFactSelected: true }
      }

      if ( obj.isVINFactSelected && !obj.isVINFactDisable && !checked ) { //esta seleccionado, //no esta deshabilitado, //deseleccionado 
        return { ...obj, isVINFactSelected: false }
      }

      return obj;

    })

    setVINClientes( updateVINSClientes )


  }

  const handleVinSelected = ( e, registro ) => {
    const checked = e.target.checked;

    const OrderWithTypeObj =  writtendata.TiposYCantidades.find( type => registro.Vehiculo.includes(type.TipoVehiculo) )

    if ( ! validationToVINS(OrderWithTypeObj, checked) ) return;

    const updateVIN = VINClientes.map((row) => {

      if ( registro.Vin === row.Vin ) {
        let updateRow = {
          ...row,
          Agencia               : !checked ? "" : writtendata.Agencia,
          CelularDeContacto     : !checked ? "" : writtendata.CelularDeContacto,
          CiudadDestino         : !checked ? "" : writtendata.CiudadDestino,
          DomicilioDeEntrega    : !checked ? "" : writtendata.DomicilioDeEntrega,
          NumeroDistribuidor    : !checked ? 0  : writtendata.NumeroDistribuidor,
          isVinSelected         :  checked,
          NombreCliente         : !checked ? "" : writtendata.NombreCliente,
          OrdenDeCompra         : !checked ? "" : writtendata.OrdenDeCompra,
          PersonaReceptor       : !checked ? "" : writtendata.PersonaReceptor,
          Ubicacion             : !checked ? "" : writtendata.Ubicacion,
          NumCliente            : !checked ? writtendata.NumeroCliente  : writtendata.NumeroCliente,
          FechaVinAsignado      : FechaDeHoy
          // Vehiculo              : !checked ? "" : writtendata.TipoVehiculo
        }

        insertNewVIN( updateRow, checked, OrderWithTypeObj.TipoVehiculo)
        return updateRow;
      }

      return row;
    })

    setVINSGeneratedinBD(false);
    setVINClientes(updateVIN)
  }

  const validationAllChecked1 = () => {

    if ( hasListVINSNoSelected() ) return false;
    return true;
    
  }
  const validationAllChecked2 = () => {
    //obj.isVINFactSelected && !obj.isVINFactDisable
    if ( hasListVINSFactNoSelected() ) return false;
    return true;
  }

  const handleVinSelectedAll = ({ target }) => {

   const { checked } = target;
    
    if ( !hasVINSAvailableOC( checked ) ) {
      toast.info('La cantidad de los tipos vehículos ha alcanzado su límite de seleccionados.');
      return;
    } 

    if ( !hasListVINSNoSelected() && checked ) {
        toast.info('No existen VINS disponibles para seleccionar.');
        return;
    } 

    ( checked ) && updateSelectedVINS( checked );
    // ( !checked ) && updateDeselectedVINS( checked );
    ( !checked ) && updateDeselectedVINS2( checked );

  }

  const insertNewVIN = ( object, checked, tipoVeh ) => {
    
    if ( !checked ) {
      
      setVINClientestoDelete([...VINClientestoDelete, { Vin: object.Vin, NumCliente: object.NumCliente }])

      const updateList = VINClientesGenerados.filter((row) => {
          return row.Vin !== object.Vin
      })
      setVINClientesGenerados(updateList);

      updateSeleccionados( restar, tipoVeh );

      return;
    }

    //checked is true:
    const updateVINStoDelete = VINClientestoDelete.filter( obj => obj.Vin !== object.Vin );
    
    setVINClientestoDelete( updateVINStoDelete );

    setVINClientesGenerados([
      ...VINClientesGenerados,
      { ...object }
    ])

    updateSeleccionados( sumar, tipoVeh );

  }

  const updateSeleccionados = ( action, tipoVeh ) => {
    let updateTiposYCantidades = []

    if ( action === restar ) {
      updateTiposYCantidades = writtendata.TiposYCantidades.map( type => {
        if ( type.TipoVehiculo === tipoVeh ) return { ...type, Seleccionados: Number(type.Seleccionados) - 1 }
        else return type

      })
    }

    if ( action === sumar ) {
      updateTiposYCantidades = writtendata.TiposYCantidades.map( type => {
        if ( type.TipoVehiculo === tipoVeh ) return { ...type, Seleccionados: Number(type.Seleccionados) + 1 }
        else return type

      })
    }

    writtendata.TiposYCantidades = updateTiposYCantidades;
      setWrittendata({
        ...writtendata,
        TiposYCantidades: [ ...writtendata.TiposYCantidades ]
      })
  }

  const updateSelectedAll2 = ( list, mode ) => {

    let { TiposYCantidades } = writtendata;
    let updateTypesOC = [];
    
    if ( mode === 'seleccionados' ) {
    
      updateTypesOC = TiposYCantidades.map( type => {
  
        let findType = list.find( obj => obj.TipoVeh === type.TipoVehiculo);
  
        if ( findType.Estatus === 'SINVINS_DISPONIBLES' || findType.Estatus === 'SINVINS_PENDIENTES' ) {
  
          return { ...type, Seleccionados: type.Seleccionados }
  
        }
  
        if ( findType.Estatus === 'TODOS' ) {
  
          return { ...type, Seleccionados: findType.SelecPendientes + type.Seleccionados }  //tela de duda + type.Seleccionados.
  
        }
  
        if ( findType.Estatus === 'FRAGMENTO_PENDIENTES' ) {
          
          return { ...type, Seleccionados: findType.SelecPendientes + type.Seleccionados }
  
        }
  
        if ( findType.Estatus === 'FRAGMENTO_DISPONIBLES' ) {
  
          return { ...type, Seleccionados: findType.VINSDisponibles + type.Seleccionados }
  
        }
  
      })
      
    }

    if ( mode === 'deseleccionados' ) {

      updateTypesOC = TiposYCantidades.map( type => {

        let findType = list.find( obj => obj.TipoVeh === type.TipoVehiculo);

        if ( findType.Estatus === 'SINVINS_DISPONIBLES' ) {

          return { ...type, Seleccionados: type.Seleccionados }

        }

        if ( findType.Estatus === 'TODOS' ) {

          return { ...type, Seleccionados: findType.CantidadPorTipo - findType.VINSeleccionados  }  

        }

        if ( findType.Estatus === 'FRAGMENTO_DISPONIBLES' ) {
        
          return { ...type, Seleccionados: type.Seleccionados - findType.VINSeleccionados  } 

        }

      })

    }

    setWrittendata({
      ...writtendata,
      TiposYCantidades: [ ...updateTypesOC ]
    })


  }

  const updateSelectedAll = ( TypeAndQuantityList ) => {
    //this method is useful to checked in true or false.
    let { TiposYCantidades } = writtendata;
    let updateTypesOC = [];

    updateTypesOC = TiposYCantidades.map( type => {
      let findType = TypeAndQuantityList.find( obj => obj.TipoVeh === type.TipoVehiculo);
      return { ...type, Seleccionados: findType.Seleccionados}
    })

    setWrittendata({
      ...writtendata,
      TiposYCantidades: [ ...updateTypesOC ]
    })

  } 

  const OnChange = async ( e ) => {

    if ( e.target.name === 'filterBy' ) {
      setPage(0);
      setFilterBy(e.target.value);
      getVINSByCliente( 
        writtendata.NumeroCliente, 
        writtendata.OrdenDeCompra, 
        writtendata.TiposYCantidades, 
        writtendata.FanCliente, 
        e.target.value 
      );

      url = ApiUrl + 'api/asignarvins/tiposveh_by_orden_cliente';
      const { TiposYCantidades } = await axiosPostService( url, { OrdenCompra: writtendata.OrdenDeCompra, Num_cliente: writtendata.NumeroCliente } );
      
      setWrittendata({
        ...writtendata,
        TiposYCantidades : TiposYCantidades
      })

      return;
    }

    if ( e.target.name === 'CiudadDestino' ) {
      const id = e.target.value;
      const findDom = domiciliosOrdenDeCompra.find( dom => dom.id == id);
      setWrittendata({
        ...writtendata,
        PersonaReceptor     : findDom.PersonaReceptor,
        CelularDeContacto   : findDom.CelularDeContacto,
        Agencia             : findDom.Agencia,
        CiudadDestino       : findDom.CiudadDestino,
        DomicilioDeEntrega  : findDom.DomicilioDeEntrega,
        NumeroDistribuidor  : findDom.NumeroDistribuidor,
      })
      return;
    }

    if ( e.target.name === 'Cliente' ) {
      setPage(0);

      const [ Ubicacion, Nombre_cliente, numeroCliente, FanCliente, Razon_social ] = e.target.value.split("|");
      getOrdenesDeCompraByCliente( 
        Nombre_cliente, 
        Ubicacion, 
        numeroCliente, 
        FanCliente, 
        Razon_social, 
        filterBy 
        );
      setVINSGeneratedinBD(false)
      return;

    }

    if ( e.target.name === 'ordenDeCompra' ) {
      const [ OrdenCompra, Cantidad ] = e.target.value.split("|");
      const findOrder = ordenesDeCompra.find( order => order.OrdenCompra === OrdenCompra );
      setPage(0);

      setWrittendata({
        ...writtendata,
        OrdenDeCompra        : OrdenCompra,
        TiposYCantidades     : findOrder.TiposYCantidades,
        InformacionDomicilio : findOrder.InformacionDomicilio,
        Cantidad             : Cantidad,
        PersonaReceptor      : containsAddresses(findOrder.InformacionDomicilio, 'PersonaReceptor'),
        CelularDeContacto    : containsAddresses(findOrder.InformacionDomicilio, 'CelularDeContacto'),
        Agencia              : containsAddresses(findOrder.InformacionDomicilio, 'Agencia'),
        CiudadDestino        : containsAddresses(findOrder.InformacionDomicilio, 'CiudadDestino'),
        DomicilioDeEntrega   : containsAddresses(findOrder.InformacionDomicilio, 'DomicilioDeEntrega'),
        NumeroDistribuidor   : containsAddresses(findOrder.InformacionDomicilio, 'NumeroDistribuidor')
        
      })

      setDomiciliosOrdenDeCompra(findOrder.InformacionDomicilio)
      getVINSByCliente( writtendata.NumeroCliente, OrdenCompra, findOrder.TiposYCantidades, writtendata.FanCliente, filterBy );
      return;
    }

    setWrittendata({
      ...writtendata,
      [e.target.name] : e.target.value
    })
  }

  const handleGuardarVinsConOrdenCompra = () => {
      setPage(0);
      setVINSGeneratedinBD(true);
      getOrdenesDeCompraByCliente( 
        writtendata.NombreCliente, 
        writtendata.Ubicacion, 
        writtendata.NumeroCliente, 
        writtendata.FanCliente, 
        writtendata.Razon_social, 
        filterBy );
  }

  const onGenerateTable = () => {
    if ( VINSGeneratedinBD ) setVINClientestoDelete([]);
    setIsPreviewTable(!isPreviewTable)

    if ( isPreviewTable ) {
      try {
          dataTableDestroy();
          dataTable();
      } catch (error) {
          toast.error("Error al cargar registros en tabla.")
          console.log('error en funcion onGenerateTable');
          
      }    
   }

  }

  const copyVINS = () => {
    openModal();
  }

  const finished = () => {
    closeModal();
  }

  const totalSeleccionados = () => {
    let suma = 0;

    for (const obj of writtendata.TiposYCantidades) {
      suma = suma + Number(obj.Seleccionados);
    }

    return suma;
  }

  const validationToVINS = ( OrderWithTypeObj, checked ) => {
    let passValidations = true
    let messageToast = '';

    if ( OrderWithTypeObj === undefined ) {
      if ( messageToast === '' ) messageToast = 'El tipo vehículo no coincide con los tipos de la orden de compra.';
      passValidations = false;
    }
    if ( OrderWithTypeObj !== undefined ) {
      if ( ( Number(writtendata.Cantidad) === totalSeleccionados() ) && checked) {
        messageToast = 'La cantidad de VINS asignados ha alcanzado su límite en la orden de compra.'
        passValidations = false;
      }
      
      if ( (OrderWithTypeObj.Seleccionados >= OrderWithTypeObj.Cantidad) && checked ) {
        if ( messageToast === '' ) messageToast = `La orden de compra ya tiene ${OrderWithTypeObj.Seleccionados} ${OrderWithTypeObj.TipoVehiculo} seleccionados`;
        passValidations = false;
      }
    }

    if ( messageToast !== '' ) toast.info(messageToast);
    return passValidations;

  }

  const validateProperty = ( value ) => {
    return value !== undefined ? value : "";
  }

  const containsAddresses = ( InformacionDomicilio, propiedad ) => {
    return InformacionDomicilio.length > 0 ? InformacionDomicilio[0][propiedad] : ""
  }

  const crearFormatoFactura = () => {
    abrirModal();
  }

  const resetValuesFormFact = ( ) => {
    setVINFacturacion([]) 
    setTipoVehiculo('')
    setFanCliente('')
    setRazonSocial('')
    setNumCliente(0)
    resetParamsFormFacturar()
  }

  const handleAfterPrint = async ( value ) => {
    
    if ( value === 'Impreso' ) {
      url = ApiUrl + "api/asignarvins/updatePrintedVINS"
      const response = await axiosPostService( url, {
        OrdenDeCompra : writtendata.OrdenDeCompra,
        Num_cliente   : writtendata.NumeroCliente,
        data          : VINFacturacion

      })

      if ( response.isUpdated ) {
        getVINSByCliente( 
          writtendata.NumeroCliente, 
          writtendata.OrdenDeCompra, 
          writtendata.TiposYCantidades, 
          writtendata.FanCliente, 
          filterBy 
        );

        cerrarModal()

      }
    }

    if ( value === 'Cerrar' ) {
      cerrarModal();
      resetParamsFormFacturar();
      // resetValuesFormFact('Cerrar')
    }

  }

  const resetParamsFormFacturar = () => {

    setParamFormFacturar({
      PrecioFactura       : 0,
      PrecioCDO           : 0,
      BonificacionGeneral : 1.5,
      BonificacionExtra   : 0,
      AdminFlotilla       : '',
      GteFlotilla         : '',
      GteAdmin            : '',
      Logistica           : '',
      ElaboroPedido       : '',
      RevisoPedido        : ''  
    })
  }

  const dataTable = () => {
    // $('#ordenCompraVINSTable').DataTable(statusGPSDataTable);

    setTimeout(() => {
      $('#ordenCompraVINSTable').DataTable(statusGPSDataTable);
      
    }, 500);
  }

  const dataTableDestroy = () => {
      $("#ordenCompraVINSTable").DataTable().destroy();
  }

  const splitFanClient = ( FanClient ) => {
    return FanClient.length === 1 || FanClient.length === 3 ? FanClient  : FanClient.substring(3,7);
  }

  //Redesign
  const updateSelectedVINS = ( checked ) => {

    let TypeAndQuantityList = getDifferenceCantSelect();

    let list = [];

    for (const obj of TypeAndQuantityList) {
      
      // Filtrar los VINS que contengan el tipo. de la lista de VINClientes
      const test = VINClientes.filter( row => row.Vehiculo.includes(obj.TipoVeh) && !row.isVinSelected ); //obtener sólo los que no están select

      const VINSDisponibles = test.length;
      const SelecPendientes = obj.SelecPendientes;
      
      list.push({
        'TipoVeh'         : obj.TipoVeh, 
        'VINSDisponibles' : VINSDisponibles, //test.length, 
        'VINSLista'       : test, 
        'SelecPendientes' : SelecPendientes, //obj.SelecPendientes,
        'Estatus'         : calculateTotalSelected( VINSDisponibles, SelecPendientes )
      });

    }

    //crear lista; extraer los VINS de VINClientes que deben ser seleccionados.
    let secondList = [];

    for (const obj of list) {
      
      //agregar objeto con el tipo y la lista con los VINS que serán seleccionados.
      if ( obj.Estatus === 'TODOS') {
        secondList = [ ...secondList, ...obj.VINSLista ];
      }

      if ( obj.Estatus === 'FRAGMENTO_PENDIENTES' ) {
        secondList = [ ...secondList, ...obj.VINSLista.slice(0, obj.SelecPendientes) ];
      }

      if ( obj.Estatus === 'FRAGMENTO_DISPONIBLES' ) {
        
        secondList = [ ...secondList, ...obj.VINSLista ];
      }


    }

    
    let VINSAdded = [];
    const updateVINClientes = VINClientes.map( obj1 => {

      const findObj = secondList.find(obj2 => obj2.Vin === obj1.Vin );

      if ( findObj !== undefined ) {

        let newObj = createObjWithInputValues( checked, obj1 );
        VINSAdded = [ ...VINSAdded, { ...newObj } ];
        return newObj;

      }

      return obj1;

    })

    setVINClientes( updateVINClientes );
    setVINClientesGenerados([ ...VINClientesGenerados, ...VINSAdded ]); //lista de VINS generados.
    setVINSGeneratedinBD(false);

    const updateVINStoDelete = VINClientestoDelete.filter( obj => {
      let findVin = VINSAdded.find(row => row.Vin === obj.Vin);
      return findVin === undefined
    });

    setVINClientestoDelete( updateVINStoDelete ); //lista de VINS eliminados.
    
    updateSelectedAll2( list, 'seleccionados' ); //lista de tiposVehiculos/cantidades.


  }

  /* const updateSelectedVINS = ( checked ) => {

    let TypeAndQuantityList = getDifferenceCantSelect();
    
    let TotalTypeNumber = TypeAndQuantityList.length;

    let cont = 1;
    let AllTypesCompleted = false;
    let VINSAdded = [];

    const updatelistVINClients = VINClientes.map( (obj, index) => {
      
      if ( !AllTypesCompleted ) {
        
        if ( TypeAndQuantityList[ cont - 1 ].SelecPendientes === 0 ) {
          
          ( cont !== TotalTypeNumber ) ? cont++ : AllTypesCompleted = true;

        }

      }

      if ( !AllTypesCompleted ) {
        // Si ya no existen tipos en la lista: del tipo que se está agregando: pasar al siguiente tipo.
        
        if ( obj.Vehiculo.includes( TypeAndQuantityList[ cont - 1 ].TipoVeh ) && !obj.isVinSelected ) {

          TypeAndQuantityList[ cont - 1 ].SelecPendientes --;
          TypeAndQuantityList[ cont - 1 ].Seleccionados ++;
          
          let newObj = createObjWithInputValues( checked, obj );

          VINSAdded = [ ...VINSAdded, { ...newObj } ];
          return newObj;

        }

        else {
          
          if ( hasListThisTypeVehicle( index, TypeAndQuantityList[ cont - 1 ].TipoVeh ) === false ) { //si no existen mas del tipo vehiculo; saltamos al siguiente de la orden de compra.

            cont++;

            if ( obj.Vehiculo.includes( TypeAndQuantityList[ cont - 1 ].TipoVeh ) && !obj.isVinSelected ) {
             
              TypeAndQuantityList[ cont - 1 ].SelecPendientes --;
              TypeAndQuantityList[ cont - 1 ].Seleccionados ++;
              
              let newObj = createObjWithInputValues( checked, obj );
              VINSAdded = [ ...VINSAdded, { ...newObj } ];
              return newObj;
  
            }
          }

        }

      }
      
      return {
        ...obj
      }

    })

    updateSelectedAll( TypeAndQuantityList );
    setVINClientes( updatelistVINClients );
    setVINClientesGenerados([ ...VINClientesGenerados, ...VINSAdded ]);
    setVINSGeneratedinBD(false);
    
    const updateVINStoDelete = VINClientestoDelete.filter( obj => {
      let findVin = VINSAdded.find(row => row.Vin === obj.Vin);
      return findVin === undefined
    });

    setVINClientestoDelete( updateVINStoDelete );

  } */

  const updateDeselectedVINS2 = ( checked ) => {
    
    let TypeAndQuantityList = getDifferenceCantSelect();

    let list = [];

    for (const obj of TypeAndQuantityList) {

      const test = VINClientes.filter( row => row.Vehiculo.includes(obj.TipoVeh) && row.isVinSelected ); //obtener sólo los que están select

      const VINSeleccionados = test.length;
      const Cantidad = obj.Cantidad;

      list.push({
        'TipoVeh'          : obj.TipoVeh, 
        'VINSeleccionados' : VINSeleccionados, 
        'VINSLista'        : test, 
        'CantidadPorTipo'  : Cantidad,
        'Estatus'          : calculateTotalDeselected( VINSeleccionados, Cantidad )  
      })

    }


    let secondList = [];

    for (const obj of list) {
      
      if ( obj.Estatus === 'TODOS' ) {

        secondList = [ ...secondList, ...obj.VINSLista ];

      }

      if ( obj.Estatus === 'FRAGMENTO_DISPONIBLES' ) {

        secondList = [ ...secondList, ...obj.VINSLista ];

      }

    }


    let VINSAdded = [];

    const updateVINClientes = VINClientes.map( obj1 => {

      const findObj = secondList.find(obj2 => obj2.Vin === obj1.Vin );

      if ( findObj !== undefined ) {

        let newObj = createObjWithInputValues( checked, obj1 );
        VINSAdded = [ ...VINSAdded, { ...newObj } ];
        return newObj;

      }

      return obj1;

    });

    setVINClientes( updateVINClientes );
    setVINClientestoDelete([...VINClientestoDelete, ...VINSAdded ]);

    const updateVINSToGenerate = VINClientesGenerados.filter( obj => {
      let findVin = VINSAdded.find(row => row.Vin === obj.Vin);
      return findVin === undefined;
    })

    setVINClientesGenerados( updateVINSToGenerate );

    updateSelectedAll2( list, 'deseleccionados' );

  }

  /* const updateDeselectedVINS = ( checked ) => {

    let TypeAndQuantityList = getDifferenceCantSelect();
      
    let TotalTypeNumber = TypeAndQuantityList.length;
    let cont = 1;
    let AllTypesCompleted = false;
    let VINSAdded = [];

    const updatelistVINClients = VINClientes.map( (obj, index) => {

      let aux = cont;
     
      if ( !AllTypesCompleted ) {

          if ( TypeAndQuantityList[ cont - 1 ].Seleccionados === 0 ) {// selecionados tipos orden: onix, aveo, captiva

            ( cont !== TotalTypeNumber ) ? cont++ : AllTypesCompleted = true; 

          }
      }

      if ( !AllTypesCompleted ) {

        if ( obj.Vehiculo.includes( TypeAndQuantityList[ cont - 1 ].TipoVeh ) && obj.isVinSelected ) {
         
          TypeAndQuantityList[ cont - 1 ].Seleccionados --;
          
          let newObj = createObjWithInputValues( checked, obj );

          VINSAdded = [ ...VINSAdded, { ...newObj } ];
          return newObj;

        }

      }

      return {
        ...obj
      }
      
      
    })
    
    setVINClientes( updatelistVINClients );
    updateSelectedAll( TypeAndQuantityList );

    
    setVINClientestoDelete([...VINClientestoDelete, ...VINSAdded ]);
    
    const updateVINSToGenerate = VINClientesGenerados.filter( obj => {
      let findVin = VINSAdded.find(row => row.Vin === obj.Vin);
      return findVin === undefined;
    })

    setVINClientesGenerados( updateVINSToGenerate );

  } */

  const createObjWithInputValues = ( checked, obj ) => {
    return {
      ...obj,
      Agencia               : !checked ? "" : writtendata.Agencia,
      CelularDeContacto     : !checked ? "" : writtendata.CelularDeContacto,
      CiudadDestino         : !checked ? "" : writtendata.CiudadDestino,
      DomicilioDeEntrega    : !checked ? "" : writtendata.DomicilioDeEntrega,
      NumeroDistribuidor    : !checked ? 0  : writtendata.NumeroDistribuidor,
      isVinSelected         :  checked,
      NombreCliente         : !checked ? "" : writtendata.NombreCliente,
      OrdenDeCompra         : !checked ? "" : writtendata.OrdenDeCompra,
      PersonaReceptor       : !checked ? "" : writtendata.PersonaReceptor,
      Ubicacion             : !checked ? "" : writtendata.Ubicacion,
      NumCliente            : !checked ? writtendata.NumeroCliente  : writtendata.NumeroCliente,
      FechaVinAsignado      : FechaDeHoy
      // Vehiculo              : !checked ? "" : writtendata.TipoVehiculo
    }
  }

  const getDifferenceCantSelect = () => {
    let TypeAndQuantityList = [];
    const { TiposYCantidades } = writtendata;

    for (const obj of TiposYCantidades) {
      TypeAndQuantityList.push({
        TipoVeh         : obj.TipoVehiculo,
        SelecPendientes : obj.Cantidad - obj.Seleccionados,
        Cantidad        : obj.Cantidad,
        Seleccionados   : obj.Seleccionados,
      });
    }

    return TypeAndQuantityList;

  }

  const calculateTotalSelected = (VINSDisp, SelectPend) => {

    if ( VINSDisp === 0 ) return 'SINVINS_DISPONIBLES'; //No hay VINS en la lista disponibles por seleccionar.
    
    if ( SelectPend === 0 ) return 'SINVINS_PENDIENTES'; //No hay VINS pendientes en el tipo vehiculo por seleccionar.

    if ( VINSDisp === SelectPend ) return 'TODOS'; //seleccionar todos.   //validar si es 0 = 0 (no podría ser 0 = 0 2firstVal)

    if ( VINSDisp > SelectPend ) return 'FRAGMENTO_PENDIENTES'; //seleccionar solo una porcion.

    if ( VINSDisp < SelectPend ) return 'FRAGMENTO_DISPONIBLES' //será seleccionado una menor cantidad que el total de pendientes.

  }

  const calculateTotalDeselected = (VINSeleccionados, Cantidad) => {

    if ( VINSeleccionados === 0 ) return 'SINVINS_DISPONIBLES';

    if ( Cantidad === VINSeleccionados ) return 'TODOS';

    if ( Cantidad > VINSeleccionados ) return 'FRAGMENTO_DISPONIBLES';

    //Cantidad no puede ser igual a 0
    //Cantidad no puede ser menor a los VINSeleccionados

  }

  const hasVINSAvailableOC = ( checked ) => {
    let available = false;
    const { TiposYCantidades } = writtendata;
    
    if ( TiposYCantidades.length === 0 ) return available;
    
    for (const obj of TiposYCantidades) {

      if ( checked ) {
        if ( obj.Cantidad > obj.Seleccionados ) available = true;
      }

      if ( !checked ) {
        if ( obj.Seleccionados > 0 ) available = true;
      }

    }

    return available;
    
  }

  const hasListVINSFactNoSelected = () => {
    let VINSAvailable = true;
    const findVin = VINClientes.find( obj => !obj.isVINFactSelected && !obj.isVINFactDisable );

    if ( findVin === undefined ) {
      VINSAvailable = false;
      return VINSAvailable;
    }
    
    return VINSAvailable;
  }

  const hasListVINSNoSelected = () => {

    let VINSAvailable = true;
    const findVin = VINClientes.find( obj => ! obj.isVinSelected );

    if ( findVin === undefined ) {
      VINSAvailable = false;
      return VINSAvailable;
    }
    
    return VINSAvailable;

  }

  const hasListThisTypeVehicle = ( index, TipoVeh ) => {
    
    let existType = false;

    for (const key in VINClientes) {

      if ( Number( key ) >= index ) {

        if ( VINClientes[ key ].Vehiculo.includes( TipoVeh ) ) existType = true;
      
      }

    }

    return existType;

  }

  const handleCancelVinFact = ({ Vin, NumCliente }) => {

    updateVinCancBD( Vin, NumCliente );

    const updateVINClientes = VINClientes.map((row) => {
      if ( row.Vin === Vin ) {
        return { ...row, isVINFactSelected: false, isVINFactDisable: false }
      }
      return row
    })

    setVINClientes( updateVINClientes );

  }

  const updateVinCancBD = async ( Vin, NumCliente ) => {
    
    url = `${ ApiUrl }api/asignarvins/cancelvinfact`;
    await axiosPatchService( url, { Vin, NumCliente } );
  }

  const validationsVinSelectAllFF = () => {

    if ( VINClientes.length === 0 ) return true;
    
    if ( VINClientes.find( obj => !obj.isVINFactDisable ) === undefined ) return true;
    
    return false;
  }

  const createSortHandler = (property) => (event) => {

    handleRequestSort(event, property);
  };

  const handleRequestSort = (event, property) => {

    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    setVINClientes(

      stableSort( VINClientes, getComparator( order, orderBy ) )

    )
    
  }, [ order, orderBy ])
  

  return (
    <>
    <Modal isOpen={isOpenModal} closeModal={closeModal}>
        <ModalCopiarVINS
          data={VINClientesGenerados}
          finished={finished}
        />
    </Modal>

    <ModalGrande isOpen={esAbiertoModal} closeModal={cerrarModal}>
        <ModalFormatoFactura 
          agencia={agencia}
          fanCliente={fanCliente}
          numCliente={numCliente}
          handleAfterPrint={handleAfterPrint}
          paramFormFacturar={paramFormFacturar}
          razonSocial={razonSocial}
          tipoVehiculo={tipoVehiculo}
          VINFacturacion={VINFacturacion}
        />
    </ModalGrande>

    <div className="row">
      <div className="col-6">
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          
          <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
            
            <select 
              name='Cliente' 
              className='form-select select-class-1 width__label-input mt-2' 
              onChange={OnChange}
              tabIndex={1}
              disabled={ isPreviewTable }
            >
              {
                clientes
                .map(cliente => {
                  return (
                    <option 
                      value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}|${cliente.FanCliente}|${cliente.Razon_social}`} 
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
            disabled={ isPreviewTable || ordenesDeCompra.length === 0}
          >
            {
              ordenesDeCompra.map( orden => {
                return (
                  <option value={`${orden.OrdenCompra}|${orden.Cantidad}`}>
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
            
            <h6 className='mr-4 width__label-input-min'>Persona que recibe: </h6>
            
            <input 
              className='input-class width__label-input mt-2' 
              type="text" 
              name="PersonaReceptor" 
              value={writtendata.PersonaReceptor} 
              // onChange={OnChange}
              // disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
              readOnly
              tabIndex={3}
            />

        </div>

      </div>

      <div className="col-6">

        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

          <h6 className='mr-4 width__label-input-min'>Celular: </h6>
          <input 
            className='input-class width__label-input mt-2' 
            type="text" 
            name="CelularDeContacto" 
            value={writtendata.CelularDeContacto} 
            readOnly
          />

        </div>
      </div>
    </div>
    
    <div className="row">
      <div className="col-6">
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          <h6 className='mr-4 width__label-input-min'>Agencia: </h6>
            <input 
              className='input-class width__label-input mt-2' 
              type="text" 
              name="Agencia" 
              value={writtendata.Agencia} 
              readOnly
              // onChange={OnChange}
              // disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
              // tabIndex={5}
            />
        </div>
      </div>
      <div className="col-6">
        
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          
          <h6 className='mr-4 width__label-input-min'>Ciudad De Destino: </h6>

          <select 
            className='form-select select-class-1 width__label-input mt-2' 
            disabled={ domiciliosOrdenDeCompra.length === 0 }
            name='CiudadDestino' 
            onChange={OnChange}
          >
            { 
              domiciliosOrdenDeCompra !== undefined &&
              domiciliosOrdenDeCompra.map( dom => (
                <option 
                  value={`${dom.id}`}
                >
                  { dom.CiudadDestino }
                </option>
              )) 
            }
          </select>

        </div>
        
      </div>
    </div>
    
    <div className="row">
      
      <div className="col-6">
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          
          <h6 className='mr-4 width__label-input-min'>Número Distribuidor: </h6>
          <input
            autoComplete='off'
            className='input-class width__label-input mt-2'
            name='NumeroDistribuidor'
            readOnly
            type="text"
            value={writtendata.NumeroDistribuidor}
          />

        </div>
      </div>
      
      <div className="col-6">
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          <h6 className='mr-4 width__label-input-min'>Domicilio: </h6>
          <input 
            className='input-class width__label-input mt-2' 
            type="text" 
            name="DomicilioDeEntrega" 
            value={writtendata.DomicilioDeEntrega} 
            readOnly
          />
        </div>
      </div>

    </div>
    
    <div className="row">
      <div className="col-6">
        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
          <h6 className='mr-4 width__label-input-min'>Filtrar Por: </h6>
          <select 
            name="filterBy" 
            className='form-select select-class-1 width__label-input mt-2'
            onChange={OnChange}
            disabled={ isPreviewTable }
          >
            <option value="TODOS"> TODOS </option>
            <option selected value="FAN"> INVENTARIO </option>
            <option value="FACTURADOS"> FACTURADOS </option>
          </select>
        </div>
      </div>
      <div className="col-6">
        <div className="row d-flex justify-content-between pl-2 pr-4">
        </div>
      </div>
    </div>

    <div className="row mt-4">

      <div className="col-4 animate__animated animate__fadeIn">

        <table className='table table-sm table-bordered table-striped compact'>
          <thead>
              <tr className='text-center' style={{backgroundColor:'lightskyblue' }}>
                  <th><small>TIPO</small></th>
                  <th><small>CANTIDAD</small></th>
                  <th><small>SELECCIONADOS</small></th>
              </tr>
          </thead>
          <tbody>
            {
              writtendata.TiposYCantidades !== undefined &&
              writtendata.TiposYCantidades.map( tipo => {
                return (
                  <tr className='text-center' style={{backgroundColor:'lightskyblue' }}>
                    <td>{tipo.TipoVehiculo}</td>
                    <td>{tipo.Cantidad}</td>
                    <td>{tipo.Seleccionados}</td>
                  </tr>
                )
              })
            }
            <tr className='text-center' style={{backgroundColor:'mediumaquamarine' }}>
              <td>TOTAL</td>
              <td>{writtendata.Cantidad}</td>
              <td>{totalSeleccionados()}</td>
            </tr>
          </tbody>
        </table>

      </div>

      <div className="col-4">
        <div className="row d-flex justify-content-between pl-2 pr-4">
        </div>
      </div>
      
      <div className="col-4">
        <div className="row d-flex justify-content-between pl-2 pr-4">
        </div>
      </div>

    </div>

    {
      /* !updateVentasFlotillasDMSTable &&
      <div className="row m-2">
        <div className="col">
          <strong>Cargando...</strong>
          <div className="spinner-border ml-4" role="status" aria-hidden="true"></div>
        </div>
      </div> */
    }

      <div className="row m-2 d-flex justify-content-between">
        <h6 className='ml-2'>Seleccionar VIN's que integran el pedido a GM</h6>
        <button 
          className='btn btn-info mt-2 mb-2' 
          disabled={ VINClientesGenerados.length === 0 && VINClientestoDelete.length === 0 }
          onClick={onGenerateTable}
          type='button' 
        >
          { isPreviewTable ? 'Regresar' : 'Vista Previa'}
        </button>
      </div>

    {/* animate__animated animate__fadeIn */}
    {
      !isPreviewTable
      &&
        <Paper sx={{ width: '100%' }} elevation={6} className=''>
          
          <TableContainer sx={{ maxHeight: 640 }}>
           
            <Table stickyHeader aria-label="a dense table" className='animate__animated animate__fadeIn'>
            
              <TableHead>
                {/* first header */}
                <TableRow> 
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  
                  <StyledTableCell align="center">
                    
                    <Checkbox 
                      sx={{
                        color: blue[50],
                        '&.Mui-checked': {
                          color: blue[600],
                        },
                      }}
                      disabled={ VINClientes.length === 0 }
                      onChange={ handleVinFactAll } 
                      checked={ validationAllChecked2() }
                      
                    />
                    
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    
                    <Checkbox 
                      sx={{
                        color: blue[50],
                        '&.Mui-checked': {
                          color: blue[600],
                        },
                      }}
                      disabled={ VINClientes.length === 0 }
                      onChange={ handleVinSelectedAll }
                      checked={ validationAllChecked1() }
                      ref={ checkBoxSelectedAll }
                    />
                    
                  </StyledTableCell>
                  <StyledTableCell align="center" colSpan={11}></StyledTableCell>
                  
                </TableRow>

                {/* second header */}
                <TableRow>
                  <StyledTableCell style={{top:57}} align="center">#</StyledTableCell>
                  <StyledTableCell style={{top:57}} align="center"></StyledTableCell>
                  <StyledTableCell style={{top:57}} align="center">Formato Factura</StyledTableCell>
                  <StyledTableCell style={{top:57}} align="center">
                    {`Seleccionar VIN (${ VINClientesGenerados.length })`}
                  </StyledTableCell>
                  
                  {cellsAsignarVINSOC.map((headCell) => (
                    <StyledTableCell
                      style={{ top:57 }}
                      key={ headCell.id }
                      align="center"
                      sortDirection={ orderBy === headCell.id ? order : false }
                    >
                      <TableSortLabel
                        sx={{ color:'white' }}
                        active={ orderBy === headCell.id }
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                      >

                        { headCell.label }
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={ visuallyHidden }>
                            { order === 'desc' ? 'sorted descending' : 'sorted ascending' }
                          </Box>
                        ): null}

                      </TableSortLabel>

                    </StyledTableCell>
                  ))}

                </TableRow>

              </TableHead>

              <TableBody sx={{ backgroundColor: '#FFFFE0' }}>
                {
                  
                  VINClientes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((registro, index) => (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={registro.Inventario}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell className='noselect' align="center">{ index + 1 }</TableCell>
                      <TableCell className='noselect' align="center">
                        {

                          (registro.isVINFactSelected && registro.isVINFactDisable) &&
                            <Tooltip title='Cancelar Impresión'>
                              <IconButton color='error' onClick={ () => handleCancelVinFact( registro ) }>

                                <ClearIcon fontSize='small'/>
                              </IconButton>
                            </Tooltip>
                            
                        }
                      </TableCell>
                      <TableCell className='noselect' align="center">
                      {
                        registro.Impreso !== null &&
                        
                        <Checkbox 
                          sx={{
                            color: blueGrey[200],
                            '&.Mui-checked': {
                              color: blue[600],
                            },
                            '&.Mui-disabled': {
                              color: blueGrey[200],
                            }
                          }}
                          checked={ registro.isVINFactSelected }
                          disabled={ registro.isVINFactDisable }
                          onChange={( e ) => handleVinFact( e, registro )}
                        />
                      }  
                      </TableCell>
                      <TableCell className='noselect' align="center">
                        {
                          <Checkbox 
                            sx={{
                              color: blueGrey[200],
                              '&.Mui-checked': {
                                color: blue[600],
                              },
                              '&.Mui-disabled': {
                                color: blueGrey[200],
                              }
                            }}
                            checked={registro.isVinSelected} 
                            disabled={ registro.isDisabled }
                            onChange={( e ) => handleVinSelected( e, registro )}
                          />
                        }
                      </TableCell>
                      <TableCell className='noselect' align="center">{ registro.Inventario.replace('  ', '-').split('-').pop().trim() }</TableCell>
                      <TableCell align="center">{registro.Vin}</TableCell>
                      <TableCell className='noselect'align="center">{ upperCase( registro.Vehiculo )}</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( registro.Color ) }</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( registro.OrdenDeCompra ) }</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( validateFan( registro.FanCliente ) ) }</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( registro.PersonaReceptor ) }</TableCell>
                      <TableCell className='noselect' align="center">{ registro.CelularDeContacto }</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( registro.Agencia ) }</TableCell>
                      <TableCell className='noselect' align="center">{ upperCase( registro.CiudadDestino ) }</TableCell>
                      <TableCell className='noselect' align="left">{ upperCase( registro.DomicilioDeEntrega ) }</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>

            </Table>
          </TableContainer>

          <TablePagination
            sx={{ backgroundColor: '#FFFFE0', display:'flex', flexDirection:'row', alignItems:'flex-start', justifyContent: 'flex-start' }}
            // labelRowsPerPage={`Mostrando registros del ${from} al ${ rowsPerPage } de un total de ${ VINClientes.length } registros`}
            labelRowsPerPage={``}
            labelDisplayedRows={
              ({ from, to, count }) => { 
                return `Mostrando registros del ${from} al ${to} de un total de ${count !== -1 ? `${count} registros` : `${to} registros`}` 
            }}
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={VINClientes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          
        </Paper>
      
    }

    <TablaAsignarVinsOrdenDeCompra
      agencia={ agencia }
      copyVINS={ copyVINS }
      data={ VINClientesGenerados }
      handleGuardarVinsConOrdenCompra={ handleGuardarVinsConOrdenCompra }
      isPreviewTable={ isPreviewTable }
      TiposYCantidades={ writtendata.TiposYCantidades }
      VINClientestoDelete={ VINClientestoDelete }
      VINSGeneratedinBD={ VINSGeneratedinBD }
      NumeroCliente={ writtendata.NumeroCliente }
    />

    <div className="row m-2">
      <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        onClick={onGenerateTable} 
        disabled={ VINClientesGenerados.length === 0 && VINClientestoDelete.length === 0 }
      >
        { isPreviewTable ? 'Regresar' : 'Vista Previa'}
      </button>
      <button 
        type='button' 
        className='btn btn-info mt-2 mb-2 ml-4' 
        onClick={ crearFormatoFactura } 
        disabled={ VINFacturacion.length === 0 || isPreviewTable }
      >
        <FontAwesomeIcon icon={faPrint}/>
        <small className='ml-2'>Formato Facturación</small>
      </button>
    </div>

    
    </>
  )
}

export default AsignarVinsOrdenDeCompra