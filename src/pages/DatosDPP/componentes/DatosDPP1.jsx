import React, { useState, useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faUpload, faPrint } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx'
import swal from 'sweetalert';

import { TablaPermisoDesvio } from './tablas-vistas/TablaPermisoDesvio';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import { ApiUrl } from '../../../services/ApiRest'
import { toast } from 'react-toastify';
import { validarFecha, isDefaultDate, validarFechaExcel, validarFechaExcelDPP } from '../../../helpers/fecha';
import { upperCase } from '../../../helpers/converToUpperCase';
import { SumarDiasAFecha } from '../../../services/asignacionLoteService/SumarDiasAFecha';

const DECREMENTAR = 'DECREMENTAR';
const INCREMENTAR = 'INCREMENTAR';
const Asignar = 'Asignar';
const Modificar = 'Modificar'
const emptyDate = '1900-01-01';

const DatosDPP1 = ({ clientes, agencia }) => {

  const [writtendata, setWrittendata] = useState({
    Cliente               : clientes.length > 0 ? `${clientes[0].Nombre_corto}`  : "",
    RazonSocial           : clientes.length > 0 ? `${clientes[0].Razon_social}`  : "",
    NumeroCliente         : clientes.length > 0 ? `${clientes[0].Num_cliente}`   : 0,
    UbicacionCliente      : clientes.length > 0 ? `${clientes[0].Ubicacion}`     : "",
    PermisoDesvio         : "DPP",
    FolioDesvio           : "",
    FechaSalida           : "",
    FechaLlegada          : "",
    FechaEntrega          : "",
    FechaVencimiento      : "",
    FechaVencimientoDPP1  : "", //fechaDePago
    FolioDPP              : "",
    FechaSolicitudDPP     : "",
    Observaciones         : "",
    /* add two properties */
    FechaDeEntregaDPP     : "",
    PlazoDiasNaturales    : 0
  })
  const [IndicadoresCliente, setIndicadoresCliente] = useState({
    LimiteCreditoActual    : 0,
    MontoVINSSeleccionados : 0,
    NuevoLimiteCredito     : 0
  })
  const [hasCreditThisClient, setHasCreditThisClient] = useState( true );
  const [isPreviewTable, setIsPreviewTable]                                 = useState(false)
  const [VINClientes, setVINClientes]                                       = useState([])
  const [VINClientesGenerados, setVINClientesGenerados]                     = useState([])
  const [updateVentasFlotillasDMSTable, setUpdateVentasFlotillasDMSTable]   = useState(false)
  const [isExcelAndPrintButtonEneabled, setIsExcelAndPrintButtonEneabled]   = useState(false)
  const [ordenesDeCompra, setOrdenesDeCompra] = useState([])
  const [ordenCompraSelected, setOrdenCompraSelected] = useState('');
  const [VINSGeneratedinBD, setVINSGeneratedinBD] = useState(false)
  const [checkAll, setCheckAll] = useState(false)
  const [selectionMode, setSelectionMode] = useState(Asignar);
  const [activeInputDeploy, setActiveInputDeploy] = useState(false);
  const emptySpace = ""
  const DPP = "DPP"
  const Contado = "Contado"
  let url = '';
  const permisoDesvioSelectRef = useRef();
  const checkBoxSelectedAll = useRef(); 

  useEffect(() => {
    // updateTablaVentasFlotillasDMS()
    if ( clientes.length > 0 ) {
       setWrittendata({
        ...writtendata, 
        Cliente          : clientes[0].Nombre_corto, 
        NumeroCliente    : clientes[0].Num_cliente, 
        UbicacionCliente : clientes[0].Ubicacion,
        RazonSocial      : clientes[0].Razon_social
       })
       setUpdateVentasFlotillasDMSTable(true)
       getOrdenesDeCompraByCliente( 
        clientes[0].Nombre_corto, 
        clientes[0].Ubicacion, 
        clientes[0].Num_cliente 
       );
    }


  }, [clientes])

  useEffect(() => {
    if ( ! isPreviewTable ) checkBoxSelectedAll.current.checked = checkAll;
    
  }, [isPreviewTable])
  

  //El endpoint llamado en esta función se encuentr en las rutas de [asignacion_lote] backend
  const updateTablaVentasFlotillasDMS = async () => {
    if ( clientes.length > 0 ) {
      url = ApiUrl + "api/updateregistrosoracle"
      const body =  { agencia: agencia }
      const response = await axiosPostService( url, body )
      if ( response.isUpdated ) {
          setUpdateVentasFlotillasDMSTable(true)
          getVINSCliente(clientes[0].Num_cliente);

      }
    }
    // setUpdateVentasFlotillasDMSTable(true)
    // getVINSCliente(clientes[0].Num_cliente);
  }
  
  const getVINSCliente = async ( NumCliente, ordenCompra ) => {
    url = ApiUrl + "api/dpp_contado/getvinscliente";
    const body_cliente = { Agencia: agencia, NumCliente: NumCliente };
    let total_vines_cliente = await axiosPostService( url, body_cliente);

    if( checkBoxSelectedAll.current?.checked !== null ) {

      if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;

    }

    if ( NumCliente !== writtendata.NumeroCliente && !isPreviewTable) setVINClientesGenerados([]);
    if ( total_vines_cliente.length  > 0 ) total_vines_cliente = agregarVariableIsSelected(total_vines_cliente);
    
    total_vines_cliente = total_vines_cliente.filter( VIN => VIN.OrdenDeCompra === ordenCompra )

    if ( ordenCompraSelected !== ordenCompra ) {

      total_vines_cliente = total_vines_cliente.map((row) => {

        let updateRow = { ...row }
        let findObj = VINClientesGenerados.find( obj => row.VIN === obj.VIN );
        if ( findObj !== undefined ) updateRow = { ...findObj }
        return updateRow;

      })

    }

    
    if ( isPreviewTable ) updateVINS( 'FolioDesvio', writtendata.FolioDesvio, total_vines_cliente )
    else {

      const emptyVINSList = total_vines_cliente.filter((obj) => obj.isOnBD === false);
      ( emptyVINSList.length > 0 ) ? setSelectionMode( Asignar ) : setSelectionMode( Modificar ); 
      setVINClientes(total_vines_cliente);

    }
  }

  const getOrdenesDeCompraByCliente = async ( NombreCliente, UbicacionCliente, numeroCliente ) => {
    url = ApiUrl + "api/dpp_contado/get_ordenes_de_compra"
    const body_cliente = { 
      Agencia          : agencia, 
      NombreCliente    : NombreCliente, 
      UbicacionCliente : UbicacionCliente,
      Num_cliente      : numeroCliente 
    };
    const total_ordenes_compra = await axiosPostService( url, body_cliente );

    getLimiteCreditoByCliente( numeroCliente, true );

    setOrdenesDeCompra([])
    setOrdenesDeCompra(total_ordenes_compra)

    if ( total_ordenes_compra.length > 0 ) {
      let ordenSelected = total_ordenes_compra[0];
      setOrdenCompraSelected(ordenSelected.OrdenCompra)
      getVINSCliente( numeroCliente, ordenSelected.OrdenCompra )
    }
    if ( total_ordenes_compra.length === 0 ) {
      setOrdenCompraSelected('')
      setVINClientes([])
      setVINClientesGenerados([])
    }
  }

  const getLimiteCreditoByCliente = async ( numeroCliente, firstRender = false ) => {
    url  = ApiUrl + "api/dpp_contado/get_limite_credito";
    const [ monto ] = await axiosPostService( url, { Agencia: agencia, numeroCliente } );

    setIndicadoresCliente({
      ...IndicadoresCliente,
      LimiteCreditoActual    : monto.LimiteCredito,
      NuevoLimiteCredito     : monto.LimiteCredito,
      MontoVINSSeleccionados : 0
    })

    if ( monto.LimiteCredito === 0 ) setHasCreditThisClient( false ) 
    else setHasCreditThisClient( true );
    

  }

  const agregarVariableIsSelected = (total_vines_cliente) => {
    const list = total_vines_cliente.map((obj) => {
      let changeObj = {
        ...obj,
        isVinSelected   : obj.FolioDPP !== null ? true : false,
        isDisabled      : obj.FolioDPP !== null ? true : false,
        isOnBD          : obj.FolioDPP !== null ? true : false,
        isVinModified   : false,
        oldFolioDesvio  : obj.FolioDesvio,
      }
      return changeObj;
    })

    const listOrdered =  ordenarVinesDeshabilitadosAlFinal( list )
    return listOrdered;
  }

  const ordenarVinesDeshabilitadosAlFinal = ( list ) => {
    const mixedLists = [
      //listVinsHabilitados
       ...list.filter((row) => { return row.FolioDPP === null }), 
       //listVinsDeshabilitados = se realiza un map para poner el valor DPP, cuando algunos vins solo tiene folioDPP pero no su folioDesvio
       ...list.filter((row) => { return row.FolioDPP !== null }).map((row) =>  ({...row, PermisoDesvio : row.PermisoDesvio !== 'Contado' ? 'DPP' : 'Contado'}) )
      ]
    return mixedLists;
  }

  const changeSelectClientes = async(e) => {
    const [ Ubicacion, Nombre_cliente, Num_cliente, Razon_social ] = e.target.value.split("|");
    setWrittendata({
      ...writtendata,
      Cliente          : Nombre_cliente,
      NumeroCliente    : Num_cliente,
      UbicacionCliente : Ubicacion,
      RazonSocial      : Razon_social
    })

    getOrdenesDeCompraByCliente( Nombre_cliente, Ubicacion, Num_cliente );

    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);
    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
  }

  const OnChange = (e) => {

    if ( selectionMode === Modificar && e.target.name !== "ordenDeCompra") {
      
      modifiedPropertyOnVINS( e.target.value, e.target.name );
    }
    

    if ( e.target.name === "PermisoDesvio" ) {
      setWrittendata({
        ...writtendata,
        [e.target.name] : e.target.value,
        FolioDPP        : ""
      })

      return;
    }

    if ( e.target.name === "ordenDeCompra" ) {
      
      setOrdenCompraSelected(e.target.value)
      getVINSCliente( writtendata.NumeroCliente, e.target.value )
      return;
    }

    setWrittendata({
      ...writtendata,
      [e.target.name]: e.target.value
    })

  }

  const handleVinSelected = async ( e, registro ) => {
      
    const checked = e.target.checked;
    const { isOnBD } = registro;

    if ( activeInputDeploy && selectionMode === Modificar ) { 
        // console.log('1');
        addFirstVINEditMode( registro );
        return;
    }
      
    if ( !activeInputDeploy && selectionMode === Modificar ) { 
        // console.log('2');
        valuesInputEqualToVIN( registro, e.target.checked );
        return;
    }

    if ( activeInputDeploy && selectionMode === Asignar) { 

      if ( isOnBD ) {
        // console.log('3');
        // if ( existVINSNoOnBDSelected() || selectionMode === Asignar ) {
        if ( existVINSNoOnBDSelected() || existVINSOnBDSelected() ) { 
            // console.log('3.1');
            
            if ( checked === true ) {
              // console.log('3.1.1');
              const confirmation = await replaceDatesConfirm( registro.VIN );
              if ( confirmation ) {
                
                const registerModified = updatePropertiesToObject( writtendata, registro, checked, false, true );
                updateVINOnBDAssignMode( registerModified, checked );
                return;
                
              }
              
              return;
            }
            
            if ( checked === false ) {
              // console.log('3.1.2');

              url = ApiUrl + "api/dpp_contado/datesByVIN";
              let originalDates = await axiosPostService( url, { VIN : registro.VIN, Cliente : writtendata.NumeroCliente } );
              const registerModified = updatePropertiesToObject( originalDates[0], registro, checked, false, false );
              updateVINOnBDAssignMode( registerModified, checked );
              return;

           }

        }

        // console.log('3.2.2');
        addFirstVINEditMode( registro );
        setActiveInputDeploy( false );
        setSelectionMode( Modificar );
        return;
      }

      if ( !isOnBD ) {
        // console.log('4');
        if ( hasInputsDefaultValues() ) {
          toast.info("Favor de colocar las fechas antes de seleccionar el VIN.") 
          return;
        }
        
        manageRegisterNoOnBDAssignMode( registro, checked );
        return;
      }

    }
    
    if ( selectionMode === Asignar && registro.isOnBD ) {
      // console.log('5');
      toast.info("No es posible agregar el VIN que está en BD, en modo asignar.");
      return;
      
    }

    if ( selectionMode === Asignar && hasInputsDefaultValues() ) {
      // console.log('9:');
      toast.info("Favor de colocar las fechas antes de seleccionar el VIN.") 
      return;
    }


    const updateVIN = VINClientes.map((row) => {
      if ( registro.VIN === row.VIN ) {
        let updateRow = {
          ...row,
          isVinSelected         : checked,
          FechaEntrega          : !checked ? "" : writtendata.FechaEntrega,
          FechaDeEntregaDPP     : !checked ? "" : writtendata.FechaDeEntregaDPP,
          FechaLlegada          : !checked ? "" : writtendata.FechaLlegada,
          FechaSalida           : !checked ? "" : writtendata.FechaSalida,
          FechaVencimiento      : !checked ? "" : writtendata.FechaVencimiento,
          FechaVencimientoDPP1  : !checked ? "" : writtendata.FechaVencimientoDPP1,
          FechaSolicitudDPP     : !checked ? "" : writtendata.FechaSolicitudDPP,
          FolioDPP              : !checked ? "" : writtendata.FolioDPP,
          FolioDesvio           : !checked ? "" : writtendata.FolioDesvio,
          PermisoDesvio         : !checked ? "" : writtendata.PermisoDesvio,
          Observaciones         : !checked ? "" : writtendata.Observaciones
        }
        insertNewVIN(updateRow, checked)
        return updateRow;
      }

      return row;
    })

    setVINClientes(updateVIN);
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false); 
    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
  }

  const updateVINOnBDAssignMode = ( registro, checked = true ) => { 
   
    const updateVINS = VINClientes.map(( row ) => {
      if ( row.VIN === registro.VIN ) {
        return {
          ...registro 
        }
      }
      return {
        ...row
      }
    })

    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);
    setVINClientes( updateVINS );

    if ( checked ) {
      const takeOutVINFromList = VINClientesGenerados.filter((row) => row.VIN !== registro.VIN );
      setVINClientesGenerados([
        ...takeOutVINFromList,
        {
          ...registro,
          Cliente           : writtendata.Cliente,
          NumeroCliente     : writtendata.NumeroCliente,
          UbicacionCliente  : writtendata.UbicacionCliente 
        }
      ])

    }

    if ( !checked ) {
      const updateList = VINClientesGenerados.filter((row) => {
        return row.VIN !== registro.VIN 
      })
      setVINClientesGenerados( updateList );
    }

  }

  const handleVinSelectedAll = async ( e ) => {
    const checked = e.target.checked;
    let sumatoriaPrecioFactura = 0;
    // console.log('6');
    
    if ( checked && selectionMode === Asignar ) { 
      // console.log('6.1');
        analizeSelectionVINSAsignMode( checked );
        return; 
    }

    if ( !checked && selectionMode === Asignar ) { 
      // console.log('6.2');
        analizeDeselectionVINSAssignMode( checked );
        return; 
    }

    if ( checked && selectionMode === Modificar ) {

        // console.log('6.3');
        if ( existEmptyVINS() ) {  // (CON EMPTY VINS)
          // console.log('6.3.1');
          const firstVINSelectedFound = VINClientes.find((obj) => obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === true ) //##2
          if ( firstVINSelectedFound === undefined ) return
          // console.log('6.3.1.1.2');
          analizeSelectionVINSEditMode( checked, firstVINSelectedFound );
          return;
        }
        
        if ( existVINSOnBDSelected() ) { // (SIN EMPTY VINS) 
          // console.log('6.3.2');
            const firstVINSelectedFound = VINClientes.find((obj) => obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === true ) //##2
            if ( firstVINSelectedFound === undefined ) return
            analizeSelectionVINSEditMode( checked, firstVINSelectedFound );
            return;
        }

        // console.log('6.4');
        /* Aún no existen VINS seleccionados. seleccionamos el primero habilitado. */
        const firstVINOnBDEneabled = VINClientes.find((obj) => obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === false ) //##2
        if ( firstVINOnBDEneabled === undefined ) return;
        analizeSelectionVINSEditMode( checked, firstVINOnBDEneabled );
        return;
    }

    if ( !checked && selectionMode === Modificar ) {
      // console.log('6.5');

      if ( existEmptyVINS() ) {  // (Con emptyVINS) checked false:
        // console.log('6.6');
        /* 1.- Deshabilitar los VINS, seleccionarlos (banderas: isOnBD:true, isVinSelected:true|false, isDisabled:false) */
        /* 2.- si la bandera isModified cambió; pedir la información original de la Base de Datos; sino, sólo seleccionarlo y deshabilitarlo. */
        /* 3.- cambiar a modo asignar */
        /* 4.- resetear las cajas de texto. */
        /* 5.- remover todos los VINS de la lista de VINS Generados */
        
        await analizeDeselectionVINSEditMode( checked, 'withEmptyVINS' );
        return;
      }

      /* (Sin emptyVINS) checked false: */
      /* 1.- Remover la selección de los VINS, banderas:( isOnBD:true, isVinSelected:true, isDisabled:false ) */
      /* 2.- si la bandera isModified cambió; pedir la información original de la Base de Datos; sino, sólo deseleccionarlo. */
      /* 4.- resetear las cajas de texto. */
      /* 5.- remover todos los VINS de la lista de VINS Generados */
      /* setActiveInputDeploy(true); */

      // console.log('6.7');
      await analizeDeselectionVINSEditMode( checked, 'noEmptyVINS' );
      return;
    }
    
  }

  const insertNewVIN = (object, checked) => {
    if ( !checked ) {
      const updateList = VINClientesGenerados.filter((row) => {
          return row.VIN !== object.VIN
      })

      setVINClientesGenerados(updateList) //TODO: acceder a la función si y sólo si: hasCreditThisClient is true
      if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( DECREMENTAR, object.PrecioFactura, object.isOnBD );
      return;
    }
    
    //TODO: acceder a la función si y sólo si: hasCreditThisClient is true
    if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( INCREMENTAR, object.PrecioFactura, object.isOnBD );
    setVINClientesGenerados([
      ...VINClientesGenerados,
      {
        ...object,
        Cliente           : writtendata.Cliente,
        NumeroCliente     : writtendata.NumeroCliente,
        UbicacionCliente  : writtendata.UbicacionCliente
      }
    ])
  }

  const addClientNumber = ( list ) => {
    return list.map((obj) => {
      return {
        ...obj,
        Cliente           : writtendata.Cliente,
        NumeroCliente     : writtendata.NumeroCliente,
        UbicacionCliente  : writtendata.UbicacionCliente
      }
    })
  }

  const calcularIndicadoresCredito = ( action, InvoicePrice, isOnBD ) => {

    if ( isOnBD ) return;
    if ( InvoicePrice == 0 ) return;

    if ( action === DECREMENTAR ) {
      setIndicadoresCliente({
        ...IndicadoresCliente,
        MontoVINSSeleccionados : IndicadoresCliente.MontoVINSSeleccionados - InvoicePrice,
        NuevoLimiteCredito     : IndicadoresCliente.NuevoLimiteCredito + InvoicePrice,
      })
    }

    if ( action === INCREMENTAR ) { 
      setIndicadoresCliente({
        ...IndicadoresCliente,
        MontoVINSSeleccionados : IndicadoresCliente.MontoVINSSeleccionados + InvoicePrice,
        NuevoLimiteCredito     : IndicadoresCliente.NuevoLimiteCredito - InvoicePrice,
      })
    }
  }

  const handleGuardarPermisoDesvio = () => {
    if ( ! isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( true );
    setVINSGeneratedinBD( true )
    getLimiteCreditoByCliente( writtendata.NumeroCliente, false );
    // getVINSCliente( writtendata.NumeroCliente, ordenCompraSelected ); //Cambiar esta función al presionar el botón regresar.
    setCheckAll(false);
  }

  const onGenerateTable = () => {
    if ( existsAnyEmptyDate() !== undefined) {
      toast.info("Existen VINS seleccionados sin fecha asignada.")
      return;
    }

    if ( existsAnyEmptyFolioDesvio() !== undefined ) {
      toast.info("Existen VINS seleccionados sin folio desvío asignado.")
      return;
    }

    if ( writtendata.PermisoDesvio ===  DPP && existsAnyEmptyFolioDPP() !== undefined) {
      toast.info("Existen VINS seleccionados sin folio dpp asignado.")
      return;
    }

    if ( VINSGeneratedinBD ) {
      // setVINClientesGenerados([]);
      getVINSCliente( writtendata.NumeroCliente, ordenCompraSelected );
    }

    setIsPreviewTable(!isPreviewTable)
    
  }

  const existsAnyEmptyDate = () => {
    return VINClientesGenerados.find( (obj) => {
      if ( 
           (writtendata.PermisoDesvio ===  Contado && obj.FechaEntrega     === emptySpace) || 
           (writtendata.PermisoDesvio ===  Contado && obj.FechaLlegada     === emptySpace) || 
           (writtendata.PermisoDesvio ===  Contado && obj.FechaSalida      === emptySpace) || 
           (writtendata.PermisoDesvio ===  Contado && obj.FechaVencimiento === emptySpace) 
          //  || //  ( writtendata.PermisoDesvio ===  DPP && obj.FechaVencimientoDPP1 === emptySpace )
         ) return obj;
    })
  }

  const existsAnyEmptyFolioDesvio = () => { 
    return VINClientesGenerados.find( (obj) => {
      if ( writtendata.PermisoDesvio ===  Contado && obj.FolioDesvio === emptySpace ) return obj;
    })
  }
  
  const existsAnyEmptyFolioDPP = () => { 
    return VINClientesGenerados.find( (obj) => {
      if ( obj.FolioDPP === emptySpace ) return obj;
    })
  }

  const OnBlur = async (e) => {

    let url = '';
    if ( e.target.value === "" ) return;
    if ( VINClientes.filter( perm => perm.isOnBD ).length === 0 ) return;
    const inputValue = `${e.target.value}`.toUpperCase();
    
    if ( selectionMode === Modificar ) { /* si cambia el folioDesvio o DPP en modo modificar, no realizar la búsqueda. */
      if ( VINClientesGenerados.length > 0 ) return;
    }

    updateVINS( e.target.name, inputValue, VINClientes );
   
  }

  const OnBlurDiasNaturales = async ({ target }) => {
    const { value } = target;

    if ( value === "" ) return;

    const dias = value;
    const fechaDeEnt = writtendata.FechaDeEntregaDPP;
    
    const resultDate = await calculateDate( dias, fechaDeEnt );
    setWrittendata({
      ...writtendata,
      FechaVencimientoDPP1: resultDate
    })

    modifiedPropertyOnVINS( resultDate, 'FechaVencimientoDPP1' );

  }

  const updateVINS = ( FolioDesvioOrDPP, inputValue, VINClientes ) => {
    inputValue = inputValue.toUpperCase();

    let filterVINS = VINClientes.filter( row => row[FolioDesvioOrDPP] === inputValue );

    if ( filterVINS.length === 0 ) {
      toast.info(`El folio ${inputValue} no existe en la lista de VINS actual.`);
      return;
    }

    let equalDates = validateDates( filterVINS ); 
    if ( equalDates ) setDatesInputs( filterVINS[0] );
    if ( !equalDates ) {
      setActiveInputDeploy( true );
      const { PermisoDesvio } = filterVINS[0];
      if ( PermisoDesvio !== writtendata.PermisoDesvio ) permisoDesvioSelectRef.current.value = PermisoDesvio;
      setWrittendata({
        ...writtendata,
        PermisoDesvio: PermisoDesvio
      })
     
    }
    changeSelectionMode( equalDates, VINClientes ); 

    const updateVINS = VINClientes.map((obj) => {
      if ( obj.isOnBD ) {
        return {
          ...obj,
          isDisabled     : validateIsVINDisabled( obj, FolioDesvioOrDPP, inputValue, equalDates, filterVINS ),
          isVinSelected  : validateIsVINSelected( obj, equalDates, filterVINS )
        }
      }

      if ( !obj.isOnBD ) {
        return createNewObj( obj, false )
      }

    })
    
    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);
    
    setVINClientes( updateVINS );


    if ( addListToVINSGenerados( updateVINS ) ) {
      
      filterVINS = addClientNumber( filterVINS );
      
      setVINClientesGenerados( filterVINS )
      return;
    } 
    setVINClientesGenerados([]);
  }

  const onExportToPlanDPP = ({ target }) => {
    // calculateDate();
    const dataExcel = dataExcelPlanDPP();
    const Header = [
      "NUMERO DE SERIE",
      "MARCA",
      "MODELO",
      "FECHA DE ENTREGA",
      "FECHA DE PAGO",
      "PRECIO DE VENTA"  
    ];

    const fileName = "Folio DPP";
    const fileNameExtension = "Folio_DPP.xlsx"
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_json(ws, dataExcel, {
      header: Header,
      skipHeader: false,
    })

    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileNameExtension);

    
  }

  const calculateDate = async ( dias, fecha ) => {
    const { data } = await SumarDiasAFecha( dias, fecha );
    const fechaDePago = data.substring(0,10);
    return fechaDePago;
  }

  const onExportToPermisoDesvio = ({ target }) => {
    const dataExcel = dataExcelPermisoDesvio();
    const Header = [
      "Tipo de Operación",
      "VIN",
      "Número de Distribuidor que recibe la unidad",
      "Nombre del Cliente Final o Carrocera",
      "Dirección del Cliente Final o Carrocera",
      "Fecha Estimada Salida TyT",
      "Fecha de Llegada al Destino",
      "Fecha de Entrega al Cliente",
      "Folio DPP"      
    ];
  
    const fileName = "Permiso Desvío";
    const fileNameExtension = "Permiso_Desvio.xlsx";
    let wb = XLSX.utils.book_new()
    let ws = XLSX.utils.json_to_sheet([])
  
    XLSX.utils.sheet_add_json(ws, dataExcel, {
      header: Header,
      skipHeader: false,
    })
  
    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileNameExtension)

  }

  const dataExcelPermisoDesvio = () => {

    return VINClientesGenerados.map((row) => {
      return {
        "Tipo de Operación"                            : row.PermisoDesvio,
        "VIN"                                          : row.VIN,
        "Número de Distribuidor que recibe la unidad"  : row.NumeroDistribuidor == 0 ? "" : row.NumeroDistribuidor,
        "Nombre del Cliente Final o Carrocera"         : writtendata.RazonSocial,
        "Dirección del Cliente Final o Carrocera"      : row.DireccionClienteFinal.toUpperCase(),
        "Fecha Estimada Salida TyT"                    : validarFechaExcel(isDefaultDate(row.FechaSalida)),
        "Fecha de Llegada al Destino"                  : validarFechaExcel(isDefaultDate(row.FechaLlegada)),
        "Fecha de Entrega al Cliente"                  : validarFechaExcel(isDefaultDate(row.FechaEntrega)),
        "Folio DPP"                                    : row.FolioDPP
      }
    })

  }

  const dataExcelPlanDPP = () => {
    return VINClientesGenerados.map((row) => {
      return {
        "NUMERO DE SERIE"  : row.VIN,
        "MARCA"            : "CHEVROLET",
        "MODELO"           : row.Modelo,
        "FECHA DE ENTREGA" : validarFechaExcelDPP(isDefaultDate(row.FechaDeEntregaDPP)),
        "FECHA DE PAGO"    : validarFechaExcelDPP(isDefaultDate(row.FechaVencimientoDPP1)),
        "PRECIO DE VENTA"  : row.PrecioFactura
      }
    })
  }

  const hasEqualityDates = ( list, firstOfList ) => {
      let equalityDatesList;
      let assertValidation = false;
      const { FechaSalida, FechaLlegada, FechaEntrega, FechaVencimiento } = firstOfList;
      const { FechaSolicitudDPP, FechaDeEntregaDPP, FechaVencimientoDPP1 } = firstOfList;

      if ( firstOfList.PermisoDesvio === "DPP" ) {
          equalityDatesList = list.filter((obj) => {
            return (
              obj.FechaSalida          === FechaSalida &&  
              obj.FechaLlegada         === FechaLlegada &&  
              // obj.FechaEntrega         === FechaEntrega &&  
              obj.FechaEntrega         === FechaEntrega &&  
              obj.FechaVencimiento     === FechaVencimiento &&  
              obj.FechaSolicitudDPP    === FechaSolicitudDPP &&  
              obj.FechaDeEntregaDPP    === FechaDeEntregaDPP &&  
              obj.FechaVencimientoDPP1 === FechaVencimientoDPP1   
              ) 
          })
        
      } else {
          equalityDatesList = list.filter((obj) => {
            return (
                obj.FechaSalida          === FechaSalida &&  
                obj.FechaLlegada         === FechaLlegada &&  
                obj.FechaEntrega         === FechaEntrega &&  
                // obj.FechaEntrega         === FechaEntrega &&  
                obj.FechaVencimiento     === FechaVencimiento   
                ) 
          })

      }

      if ( equalityDatesList.length === list.length ) assertValidation = true;

      return assertValidation;
  }

  const compareDatesTwoVINS = ( OBJ1, OBJ2 ) => {
    let areEqualDates = false;
    
    //validar si ambos VINS contienen el mismo permisoDesvío.

    if ( OBJ1.PermisoDesvio !== OBJ2.PermisoDesvio ) return false;

    if ( OBJ2.PermisoDesvio === "DPP" ) {
        if ( 
            OBJ1.FechaSalida          === OBJ2.FechaSalida &&
            OBJ1.FechaLlegada         === OBJ2.FechaLlegada &&
            OBJ1.FechaEntrega         === OBJ2.FechaEntrega &&
            OBJ1.FechaVencimiento     === OBJ2.FechaVencimiento &&
            OBJ1.FechaSolicitudDPP    === OBJ2.FechaSolicitudDPP &&
            OBJ1.FechaDeEntregaDPP    === OBJ2.FechaDeEntregaDPP &&
            OBJ1.FechaVencimientoDPP1 === OBJ2.FechaVencimientoDPP1
          ) areEqualDates = true;
         
    } else {
        if ( 
            OBJ1.FechaSalida          === OBJ2.FechaSalida &&
            OBJ1.FechaLlegada         === OBJ2.FechaLlegada &&
            OBJ1.FechaEntrega         === OBJ2.FechaEntrega &&
            OBJ1.FechaVencimiento     === OBJ2.FechaVencimiento 
          ) areEqualDates = true;

    }

    return areEqualDates;

  }

  const valuesInputEqualToVIN = ( registro, checked ) => {

      const { isOnBD } = registro;

      if ( !isOnBD ) {
        
        manageRegisterNoOnBD( registro, checked );
        return;
      }


      const { FechaSalida, FechaLlegada, FechaEntrega, FechaVencimiento, PermisoDesvio } = registro;
      const { FechaSolicitudDPP, FechaDeEntregaDPP, FechaVencimientoDPP1 } = registro;
      
      if ( PermisoDesvio === "DPP" ) { //TODO: Agregar otra condicional: && checked === true

          if ( 
              FechaSalida.substring(0,10)          === writtendata.FechaSalida  || FechaSalida.substring(0,10)   === emptyDate && //const emptyDate = '1900-01-01';
              FechaLlegada.substring(0,10)         === writtendata.FechaLlegada || FechaLlegada.substring(0,10)  === emptyDate &&
              FechaEntrega.substring(0,10)         === writtendata.FechaEntrega || FechaEntrega.substring(0,10)  === emptyDate &&
              FechaVencimiento.substring(0,10)     === writtendata.FechaVencimiento || FechaVencimiento.substring(0,10) === emptyDate &&
              FechaSolicitudDPP.substring(0,10)    === writtendata.FechaSolicitudDPP &&
              FechaDeEntregaDPP.substring(0,10)    === writtendata.FechaDeEntregaDPP &&
              FechaVencimientoDPP1.substring(0,10) === writtendata.FechaVencimientoDPP1 
              ||
              checked === false
          ) {
            manageRegisterOnBD( registro, checked );

          } else {
            toast.info("Las fechas del VIN que intenta seleccionar no coinciden con los VINS seleccionados.")
          }
        
      } else {

          if ( 
              FechaSalida.substring(0,10)          === writtendata.FechaSalida &&
              FechaLlegada.substring(0,10)         === writtendata.FechaLlegada &&
              FechaEntrega.substring(0,10)         === writtendata.FechaEntrega &&
              FechaVencimiento.substring(0,10)     === writtendata.FechaVencimiento 
              ||
              checked === false
          ) {
            manageRegisterOnBD( registro, checked );

          } else {
            toast.info("Las fechas del VIN que intenta seleccionar no coinciden con los VINS seleccionados.")
          }

      }

  }

  const setDatesInputs = ( registro ) => {
    

    const { FechaSalida, FechaLlegada, FechaEntrega, FechaVencimiento, PermisoDesvio, FolioDPP, FolioDesvio } = registro;
    const { FechaSolicitudDPP, FechaDeEntregaDPP, FechaVencimientoDPP1 } = registro;

    if ( PermisoDesvio === "DPP" ) {

      setWrittendata({
        ...writtendata,
        PermisoDesvio        : PermisoDesvio,
        FolioDPP             : FolioDPP,
        FolioDesvio          : FolioDesvio, 
        FechaSalida          : FechaSalida.substring(0,10) === emptyDate ? "" : FechaSalida.substring(0,10), //-->
        FechaLlegada         : FechaLlegada.substring(0,10) === emptyDate ? "" : FechaLlegada.substring(0,10), //-->
        FechaEntrega         : FechaEntrega.substring(0,10) === emptyDate ? "" : FechaEntrega.substring(0,10), //-->
        FechaVencimiento     : FechaVencimiento.substring(0,10) === emptyDate ? "" : FechaVencimiento.substring(0,10), //-->
        FechaSolicitudDPP    : FechaSolicitudDPP.substring(0,10),
        FechaDeEntregaDPP    : FechaDeEntregaDPP.substring(0,10),
        FechaVencimientoDPP1 : FechaVencimientoDPP1.substring(0,10) 
      })
      permisoDesvioSelectRef.current.value = PermisoDesvio;

    } else {

      setWrittendata({
        ...writtendata,
        PermisoDesvio        : PermisoDesvio,
        FolioDPP             : "",
        FolioDesvio          : FolioDesvio, 
        FechaSalida          : FechaSalida.substring(0,10),
        FechaLlegada         : FechaLlegada.substring(0,10),
        FechaEntrega         : FechaEntrega.substring(0,10),
        FechaVencimiento     : FechaVencimiento.substring(0,10),
        FechaSolicitudDPP    : "",
        FechaDeEntregaDPP    : "",
        FechaVencimientoDPP1 : "" 
      })
      permisoDesvioSelectRef.current.value = PermisoDesvio;

    }

    setActiveInputDeploy( false );

  }

  const validateDates = ( takeVINSFolio ) => {
    let equalDates = false;

    if ( takeVINSFolio.length > 0 ) {
      const firstVIN = takeVINSFolio[0];

      if ( takeVINSFolio.length > 1 ) { 
        if ( hasEqualityDates( takeVINSFolio, firstVIN ) ) equalDates = true;
      } else equalDates = true;
      

    } /* No se encontró coincidencias con el folio tipado */

    return equalDates;
  }

  const validateIsVINDisabled = ( obj, FolioDesvioOrDPP, inputValue, equalDates, filterVINS ) => {
    let newList = []
    filterVINS.map((obj) => { newList.push(obj.VIN); })
    
    if ( equalDates && obj.isOnBD && newList.includes( obj.VIN ) ) return false;
    
    if ( !equalDates && obj.isOnBD && newList.includes( obj.VIN ) ) return false;
    
    if ( obj[FolioDesvioOrDPP] !== inputValue && obj.isOnBD ) return true;
    
    if ( obj.isOnBD ) return true;
    
    return false;
  }

  const validateIsVINSelected = ( obj, equalDates, filterVINS ) => {
    let newList = []
    filterVINS.map((obj) => { newList.push(obj.VIN); })

    if ( equalDates && obj.isOnBD && newList.includes( obj.VIN ) ) return true;
    if ( !equalDates && obj.isOnBD && newList.includes( obj.VIN ) ) { 
      
      return false;
    }
    if ( obj.isOnBD ) return true;
    return false;
  }

  const addListToVINSGenerados = ( updateVINS ) => {
    const VINSEnabledNoSelected = updateVINS.filter(( obj ) => obj.isOnBD && !obj.isVinSelected ) 
    return VINSEnabledNoSelected.length === 0 ? true : false;
  }

  const addFirstVINEditMode = ( registro ) => {
        setDatesInputs( registro ); 

        const updateVINS = VINClientes.map((obj) => {
          let newObj = { ...obj };
          if ( obj.VIN === registro.VIN ) {
            newObj = {
              ...obj,
              isVinSelected: true
            }
            return newObj;
          }
          return newObj;
        })

        if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
        if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);

        setVINClientes( updateVINS );
        setVINClientesGenerados([{
          ...registro,
          Cliente           : writtendata.Cliente,
          NumeroCliente     : writtendata.NumeroCliente,
          UbicacionCliente  : writtendata.UbicacionCliente
        }]);
  }

  const manageRegisterNoOnBD = ( registro, checked ) => {
    
    let cloneNewObj = {};

    const updateVINS = VINClientes.map(( row ) => {
      let newObj = { ...row };
      if ( row.VIN === registro.VIN ) {

          newObj = createNewObj( registro, checked );
          cloneNewObj = { ...newObj };
          return newObj;

      }
      return newObj;
    })

    if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( INCREMENTAR, registro.PrecioFactura, registro.isOnBD );

    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);

    setVINClientes( updateVINS );

    if ( !checked ) {

      const updateList = VINClientesGenerados.filter((row) => {
          return row.VIN !== registro.VIN
      })

      if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( DECREMENTAR, registro.PrecioFactura, registro.isOnBD );

      hasAllVINSDeselected( updateList, updateVINS, [] );
      setVINClientesGenerados(updateList)
      return;
    }

    setVINClientesGenerados([
      ...VINClientesGenerados,
      { 
        ...cloneNewObj,
        Cliente           : writtendata.Cliente,
        NumeroCliente     : writtendata.NumeroCliente,
        UbicacionCliente  : writtendata.UbicacionCliente 
      }
    ])

  }

  const manageRegisterNoOnBDAssignMode = ( registro, checked ) => {
    let cloneNewObj = {};

    const updateVINS = VINClientes.map((row) => {
      let newObj = { ...row };
      if ( row.VIN === registro.VIN ) {

          newObj = createNewObj( registro, checked );
          cloneNewObj = { ...newObj };
          return newObj;
      }
      return newObj;
    })

    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);
    setVINClientes( updateVINS );

    if ( !checked ) {

      const updateList = VINClientesGenerados.filter((row) => {
          return row.VIN !== registro.VIN
      })

      if ( updateList.length === 0 ) {
          // setInputsDefaultValues(); /* Modo asignar: todos vins vacios deseleccionados NO BORRAR LINEA */
      }

      setVINClientesGenerados(updateList)
      return;
    }

    setVINClientesGenerados([
      ...VINClientesGenerados,
      { 
        ...cloneNewObj,
        Cliente           : writtendata.Cliente,
        NumeroCliente     : writtendata.NumeroCliente,
        UbicacionCliente  : writtendata.UbicacionCliente 
      }
    ])    

  }

  const hasAllVINSDeselected = ( updateList, updateVINS, originalDates ) => {
    if ( updateList.length === 0 ) {
      
      const filterEmptyVINS = getEmptyVINS( updateVINS );

      if ( filterEmptyVINS.length > 0 )  setUpWithEmptyVINS( originalDates );

      if ( filterEmptyVINS.length === 0 )  setUpNoEmptyVINS();

    }
  }

  const manageRegisterOnBD = async ( registro, checked ) => {
      let originalDates = [];

      const { isVinModified, VIN } = registro;

      if ( isVinModified && !checked ) {
          
        url = ApiUrl + "api/dpp_contado/datesByVIN";
        originalDates = await axiosPostService( url, { VIN : VIN, Cliente : writtendata.NumeroCliente } );

      }

      const updateVINS = VINClientes.map((row) => {
        let newObj = { ...row };
        if ( row.VIN === registro.VIN ) {

          if ( originalDates.length > 0 ) return updatePropertiesToObject( originalDates[0], row, checked, false, false );

          return { 
            ...row, 
            isVinSelected: checked 
          }

        }

        return newObj;
      })

      if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
      if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);

      setVINClientes( updateVINS );

      if ( !checked ) {

          const updateList = VINClientesGenerados.filter((row) => {
              return row.VIN !== registro.VIN
          })

          hasAllVINSDeselected( updateList, updateVINS, originalDates ); //TODO: ENVIAR LA LISTA con el VIN actualizado de la BD. en caso de mod.

          setVINClientesGenerados(updateList)
          return;
      }

      setVINClientesGenerados([
        ...VINClientesGenerados,
        { 
          ...registro,
          Cliente           : writtendata.Cliente,
          NumeroCliente     : writtendata.NumeroCliente,
          UbicacionCliente  : writtendata.UbicacionCliente 
        }
      ])
  }

  const getOriginalDatesVINS = async ( VINSList, param ) => {
    let newList = [];
    url = ApiUrl + "api/dpp_contado/datesByVIN";
    let client = writtendata.NumeroCliente;

    for (const obj of VINSList) {
      let newObj = {}
      let originalDates = await axiosPostService( url, { VIN: obj.VIN, Cliente: client } );
      // let {  } = originalDates[0];
      newObj = param === 'withEmptyVINS' ? updatePropertiesToObject( originalDates[0], obj, true, true, false ) : updatePropertiesToObject( originalDates[0], obj, false, false, false );
      newList.push(newObj);
      
    }

    return newList;

  }

  const changeSelectionMode = ( equalDates, VINClientes ) => {
    if ( equalDates ) {
      setSelectionMode( Modificar );
      return;
    }

    const filterEmptyVINS = VINClientes.filter((obj) => obj.isOnBD === false );
    if ( filterEmptyVINS.length === 0 ) setSelectionMode( Modificar );
    else setSelectionMode( Asignar );
  }

  const hasInputsDefaultValues = () => {
    let assertValidation = false;
    const { FechaSalida, FechaLlegada, FechaEntrega, FechaVencimiento, PermisoDesvio } = writtendata;
    const { FechaVencimientoDPP1, FechaSolicitudDPP, FechaDeEntregaDPP } = writtendata;
  
    if ( PermisoDesvio === "DPP" ) {

      if ( 
        
        FechaVencimientoDPP1 === "" ||
        FechaSolicitudDPP    === "" ||
        FechaDeEntregaDPP    === ""   
       ) assertValidation = true;

    } else {

      if ( 
        FechaSalida          === "" || 
        FechaLlegada         === "" || 
        FechaEntrega         === "" || 
        FechaVencimiento     === "" 
       ) assertValidation = true;

    }

    return assertValidation;

  }

  const setUpWithEmptyVINS = ( originalDates ) => {

    setInputsDefaultValues();
    setSelectionMode( Asignar );
    setActiveInputDeploy( true );

    const updateVINS = VINClientes.map((obj) => {

        if ( obj.isOnBD ) {
         
          if ( obj.isVinModified ) return updatePropertiesToObject( originalDates[0], obj, true, true, false );

          return {
            ...obj,
            isDisabled    : true,
            isVinSelected : true
          }

        }

        return {
          ...obj,
          isVinSelected        : false,
          FechaEntrega         : "",
          FechaDeEntregaDPP    : "",
          FechaLlegada         : "",
          FechaSalida          : "",
          FechaVencimiento     : "",
          FechaVencimientoDPP1 : "",
          FechaSolicitudDPP    : "",
          FolioDPP             : "",
          FolioDesvio          : "",
          PermisoDesvio        : "",
          Observaciones        : "",
        }
    })

    if ( isExcelAndPrintButtonEneabled ) setIsExcelAndPrintButtonEneabled( false );
    if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);

    setVINClientes( updateVINS );

  }

  const existVINSNoOnBDSelected = () => {
    const filterVINS = VINClientes.filter((row) => row.isVinSelected === true && row.isOnBD === false)
    return filterVINS.length > 0 ? true : false;
  }

  const existVINSOnBDSelected = () => {
    const filterVINS = VINClientes.filter((row) => row.isVinSelected === true && row.isOnBD === true && row.isDisabled === false);
    return filterVINS.length > 0 ? true : false;
  }

  const existEmptyVINS = () => {
    const filterVINS = VINClientes.filter((row) => !row.isOnBD );
    return filterVINS.length > 0 ? true : false;
  }

  const setUpNoEmptyVINS = () => {

    setInputsDefaultValues();
    setActiveInputDeploy( true );

  }

  const setInputsDefaultValues = () => {
    const { current } = permisoDesvioSelectRef;
    const { value } = current;

      setWrittendata({
        ...writtendata,
        PermisoDesvio         : value,
        FolioDesvio           : "",
        FechaSalida           : "",
        FechaLlegada          : "",
        FechaEntrega          : "",
        FechaVencimiento      : "",
        FechaVencimientoDPP1  : "", 
        FolioDPP              : "",
        FechaSolicitudDPP     : "",
        Observaciones         : "",
        FechaDeEntregaDPP     : "",
        PlazoDiasNaturales    : 0
      })

  }

  const createNewObj = ( registro, checked ) => {
    const { current } = permisoDesvioSelectRef;
    const { value } = current;

    if ( checked ) {
        if ( value === "DPP" ) {
            return { 
              ...registro, 
              isVinSelected         : checked,
              FechaSalida           : writtendata.FechaSalida,
              FechaLlegada          : writtendata.FechaLlegada,
              FechaEntrega          : writtendata.FechaEntrega,
              FechaVencimiento      : writtendata.FechaVencimiento,
              FechaSolicitudDPP     : writtendata.FechaSolicitudDPP,
              FechaDeEntregaDPP     : writtendata.FechaDeEntregaDPP,
              FechaVencimientoDPP1  : writtendata.FechaVencimientoDPP1,
              PermisoDesvio         : value,
              Observaciones         : writtendata.Observaciones,
              FolioDesvio           : writtendata.FolioDesvio,
              FolioDPP              : writtendata.FolioDPP
            }
        
        } 
        return {
            ...registro, 
            isVinSelected         : checked,
            FechaSalida           : writtendata.FechaSalida,
            FechaLlegada          : writtendata.FechaLlegada,
            FechaEntrega          : writtendata.FechaEntrega,
            FechaVencimiento      : writtendata.FechaVencimiento,
            FechaSolicitudDPP     : '',
            FechaDeEntregaDPP     : '',
            FechaVencimientoDPP1  : '',
            PermisoDesvio         : value,
            Observaciones         : writtendata.Observaciones,
            FolioDesvio           : writtendata.FolioDesvio,
        }
     
    }

    if ( !checked ) {
      if ( value === "DPP" ) {
          return { 
            ...registro, 
            isVinSelected         : checked,
            FechaSalida           : '',
            FechaLlegada          : '',
            FechaEntrega          : '',
            FechaVencimiento      : '',
            FechaSolicitudDPP     : '',
            FechaDeEntregaDPP     : '',
            FechaVencimientoDPP1  : '',
            PermisoDesvio         : '',
            Observaciones         : '',
            FolioDesvio           : '',
            FolioDPP              : ''
          }
    
      } 

      return {
          ...registro, 
          isVinSelected         : checked,
          FechaSalida           : '',
          FechaLlegada          : '',
          FechaEntrega          : '',
          FechaVencimiento      : '',
          FechaSolicitudDPP     : '',
          FechaDeEntregaDPP     : '',
          FechaVencimientoDPP1  : '',
          PermisoDesvio         : '',
          Observaciones         : '',
          FolioDesvio           : '',
      }

    }  
  }

  const updatePropertiesToObject = ( 
    originalDates, 
    registro, 
    checked, 
    isDisabled = false, 
    isVinModified = false 
    ) => {
    const { 
      PermisoDesvio, 
      FechaDeEntregaDPP, 
      FechaEntrega, 
      FechaLlegada,
      FechaSalida,
      FechaVencimiento, 
      FechaSolicitudDPP,
      FechaVencimientoDPP1,
      Observaciones, 
      FolioDPP,
      FolioDesvio
    } = originalDates;


    if ( PermisoDesvio === "DPP" ) {
      return {
        ...registro,
        isVinSelected         : checked,
        isDisabled            : isDisabled,
        isVinModified         : isVinModified, 
        FechaSalida           : FechaSalida.substring(0,10),
        FechaLlegada          : FechaLlegada.substring(0,10),
        FechaEntrega          : FechaEntrega.substring(0,10),
        FechaVencimiento      : FechaVencimiento.substring(0,10),
        FechaSolicitudDPP     : FechaSolicitudDPP.substring(0,10),
        FechaDeEntregaDPP     : FechaDeEntregaDPP.substring(0,10),
        FechaVencimientoDPP1  : FechaVencimientoDPP1.substring(0,10),
        PermisoDesvio         : PermisoDesvio,
        Observaciones         : Observaciones,
        FolioDesvio           : FolioDesvio,
        FolioDPP              : FolioDPP
      }
    }

    return {
      ...registro,
      isVinSelected         : checked,
      isDisabled            : isDisabled,
      isVinModified         : isVinModified, 
      FechaSalida           : FechaSalida.substring(0,10),
      FechaLlegada          : FechaLlegada.substring(0,10),
      FechaEntrega          : FechaEntrega.substring(0,10),
      FechaVencimiento      : FechaVencimiento.substring(0,10),
      FechaSolicitudDPP     : '',
      FechaDeEntregaDPP     : '',
      FechaVencimientoDPP1  : '',
      PermisoDesvio         : PermisoDesvio,
      Observaciones         : Observaciones,
      FolioDesvio           : FolioDesvio,

    }
  }

  const getEmptyVINS = ( list ) => {
    return list.filter((row) => row.isOnBD === false && row.isVinSelected === false && row.isDisabled === false);
  }

  const modifiedPropertyOnVINS = ( value, name ) => {

    if ( VINClientesGenerados.length === 0 ) return;

    const updateVINSClientes = VINClientes.map((obj) => {
      if ( obj.isVinSelected && !obj.isDisabled ) {
        return {
          ...obj,
          [name] : value,
          isVinModified: true
        }
      }
      return {
        ...obj
      }
    })

    const updateVINSClientesGenerados = VINClientesGenerados.map((obj) => {
        return {
          ...obj,
          [name] : value,
          isVinModified: true
        }
    })

    setVINClientes( updateVINSClientes );
    setVINClientesGenerados( updateVINSClientesGenerados );

  }

  const replaceDatesConfirm = async ( VIN ) => {  
      let confirm = true;
      await swal({
          text:`El VIN ${ VIN } ya tiene datos asignados
          ¿Desea remplazarlos?`,
          icon:"info",
          // buttons:["No","Si"]
          buttons:["Si","No"]
          }).then( respuesta => {
          if ( respuesta ) confirm = false;
      })
      return confirm;
  }

  const rellenarFechasTemporal = () => {
    setWrittendata({
      ...writtendata,
      FechaSalida           : "2023-01-02",
      FechaLlegada          : "2023-01-02",
      FechaEntrega          : "2023-01-02",
      FechaVencimiento      : "2023-01-02",
      FechaVencimientoDPP1  : "2023-01-02", 
      FechaSolicitudDPP     : "2023-01-02",
      FechaDeEntregaDPP     : "2023-01-02",
    })
  }

  const analizeSelectionVINSEditMode = ( checked, firstVINSelectedFound ) => {
      // (CON EMPTY VINS) //TODO:
      /* stage 1: 
        - tiene que existir por lo menos 1 vin seleccionado. ## 1 
        - tomar el primer VIN seleccionado que contenga las banderas: isOnBD:true, isDisabled:false, isVinSelected:true ## 2
        - extraer las fechas del VIN tomado en el paso anterior. ( aplicar esto al momento de recorrer la lista; en la función que se llamará ) ##3
        - recorrer la lista, comparar las fechas a los VINS que contengan las banderas: isOnBD:true, isDisabled:false, isVinSelected:false (si coinciden, seleccionarlo.) ##4
        - tomar el VIN en una lista adicional con un push(), agregarlo a la lista de VINSGenerados.  let temporalList = [] ##5
      */
        let temporalList = []
        /* const firstVINSelectedFound = VINClientes.find((obj) => obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === true ) //##2

        if ( firstVINSelectedFound === undefined ) return //##1 */

        const updateVINSClientes = VINClientes.map((obj) => {

          if ( obj.VIN === firstVINSelectedFound.VIN ) {
            temporalList.push(obj)
            setDatesInputs( firstVINSelectedFound );
            return {
              ...obj,
              isVinSelected: true
            }

          } 

          if ( obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === false ) {
            if ( compareDatesTwoVINS( obj, firstVINSelectedFound ) ) { // ##3 ,##4
              temporalList.push(obj) //##5
              return {
                ...obj,
                isVinSelected : true
              } 
            } 
          }

          return obj;
        })
        setVINClientes( updateVINSClientes );
        
        const VINSOnListRemoved = VINClientesGenerados.filter((obj) =>  temporalList.find(row => row.VIN === obj.VIN ) === undefined );

        const mergeLists = [ ...VINSOnListRemoved, ...temporalList ].map((obj) => {
          return {
            ...obj,
            Cliente           : writtendata.Cliente,
            NumeroCliente     : writtendata.NumeroCliente,
            UbicacionCliente  : writtendata.UbicacionCliente
          }
        })

        setVINClientesGenerados( mergeLists );
        setCheckAll( checked )

  }

  const analizeDeselectionVINSEditMode = async ( checked , param ) => {
    const filterVINSModified = VINClientes.filter((obj) => obj.isVinModified );
    let VINSWithOriginalDates = await getOriginalDatesVINS( filterVINSModified, param );

    let updateVINS = [];

    if ( param === 'withEmptyVINS' ) {

       updateVINS = VINClientes.map((obj) => {
        if ( obj.isOnBD === true ) { //&& obj.isDisabled === false
          if ( obj.isVinModified ) {
            return VINSWithOriginalDates.find((row) => row.VIN === obj.VIN );
          }

          return { ...obj, isDisabled: true, isVinSelected: true }
        }

        // return { ...obj }  ========¿¿APLICAR DESCUENTO AL CREDITO DEL CLIENTE??==================================
        return createNewObj( obj, checked );  
      })

    }

    if ( param === 'noEmptyVINS' ) { 
      updateVINS = VINClientes.map((obj) => {
        if ( obj.isOnBD === true && obj.isDisabled === false && obj.isVinSelected === true ) {
          if ( obj.isVinModified ) {
            return VINSWithOriginalDates.find((row) => row.VIN === obj.VIN );
          }
          return { ...obj, isDisabled: false, isVinSelected: false }
        }
        return { ...obj }  
      })

    }


    setVINClientes( updateVINS );
    setVINClientesGenerados([]);
    setActiveInputDeploy(true);
    ( param === 'withEmptyVINS' ) && setSelectionMode(Asignar);
    setInputsDefaultValues();
    setCheckAll( checked )
  }

  const analizeSelectionVINSAsignMode = ( checked ) => {
      let sumatoriaPrecioFactura = 0;

      if ( hasInputsDefaultValues() ) {
        toast.info("Favor de colocar las fechas antes de seleccionar los VINS."); 
        checkBoxSelectedAll.current.checked = !checked;
        if ( checkAll ) setCheckAll( false );
        return;
      }

      const updateVINSList = VINClientes.map((row) => {

        if ( (row.isOnBD === false ) && (row.PrecioFactura !== 0) ) {
          if ( (checked && ! row.isVinSelected) || (! checked && row.isVinSelected) ) sumatoriaPrecioFactura += row.PrecioFactura //this result will be increased or decreased.
        }

        if ( row.isDisabled === false && row.isOnBD === false && row.isVinSelected === false ) {
          return createNewObj( row, checked );
        }

        return {
          ...row
        }

      })

      //TODO: acceder a la función si y sólo si: hasCreditThisClient is true
      if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( checked ? INCREMENTAR : DECREMENTAR , sumatoriaPrecioFactura, false )

      setVINClientes( updateVINSList );

      const VINSNoOnBD =  updateVINSList.filter((row) => !row.isOnBD );
      const VINSOnListRemoved = VINClientesGenerados.filter((obj) =>  VINSNoOnBD.find(row => row.VIN === obj.VIN ) === undefined );

      const mergeLists = [ ...VINSOnListRemoved, ...VINSNoOnBD ].map((obj) => {
        return {
          ...obj,
          Cliente           : writtendata.Cliente,
          NumeroCliente     : writtendata.NumeroCliente,
          UbicacionCliente  : writtendata.UbicacionCliente
        }
      })

      setVINClientesGenerados( mergeLists );
      setCheckAll( checked )
  }

  const analizeDeselectionVINSAssignMode = ( checked ) => {
    let sumatoriaPrecioFactura = 0;

    const updateVINSlist = VINClientes.map((obj) => {
      if ( (obj.isOnBD === false ) && (obj.PrecioFactura !== 0) ) {
        if ( (checked && ! obj.isVinSelected) || (! checked && obj.isVinSelected) ) sumatoriaPrecioFactura += obj.PrecioFactura //this result will be increased or decreased.
      }

      if ( !obj.isOnBD ) {
        return createNewObj( obj, checked );
      }
      return {
        ...obj
      }
    })
    
    //TODO: acceder a la función si y sólo si: hasCreditThisClient is true
    if ( writtendata.PermisoDesvio === "DPP" ) ( hasCreditThisClient ) && calcularIndicadoresCredito( checked ? INCREMENTAR : DECREMENTAR , sumatoriaPrecioFactura, false )
    setVINClientes( updateVINSlist );

    const updateVINSGenerados = VINClientesGenerados.filter((obj) => obj.isOnBD );
    setVINClientesGenerados( updateVINSGenerados );
    setCheckAll( checked );
  }

  return (
    <>
      <div className="row mr-4 ">
        <div className="col-6"></div>
        <div className="col-6">
          <div className="d-flex flex-row-reverse">
            {/* <button
            onClick={ rellenarFechasTemporal }
            name=''
            title=''
            type='button'
            className="btn btn-warning btn-sm mt-2 mb-2 ml-2"
            
            >
              rellenarFechas
            </button> */}
            <button
            onClick={ onExportToPlanDPP }
            name='PlanDPP'
            title='PLAN DPP'
            type='button'
            className="btn btn-outline-success btn-sm mt-2 mb-2 ml-2"
            disabled={( VINClientesGenerados.length === 0 ) || ( writtendata.PermisoDesvio === Contado )}
            // disabled
            >
              <FontAwesomeIcon icon={faFileExcel} />
            </button>
            <button
            onClick={ onExportToPermisoDesvio }
            name='PermisoDesvio'
            title='PERMISO DESVÍO'
            type='button'
            className="btn btn-outline-success btn-sm mt-2 mb-2 ml-2"
            disabled={( VINClientesGenerados.length === 0 )}
            // disabled
            >
              <FontAwesomeIcon icon={faFileExcel} />
          </button>
          </div>
        </div>
      </div>
      <div className="row m-2">
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Folio Desvío: </h6>
              
              <input 
                className='input-class width__label-input mt-2' 
                type="text" 
                name="FolioDesvio" 
                value={writtendata.FolioDesvio} 
                onChange={OnChange}
                onBlur={OnBlur}
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                tabIndex={3}
                autoComplete="off"
              />

          </div>
        </div>
        <div className="col-6">

          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                
                <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
                
                <select 
                  className='form-select select-class-1 width__label-input mt-2' 
                  disabled={!updateVentasFlotillasDMSTable || isPreviewTable}
                  onChange={(e) => changeSelectClientes(e)} 
                  tabIndex={1}
                >
                  {
                    clientes
                    .map(cliente => {
                      return (
                        <option 
                        value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}|${cliente.Razon_social}`} 
                        >
                            {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                        </option>
                      )
                    })
                  }
                </select>

          </div>

          
        </div>
      </div>
      <div className="row m-2">
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Fecha Salida: </h6>
              
              <input 
                className='input-class width__label-input mt-2' 
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                min="2022-01-01"
                name="FechaSalida" 
                onChange={OnChange}
                tabIndex={4}
                type="date" 
                value={writtendata.FechaSalida} 
              />
              
          </div>
          
        </div>
        <div className="col-6" >
          
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              <h6 className='mr-4 width__label-input-min'>Orden Compra: </h6>
              <select 
                name='ordenDeCompra' 
                className='form-select select-class-1 width__label-input mt-2' 
                tabIndex={2} 
                onChange={OnChange}
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
              >
                {
                  ordenesDeCompra.map( orden => {
                    return (
                      <option value={orden.OrdenCompra}>
                        { orden.OrdenCompra }
                      </option>
                    )
                  })
                }
              </select>
          </div>
        </div>
      </div>
      <div className="row m-2">
        
        <div className="col-6" >
          {/* foliodesvio */}
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              <h6 className='mr-4 width__label-input-min'>Fecha Llegada: </h6>
              <input 
                className='input-class width__label-input' 
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                min="2022-01-01"
                name="FechaLlegada" 
                onChange={OnChange}
                tabIndex={5}
                type="date" 
                value={writtendata.FechaLlegada} 
              />
          </div>
        </div>

        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              <h6 className='mr-4 width__label-input-min'>Permiso Desvío:</h6>
              <select 
                className='form-select select-class-1 width__label-input mt-2' 
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                name='PermisoDesvio' 
                onChange={OnChange}
                ref={permisoDesvioSelectRef}
                tabIndex={2} 
              >
                    <option value="DPP"> DPP </option>
                    <option value="Contado"> Contado </option>
              </select>
          </div>
        </div>

      </div>
      <div className="row m-2">
        <div className="col-6" >
        
          
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Fecha Entrega: </h6>

              <input 
                className='input-class width__label-input mt-2' 
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                min="2022-01-01"
                name="FechaEntrega" 
                onChange={OnChange}
                tabIndex={6}
                type="date" 
                value={writtendata.FechaEntrega} 
              />
          </div>

          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              
              <h6 className='mr-4 width__label-input-min'>Fecha Vencimiento F.: </h6>
              <input 
                className='input-class width__label-input mt-2' 
                disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                min="2022-01-01"
                name="FechaVencimiento" 
                onChange={OnChange}
                tabIndex={7}
                type="date" 
                value={writtendata.FechaVencimiento} 
              />

          </div>
          
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            
            <h6 className='mr-4 width__label-input-min'>Observaciones: </h6>
            
            <input 
              autoComplete="off"
              className='input-class width__label-input mt-2' 
              disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
              name="Observaciones" 
              onChange={OnChange}
              tabIndex={8}
              type="text" 
              value={writtendata.Observaciones} 
            />

          </div>
          
        </div>
        {
          writtendata.PermisoDesvio === "DPP" &&
          <div className="col-6" >
            
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4 ">
                <h6 className='mr-4 width__label-input-min'>Folio DPP: </h6>
                <input 
                  className='input-class width__label-input mt-2' 
                  type="text" 
                  name="FolioDPP" 
                  value={writtendata.FolioDPP} 
                  onChange={OnChange}
                  onBlur={OnBlur}
                  tabIndex={8}
                  autoComplete="off"
                  disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                />
            </div>
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4 ">
              <h6 className='mr-4 width__label-input-min'>Fecha Solicitud DPP: </h6>
                <input 
                  className='input-class width__label-input mt-2' 
                  type="date" 
                  name="FechaSolicitudDPP" 
                  value={writtendata.FechaSolicitudDPP} 
                  onChange={OnChange}
                  disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                  tabIndex={9}
                  min="2022-01-01"
                />
            </div>
            
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                <h6 className='mr-4 width__label-input-min'>Fecha De Entrega DPP: </h6>
                <input 
                  className='input-class width__label-input mt-2' 
                  type="date" 
                  name="FechaDeEntregaDPP" 
                  value={writtendata.FechaDeEntregaDPP} 
                  onChange={OnChange}
                  disabled={ !updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0 }
                  // tabIndex={9}
                  min="2022-01-01"
                />
            </div>
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                <h6 className='mr-4 width__label-input-min'>Plazo (Días Naturales): </h6>
                <input 
                  autoComplete='off'
                  className="input-class width__label-input mt-2" 
                  // style={{height:'20px', fontSize:18}}
                  name="PlazoDiasNaturales" 
                  onChange={ OnChange } 
                  onBlur={ OnBlurDiasNaturales }
                  type="number"
                  disabled={ writtendata.FechaDeEntregaDPP === "" || !updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0} 
                  // value={porcentajeEnganche} 
                />
            </div>
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                <h6 className='mr-4 width__label-input-min'>Fecha Vencimiento DPP: </h6>
                <input 
                  className='input-class width__label-input mt-2' 
                  type="date" 
                  name="FechaVencimientoDPP1" 
                  value={writtendata.FechaVencimientoDPP1} 
                  onChange={OnChange}
                  min="2022-01-01"
                  tabIndex={8}
                  // disabled={!updateVentasFlotillasDMSTable || isPreviewTable || ordenesDeCompra.length === 0}
                  disabled
                />
            </div>
          
        </div>
        }
      </div>

      {
        writtendata.PermisoDesvio === "DPP" &&
        <div className="row ml-2">
          <div className="col-4">
            <table className='table table-sm table-bordered table-striped compact' style={{ width:'88%' }}>
              <tbody>
                <tr style={{backgroundColor:'lightskyblue' }}>
                  <td style={{width:'55%'}}>Límite crédito Actual: </td>
                  <td style={{width:'45%'}} >
                    <div className="row d-flex justify-content-between ml-2 mr-2">
                      <div>
                      $
                      </div>
                      <div>
                      { new Intl.NumberFormat('es-MX').format(IndicadoresCliente.LimiteCreditoActual) }
                      </div>
                    </div>
                  </td>
                </tr>
                <tr style={{backgroundColor:'lightskyblue' }}>
                  <td>Monto VINS Seleccionados: </td>
                  <td>
                    <div className="row d-flex justify-content-between ml-2 mr-2">
                      <div>
                        $
                      </div>
                      <div>
                        { new Intl.NumberFormat('es-MX').format(IndicadoresCliente.MontoVINSSeleccionados) }
                      </div>
                    </div>
                  </td>
                </tr>
                <tr style={{backgroundColor:'mediumaquamarine' }}>
                  <td>Nuevo Límite de Crédito: </td>
                  <td>
                    <div className="row d-flex justify-content-between ml-2 mr-2">
                      <div>
                        $
                      </div>
                      <div>
                       { new Intl.NumberFormat('es-MX').format(IndicadoresCliente.NuevoLimiteCredito) }
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }


      {
        !updateVentasFlotillasDMSTable &&
          <div className="row m-2">
            <div className="col">
              <strong>Cargando...</strong>
              <div className="spinner-border ml-4" role="status" aria-hidden="true"></div>
            </div>
          </div>
      }

      <div className="row m-2 d-flex justify-content-between">
        <h6 className='ml-2'>Seleccionar VIN's que integran el permiso de desvío</h6>
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        onClick={onGenerateTable}
        disabled={VINClientesGenerados.length === 0}
        >
          { isPreviewTable ? 'Regresar' : 'Vista Previa'}
        </button>
      </div>
      {
        !isPreviewTable
        && 
        <div className="row m-2">
          <div className='table-responsive'>
          <table className='table display compact' style={{fontSize:11}}>
            <thead style={{backgroundColor:'#1565C0', color:'white'}}>
              <tr className='text-center' style={{borderBottom:'2px solid #1565C0'}}>
                <th></th> 
                <th>
                  <div style={{paddingBottom:'10px', paddingTop:'0px', paddingLeft:'25px'}}>
                  <input 
                  style={{position:'sticky'}} 
                  className="form-check-input" 
                  name="vin_selected_all" 
                  onChange={ handleVinSelectedAll }
                  type="checkbox" 
                  value="vin_selected_all"
                  ref={ checkBoxSelectedAll }
                  disabled={ VINClientes.length === 0 } 
                  // disabled 
                  />
                  </div>
                </th> 
                <th></th> <th></th> <th></th> 
                <th></th> <th></th> <th></th> <th></th>
                <th></th> <th></th> <th></th> <th></th>
                
                {writtendata.PermisoDesvio === "DPP" && <><th></th><th></th><th></th><th></th></>}
              </tr>
              <tr className='text-center' style={{borderTop:'3px solid #1565C0'}}>
                <th className='noselect' style={{fontSize:11}}>#</th>
                <th>
                  {`Seleccionar VINS (${VINClientesGenerados.length})`}
                </th>
                <th>VIN</th>
                <th>Permiso Desvio</th>
                <th>Folio Desvio</th>
                <th>Fecha Salida</th>
                <th>Fecha Llegada</th>
                <th>Fecha Entrega</th>
                <th>Fecha Vencimiento</th>
                {
                  writtendata.PermisoDesvio === "DPP" && 
                  <>
                    <th>Folio DPP</th>
                    <th>Fecha Solicitud DPP</th>
                    <th>Fecha Entrega DPP</th>
                    <th>Fecha Vencimiento DPP</th>
                  </>
                }
                <th>Orden Compra</th>
                <th>Folio Compra</th>
                <th>Precio Factura</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody style={{backgroundColor:'#FFFFE0'}}>{/* #FFFACD */}
            {
              VINClientes.length 
              > 0 ?
              VINClientes
              .map((registro, index) => {
                return (
                  <tr className='text-center'>
                    <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>
                    <td>
                    <div style={{paddingLeft:'25px'}}>
                      <input 
                        style={{position:'sticky'}}
                        checked={registro.isVinSelected} 
                        className="form-check-input" 
                        name="vin_selected" 
                        onChange={( e ) => handleVinSelected( e, registro )}
                        type="checkbox" 
                        value="vin_selected"
                        disabled={ registro.isDisabled } 
                      />
                    </div>
                    </td>
                    <td>{registro.VIN}</td>
                    <td>{ upperCase( registro.PermisoDesvio ) }</td>
                    <td>{ upperCase( registro.FolioDesvio ) }</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaSalida))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaLlegada))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaEntrega))}</td>
                    <td>{validarFecha(isDefaultDate(registro.FechaVencimiento))}</td>
                    {
                      writtendata.PermisoDesvio === "DPP" && 
                      <>
                        <td>{ upperCase( registro.FolioDPP ) }</td>
                        <td>{validarFecha(isDefaultDate(registro.FechaSolicitudDPP))}</td>
                        <td>{validarFecha(isDefaultDate(registro.FechaDeEntregaDPP))}</td>
                        <td>{validarFecha(isDefaultDate(registro.FechaVencimientoDPP1))}</td>
                      </>
                    }
                    <th class="font-weight-normal">{ upperCase( registro.OrdenDeCompra ) }</th>
                    <th class="font-weight-normal">{ upperCase( registro.Folio_compra_contrato ) }</th>
                    <th class="font-weight-normal">{ new Intl.NumberFormat('es-MX').format(registro.PrecioFactura) }</th>
                    <th class="font-weight-normal">{ upperCase( registro.Observaciones ) }</th>
                  </tr>
                )
              })
              :
              <tr className='p-2'>
                  <td>No existen registros para el cliente seleccionado.</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {writtendata.PermisoDesvio === "DPP" && <><td></td><td></td><td></td><td></td></>}
              </tr>
            }
            </tbody>
          </table>
          {/* <h6 style={{color:'red',fontWeight:'bold'}}>{ JSON.stringify( selectionMode ) }</h6>  */}
          </div>
      </div>
      }

      <TablaPermisoDesvio
        agencia={agencia}
        data={VINClientesGenerados}
        isPreviewTable={isPreviewTable}
        handleGuardarPermisoDesvio={handleGuardarPermisoDesvio}
        valorPermisoDesvio={writtendata.PermisoDesvio}
        nombreCliente={writtendata.Cliente}
        isExcelAndPrintButtonEneabled={isExcelAndPrintButtonEneabled}
        IndicadoresCliente={IndicadoresCliente}
        VINSGeneratedinBD={VINSGeneratedinBD} />
      
      <div className="row m-2">
        <button 
        type='button' 
        className='btn btn-info mt-2 mb-2' 
        onClick={onGenerateTable} 
        disabled={VINClientesGenerados.length === 0}
        >
          { isPreviewTable ? 'Regresar' : 'Vista Previa'}
        </button>
      </div>
      
    </>
  )
}

export default DatosDPP1