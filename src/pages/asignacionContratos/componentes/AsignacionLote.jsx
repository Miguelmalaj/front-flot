import React,{ useState, useEffect, useRef } from 'react'

import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

import { ApiUrl } from '../../../services/ApiRest';
import { getAgencia } from '../../../helpers/getAgencia';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { LoteVehiculosTable } from './reactToPrint/LoteVehiculosTable';
import { invertirCadenaFecha, FechaDeHoyYYMMDD } from '../../../helpers/fecha';
import { validarFecha, isDefaultDate } from '../../../helpers/fecha';
import { isADotValue, hasPointTheInputValue, isNumber, getTotalPoints } from '../../../helpers/validarInputs';
import { ValidTwoDecimals, removerComas } from '../../../helpers/formatoMoneda';
import '../../../css/asignacionContratos/asignacionLote/asignacionLote.css'
import { upperCase } from '../../../helpers/converToUpperCase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCheck, faCancel } from '@fortawesome/free-solid-svg-icons';
/* Nota: Nombre Bloque es conocido en la interfaz gráfica, Nombre lote es conocido en la base de datos  */
const defaultDate = '1900-01-01'
const tasa = 5;

const AsignacionLote = ({ 
  agencia, 
  Folio_lote, 
  clientes, 
  incrementarFolioLote,
  updateMainValues,
  fatherInputs 
}) => {

  const [VINClientes, setVINClientes] = useState([])
  const [updateVentasFlotillasDMSTable, setUpdateVentasFlotillasDMSTable] = useState(true)
  const [VINClientesGenerados, setVINClientesGenerados] = useState([])
  const [NombresLoteCliente, setNombresLoteCliente] = useState([])
  const [isShowedTable, setIsShowedTable] = useState(false)
  const [isEditMode, setisEditMode] = useState(true)
  const [isActiveButtonGuardarLote, setIsActiveButtonGuardarLote] = useState(true)
  const [isActiveButtonActualizarLote, setisActiveButtonActualizarLote] = useState(false)
  const [Folio_lote_edit, setFolio_lote_edit] = useState(-1)
  const [nombreCliente, setNombreCliente] = useState("")
  const [ubicacionState, setUbicacionState] = useState("")
  const [nombreLoteState, setNombreLoteState] = useState("")
  const [NumCliente, setNumCliente] = useState(0)
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(tasa);
  const [inputsObject, setInputsObject] = useState({
    NombreCliente       : "", 
    NombreLote          : "",
    Ubicacion           : "",
    numCliente          : 0,
    FechaFirmaContrato  : ""
  })
  const [checkAll, setCheckAll] = useState(false);
  const [editBloq, setEditBloq] = useState(false);
  const [nameEditBloq, setNameEditBloq] = useState('');

  const checkBoxSelectedAll = useRef();
  const clientsSelect       = useRef();
  const folioLoteSelect     = useRef();
  const currentFolio        = useRef(0);
  const helperRef           = useRef(false);

  let url = '';
  const vin_selected = 'vin_selected'
  
  useEffect( () => {

    if ( clientes.length > 0 ) {
      
      getNombresLoteCliente( clientes[0], true );
      
    }

  }, [clientes])


  useEffect(() => {

    if ( NombresLoteCliente.length > 0 && helperRef.current ) {

        folioLoteSelect.current.value = currentFolio.current;
        helperRef.current = false;
        currentFolio.current = 0;

    }

  }, [NombresLoteCliente])
  
  

  useEffect(() => {
    if ( ! isShowedTable ) {
      checkBoxSelectedAll.current.checked = checkAll;
    }
  }, [isShowedTable])
  
  
  useEffect(() => {

    updateMainValues( inputsObject );

  }, [inputsObject])
  

  const getLoteCliente = async (Folio_lote, Nombre_corto, NumCliente, Ubicacion) => {

    setFolio_lote_edit( Folio_lote )
    url = ApiUrl + "api/getLoteCliente";
    const body_lote = { agencia: agencia, Folio_lote: Folio_lote, NumCliente: NumCliente };
    const vins_lote = await axiosPostService( url, body_lote );

    url = ApiUrl + "api/getvinscliente";
    const body_cliente = { Agencia: agencia, Nombre_cliente: Nombre_corto, Folio_lote: Folio_lote, NumCliente: NumCliente };
    const total_vines_cliente = await axiosPostService( url, body_cliente )
    
    if ( total_vines_cliente.length === 0 ) {
      toast('No existen registros en la Base de Datos para el cliente seleccionado.')
      return;
    }
    
    const add_properties_total_vines_cliente = addBooleansVariables( total_vines_cliente, Nombre_corto );

    mergeVinsLoteVinsCliente(vins_lote, add_properties_total_vines_cliente, Nombre_corto, Ubicacion, NumCliente);

  }

  const addBooleansVariables = ( total_vines_cliente, Nombre_corto ) => {
    let add_properties_total_vines_cliente = total_vines_cliente.map((objcliente) => {
      let newObj = {
        ...objcliente,
        Marca        : 'CHEVROLET', 
        Distribuidor : 'CULIACAN MOTORS SA DE CV',
        vinSelected  : false, 
        vinBlocked   : false,
        cliente      : Nombre_corto 
      }
      return newObj
    })
    return add_properties_total_vines_cliente;
  }

  const mergeVinsLoteVinsCliente = ( vins_lote, total_vines_cliente, Nombre_corto, Ubicacion, NumCliente ) => {

    let VinsEnLote = []

    const merged_vins = total_vines_cliente.map((objcliente) => {

      const findVinInLote = vins_lote.find(objlote => objlote.VIN === objcliente.VIN);

      const newObjCliente = isVinInLote(objcliente, findVinInLote, Nombre_corto);

      if ( findVinInLote !== undefined ) VinsEnLote.push(newObjCliente);

      return newObjCliente;

    })

    if( checkBoxSelectedAll.current?.checked !== null ) {
      if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
      
    }

    const valor_nombre_lote = vins_lote.length > 0 ? vins_lote[0].Nombre_lote : "";
    const contract_sign_date = vins_lote.length > 0 ? vins_lote[0].Fecha_firma_contrato.substring(0,10) : "";

    setVINClientes(merged_vins)
    setVINClientesGenerados(VinsEnLote)
    setNombreLoteState(valor_nombre_lote)

    //NombreCliente: Nombre_corto, Ubicacion: Ubicacion, numCliente: Num_cliente
    setInputsObject({
      ...inputsObject, 
      NombreLote        : valor_nombre_lote, 
      NombreCliente     : Nombre_corto, 
      Ubicacion         : Ubicacion, 
      numCliente        : NumCliente,
      FechaFirmaContrato: contract_sign_date
    })

  }

  const isVinInLote = ( objcliente, findVinInLote, Nombre_corto ) => {
    let objeto = {}
    if ( findVinInLote !== undefined ) {
      
      objeto = {
        Vehiculo                  : objcliente.Vehiculo,
        Factura                   : objcliente.Factura,
        Cliente                   : objcliente.Cliente,
        Tasa_porcentaje_enganche  : findVinInLote.Tasa_porcentaje_enganche, 
        Venta                     : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(findVinInLote.Precio_factura) ),
        Monto_total               : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(findVinInLote.Monto_total) ),
        Inversion_inicial         : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(findVinInLote.Inversion_inicial) ),
        
        isPrecioVehiculoEditable  : false,
        VIN                       : objcliente.VIN,
        Ubicacion                 : findVinInLote.Ubicacion_cliente,
        cliente                   : findVinInLote.Nombre_cliente,
        nombreLote                : findVinInLote.Nombre_lote,
        Orden_compra              : findVinInLote.Orden_compra,
        Fecha_firma_contrato      : findVinInLote.Fecha_firma_contrato,
        Marca                     : 'CHEVROLET',
        Distribuidor              : 'CULIACAN MOTORS SA DE CV',
        vinSelected               : true,
        vinBlocked                : true,
        Modelo                    : objcliente.Modelo,
        Paquete                   : objcliente.Paquete
      }
    }
    if ( findVinInLote === undefined ) {
     
      objeto = {
        cliente                   : Nombre_corto,
        Vehiculo                  : objcliente.Vehiculo,
        Factura                   : objcliente.Factura,
        Cliente                   : objcliente.Cliente,
        Tasa_porcentaje_enganche  : porcentajeEnganche,
        
        Venta                     : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( (objcliente.Venta ).toFixed(2) )) ),
        Monto_total               : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( ((objcliente.Venta ) * ( 1 - ( porcentajeEnganche / 100) )).toFixed(2) )) ),
        Inversion_inicial         : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( ((objcliente.Venta ) * ( porcentajeEnganche / 100 )).toFixed(2) )) ),

        isPrecioVehiculoEditable  : (objcliente.Venta ) == 0 ? true : false,
        VIN                       : objcliente.VIN,
        Orden_compra              : objcliente.Orden_compra,
        Fecha_firma_contrato      : defaultDate,
        Marca                     : 'CHEVROLET',
        Distribuidor              : 'CULIACAN MOTORS SA DE CV',
        vinSelected               : objcliente.vinSelected,
        vinBlocked                : objcliente.vinBlocked,
        Modelo                    : objcliente.Modelo,
        Paquete                   : objcliente.Paquete

      }
    }
    return objeto;
  }

  const handleStateButtonGuardarLote = (value) => {

    /* setInputsObject({ //why do you update here?TODO:
      ...inputsObject, 
    })   */

    if ( isEditMode ) {
      setisActiveButtonActualizarLote(false)
      
      const Folio_lote  = Folio_lote_edit;
      const Nombre_cli  = nombreCliente;
      const Num_Cliente = NumCliente; 
      const Ubicacion   = ubicacionState;

      getLoteCliente( Folio_lote, Nombre_cli, Num_Cliente, Ubicacion ); //send ubication as a parameter.
      setCheckAll(false);
    }

    if ( !isEditMode ) {
      setisActiveButtonActualizarLote(false)
      setIsActiveButtonGuardarLote(false)
      incrementarFolioLote();
      setisEditMode(!isEditMode)
      const cliente = getObjectClienteSelected()
      getNombresLoteCliente(cliente);
      setCheckAll(false);
    }
  }

  const getNombresLoteCliente = async (cliente, firstRender = false ) => {
      
      const { NombreCliente:NombreClienteFI, NombreLote:NombreLoteFI, Ubicacion: UbicacionFI, numCliente: numClienteFI } = fatherInputs;

      const { Nombre_corto, Ubicacion: UbicacionCliente, Num_cliente } = cliente;
      
      const containsFatherInputs = numClienteFI !== 0;
      const finalValidation      = containsFatherInputs && firstRender; //cuando es true; ya ha sido guardado el cliente y bloque en father component.
      
      const finalNombreCliente   = finalValidation ? NombreClienteFI : Nombre_corto;
      const finalNumCliente      = finalValidation ? numClienteFI    : Num_cliente;
      const finalUbicacion       = finalValidation ? UbicacionFI     : UbicacionCliente;
      
      setNombreCliente( finalNombreCliente ); 
      setNumCliente( finalNumCliente ); 
      setUbicacionState( finalUbicacion ); 

      if ( finalValidation ) {
        clientsSelect.current.value = `${UbicacionFI}|${NombreClienteFI}|${numClienteFI}`;
        helperRef.current = true;

      }

      url = ApiUrl + "api/getNombresLotesCliente";

      const body =  { 
        agencia      : agencia, 
        Nombre_corto : finalNombreCliente,
        Ubicacion    : finalUbicacion,
        numCliente   : finalNumCliente
      };

      const nombres_lote_cliente = await axiosPostService( url, body );
      
      if ( nombres_lote_cliente.length === 0 ) {
        setInputsObject({
          ...inputsObject,
          NombreLote    : '', 
          NombreCliente : finalNombreCliente,
          Ubicacion     : finalUbicacion,
          numCliente    : finalNumCliente
        });

        resetValuesVINClientes();
        return;
      }

      const { Folio_lote, NumCliente } = nombres_lote_cliente[0];

      setNombresLoteCliente( nombres_lote_cliente ); 

      const obj = nombres_lote_cliente.find(obj => obj.Nombre_lote === NombreLoteFI);
      if ( obj !== undefined ) currentFolio.current = obj.Folio_lote; /* nombre lote father component */
      if ( obj === undefined ) currentFolio.current = Folio_lote; /* nombre lote encontrado en lista axios */
      
      
      getLoteCliente( 
        finalValidation ? obj?.Folio_lote !== undefined ? obj.Folio_lote : Folio_lote : Folio_lote,
        finalNombreCliente,    
        finalNumCliente,      
        finalUbicacion        
      );
    
  }

  const resetValuesVINClientes = () => {
    setVINClientesGenerados([])
    setVINClientes( [] )
    setNombresLoteCliente([])
  }

  const changeSelectClientes = async (e) => {
    const split = e.target.value.split("|")
    const [ Ubicacion, Nombre_cliente, Num_cliente ] = split;
    
    if ( !isEditMode ) {

      setInputsObject({...inputsObject, NombreCliente: Nombre_cliente, Ubicacion: Ubicacion, numCliente: Num_cliente})
      setNombreCliente( Nombre_cliente );
      setNumCliente( Num_cliente );
      setUbicacionState( Ubicacion );
      await cargarVinesCliente(Nombre_cliente, Num_cliente);
      
    }

    if ( isEditMode ) {

      const objetoCliente = { Nombre_corto: Nombre_cliente, Ubicacion: Ubicacion, Num_cliente: Num_cliente}
      getNombresLoteCliente(objetoCliente);
      setIsActiveButtonGuardarLote( true );
      setisActiveButtonActualizarLote(false)
      setIsShowedTable( false );
    }
  
  }

  const cargarVinesCliente = async (Nombre_cliente, Num_cliente) => {
    url = ApiUrl + "api/getvinsdisponiblescliente"
    const body = { Agencia: agencia, Nombre_cliente: Nombre_cliente, NumCliente: Num_cliente}
    const vins_disponibles_cliente = await axiosPostService( url, body );

    if( checkBoxSelectedAll.current?.checked !== null ) {
      if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
    }
    
    if ( vins_disponibles_cliente.length === 0 ) {
      setVINClientes([])
      setVINClientesGenerados([])
      setInputsObject({ 
        ...inputsObject,NombreLote: "", 
      })
      toast("No existen vines disponibles en Base de Datos para el cliente seleccionado")
      setIsShowedTable(false)
    }

    if ( vins_disponibles_cliente.length > 0 ) {
      const add_properties_total_vines_cliente = addBooleansVariables( vins_disponibles_cliente, Nombre_cliente );
      setVINClientes(add_properties_total_vines_cliente)
      setVINClientesGenerados([])
      
      setInputsObject({
        ...inputsObject,
        NombreLote: "",
      })
      setIsShowedTable(false)
    }

  }

  const handleVinSelectedAll = ({ target }) => {
    const checked = target.checked;
    
    if ( inputsObject.FechaFirmaContrato === '' ) {
      toast.info("Favor de agregar Fecha Firma Contrato antes de la selección de VINS");
      checkBoxSelectedAll.current.checked = !checked;
      return;
    }

    if ( inputsObject.FechaFirmaContrato !== ''  && isEditMode && checked ) {
      if ( inputsObject.FechaFirmaContrato !== VINClientesGenerados[0].Fecha_firma_contrato.substring(0, 10) ) {
        toast.info("La Fecha Firma Contrato seleccionada no coincide con las del bloque.");
        checkBoxSelectedAll.current.checked = !checked;
        return;
      }
    }

    if ( isEditMode && !isActiveButtonActualizarLote) setisActiveButtonActualizarLote(true) 
    if ( isEditMode && isActiveButtonGuardarLote) setIsActiveButtonGuardarLote(false)

    /* Modo edición */
    if ( isEditMode ) {
      
      const updateList = VINClientes.map((obj) => {
        let updateObj = { ...obj }

        if ( ! obj.vinBlocked ) {
          updateObj = {
            ...obj,
            vinSelected: checked,
            Ubicacion            : !checked ? "" : ubicacionState, 
            nombreLote           : !checked ? "" : inputsObject.NombreLote, 
            Fecha_firma_contrato : !checked ? defaultDate : inputsObject.FechaFirmaContrato
          }
        }

        return updateObj;
      })

      setVINClientes( updateList );
     
     if ( checked ) {
       const filtrarVINSNoBlocked = updateList.filter((obj) => !obj.vinBlocked );
        setVINClientesGenerados([
          ...VINClientesGenerados,
          ...filtrarVINSNoBlocked
        ])
      }

      if ( ! checked ) {
        const filtrarVINSBlocked = updateList.filter((obj) => obj.vinBlocked );
        setVINClientesGenerados(filtrarVINSBlocked);
      }
      setCheckAll( checked );
    }

    /* Nuevo Lote */
    if ( ! isEditMode ) {

      const updateList = VINClientes.map((obj) => {
        return {
          ...obj,
          vinSelected: checked,
          Ubicacion            : !checked ? "" : ubicacionState, 
          nombreLote           : !checked ? "" : inputsObject.NombreLote, 
          Fecha_firma_contrato : !checked ? defaultDate : inputsObject.FechaFirmaContrato 
        }
      })

      setVINClientes( updateList );
      if ( checked ) setVINClientesGenerados(updateList);
      if ( ! checked ) setVINClientesGenerados([]);
      setCheckAll( checked );
    }

  }

  const handleCheckSelected = (e, registro) => {

    if ( inputsObject.FechaFirmaContrato === '' ) {
      toast.info("Favor de agregar Fecha Firma Contrato antes de la selección de VINS");
      return;
    }

    if ( inputsObject.FechaFirmaContrato !== ''  && isEditMode && e.target.checked ) {
      if ( inputsObject.FechaFirmaContrato !== VINClientesGenerados[0].Fecha_firma_contrato.substring(0, 10) ) {
        toast.info("La Fecha Firma Contrato seleccionada no coincide con las del bloque.");
        return;
      }
    }

    if ( isEditMode && !isActiveButtonActualizarLote) setisActiveButtonActualizarLote(true) 
    if ( isEditMode && isActiveButtonGuardarLote) setIsActiveButtonGuardarLote(false)
    if ( e.target.value === 'vin_selected' ) {
      updateValuesVIN(registro, e.target.value, e.target.checked)
      return
    }

  }

  const updateValuesVIN = ( registro, value, checked ) => {
    const updateVIN = VINClientes.map((row) => {
      if ( registro.VIN === row.VIN ) {
        let updateRow = {}
        if ( value === vin_selected) {
          updateRow = { 
            ...row, 
            vinSelected          : checked,
            Ubicacion            : !checked ? "" : ubicacionState, 
            nombreLote           : !checked ? "" : inputsObject.NombreLote, 
            //Agregar propiedad FechaFirma aqui.
            Fecha_firma_contrato : !checked ? defaultDate : inputsObject.FechaFirmaContrato 
          }
          insertNewVIN(updateRow, value, checked) 
          return updateRow
        } 

      }

      return row
    })

    setVINClientes(updateVIN)
  }

  const insertNewVIN = (object, value, checked) => {
    if ( value === vin_selected){
      if ( !checked ) {
        const updateList = VINClientesGenerados.filter((row) => {
            return row.VIN !== object.VIN
        })

        setVINClientesGenerados(updateList)
        return;
      }
      setVINClientesGenerados([
        ...VINClientesGenerados,
        object
      ])
    }

  }

  const handleInputsObject = (e) => {
    setInputsObject({
      ...inputsObject,
      [e.target.name]: e.target.value 
    })
  }

  const onGenerateTable = () => {
    if( !isShowedTable ) {
      const updateVINSGenerated = VINClientesGenerados.map( register => {
        let { Venta, Fecha_firma_contrato, Tasa_porcentaje_enganche, Monto_total, Inversion_inicial } = VINClientes.find( reg => reg.VIN === register.VIN)
        return {
          ...register,
          Venta                    : Venta,
          Fecha_firma_contrato     : Fecha_firma_contrato,
          Tasa_porcentaje_enganche : Tasa_porcentaje_enganche,
          Monto_total              : Monto_total,
          Inversion_inicial        : Inversion_inicial
        }
      })

      setVINClientesGenerados(updateVINSGenerated)
    }

    setIsShowedTable(!isShowedTable)
  }

  const changeSelectNombresLoteCliente = (e) => {
    if ( isEditMode && isActiveButtonActualizarLote ) setisActiveButtonActualizarLote(false)
    setIsActiveButtonGuardarLote( true )
    setIsShowedTable( false )
    const Folio_lote = e.target.value;
    const Nombre_cliente = nombreCliente; 
    const Num_Cliente = NumCliente;
    const Ubicacion = ubicacionState;

    setFolio_lote_edit(Folio_lote)
    getLoteCliente( Folio_lote, Nombre_cliente, Num_Cliente, Ubicacion );
  }

  const onCreateOrModify = async () => {
    setIsShowedTable(false)
    setIsActiveButtonGuardarLote(true)
    
    if ( !isEditMode ) { //switch to edit 
      setisActiveButtonActualizarLote(false)
      const cliente = getObjectClienteSelected()
      getNombresLoteCliente(cliente);
    }

    if ( isEditMode ) { //switch to new block 
      
      url = ApiUrl + "api/getvinsdisponiblescliente";
      const body = { Agencia: agencia, Nombre_cliente: nombreCliente, NumCliente: NumCliente };
      const vins_disponibles_cliente = await axiosPostService( url, body );

      if ( checkBoxSelectedAll.current?.checked !== null ) {
        if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
        setCheckAll( false );
      }

      if ( vins_disponibles_cliente.length === 0 ) {
        setVINClientes([]);
        setVINClientesGenerados([]);

        setInputsObject({ 
          ...inputsObject,
          NombreLote          : "", 
          FechaFirmaContrato  : ""
        });

        setisEditMode(!isEditMode);

        toast("No existen VINS disponibles en Base de Datos para el cliente seleccionado.");
        return;
      }

      let add_properties_total_vines_cliente = addBooleansVariables( vins_disponibles_cliente, nombreCliente );

      add_properties_total_vines_cliente = addCalculosPrecioVehiculo( add_properties_total_vines_cliente )

      setVINClientes(add_properties_total_vines_cliente);
      setVINClientesGenerados([]);
      setisActiveButtonActualizarLote(false);

      setInputsObject({
        ...inputsObject,
        NombreLote          : "",
        FechaFirmaContrato  : ""
      })
    }

    setisEditMode(!isEditMode)
  }

  const addCalculosPrecioVehiculo = ( add_properties_total_vines_cliente ) => {
    return add_properties_total_vines_cliente.map( row => {
      return {
        ...row,
        Venta                     : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( (row.Venta ).toFixed(2) )) ), 
        Tasa_porcentaje_enganche  : tasa,
        Monto_total               : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( ((row.Venta ) * ( 1 - ( porcentajeEnganche / 100) )).toFixed(2) )) ),
        Inversion_inicial         : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format( Number( ((row.Venta ) * ( porcentajeEnganche / 100 )).toFixed(2) )) ),
        isPrecioVehiculoEditable  : new Intl.NumberFormat('es-MX').format((row.Venta )) == 0 ? true : false
      }
    })
  }

  const getObjectClienteSelected = () => {
    let numero_cliente = NumCliente;
    let cliente = clientes.find((obj) => obj.Num_cliente == numero_cliente)
    return cliente;
  }

  const disabledVINSelected = ( vinBlocked ) => {

    if ( isEditMode ) {
    if ( vinBlocked ) return true;
    if ( NombresLoteCliente.length === 0) return true;
    return false;
    }

    if ( !isEditMode ) {
      if ( inputsObject.NombreLote === "" ) return true;
      return false;
    }

  }

  const disabledVINSelectedAll = () => {
    if ( isEditMode ) {
      // if ( vinBlocked ) return true;
      if ( NombresLoteCliente.length === 0) return true;
      return false;
      }
  
      if ( !isEditMode ) {
        if ( VINClientes.length === 0 ) return true;
        if ( inputsObject.NombreLote === "" ) return true;
        return false;
      }

  }

  const OnChangeDate = ( e ) => setInputsObject({ ...inputsObject, FechaFirmaContrato: e.target.value })

  const onChange = (e, vinRegistro, valorDelCampoEnArreglo) => {
    if ( e.target.name === "Inversion_inicial" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }
    if ( e.target.name === "Monto_total" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }
    if ( e.target.name === "Tasa_porcentaje_enganche" ) {
      calcularTasa(e, vinRegistro)
      return;
    }
    if ( e.target.name === "Venta" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }
  }

  const updateTasa = ( e ) => {
    let value = e.target.value;
    if ( value < 0 ) return;
    setPorcentajeEnganche(value)
    const updateListaClientes = VINClientes.map((row) => {
      return {
          ...row,
          Tasa_porcentaje_enganche  : value,
          Monto_total               : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(      Number( (removerComas(row.Venta) * (1 - (value / 100))).toFixed(2) )     )),
          Inversion_inicial         : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(      Number( (removerComas(row.Venta) * (value / 100)).toFixed(2) )           )),
      }
      
    })
    setVINClientes(updateListaClientes)

  }

  const calcularTasa = (e, vinRegistro) => {
    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === vinRegistro ) {
        let updaterow;
          updaterow = {
            ...row,
            [e.target.name]       : e.target.value,
            ['Monto_total']       : new Intl.NumberFormat('es-MX').format(removerComas(row.Venta) * (1 - (e.target.value / 100))),
            ['Inversion_inicial'] : new Intl.NumberFormat('es-MX').format(removerComas(row.Venta) * (e.target.value / 100) ),
          }
        return updaterow
      }
      return row
    })

    setVINClientes(updateListaClientes)
  }

  const calcularMontoTotal = (e, row, tipo, registro) => {
    let result = {}
    if ( tipo === "blur" ) {
      let tasa = 0;
      let montoTotal = e.target.value; 
      let precioVehiculo = removerComas(registro.Venta);
      let inversionInicial = 0;

      tasa = 1 - ( Number( (montoTotal/precioVehiculo).toFixed(4) ) )
      tasa = Number((tasa * 100).toFixed(2));
      inversionInicial = Number( (precioVehiculo * ( tasa / 100 )).toFixed(2) )

      result = {
        ...row,
        [e.target.name]          : new Intl.NumberFormat('es-MX').format(montoTotal),
        Tasa_porcentaje_enganche : tasa,
        Inversion_inicial        : new Intl.NumberFormat('es-MX').format(inversionInicial)
      }
    }
    if ( tipo !== "blur" ) {
      result = {
        ...row,
        [e.target.name] : removerComas(e.target.value)
      }

    }
    
    return result;
  }

  const calcularInversionInicial = (e,row,tipo,registro) => {
    let result = {}
    if ( tipo === "blur" ) {
      let tasa = 0;
      let montoTotal = 0; 
      let precioVehiculo = removerComas(registro.Venta);
      let inversionInicial = e.target.value;

      tasa = Number((inversionInicial / precioVehiculo).toFixed(4));
      tasa = Number((tasa * 100).toFixed(2));
      montoTotal = Number((precioVehiculo * ( 1 - (tasa / 100) )).toFixed(2));

      result = {
        ...row,
        Monto_total              : new Intl.NumberFormat('es-MX').format(montoTotal),
        Tasa_porcentaje_enganche : tasa,
        Inversion_inicial        : new Intl.NumberFormat('es-MX').format(inversionInicial)
      }

    }
    if ( tipo !== "blur" ) {
      result = {
        ...row,
        [e.target.name] : removerComas(e.target.value)
      }
    }
    return result;
  }

  const calcularValores = (propiedad, vinRegistro, valor) => {

    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === vinRegistro ) {
        let updaterow;
        
        if ( propiedad === "Monto_total" ) {
          updaterow = {
            ...row,
            [propiedad] : valor
          }
        }
        if ( propiedad === "Inversion_inicial" ) {
          updaterow = {
            ...row,
            [propiedad] : valor
          }
        }
        if ( propiedad === "Venta" ) {
          updaterow = {
            ...row,
            [propiedad] : valor
          }
        }
        
        return updaterow
      }
      return row
    })
    setVINClientes(updateListaClientes)

  }

  const validateInput = (e, vinRegistro, valorDelCampoEnArreglo) => {
    if (isNumber(e.target.value)) {
      calcularValores(e.target.name, vinRegistro, e.target.value)
      return;
    }
    
    if (!isNumber(e.target.value)) {
      if (isADotValue(e.target.value)) {
          (!hasPointTheInputValue( valorDelCampoEnArreglo ))
          ? calcularValores(e.target.name, vinRegistro, e.target.value)
          : (getTotalPoints(e.target.value) !== 2) && calcularValores(e.target.name, vinRegistro, valorDelCampoEnArreglo.substring(0, valorDelCampoEnArreglo.toString().length - 1))
          
      }
    }

  }

  const onBlur = (e, registro) => {

    if ( e.target.name === "Monto_total" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Inversion_inicial" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Venta" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
  }

  const onFocus = (e, registro) => {
    if ( e.target.name === "Monto_total" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Inversion_inicial" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Venta" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
  }

  const updateArregloClientes = ( e, registro, tipo ) => {
    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === registro.VIN ) {

        if ( e.target.name === "Venta" ) {
          return {
              ...row,
              [e.target.name]   : tipo === "blur" ? new Intl.NumberFormat('es-MX').format(e.target.value) : removerComas(e.target.value),
              Monto_total       : tipo === "blur" ? new Intl.NumberFormat('es-MX').format((e.target.value) * ( 1 - ( registro.Tasa_porcentaje_enganche / 100) )) : registro.Monto_total,
              Inversion_inicial : tipo === "blur" ? new Intl.NumberFormat('es-MX').format((e.target.value) * ( registro.Tasa_porcentaje_enganche / 100 )) : registro.Inversion_inicial
          }
        }
        
        if ( e.target.name === "Monto_total" ) {
          return calcularMontoTotal(e,row,tipo,registro);
        }

        if ( e.target.name === "Inversion_inicial" ) {
          return calcularInversionInicial(e,row,tipo,registro);
        }

      }
      return row
    })
    setVINClientes(updateListaClientes)
  }

  const onEditBloq = () => {

    if ( editBloq ) setNameEditBloq('');

    setEditBloq( !editBloq );
  }

  const changeNameBloque = ({ target }) => {
    const { value } = target;
    setNameEditBloq( value );
  }

  const acceptEditNameBloq = async () => {

    const { NombreCliente, Ubicacion, numCliente, NombreLote } = inputsObject;

    const body = { 
      NombreCliente, 
      Ubicacion, 
      numCliente, 
      NombreLote : nameEditBloq,
      anteriorNombreLote: NombreLote
    }

    const response = await nameAlreadyExists( numCliente, nameEditBloq );
    if ( response ) {
        toast(`Ya existe un bloque ${ nameEditBloq }, favor de indicar otro nombre.`);
        return;
    }
    
    updateMainValues( body );

    url = ApiUrl + 'api/changeNameBloq';

    const resp = await axiosPostService(url, body);  

    if ( resp?.wasChanged !== true ) {
      toast(`Ocurrió un error al intentar cambiar el nombre del bloque.`);
      updateMainValues({ NombreCliente, Ubicacion, numCliente, NombreLote }); 
      return
    }

    const cliente = getObjectClienteSelected();

    getNombresLoteCliente( cliente, true );
    setNameEditBloq('');
    setEditBloq(false);

  }

  const nameAlreadyExists = async ( NumCliente, NomLote ) => {
    url = ApiUrl + "api/nameAlreadyExists";
    const { message } = await axiosPostService(url,{NumCliente, NomLote});
    return message;

}

  return (
    <>

      <div className="d-flex justify-content-start ml-3">
            
        <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>
      
        <select 
          className='form-select select-class-1 width__label-input mt-2' 
          disabled={ !updateVentasFlotillasDMSTable || editBloq } 
          onChange={(e) => changeSelectClientes(e)} 
          ref={clientsSelect}
        >
          {
            clientes.map(cliente => (
                <option 
                  value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                >
                  {`${cliente.Nombre_corto} ${cliente.Ubicacion}`}
                </option>
            ))
          }
        </select>
          
      </div>

      <div className="d-flex justify-content-start ml-3">
           
        <h6 className='mr-4 width__label-input-min'>Nombre de Bloque: </h6>
      
        {
          !isEditMode ? 
          <input 
            autoComplete="off"
            className='input-class width__label-input mt-2' 
            disabled={!updateVentasFlotillasDMSTable}
            name="NombreLote" 
            onChange={handleInputsObject}
            type="text" 
            value={inputsObject.NombreLote} 
          />

          :

          <>

            <select 
              className='form-select select-class-1 width__label-input mt-2' 
              disabled={!updateVentasFlotillasDMSTable || NombresLoteCliente.length === 0 || editBloq }
              onChange={(e) => changeSelectNombresLoteCliente(e)} 
              ref={folioLoteSelect}
            >
              { 
                NombresLoteCliente.map(objeto => (
                    <option 
                      value={objeto.Folio_lote}
                    >
                      { `${objeto.Nombre_lote} ${invertirCadenaFecha(objeto.Fecha_firma_contrato.substring(0, 10))}` }
                    </option>
                ))
              }
            </select>

            <button
              disabled={ NombresLoteCliente.length === 0 || isShowedTable }
              style={{ height:'35px' }}
              title={ (!editBloq) ? 'Editar nombre bloque' : 'Cancelar edición nombre bloque'}
              type='button'
              className='btn btn-outline-primary btn-sm mt-2 ml-2'
              onClick={ onEditBloq }
            >
              <FontAwesomeIcon icon={ (!editBloq) ? faEdit : faCancel }/>
            </button>

            {
              editBloq &&
              <>
                <input 
                  autoComplete="off"
                  className='input-class width__label-input mt-2 ml-2' 
                  name="EditarBloque" 
                  onChange={ changeNameBloque }
                  type="text"
                  value={ nameEditBloq } 
                />
              
                <button
                  style={{ height:'35px' }}
                  disabled={ nameEditBloq.length === 0 }
                  title='Aceptar'
                  type='button'
                  className='btn btn-outline-primary btn-sm mt-2 ml-2'
                  onClick={ acceptEditNameBloq }
                >
                  <FontAwesomeIcon icon={faCheck}/>
                </button>

                <small className='mt-2 ml-2'>Escribir únicamente el nombre del bloque, la fecha será agregada automáticamente.</small>
              </>
            }

          </>

        }
          
      </div>

      <div className="d-flex justify-content-start ml-3">

        <h6 className='mr-4 width__label-input-min'>Fecha Firma Contrato: </h6>
        <input 
          className='input-class width__label-input mt-2' 
          type="date" 
          name="FechaFirmaContrato" 
          value={inputsObject.FechaFirmaContrato} 
          onChange={OnChangeDate}
          min="2022-01-01"
          disabled={ editBloq }
        />
        
      </div>
      
      <div className="row m-2 d-flex justify-content-between" style={{paddingTop:'10px', borderTop:'1px solid gainsboro'}}>
        
        <h6>Seleccionar VIN's que integran el bloque</h6>
        
        <button 
          className='btn btn-info'
          disabled={ !updateVentasFlotillasDMSTable || editBloq }
          onClick={onCreateOrModify}
          type='button' 
        >
          { isEditMode ? "Nuevo Bloque" : "Cancelar"}
        </button>

      </div>
      {
        !isShowedTable && 
        <div className="row table-responsive heightTable">

          <table className='table display compact'style={{width:'2974px', tableLayout:'fixed'}}>
            
            <thead style={{ position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white', fontSize:11, boxShadow:'-10px -10px #1565C0'}}>
             
              <tr style={{fontSize:15, textAlign:'right', outline:'2px solid #1565C0'}}>
                <th colSpan="1"></th>
                <th colSpan="1" style={{ position: 'sticky', left: '0', zIndex:1 }}>
                  <div  className="d-flex justify-content-center">
                    <input 
                      style={{position:'sticky'}} 
                      className="form-check-input" 
                      name="vin_selected_all" 
                      onChange={ handleVinSelectedAll }
                      type="checkbox" 
                      value="vin_selected_all"
                      ref={ checkBoxSelectedAll }
                      disabled={ disabledVINSelectedAll() }  
                      // disabled  
                    />
                  </div>   
                </th>
                <th colSpan="11"></th>
                <th colSpan="1" style={{ padding:'5px'}}>
                  <div className="d-flex justify-content-center">
                    <input 
                      autoComplete='off'
                      className="form-control" 
                      name="Tasa_porcentaje_enganche" 
                      onChange={ updateTasa } 
                      style={{height:'20px', fontSize:18}}
                      type="number" 
                      value={porcentajeEnganche} 
                    />
                    <small className='ml-2'>%</small>
                  </div>
                </th>
                <th colSpan="1" style={{ padding:'5px'}}></th>
                <th colSpan="1"></th>
              </tr>
              
              <tr className='text-center' style={{ outline:'1px solid #1565C0' }}>
                <th className='noselect' style={{width:'130px', fontSize:11}}>#</th>
                <th className='noselect' style={{width:'134px',position:'sticky', left:'0px', backgroundColor:'#1565C0', zIndex:1}}>
                  { `Seleccionar VINS (${VINClientesGenerados.length})` }
                </th>
                <th style={{width:'334px', position:'sticky', left:'185px', backgroundColor:'#1565C0', zIndex:1 }}>VIN</th>
                <th className='noselect' style={{width:'294px'}}>No. Factura</th>
                <th className='noselect' style={{width:'294px'}}>Cliente</th>
                <th className='noselect' style={{width:'292px'}}>Distribuidor</th>
                <th className='noselect' style={{width:'134px'}}>Marca</th>
                <th className='noselect' style={{width:'294px'}}>Unidad</th>
                <th className='noselect' style={{width:'134px'}}>Paquete</th>
                <th className='noselect' style={{width:'130px'}}>Modelo</th>
                <th className='noselect' style={{width:'134px'}}>Orden de Compra</th>  
                <th className='noselect' style={{width:'134px'}}>Fecha Firma</th>  
                <th className='noselect text-right' style={{width:'134px'}}>Precio Factura</th>  
                <th className='noselect' style={{width:'134px'}}>Porcentaje Enganche</th>  
                <th className='noselect' style={{width:'134px'}}>Inversión Inicial</th>  
                <th className='noselect' style={{width:'134px'}}>Monto a Financiar</th>  
              </tr>

            </thead>
            <tbody style={{ position: 'sticky', zIndex:0}} className={VINClientes.length > 0 ? 'withData' : 'withNoData'}>{/* #FFFACD */}
            {
              VINClientes.length > 0 ?
              VINClientes.map((registro, index) => {

                return (
                  <tr className='text-center' key={registro.VIN}>
                    <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>
                    <td className='noselect' style={{ position:'sticky', left:'0px', backgroundColor:'#FFFFE0', zIndex:1 }}>
                      <input
                        checked={registro.vinSelected} 
                        className="form-check-input" 
                        disabled={  disabledVINSelected(registro.vinBlocked) } 
                        name="vin_selected" 
                        onChange={( e ) => handleCheckSelected( e, registro )}
                        style={{position:'sticky'}} 
                        type="checkbox" 
                        value="vin_selected"
                      />
                    </td>
                    <td style={{ position:'sticky', left:'185px', backgroundColor:'#FFFFE0', zIndex:1 }}>{registro.VIN}</td>
                    <td className='noselect'>{ registro.Factura }</td>
                    <td className='noselect'>{ nombreCliente }</td>
                    <td className='noselect'>CULIACAN MOTORS SA DE CV</td>
                    <td className='noselect'>{ upperCase( registro.Marca )}</td>
                    <td className='noselect'>{ upperCase( registro.Vehiculo )}</td>
                    <td className='noselect'>{ upperCase( registro.Paquete )}</td>
                    <td className='noselect'>{ upperCase( registro.Modelo )}</td>
                    <td className='noselect'>{ upperCase( registro.Orden_compra )}</td>
                    <td className='noselect'>{ validarFecha( isDefaultDate(registro.Fecha_firma_contrato) ) }</td>
                    <td className='noselect text-right'>
                      {
                      
                        (registro.isPrecioVehiculoEditable) 
                        ? 
                          <input 
                            autoComplete='off'
                            className="form-control"
                            name="Venta" 
                            onBlur={(e) => onBlur(e, registro)} 
                            onFocus={(e) => onFocus(e, registro)}
                            onChange={(e) => onChange(e, registro.VIN, registro.Venta)} 
                            type="text" 
                            value={registro.Venta} /> 
                        : 
                          registro.Venta
                      
                      }
                    </td>
                    
                    <td className='noselect'>
                      { registro.Tasa_porcentaje_enganche }
                       
                    </td>
                    
                    <td className='noselect'>
                      { registro.Inversion_inicial }
                      
                    </td>

                    <td className='noselect'>
                      { registro.Monto_total }
                      
                    </td>
                    
                  </tr>
                )

              })
              :
              <tr className='p-2'>
                  {
                    !updateVentasFlotillasDMSTable ?
                    <>
                      <div className="d-flex align-items-start p-2">
                      <strong>Cargando...</strong>
                      <div className='spinner-border ml-2' role="status" aria-hidden="true"></div>
                      </div>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </>
                    :
                    <>
                      <td>No existen bloques creados del cliente seleccionado</td>
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
                    </>
                  }
              </tr>
            }
            </tbody>
          </table>

      </div>
      }

      <LoteVehiculosTable 
        agencia={agencia}
        data={VINClientesGenerados} 
        Folio_lote={ isEditMode ? Folio_lote_edit : Folio_lote}
        handleStateButtonGuardarLote={handleStateButtonGuardarLote}
        isActiveButtonActualizarLote={isActiveButtonActualizarLote}
        isActiveButtonGuardarLote={isActiveButtonGuardarLote}
        isEditMode={isEditMode}
        isShowedTable={isShowedTable} 
      />
      
      <div className="row m-2">
        <button 
          type='button' 
          className='btn btn-info mt-2 mb-2' 
          onClick={onGenerateTable}
          disabled={ VINClientesGenerados.length === 0 || editBloq }
        >
          { isShowedTable ? 'Editar' : 'Vista Previa'}
        </button>
      </div>
      
    </>
  )
}

export default AsignacionLote