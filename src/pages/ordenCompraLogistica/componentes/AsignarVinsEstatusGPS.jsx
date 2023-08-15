import React, { useState, useEffect, useRef } from 'react'

import { generate as id } from 'shortid'
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faAdd, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

import { useModal } from '../../../modales/shared/useModal';
import ModalGrande from '../../../modales/shared/ModalGrande';
import { ModalPendientesEntregas } from '../../../modales/ordendecompra/ModalPendientesEntregas';
import ModalMini from '../../../modales/shared/ModalMini'
import { ModalStatusTyT } from '../../../modales/statustyt/ModalStatusTyT';
import { ApiUrl } from '../../../services/ApiRest';
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService';
import { FechaDeHoyYYMMDD, isDefaultDate, reduceString, validarFecha } from '../../../helpers/fecha';
import { TablaAsignarVinsEstatusGPS } from './tablas-vistas/TablaAsignarVinsEstatusGPS';
import { upperCase } from '../../../helpers/converToUpperCase';
import { statusGPSDataTable, ordenDeCompraDataTable } from '../../../components/datatable/conf';
import { Button } from '@mui/material';
import readXlsxFile from 'read-excel-file';

import $ from 'jquery';
import '../../../css/ordenDeCompra/ordenDeCompra.css';
import { 
    estatusTyTDynamicObj, 
    defaultDateDB, 
    defaultDate, 
    defaultPay, 
    defaultEstatusGPS, 
    defaultEstatusPrevia, 
    OK, 
    PATIOSTATUSTYT, 
    UBICACIONPATIO,
    PATIO, 
    DISTRIBUIDOR, 
    SINPREVIA, 
    emptyString, 
    CartaCliente, 
    ReciboEntrega, 
    FacturaPago, 
    Asignar, 
    Modificar, 
    slices, 
    estatusTyTList, 
    estatusTyTObj, 
    estatusKeysTyTList, 
    pendientesEntrega, 
    especificDate,
    stylesObjects, 
    EstatusTyTvalidations,
    PatioUbiValidations
} from '../helpers/constantes';

/* libraries to import excel */
import '@grapecity/spread-sheets-react'
// import '@grapecity/spread-sheets-react/styles/gc.spread.sheets.excel2016colorful.css'
// import { SpreadSheets, Worksheet, Column } from '@grapecity/spread-sheets-react';
import { IO } from '@grapecity/spread-excelio';

const { 
    HeaderClientSticky, 
    HeaderClientStatic, 
    secondHeaderSelectAllPendEnt, 
    secondHeaderSelectAll, 
    secondHeaderVINPendEnt, 
    secondHeaderVIN, 
    secondHeaderTypePackage, 
    secondHeaderTypePackagePendEnt, 
    secondHeaderDestiny, 
    secondHeaderDestinyPendEnt, 
    secondHeaderEstatusTyTPendEnt, 
    secondHeaderEstatusTyT, 
    BodyClientSticky, 
    BodyClientStatic, 
    BodySelect, 
    BodySelectPendEnt,
    BodyVIN,
    BodyVINPendEnt,
    BodyTypePackagePendEnt,
    BodyTypePackage,
    BodyDestinyPendEnt,
    BodyDestiny,
    BodyEstatusTyTPendEnt,
    BodyEstatusTyT
} = stylesObjects;


const AsignarVinsEstatusGPS = ({ agencia, clientes }) => {

    const [writtendata, setWrittendata] = useState({
        NumeroCliente       : clientes.length > 0 ? `${clientes[0].Num_cliente}`   : 0,
        Ubicacion           : clientes.length > 0 ? `${clientes[0].Ubicacion}`     : 0,
        NombreCliente       : clientes.length > 0 ? `${clientes[0].Nombre_corto}`  : 0,
        FechaSolicitudGPS   : defaultDate, /* Fecha Segregación Solicit */
        FechaAceptacionGPS  : defaultDate, /* Fecha Instalación */
        EstatusGPS          : defaultEstatusGPS,
        EstatusPrevia       : defaultEstatusPrevia,
        EstatusTyT          : PATIOSTATUSTYT,
        Patio               : UBICACIONPATIO, /* new property added */
        FechaEntregaCliente : defaultDate,
        FechaDeEnvioDocum   : defaultDate,
        FechaDeRecepcion    : defaultDate,
        Observaciones       : '',
        ObservacionesTyT    : '',
        ObservacionesVIN    : '',
        CartaClientePDF     : null,
        FacturaPagoPDF      : null,

        //new properties added.
        FechaDetencionSolicit : defaultDate,
        FechaDetencionAut     : defaultDate,
        FechaGPSSolicit       : defaultDate,
        FechaGPSAut           : defaultDate,
        FechaSegregacionAut   : defaultDate,
        FechaAccesoSolicit    : defaultDate,
        FechaAccesoAut        : defaultDate,
        FechaLiberacionSolicit: defaultDate,
        FechaLiberacionAut    : defaultDate,
        FechaPreviaSolicit    : defaultDate,
        FechaPreviaAut        : defaultDate,
        FechaCalidadSolicit   : defaultDate,
        FechaCalidadAut       : defaultDate,
        FechaPagoSolicit      : defaultDate,
        FechaPagoAut          : defaultDate,
        Pago                  : defaultPay.PAGADO,

        /* status tyt dates will be managed when changing its select tag. */
        FechaInterplantaIngreso    : defaultDate,
        FechaInterplantaSalida     : defaultDate,
        FechaArmViajeIngreso       : defaultDate,
        FechaArmViajeSalida        : defaultDate,
        FechaAsigSinMadrinaIngreso : defaultDate,
        FechaAsigSinMadrinaSalida  : defaultDate,
        FechaAsigEnMadrinaIngreso  : defaultDate,
        FechaAsigEnMadrinaSalida   : defaultDate,
        FechaTransitoIngreso       : defaultDate,
        FechaTransitoSalida        : defaultDate,
    });

    const [isPreviewTable, setIsPreviewTable]                          = useState(false);
    const [VINClientes, setVINClientes]                                = useState([]);
    const [VINClientesGenerados, setVINClientesGenerados]              = useState([]);
    const [VINSGeneratedinBD, setVINSGeneratedinBD]                    = useState(false);
    const [statusTytCatList, setStatusTytCatList]                      = useState([]);
    const [patiosUbiCatList, setPatiosUbiCatList]                      = useState([]);
    const [OrdenCompra, setOrdenCompra]                                = useState('');
    const [ordenesDeCompra, setOrdenesDeCompra]                        = useState([]);
    const [radioButton, setRadioButton]                                = useState(Asignar);
    const [checkAll, setCheckAll]                                      = useState(false);
    const [clientesTotales, setClientesTotales]                        = useState([]);
    const [pendienteEntrega, setPendienteEntrega]                      = useState('');
    const [isOpenModal, openModal, closeModal]                         = useModal(false);
    const [isOpenModalEntregas, openModalEntregas, closeModalEntregas] = useModal(false);
    const [isChargingVins, setIsChargingVins]                          = useState(false);
    const [isImportExcelActive, setIsImportExcelActive] = useState( false );

    /* new state */
    const [sliceSelected, setSliceSelected] = useState( slices.first );
    const [sliceBeforeSelected, setSliceBeforeSelected] = useState( slices.first );

    const inputFileCartaClienteRef = useRef();
    const inputFileFacturaPagoRef  = useRef();
    const selectEstatusGPSRef      = useRef();
    const selectEstatusPreviaRef   = useRef();
    const selectEstatusTyTRef      = useRef();
    const selectPatioUbiRef        = useRef();
    const selectClientsRef         = useRef();
    const selectOrderRef           = useRef();
    const checkBoxSelectedAll      = useRef();
    const selectPagoRef            = useRef();
    const inputFileImportExcel     = useRef();

    let url = '';
    const fechaHoy = FechaDeHoyYYMMDD();

    useEffect(() => {

        if ( clientes.length > 0 ) {
            setWrittendata({
              ...writtendata, 
              NumeroCliente     : clientes[0].Num_cliente,
              Ubicacion         : clientes[0].Ubicacion,
              NombreCliente     : clientes[0].Nombre_corto, 
            })
            
            getOrdenesDeCompraByCliente( clientes[0].Nombre_corto, clientes[0].Ubicacion, clientes[0].Num_cliente );

            setClientesTotales([ ...pendientesEntrega, ...clientes ]);

        }
          
        getStatusTyTAndPatiosList( true )

    }, [clientes]);

    useEffect(() => {
      
        selectClientsRef.current.value = `${clientes[0].Ubicacion}|${clientes[0].Nombre_corto}|${clientes[0].Num_cliente}`;

    }, [clientesTotales])

    useEffect(() => {
        if ( ! isPreviewTable ) {
            checkBoxSelectedAll.current.checked = checkAll;
        }
    }, [isPreviewTable])

    useEffect(() => {
        setInputCurrentValues();

    }, [sliceSelected])

    const setInputCurrentValues = () => {

        const { first, third } = slices;

        const { EstatusTyT, Patio, EstatusGPS, EstatusPrevia, Pago, CartaClientePDF, FacturaPagoPDF } = writtendata;

        if ( sliceSelected ===  first ) {

            selectPatioUbiRef.current.value      = Patio;

            selectEstatusTyTRef.current.value    = EstatusTyT;

            selectEstatusGPSRef.current.value    = EstatusGPS;

            selectEstatusPreviaRef.current.value = EstatusPrevia;
            
            return;

        }
        
        if ( sliceSelected ===  third ) {
            
            selectPagoRef.current.value = Pago;
            
            if ( CartaClientePDF !== null ) inputFileCartaClienteRef.current.files = setUploadedFile( CartaClientePDF );

            if ( FacturaPagoPDF !== null ) inputFileFacturaPagoRef.current.files = setUploadedFile( FacturaPagoPDF );

        }

    }

    const setUploadedFile = ( obj ) => {
        const { name, type, lastModified } = obj;

        const myFile = new File([obj], name, {
            type: type,
            lastModified: lastModified
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(myFile);

        return dataTransfer.files;

    }

    const getStatusTyTAndPatiosList = async ( patios = false ) => {

        url = ApiUrl + "api/asignarvins/get_statustyt_catalogo";
        let total_statusTyT = await axiosPostService( url, {agencia} );
        setStatusTytCatList( total_statusTyT );

        let patios_ubicaciones = [];

        if ( patios ) {
            
            url = ApiUrl + "api/asignarvins/get_patios_ubicaciones";
            patios_ubicaciones = await axiosPostService( url, {agencia});
            setPatiosUbiCatList( patios_ubicaciones );

        }

        if ( total_statusTyT.length > 0 ) {

            setWrittendata({
                ...writtendata, 
                EstatusTyT : `${total_statusTyT[0].nombreEstatus}|${total_statusTyT[0].clave}`,
                Patio      : patios ? `${patios_ubicaciones[0].nombrePatio}|${patios_ubicaciones[0].clave}` : writtendata.Patio,
            });

        }
    
    }

    const getOrdenesDeCompraByCliente = async ( NombreCliente, UbicacionCliente, numeroCliente ) => {
        
        url = ApiUrl + "api/asignarvins/get_ordenes_de_compra";

        const body_cliente = { 
            Agencia          : agencia, 
            NombreCliente    : NombreCliente, 
            UbicacionCliente : UbicacionCliente,
            Num_cliente      : numeroCliente 
        };

        const total_ordenes_compra = await axiosPostService( url, body_cliente );

        setOrdenesDeCompra(total_ordenes_compra);

        if ( total_ordenes_compra.length > 0 ) {

            setWrittendata({
              ...writtendata,
              NumeroCliente  : numeroCliente,
              Ubicacion      : UbicacionCliente,
              NombreCliente  : NombreCliente,
            })

            setOrdenCompra(total_ordenes_compra[0].OrdenCompra);

            getVinsWithOrdenDeCompra( numeroCliente, total_ordenes_compra[0].OrdenCompra );

        }

        if ( total_ordenes_compra.length === 0 ) {

            setWrittendata({
              ...writtendata,
              NumeroCliente  : numeroCliente,
              Ubicacion      : UbicacionCliente,
              NombreCliente  : NombreCliente,
            })

            setOrdenCompra('');

            try {
                dataTableDestroy();
                setVINClientes([]);
                dataTable();

            } catch (error) {
                toast.error("Error al cargar registros en tabla.")
                

            }

            setVINClientesGenerados([])
        }

    }

    const getVinsWithOrdenDeCompra = async (  numeroCliente, ordenComp ) => {
        
        url = ApiUrl + "api/asignarvins/get_vins_to_estatus";

        const body = { Agencia: agencia, Cliente: numeroCliente, OrdenDeCompra: ordenComp };

        let total_vins_with_orden_compra = await axiosPostService( url, body );

        if ( VINClientesGenerados.length > 0 && !isPreviewTable) setVINClientesGenerados([]);

        if ( total_vins_with_orden_compra.length > 0 ) total_vins_with_orden_compra = agregarVariableIsSelected( total_vins_with_orden_compra );
       
        if( checkBoxSelectedAll.current?.checked !== null ) {
            if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
        }


        try {
            dataTableDestroy();
            setVINClientes( total_vins_with_orden_compra );
            dataTable();
            
        } catch (error) {
            toast.error("Error al cargar registros en tabla.")
            
        }

    }

    const OnChange = async ( e ) => {

        const name = e.target.name;
        const value = e.target.value;
        const files = e.target.files;
        
        let params = { name, value, files, hasEndDate : false, hasStartDate : false, endDateObj : null, startDateObj : null };

        if ( e.target.name === 'Cliente' ) {
            /* Resetear valores de input si está en modo modificar */

            const [ Ubicacion, Nombre_cliente, numeroCliente ] = e.target.value.split("|");

            if ( Nombre_cliente === pendientesEntrega[0].Nombre_corto || Nombre_cliente === pendientesEntrega[1].Nombre_corto ) {

                setPendienteEntrega( Nombre_cliente.split(' ').shift() );
                openModalEntregas(); 
                return;
            }

            if ( isImportExcelActive ) setIsImportExcelActive( false );

            getOrdenesDeCompraByCliente( Nombre_cliente, Ubicacion, numeroCliente );
            setVINSGeneratedinBD(false);
            return;
        }
        
        if ( e.target.name === 'ordenDeCompra' ) {

            /* Resetear valores de input si está en modo modificar */
           
            const OrdenCompra = e.target.value;

            getVinsWithOrdenDeCompra( writtendata.NumeroCliente, OrdenCompra );

            if ( radioButton === Modificar ) setDafaultInputValues();

            setOrdenCompra(OrdenCompra);

            return;
        }
       
        if ( e.target.name === 'EstatusTyT' ) {
            
            params = await getParams( writtendata.EstatusTyT, e.target.value );
            /* anteriorvalor  FechaSalida */
            // if ( isEstatusTyTOnList(writtendata.EstatusTyT) ) { /* Estatus TyT en el que se encuentra actualmente el VIN */
                
            //     params.endDateObj = await searchDateEstatusTyT( writtendata.EstatusTyT.split('|').shift(), 'salida' );
            //     if ( params.endDateObj.date !== null ) params.hasEndDate = true;
                
            // }
            
            /* nuevovalor FechaIngreso */
            // if ( isEstatusTyTOnList(e.target.value) ) { /* Estatus TyT al que pasará el VIN */

            //     params.startDateObj = await searchDateEstatusTyT( e.target.value.split('|').shift(), 'ingreso' );
            //     if ( params.startDateObj.date !== null ) params.hasStartDate = true;

            // }
           
        }

        if ( radioButton === Modificar ) {

           const agreeWithChanges =  await updateValuesVINSEditMode( params );
           if ( !agreeWithChanges ) return;

        }

        if ( e.target.name === 'CartaClientePDF' ) {
            if ( e.target.files[0]?.type === undefined ) return;
            if ( e.target.files[0]?.type !== "application/pdf" ) {
                toast.info('Favor de cargar la carta cliente en formato PDF.');
                return;
            }

            setWrittendata({
              ...writtendata,
              [e.target.name] : e.target.files[0]
            })
            return;
        }

        if ( e.target.name === 'FacturaPagoPDF' ) {
            if ( e.target.files[0]?.type === undefined ) return;
            if ( e.target.files[0]?.type !== "application/pdf" ) {
                toast.info('Favor de cargar la factura pago en formato PDF.');
                return;
            }


            setWrittendata({
              ...writtendata,
              [e.target.name] : e.target.files[0]
            })
            return;
        }

        /* next function will update the input whatever both modes */ 
        updateWrittenData( params );
        
    }

    const handleAfterStatusCreated = () => {
        getStatusTyTAndPatiosList();
        closeModal();
    }

    const addNewStatusTyT = ( e ) => openModal();
    
    const agregarVariableIsSelected = ( total_vins_with_orden_compra ) => {
        const list = total_vins_with_orden_compra.map((obj) => {
            return {
                ...obj,
                isVinSelected  : false,
                FechaSiniestro : "",
                pasoASiniestro : false,
                // isVinSelected : obj.EstatusTyT === "0" ? false : true,
            }
        })
        return list;
    }

    const handleVinSelected = async ( e, registro ) => {
        
        const checked = e.target.checked;

        if ( checked === true ) {
            if ( addAnotherVINEditMode( registro ) === false ) return;
        }

        if ( validatePDFFiles( checked ) === false ) return;
        
        const question = '¿Desea pasar el VIN seleccionado a estado Siniestro?';

        const dateSin = checked ? await confirmationVINToSinister( question, registro.EstatusTyT.toString() ) : '';

        if ( dateSin === 'cancel' ) return;

        let getStatusTyTOfList = ''; 
        let varEstatusTyTAux = '';
        let getPatioOfList = ''; 
        let PatioAux = '';


        if ( checked ) {

            varEstatusTyTAux = registro.EstatusTyT == 0 ? 'EN PATIO' : registro.EstatusTyT;
            getStatusTyTOfList = statusTytCatList.find( sts => sts.nombreEstatus === varEstatusTyTAux.split('|').shift());
            
            PatioAux = registro.Patio;
            getPatioOfList = patiosUbiCatList.find( sts => sts.nombrePatio === PatioAux.split('|').shift());

        }

        const updateVIN = VINClientes.map((row) => {

            if ( registro.VIN === row.VIN ) {

              let updateRow = { 
                ...row, 
                isVinSelected  : checked,
                EstatusTyT     : checked ? varEstatusTyTAux === 'EN PATIO' ? 0 : `${getStatusTyTOfList.nombreEstatus}|${getStatusTyTOfList.clave}` : row.EstatusTyT,
                Patio          : checked ? `${getPatioOfList.nombrePatio}|${getPatioOfList.clave}` : row.Patio,
                /* NumeroCliente  : !checked ? row.NumeroCliente : writtendata.NumeroCliente,  */
                FechaSiniestro : dateSin,
                pasoASiniestro : (radioButton === Modificar && dateSin !== 'cancel' && dateSin !== '') ? true : false
              }

              if ( radioButton == Asignar ) {

                updateRow = updateRowValues( row, checked, dateSin );

              }

              insertNewVIN(updateRow,checked)
              return updateRow;
            }
      
            return row;

        })

        setVINSGeneratedinBD(false);
        setVINClientes(updateVIN)
              
    }

    const validatePDFFiles = ( checked ) => {
        let validation = true;
        if ( checked && writtendata.CartaClientePDF !== null && writtendata.CartaClientePDF.type !== "application/pdf") {
            toast.info('Favor de cargar la carta cliente en formato PDF, correspondiente a cada VIN.');
            validation = false;
        }
        if ( checked && writtendata.FacturaPagoPDF !== null && writtendata.FacturaPagoPDF.type !== "application/pdf") {
            toast.info('Favor de cargar la factura pago en formato PDF, correspondiente a cada VIN.');
            validation = false;
        } 
        return validation;   
    }

    const existsVINSelected = () => {
        let exist = false;
        VINClientes.map((o) => {
            if ( o.isVinSelected ) exist = true;
        })

        return exist;
    }

    const updateValuesVINSEditMode = async ( params ) => {
        
        const { name, value, files, hasEndDate, hasStartDate } = params;

        if ( VINClientes.find( obj => obj.isVinSelected ) === undefined ) return true; /* no hay VINS seleccionados.  */

        if ( !compareEqualityFromValueChanging( name ) ) {

            const confirmation = await confirmateSelect('Existen VINS seleccionados con diferentes valores del campo a modificar. ¿Desea continuar?');
            if ( !confirmation  ) return false;

        }

        let changeToSinister = false;
        let sinisterDate = '';

        if ( name === 'EstatusTyT' && VINClientes.find( obj => obj.pasoASiniestro ) !== undefined ) toast.info(`Existen VINS seleccionados que pasaran a siniestro, los cuales no cambiarán al estatus TyT: ${ value.split('|').shift() }`);
           
        if ( 
            ( name === 'EstatusTyT' && isEstatusTyTOnList( value ) ) || 
            (hasEndDate && isEstatusTyTOnList( value )) || 
            (hasStartDate && isEstatusTyTOnList( value )) ) {

            updateDatesTyTList( params );

            return true;

        }

        
        if ( value.split('|').shift() === "SINIESTRO" && name === 'EstatusTyT' ) {

            const question = '¿Desea pasar los VINS seleccionados a estado Siniestro?';

            const dateSin = await confirmationVINToSinister( question, 'SINIESTRO' );

            if ( dateSin === 'cancel' || dateSin === '' ) {  /* usuario canceló o no colocó fecha. */

                selectEstatusTyTRef.current.value = writtendata.EstatusTyT;

                return true; 
            }

            changeToSinister = true;
            sinisterDate = dateSin;
            
        }


        const updateVINSCliente = VINClientes.map((row) => {
            
            if ( row.isVinSelected && row.EstadoSiniestro !== 1 && row.EstadoSiniestro !== 2 && !row.pasoASiniestro) {

                let updateRow = {}

                if ( name === 'FacturaPagoPDF' ) {
                    updateRow = {
                        ...row,
                        FacturaPagoPDF  : ( files[0]?.type !== "application/pdf" || files[0]?.type === undefined ) ? null : files[0], 
                        
                    }
                }

                if ( name === 'CartaClientePDF' ) {
                    updateRow = {
                        ...row,
                        CartaClientePDF : ( files[0]?.type !== "application/pdf" || files[0]?.type === undefined ) ? null : files[0], 
                        
                    }
                }

                if ( name !== 'FacturaPagoPDF' && name !== 'CartaClientePDF' ) {

                    updateRow = {
                       ...row,
                       [name]          : value,
                       pasoASiniestro  : changeToSinister ? true : row.pasoASiniestro,
                       FechaSiniestro  : changeToSinister ? sinisterDate : row.FechaSiniestro 
                       
                   }
                }

                return updateRow;

            }
            return row
        })

        const updateVINSClienteGenerados = VINClientesGenerados.map((row) => {
            
            if ( name === 'FacturaPagoPDF' ) {
                return {
                    ...row, 
                    FacturaPagoPDF  : ( files[0]?.type !== "application/pdf" || files[0]?.type === undefined ) ? null : files[0], 
                    
                }
            }
            if ( name === 'CartaClientePDF' ) {
                return {
                    ...row, 
                    CartaClientePDF : ( files[0]?.type !== "application/pdf" || files[0]?.type === undefined ) ? null : files[0], 
                    
                }
            }
            if ( name !== 'FacturaPagoPDF' && name !== 'CartaClientePDF' ) {
                return {
                    ...row, 
                    [name]          : value, 
                    //recently added.
                    pasoASiniestro  : changeToSinister ? true : row.pasoASiniestro,
                    FechaSiniestro  : changeToSinister ? sinisterDate : row.FechaSiniestro 

                }
            }

        })

        setVINClientes(updateVINSCliente);
        setVINClientesGenerados(updateVINSClienteGenerados);

        return true;
    }

    const addAnotherVINEditMode = ( registro ) => {
        let assertValidation = true;

        if ( radioButton === Modificar ) {

            let { 
                EstatusGPS, 
                FechaSolicitudGPS, //Fecha Segregación 
                FechaAceptacionGPS, //Fecha Instalación
                EstatusPrevia, 
                EstatusTyT,
                Patio, /* new property added */ 
                FechaEntregaCliente, 
                FechaDeEnvioDocum, 
                FechaDeRecepcion,
                //Dates GM
                FechaDetencionSolicit,
                FechaDetencionAut,
                FechaSegregacionAut,
                FechaPreviaSolicit,
                FechaPreviaAut,
                FechaGPSSolicit,
                FechaGPSAut,
                FechaAccesoSolicit,
                FechaAccesoAut,
                FechaLiberacionSolicit,
                FechaLiberacionAut,
                FechaCalidadSolicit,
                FechaCalidadAut,
                FechaPagoSolicit,
                FechaPagoAut,
                Pago,
                //Dates TYT
                FechaInterplantaIngreso,
                FechaInterplantaSalida,
                FechaArmViajeIngreso,
                FechaArmViajeSalida,
                FechaAsigSinMadrinaIngreso,
                FechaAsigSinMadrinaSalida,
                FechaAsigEnMadrinaIngreso,
                FechaAsigEnMadrinaSalida,
                FechaTransitoIngreso,
                FechaTransitoSalida,
                CiudadDestino,
                OrdenDeCompra

            } = registro;

            /* if a VIN is already selected, it must compare values from next VIN trying to select. */
            if ( existsVINSelected() ) { /* text inputs onchange events will modify every VIN selected. */

                if ( EstatusTyT == 0 ) EstatusTyT = 'EN PATIO';
                if ( EstatusGPS == '' ) EstatusGPS = defaultEstatusGPS;
                if ( EstatusPrevia == '' ) EstatusPrevia = defaultEstatusPrevia;
                
                if ( Pago == '' ) Pago = defaultPay.PAGADO;

                let object = { 
                    EstatusGPS, EstatusPrevia, EstatusTyT, Pago, FechaSolicitudGPS, FechaAceptacionGPS, FechaEntregaCliente, FechaDeEnvioDocum, FechaDeRecepcion,
                    FechaDetencionSolicit, FechaDetencionAut, FechaSegregacionAut, FechaPreviaSolicit, FechaPreviaAut, FechaGPSSolicit, FechaGPSAut, FechaAccesoSolicit, FechaAccesoAut, 
                    FechaLiberacionSolicit, FechaLiberacionAut, FechaCalidadSolicit, FechaCalidadAut, FechaPagoSolicit, FechaPagoAut, FechaInterplantaIngreso, FechaInterplantaSalida, 
                    FechaArmViajeIngreso, FechaArmViajeSalida, FechaAsigSinMadrinaIngreso, FechaAsigSinMadrinaSalida, FechaAsigEnMadrinaIngreso, FechaAsigEnMadrinaSalida, FechaTransitoIngreso, 
                    FechaTransitoSalida, CiudadDestino, OrdenDeCompra    
                }

                if ( compareEqualityValues( object ) ){ }//Patio

                else {
                    toast.info("VIN con valores distintos a los seleccionados.");
                    assertValidation = false;
                }

            } else {/* data of first VIN selected will be deployed in all text inputs; only edit mode */

                if ( EstatusTyT == 0 ) EstatusTyT = 'EN PATIO';
                if ( EstatusGPS === '' ) EstatusGPS = defaultEstatusGPS;
                if ( EstatusPrevia === '' ) EstatusPrevia = defaultEstatusPrevia;

                if ( Pago === '' ) Pago = defaultPay.PAGADO;

                const getStatusTyTOfList = statusTytCatList.find( sts => sts.nombreEstatus === EstatusTyT.split('|').shift())

                const getStatusPatioOfList = patiosUbiCatList.find( sts => sts.nombrePatio === Patio.split('|').shift())

                setWrittendata({ 
                    ...writtendata,
                    EstatusGPS          : EstatusGPS,
                    FechaSolicitudGPS   : FechaSolicitudGPS.substring(0,10) === defaultDateDB ? defaultDate : FechaSolicitudGPS.substring(0,10),
                    FechaAceptacionGPS  : FechaAceptacionGPS.substring(0,10) === defaultDateDB ? defaultDate : FechaAceptacionGPS.substring(0,10),
                    EstatusPrevia       : EstatusPrevia,
                    EstatusTyT          : `${getStatusTyTOfList.nombreEstatus}|${getStatusTyTOfList.clave}`,
                    Patio               : `${getStatusPatioOfList.nombrePatio}|${getStatusPatioOfList.clave}`,
                    FechaEntregaCliente : FechaEntregaCliente.substring(0,10) === defaultDateDB ? defaultDate : FechaEntregaCliente.substring(0,10),
                    FechaDeEnvioDocum   : FechaDeEnvioDocum.substring(0,10) === defaultDateDB ? defaultDate : FechaDeEnvioDocum.substring(0,10),
                    FechaDeRecepcion    : FechaDeRecepcion.substring(0,10) === defaultDateDB ? defaultDate : FechaDeRecepcion.substring(0,10),
                    
                    //GM dates
                    FechaDetencionSolicit : FechaDetencionSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaDetencionSolicit.substring(0,10),
                    FechaDetencionAut     : FechaDetencionAut.substring(0,10) === defaultDateDB ? defaultDate : FechaDetencionAut.substring(0,10),
                    FechaSegregacionAut   : FechaSegregacionAut.substring(0,10) === defaultDateDB ? defaultDate : FechaSegregacionAut.substring(0,10),
                    FechaPreviaSolicit    : FechaPreviaSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaPreviaSolicit.substring(0,10),
                    FechaPreviaAut        : FechaPreviaAut.substring(0,10) === defaultDateDB ? defaultDate : FechaPreviaAut.substring(0,10),
                    FechaGPSSolicit       : FechaGPSSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaGPSSolicit.substring(0,10),
                    FechaGPSAut           : FechaGPSAut.substring(0,10) === defaultDateDB ? defaultDate : FechaGPSAut.substring(0,10),
                    FechaAccesoSolicit    : FechaAccesoSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaAccesoSolicit.substring(0,10),
                    FechaAccesoAut        : FechaAccesoAut.substring(0,10) === defaultDateDB ? defaultDate : FechaAccesoAut.substring(0,10),
                    FechaLiberacionSolicit: FechaLiberacionSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaLiberacionSolicit.substring(0,10),
                    FechaLiberacionAut    : FechaLiberacionAut.substring(0,10) === defaultDateDB ? defaultDate : FechaLiberacionAut.substring(0,10),
                    FechaCalidadSolicit   : FechaCalidadSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaCalidadSolicit.substring(0,10),
                    FechaCalidadAut       : FechaCalidadAut.substring(0,10) === defaultDateDB ? defaultDate : FechaCalidadAut.substring(0,10),
                    FechaPagoSolicit      : FechaPagoSolicit.substring(0,10) === defaultDateDB ? defaultDate : FechaPagoSolicit.substring(0,10),
                    FechaPagoAut          : FechaPagoAut.substring(0,10) === defaultDateDB ? defaultDate : FechaPagoAut.substring(0,10),
                    Pago                  : Pago,
                    //TYT Dates
                    FechaInterplantaIngreso    : FechaInterplantaIngreso.substring(0,10) === defaultDateDB ? defaultDate : FechaInterplantaIngreso.substring(0,10),
                    FechaInterplantaSalida     : FechaInterplantaSalida.substring(0,10) === defaultDateDB ? defaultDate : FechaInterplantaSalida.substring(0,10),
                    FechaArmViajeIngreso       : FechaArmViajeIngreso.substring(0,10) === defaultDateDB ? defaultDate : FechaArmViajeIngreso.substring(0,10),
                    FechaArmViajeSalida        : FechaArmViajeSalida.substring(0,10) === defaultDateDB ? defaultDate : FechaArmViajeSalida.substring(0,10),
                    FechaAsigSinMadrinaIngreso : FechaAsigSinMadrinaIngreso.substring(0,10) === defaultDateDB ? defaultDate : FechaAsigSinMadrinaIngreso.substring(0,10),
                    FechaAsigSinMadrinaSalida  : FechaAsigSinMadrinaSalida.substring(0,10) === defaultDateDB ? defaultDate : FechaAsigSinMadrinaSalida.substring(0,10),
                    FechaAsigEnMadrinaIngreso  : FechaAsigEnMadrinaIngreso.substring(0,10) === defaultDateDB ? defaultDate : FechaAsigEnMadrinaIngreso.substring(0,10),
                    FechaAsigEnMadrinaSalida   : FechaAsigEnMadrinaSalida.substring(0,10) === defaultDateDB ? defaultDate : FechaAsigEnMadrinaSalida.substring(0,10),
                    FechaTransitoIngreso       : FechaTransitoIngreso.substring(0,10) === defaultDateDB ? defaultDate : FechaTransitoIngreso.substring(0,10),
                    FechaTransitoSalida        : FechaTransitoSalida.substring(0,10) === defaultDateDB ? defaultDate : FechaTransitoSalida.substring(0,10)

                });
                
                
                const { first, third } = slices;

                if ( sliceSelected === first ) {
                
                    selectEstatusGPSRef.current.value     = EstatusGPS;
                    selectEstatusPreviaRef.current.value  = EstatusPrevia;
                    selectEstatusTyTRef.current.value     = `${getStatusTyTOfList.nombreEstatus}|${getStatusTyTOfList.clave}`;
                    selectPatioUbiRef.current.value       = `${getStatusPatioOfList.nombrePatio}|${getStatusPatioOfList.clave}`
                  
                }
                
                if ( sliceSelected === third ) selectPagoRef.current.value = Pago;

            }

        }    

      return assertValidation;
    }

    const insertNewVIN = (object, checked) => {

        if ( !checked ) {

            const updateList = VINClientesGenerados.filter((row) => {
                return row.VIN !== object.VIN
            })
      
            if ( updateList.length === 0 ) {
                
                setCheckAll(false);
                checkBoxSelectedAll.current.checked = false;
            }

            setVINClientesGenerados(updateList);
            return;

        }
      
        setVINClientesGenerados([
        ...VINClientesGenerados,
        { ...object }
        ])
    }

    const handleUpdateData = () => {
        const { first, third } = slices;

        setVINSGeneratedinBD(true);
        setCheckAll(false);

        const [ Ubicacion, Nombre_cliente, numeroCliente ] = selectClientsRef.current.value.split("|");

        if ( Nombre_cliente === pendientesEntrega[0].Nombre_corto || Nombre_cliente === pendientesEntrega[1].Nombre_corto ) getAllSummaryVINS( pendienteEntrega );
        else getVinsWithOrdenDeCompra( writtendata.NumeroCliente, OrdenCompra );
        

        if ( sliceSelected === third ) {

            inputFileCartaClienteRef.current.value  = null;
            inputFileFacturaPagoRef.current.value   = null;
        
        }

        setWrittendata({
            ...writtendata,
            CartaClientePDF     : null,
            FacturaPagoPDF      : null
        })

    }

    const downloadPDF = async ( PDF, VIN ) => {

        url = ApiUrl + "api/asignarvins/send_pdf"
        let body = {VIN, agencia, PDF}
        await axios.post(url, body, {responseType:'blob'})
        .then(response => {
            const fileUrl = window.URL.createObjectURL(response['data']);
            window.open(fileUrl, '_blank');
        })
        .catch(err => {
            toast.error('Error al descargar carta cliente.')
        })
    } 

    const validDefaultStatusTyT = ( status ) => {

        if ( status === "0" ) return "EN PATIO";

        if ( status.toString().split("|").shift() === "0" ) return "EN PATIO";

        return status.toString().split("|").shift();
    
    }

    const validPatio = ( patio ) => {
        
        return patio.toString().split("|").shift();

    }
   
    const pipesStatusPrevia = ( statusPrevia ) => {
        /* nota: No aplica = Patio, OK = Distribuidor */
        if ( statusPrevia === defaultEstatusPrevia )  return PATIO
        if ( statusPrevia === OK )  return DISTRIBUIDOR
        if ( statusPrevia === SINPREVIA )  return SINPREVIA
    }

    const handleCheckLlaveAll = ({ target }) => {
        //desactivar si no existe ningún VIN seleccionado.
        const { checked } = target;

        const updateVINSLlave = VINClientes.map((row) => {
            if (
                (radioButton === Asignar && row.Asignado == 0 && row.isVinSelected) ||
                // (radioButton === Modificar && row.isVinSelected === true) ||
                (radioButton === Modificar && row.pasoASiniestro === false && row.isVinSelected) ||
                (radioButton === Modificar && row.EstadoSiniestro !== 1 && row.isVinSelected) ||
                (radioButton === Modificar && row.EstadoSiniestro !== 2 && row.isVinSelected)
            ) {
                return { ...row, retiroDuplicadoLlave: checked ? 1 : 0 }
            }

            return row
        })

        setVINClientes( updateVINSLlave );

        if ( VINClientesGenerados.length > 0 ) {
            const updateVINSLlave = VINClientesGenerados.map((row) => {
                return { ...row, retiroDuplicadoLlave: checked ? 1 : 0 }
            })
            setVINClientesGenerados( updateVINSLlave );
        }

        

    }

    const handleCheckLlave = ( e, registro ) => {
       
        let check = e.target.checked ? 1 : 0;

        const updateVINS = VINClientes.map((obj) => {

            let updateObj = {...obj}
            if ( obj.VIN === registro.VIN ) {
                updateObj = {...obj, retiroDuplicadoLlave: check}
            }
            return updateObj;
        })

        if ( VINClientesGenerados.length > 0 ) {
            const updateVINSGen = VINClientesGenerados.map((obj) => {
                let updateObj = {...obj}
                if ( obj.VIN === registro.VIN ) {
                    updateObj = {...obj, retiroDuplicadoLlave: check}
                }
                return updateObj;
            })
            setVINClientesGenerados( updateVINSGen );
        }

        setVINClientes(updateVINS);
        
    }

    const onGenerateTable = () => {
        if ( VINSGeneratedinBD ) setVINClientesGenerados([]);
        setIsPreviewTable(!isPreviewTable)
         
        if ( isPreviewTable ) {
            try {
                dataTableDestroy();
                dataTable();
            } catch (error) {
                toast.error("Error al cargar registros en tabla.");
                
            }    
        }
    }

    const onChangeRadioButton = (e) => {
        swal({
            text:`Al cambiar al modo ${e.target.value} se perderán los cambios no guardados.
             ¿Desea continuar?`,
            icon:"info",
            buttons:["No","Si"]
            }).then( respuesta => {
            if ( respuesta ) {
                
                const [ Ubicacion, Nombre_cliente, numeroCliente ] = selectClientsRef.current.value.split("|");

                if ( Nombre_cliente === pendientesEntrega[0].Nombre_corto || Nombre_cliente === pendientesEntrega[1].Nombre_corto ) {
                
                    getAllSummaryVINS( pendienteEntrega );
                    setRadioButton(e.target.value);
                    if ( ordenesDeCompra.length > 0 ) setOrdenesDeCompra([]);
                    setDafaultInputValues();
                    
                    return;
                }

                getVinsWithOrdenDeCompra( writtendata.NumeroCliente, OrdenCompra );
                setRadioButton(e.target.value);
                setDafaultInputValues();

                if ( isImportExcelActive ) setIsImportExcelActive( false );
            }
            })

    }

    const onChangeSlice = ({ target }) => {

        const { value, name } = target;

        if ( sliceSelected !== value ) setSliceBeforeSelected( sliceSelected );
        
        setSliceSelected( value );

    }

    const confirmateSelect = async ( txt ) => {
        let confirm = false;
        await swal({
            text:`${txt}`,
            icon:"info",
            buttons:["No","Si"]
        }).then( respuesta => {

            if ( respuesta ) confirm = true;

        })
        return confirm;
    }

    const getDateModal = async (txt, tipo = '') => {
        let result = ''; 
        
        if ( tipo !== 'siniestro' ) {

            result = fechaHoy; 

            return result;
            
        }
        
        await swal({
            text:`${txt}`,
            content: {
                element: "input",
                attributes: {
                    placeholder: "Ingresar Fecha",
                    type: "date",
                },
            },
        }).then( respuesta => {
            result = respuesta;
            
        })
    
        return result;
    }

    const setDafaultInputValues = ( numeroCliente = '', UbicacionCliente = '', NombreCliente = '' ) => {

        setWrittendata({
            ...writtendata,
            NumeroCliente  : numeroCliente    !== '' ? numeroCliente : writtendata.NumeroCliente, 
            Ubicacion      : UbicacionCliente !== '' ? UbicacionCliente : writtendata.Ubicacion,
            NombreCliente  : NombreCliente    !== '' ? NombreCliente : writtendata.NombreCliente,

            FechaSolicitudGPS   : defaultDate,
            FechaAceptacionGPS  : defaultDate,
            EstatusGPS          : defaultEstatusGPS,
            EstatusPrevia       : defaultEstatusPrevia,
            EstatusTyT          : PATIOSTATUSTYT,
            Patio               : UBICACIONPATIO,
            FechaEntregaCliente : defaultDate,
            FechaDeEnvioDocum   : defaultDate,
            FechaDeRecepcion    : defaultDate,
            Observaciones       : '',
            ObservacionesTyT    : '',
            ObservacionesVIN    : '',
            CartaClientePDF     : null,
            FacturaPagoPDF      : null,
            //GM Dates
            FechaDetencionSolicit : defaultDate,
            FechaDetencionAut     : defaultDate,
            FechaGPSSolicit       : defaultDate,
            FechaGPSAut           : defaultDate,
            FechaSegregacionAut   : defaultDate,
            FechaAccesoSolicit    : defaultDate,
            FechaAccesoAut        : defaultDate,
            FechaLiberacionSolicit: defaultDate,
            FechaLiberacionAut    : defaultDate,
            FechaPreviaSolicit    : defaultDate,
            FechaPreviaAut        : defaultDate,
            FechaCalidadSolicit   : defaultDate,
            FechaCalidadAut       : defaultDate,
            FechaPagoSolicit      : defaultDate,
            FechaPagoAut          : defaultDate,
            Pago                  : defaultPay.PAGADO,

            //TyT Dates.
            FechaInterplantaIngreso    : defaultDate,
            FechaInterplantaSalida     : defaultDate,
            FechaArmViajeIngreso       : defaultDate,
            FechaArmViajeSalida        : defaultDate,
            FechaAsigSinMadrinaIngreso : defaultDate,
            FechaAsigSinMadrinaSalida  : defaultDate,
            FechaAsigEnMadrinaIngreso  : defaultDate,
            FechaAsigEnMadrinaSalida   : defaultDate,
            FechaTransitoIngreso       : defaultDate,
            FechaTransitoSalida        : defaultDate,

        });
       

        if ( sliceSelected === slices.first ) {
        
            selectEstatusGPSRef.current.value  = defaultEstatusGPS;
            selectEstatusPreviaRef.current.value  = defaultEstatusPrevia;
            selectEstatusTyTRef.current.value = PATIOSTATUSTYT;
            selectPatioUbiRef.current.value = UBICACIONPATIO;

        }
        
        if ( sliceSelected === slices.third ) {

            inputFileCartaClienteRef.current.value  = null;
            inputFileFacturaPagoRef.current.value   = null;
            selectPagoRef.current.value = defaultPay.PAGADO;

        }
        
    }

    const handleVinSelectedAll = async ({ target }) => {

        const checked = target.checked;
        
        if ( VINSGeneratedinBD ) setVINSGeneratedinBD(false);
        
        const question = '¿Desea pasar los VINS diponibles a estado Siniestro?';

        const dateSin = checked ? await confirmationVINToSinister( question ) : '';

        if ( dateSin === 'cancel' ) return;

        if ( radioButton === Asignar ) {

            const updateVINS = VINClientes.map((row) => {

                let updateRow = {...row}

                if ( row.Asignado == 0 ) {

                    updateRow = updateRowValues( row, checked, dateSin );

                    return updateRow;    
                }
                return updateRow;
            })

            setVINClientes( updateVINS );

            if ( checked ) {
                const filtrarVINSNoAsignados = updateVINS.filter((obj) => obj.Asignado == 0)
                setVINClientesGenerados([ ...filtrarVINSNoAsignados ]);
                setCheckAll( checked )
                
            }

            if ( !checked ) {
                setVINClientesGenerados([]);
                setCheckAll( checked )
            }

            return;
        }

        if ( radioButton === Modificar ) {

            let selectSinisters = false;
            let sinisterDate = '';

            if ( checked ) {
                const confirmation = await confirmateSelect('¿Desea seleccionar todas las coincidencias?'); /* Las coincidencias son: Estatus TyT, Destino, OC */
                if ( !confirmation  ) return;
            }

            if ( writtendata.EstatusTyT.split('|').shift() === 'SINIESTRO' && checked ) {

                const { FechaSiniestro } = VINClientes.find( obj => obj.pasoASiniestro );

                if ( FechaSiniestro !== undefined ) {
                    selectSinisters = true;
                    sinisterDate = FechaSiniestro;
                }

            }
            
            const updateVINS = VINClientes.map((row) => {

                let { 
                    EstatusTyT, Patio, EstatusGPS, EstatusPrevia, FechaSolicitudGPS, FechaAceptacionGPS, FechaEntregaCliente, FechaDeEnvioDocum, FechaDeRecepcion,
                    Pago, FechaDetencionSolicit, FechaDetencionAut, FechaSegregacionAut, FechaPreviaSolicit, FechaPreviaAut, FechaGPSSolicit, FechaGPSAut,
                    FechaAccesoSolicit, FechaAccesoAut, FechaLiberacionSolicit, FechaLiberacionAut, FechaCalidadSolicit, FechaCalidadAut, FechaPagoSolicit, 
                    FechaPagoAut, CiudadDestino, OrdenDeCompra 
                } = row;

                
                let varEstatusTyTAux = EstatusTyT == 0 ? 'EN PATIO' : EstatusTyT;
                
                if ( EstatusGPS == '' ) EstatusGPS = defaultEstatusGPS;
                if ( EstatusPrevia == '' ) EstatusPrevia = defaultEstatusPrevia;

                if ( Pago == '' ) Pago = defaultPay.PAGADO;

                let object = { 
                    EstatusGPS, EstatusPrevia, EstatusTyT: varEstatusTyTAux, Pago, FechaSolicitudGPS, FechaAceptacionGPS, FechaEntregaCliente, FechaDeEnvioDocum, FechaDeRecepcion,
                    FechaDetencionSolicit, FechaDetencionAut, FechaSegregacionAut, FechaPreviaSolicit, FechaPreviaAut, FechaGPSSolicit, FechaGPSAut, FechaAccesoSolicit, FechaAccesoAut, 
                    FechaLiberacionSolicit, FechaLiberacionAut, FechaCalidadSolicit, FechaCalidadAut, FechaPagoSolicit, FechaPagoAut, CiudadDestino, OrdenDeCompra    
                }

                /* Modo importación excel - no validar coincidencias OC, dest, estatus */
                if ( 
                    isImportExcelActive && 
                    writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto &&
                    !checked &&
                    row.EstadoSiniestro !== 1 && 
                    row.EstadoSiniestro !== 2 && 
                    !row.pasoASiniestro 
                    ) {

                    return {
                        ...row,
                        isVinSelected: checked
                    }

                }

                if ( compareEqualityValues( object ) && row.EstadoSiniestro !== 1 && row.EstadoSiniestro !== 2 && !row.pasoASiniestro ) { /* EstadoSiniestro 1 : en revision, EstadoSiniestro 2 : En proceso */

                    const getStatusTyTOfList = statusTytCatList.find( sts => sts.nombreEstatus === varEstatusTyTAux.split('|').shift());
                    const getPatioOfList = patiosUbiCatList.find( sts => sts.nombrePatio === Patio.split('|').shift());

                    return { 
                        ...row, 
                        isVinSelected  : checked,
                        EstatusTyT     : varEstatusTyTAux === 'EN PATIO' ? 0 : `${getStatusTyTOfList.nombreEstatus}|${getStatusTyTOfList.clave}`,
                        Patio          : `${getPatioOfList.nombrePatio}|${getPatioOfList.clave}`, //getPatioOfList, 
                        pasoASiniestro : ( selectSinisters ) ? true : false,
                        FechaSiniestro : ( selectSinisters ) ? sinisterDate : '',
                        // NumeroCliente  : !checked ? row.NumeroCliente : writtendata.NumeroCliente,
                    }
                }

                return { ...row };
                
            })

            setVINClientes(updateVINS);
        
            if ( checked ) {

                const filtrarVINSSelected = updateVINS.filter((obj) => obj.isVinSelected);
                setVINClientesGenerados([...filtrarVINSSelected]);
                setCheckAll( checked );

            }

            if ( !checked ) {

                const filterVINSSinister = VINClientes.filter( obj => obj.pasoASiniestro );

                setVINClientesGenerados(filterVINSSinister);
                setCheckAll( checked );

                if( isImportExcelActive ) setIsImportExcelActive( false );

            }

            
        }
    }

    const disabledCheckLlaveAll = () => {
        if ( VINClientes.length === 0 ) return true;

        const findVinSelected = VINClientes.find(obj => obj.isVinSelected );

        if ( findVinSelected === undefined ) return true;

        return false;
    };

    const disabledVINSelectedAll = () => {

        if ( VINClientes.length === 0 ) return true;

        if ( radioButton === Asignar ) {

            let existVINEnable = VINClientes.find((obj) => obj.Asignado === 0 );
            if ( existVINEnable === undefined ) return true;

        }

        if ( radioButton === Modificar ) {

            if ( VINClientesGenerados.length === 0 ) return true;
                   
        }

        return false;
    }

    const dataTable = () => {
        setTimeout(() => {
            $('#statusGPSTable').DataTable(statusGPSDataTable);
        }, 500);
        
    }
    
    const dataTableDestroy = () => {
        $("#statusGPSTable").DataTable().destroy();
    }

    const validationsCheckBox = ( radioButton, registro ) => {

        const { Asignado, EstadoSiniestro, pasoASiniestro } = registro;

        if ( radioButton === Asignar && Asignado !== 0 ) return true;

        if ( radioButton === Modificar && EstadoSiniestro === 1 || EstadoSiniestro === 2 ) return true; // Estados en tabla sql: [Indicadores].[dbo].[Estatus_siniestros_flotillas] 

        if ( radioButton === Modificar && pasoASiniestro ) return true;

        return false;
    }

    const confirmationVINToSinister = async ( txt, EstatusTyTVIN = '' ) => {

        let dateSin = '';
        
        if ( 
            radioButton === Asignar && writtendata.EstatusTyT.split('|').shift() === "SINIESTRO"  ||
            radioButton === Modificar && EstatusTyTVIN.split('|').shift() === "SINIESTRO"
            ) { 
            
            const confirm = await confirmateSelect(`${ txt }`);

            if ( !confirm ) return radioButton == Asignar ? 'cancel' : '';

            dateSin = await getDateModal('Favor de indicar la fecha del siniestro', 'siniestro');
            
            if ( dateSin === null ) return 'cancel';
            
        }

        return dateSin;

    }

    const searchDateEstatusTyT = async ( estatusValue, dateType ) => {
    
        /* TODO: recibir un parámetro adicional para tomar la fecha en automático */ //ya obtenemos la fecha en automático

        let ingreso = 'ingreso';
        let response = { dateName : '', date : null };
        let message = `Favor de indicar la fecha de ${ dateType }`;

        if ( estatusValue === estatusTyTObj.INTERPLANTA ) { 

            response.dateName = dateType === ingreso ? estatusKeysTyTList.FechaInterplantaIngreso : estatusKeysTyTList.FechaInterplantaSalida;
            response.date = await getDateModal(`${ message } ${ estatusTyTObj.INTERPLANTA }`);

            return response;

        }
        
        if ( estatusValue === estatusTyTObj.ARMANDOVIAJE ) { 

            response.dateName = dateType === ingreso ? estatusKeysTyTList.FechaArmViajeIngreso : estatusKeysTyTList.FechaArmViajeSalida;
            response.date = await getDateModal(`${ message } ${ estatusTyTObj.ARMANDOVIAJE }`);

            return response;

        }
        
        if ( estatusValue === estatusTyTObj.ASIGNADOSINMADRINA ) {
            
            response.dateName = dateType === ingreso ? estatusKeysTyTList.FechaAsigSinMadrinaIngreso : estatusKeysTyTList.FechaAsigSinMadrinaSalida;
            response.date = await getDateModal(`${ message } ${ estatusTyTObj.ASIGNADOSINMADRINA }`);

            return response;

        }
        
        if ( estatusValue === estatusTyTObj.ASIGNADOENMADRINA ) { 

            response.dateName = dateType === ingreso ? estatusKeysTyTList.FechaAsigEnMadrinaIngreso : estatusKeysTyTList.FechaAsigEnMadrinaSalida;
            response.date = await getDateModal(`${ message } ${ estatusTyTObj.ASIGNADOENMADRINA }`);

            return response;

        }
        
        if ( estatusValue === estatusTyTObj.ENTRANSITO ) { 

            response.dateName = dateType === ingreso ? estatusKeysTyTList.FechaTransitoIngreso : estatusKeysTyTList.FechaTransitoSalida;
            response.date = await getDateModal(`${ message } ${ estatusTyTObj.ENTRANSITO }`);

            return response;

        }

    }

    const onOrderSelected = async ( client ) => {
        
        const { Cliente, NombreCliente, Ubicacion, OrdenDeCompra, pendienteEntrega } = client;

        if ( NombreCliente === 'TODOS' ) {
            
            closeModalEntregas();

            await getAllSummaryVINS( pendienteEntrega );

            if ( ordenesDeCompra.length > 0 ) setOrdenesDeCompra([]);
            
            setDafaultInputValues(
                0,
                '',
                pendienteEntrega === pendientesEntrega[0].Nombre_corto.split(' ').shift() ? pendientesEntrega[0].Nombre_corto : pendientesEntrega[1].Nombre_corto
            ); 

            return;
        }

        await displayClientOrder( NombreCliente, Ubicacion, Cliente, OrdenDeCompra );

        closeModalEntregas();

    }

    const getAllSummaryVINS = async ( pendienteEntrega ) => {

        setIsChargingVins( true );

        url = ApiUrl + 'api/asignarvins/all_summary_vins';

        const body = { pendienteEntrega };

        let summaryList = await axiosPostService( url, body );
       
        if ( VINClientesGenerados.length > 0 && !isPreviewTable) setVINClientesGenerados([]);
        if ( summaryList.length > 0 ) summaryList = agregarVariableIsSelected( summaryList );

        if( checkBoxSelectedAll.current?.checked !== null ) {
            if ( checkBoxSelectedAll.current?.checked ) checkBoxSelectedAll.current.checked = false;
        }

        try {
            dataTableDestroy();
            setVINClientes( summaryList );
            dataTable();
            setIsChargingVins( false );

        } catch (error) {
            toast.error("Error al cargar registros en tabla.")
            
        }


    }

    const displayClientOrder = async ( NombreCliente, UbicacionCliente, numeroCliente, ordenCompra ) => {

        url = ApiUrl + "api/asignarvins/get_ordenes_de_compra";

        const body_cliente = { 
            Agencia          : agencia, 
            NombreCliente    : NombreCliente, 
            UbicacionCliente : UbicacionCliente,
            Num_cliente      : numeroCliente 
        };

        const total_ordenes_compra = await axiosPostService( url, body_cliente );

        setOrdenesDeCompra(total_ordenes_compra);

        setOrdenCompra( ordenCompra );

        getVinsWithOrdenDeCompra( numeroCliente, ordenCompra );

        setDafaultInputValues( numeroCliente, UbicacionCliente, NombreCliente); //send parameters. ( pending ).

        selectClientsRef.current.value = `${UbicacionCliente}|${NombreCliente}|${numeroCliente}`
        selectOrderRef.current.value = ordenCompra;

    }

    const updateRowValues = ( row, checked, dateSin ) => {

        return {
            ...row,
            FacturaPagoPDF        : !checked ? null                      : writtendata.FacturaPagoPDF,
            CartaClientePDF       : !checked ? null                      : writtendata.CartaClientePDF,
            EstatusGPS            : !checked ? row.EstatusGPS            : writtendata.EstatusGPS, 
            EstatusPrevia         : !checked ? row.EstatusPrevia         : writtendata.EstatusPrevia, 
            EstatusTyT            : !checked ? row.EstatusTyT            : writtendata.EstatusTyT, 
            /* new property Patio*/
            Patio                 : !checked ? row.Patio                 : writtendata.Patio, 
            FechaAceptacionGPS    : !checked ? row.FechaAceptacionGPS    : writtendata.FechaAceptacionGPS,
            FechaDeEnvioDocum     : !checked ? row.FechaDeEnvioDocum     : writtendata.FechaDeEnvioDocum,
            FechaDeRecepcion      : !checked ? row.FechaDeRecepcion      : writtendata.FechaDeRecepcion,
            FechaEntregaCliente   : !checked ? row.FechaEntregaCliente   : writtendata.FechaEntregaCliente,
            isVinSelected         :  checked,
            
            Observaciones         : !checked ? row.Observaciones         : writtendata.Observaciones,
            ObservacionesTyT      : !checked ? row.ObservacionesTyT      : writtendata.ObservacionesTyT,
            ObservacionesVIN      : !checked ? row.ObservacionesVIN      : writtendata.ObservacionesVIN,
            
            FechaSiniestro        : !checked ? row.FechaSiniestro        : dateSin, 
            FechaDetencionSolicit : !checked ? row.FechaDetencionSolicit : writtendata.FechaDetencionSolicit,
            FechaDetencionAut     : !checked ? row.FechaDetencionAut     : writtendata.FechaDetencionAut,
            FechaGPSSolicit       : !checked ? row.FechaGPSSolicit       : writtendata.FechaGPSSolicit,
            FechaGPSAut           : !checked ? row.FechaGPSAut           : writtendata.FechaGPSAut,
            FechaSolicitudGPS     : !checked ? row.FechaSolicitudGPS     : writtendata.FechaSolicitudGPS, /* FechaSolicitudGPS es igual a FechaSegregacion Solicit */
            FechaSegregacionAut   : !checked ? row.FechaSegregacionAut   : writtendata.FechaSegregacionAut,
            FechaAccesoSolicit    : !checked ? row.FechaAccesoSolicit    : writtendata.FechaAccesoSolicit,
            FechaAccesoAut        : !checked ? row.FechaAccesoAut        : writtendata.FechaAccesoAut,
            FechaPreviaSolicit    : !checked ? row.FechaPreviaSolicit    : writtendata.FechaPreviaSolicit,
            FechaPreviaAut        : !checked ? row.FechaPreviaAut        : writtendata.FechaPreviaAut,
            FechaLiberacionSolicit: !checked ? row.FechaLiberacionSolicit: writtendata.FechaLiberacionSolicit,
            FechaLiberacionAut    : !checked ? row.FechaLiberacionAut    : writtendata.FechaLiberacionAut,
            FechaCalidadSolicit   : !checked ? row.FechaCalidadSolicit   : writtendata.FechaCalidadSolicit,
            FechaCalidadAut       : !checked ? row.FechaLiberacionSolicit: writtendata.FechaLiberacionSolicit,
            FechaPagoSolicit      : !checked ? row.FechaPagoSolicit      : writtendata.FechaPagoSolicit,
            FechaPagoAut          : !checked ? row.FechaPagoAut          : writtendata.FechaPagoAut,
            Pago                  : !checked ? row.Pago                  : writtendata.Pago,

            FechaInterplantaIngreso    : !checked ? row.FechaInterplantaIngreso    : writtendata.FechaInterplantaIngreso,
            FechaInterplantaSalida     : !checked ? row.FechaInterplantaSalida     : writtendata.FechaInterplantaSalida,
            FechaArmViajeIngreso       : !checked ? row.FechaArmViajeIngreso       : writtendata.FechaArmViajeIngreso,
            FechaArmViajeSalida        : !checked ? row.FechaArmViajeSalida        : writtendata.FechaArmViajeSalida,
            FechaAsigSinMadrinaIngreso : !checked ? row.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
            FechaAsigSinMadrinaSalida  : !checked ? row.FechaAsigSinMadrinaSalida  : writtendata.FechaAsigSinMadrinaSalida,
            FechaAsigEnMadrinaIngreso  : !checked ? row.FechaAsigEnMadrinaIngreso  : writtendata.FechaAsigEnMadrinaIngreso,
            FechaAsigEnMadrinaSalida   : !checked ? row.FechaAsigEnMadrinaSalida   : writtendata.FechaAsigEnMadrinaSalida,
            FechaTransitoIngreso       : !checked ? row.FechaTransitoIngreso       : writtendata.FechaTransitoIngreso,
            FechaTransitoSalida        : !checked ? row.FechaTransitoSalida        : writtendata.FechaTransitoSalida,
        }

    }

    const compareEqualityValues = ({ 
        EstatusGPS, EstatusPrevia, EstatusTyT, Pago, FechaSolicitudGPS, FechaAceptacionGPS, FechaEntregaCliente, FechaDeEnvioDocum, FechaDeRecepcion,
        FechaDetencionSolicit, FechaDetencionAut, FechaSegregacionAut, FechaPreviaSolicit, FechaPreviaAut, FechaGPSSolicit, FechaGPSAut, FechaAccesoSolicit, FechaAccesoAut, 
        FechaLiberacionSolicit, FechaLiberacionAut, FechaCalidadSolicit, FechaCalidadAut, FechaPagoSolicit, FechaPagoAut, FechaInterplantaIngreso,FechaInterplantaSalida,
        FechaArmViajeIngreso, FechaArmViajeSalida, FechaAsigSinMadrinaIngreso, FechaAsigSinMadrinaSalida, FechaAsigEnMadrinaIngreso, FechaAsigEnMadrinaSalida, FechaTransitoIngreso,
        FechaTransitoSalida, CiudadDestino = '', OrdenDeCompra = ''    
    }) => {

        let areEqual = false;

        if (
            /* EstatusGPS === writtendata.EstatusGPS &&
            EstatusPrevia === writtendata.EstatusPrevia && */
            EstatusTyT.split('|').shift() === writtendata.EstatusTyT.split('|').shift() &&
            compareCityAndOC( CiudadDestino, OrdenDeCompra )
            /* validateDate( FechaSolicitudGPS )   === writtendata.FechaSolicitudGPS &&
            validateDate( FechaAceptacionGPS )  === writtendata.FechaAceptacionGPS &&
            validateDate( FechaEntregaCliente ) === writtendata.FechaEntregaCliente &&
            validateDate( FechaDeEnvioDocum )   === writtendata.FechaDeEnvioDocum &&
            validateDate( FechaDeRecepcion )    === writtendata.FechaDeRecepcion && */

            //new properties added.
            /* Pago == writtendata.Pago &&
            validateDate( FechaDetencionSolicit )      === writtendata.FechaDetencionSolicit &&
            validateDate( FechaDetencionAut )          === writtendata.FechaDetencionAut &&
            validateDate( FechaSegregacionAut )        === writtendata.FechaSegregacionAut &&
            validateDate( FechaPreviaSolicit )         === writtendata.FechaPreviaSolicit &&
            validateDate( FechaPreviaAut )             === writtendata.FechaPreviaAut &&
            validateDate( FechaGPSSolicit )            === writtendata.FechaGPSSolicit &&
            validateDate( FechaGPSAut )                === writtendata.FechaGPSAut &&
            validateDate( FechaAccesoSolicit )         === writtendata.FechaAccesoSolicit &&
            validateDate( FechaAccesoAut )             === writtendata.FechaAccesoAut &&
            validateDate( FechaLiberacionSolicit )     === writtendata.FechaLiberacionSolicit &&
            validateDate( FechaLiberacionAut )         === writtendata.FechaLiberacionAut &&
            validateDate( FechaCalidadSolicit )        === writtendata.FechaCalidadSolicit &&
            validateDate( FechaCalidadAut )            === writtendata.FechaCalidadAut &&
            validateDate( FechaPagoSolicit )           === writtendata.FechaPagoSolicit &&
            validateDate( FechaPagoAut )               === writtendata.FechaPagoAut && */
            //Dates tyt.

            /* validateDate( FechaInterplantaIngreso )    === writtendata.FechaInterplantaIngreso &&
            validateDate( FechaInterplantaSalida )     === writtendata.FechaInterplantaSalida &&
            validateDate( FechaArmViajeIngreso )       === writtendata.FechaArmViajeIngreso &&
            validateDate( FechaArmViajeSalida )        === writtendata.FechaArmViajeSalida &&
            validateDate( FechaAsigSinMadrinaIngreso ) === writtendata.FechaAsigSinMadrinaIngreso &&
            validateDate( FechaAsigSinMadrinaSalida )  === writtendata.FechaAsigSinMadrinaSalida &&
            validateDate( FechaAsigEnMadrinaIngreso )  === writtendata.FechaAsigEnMadrinaIngreso &&
            validateDate( FechaAsigEnMadrinaSalida )   === writtendata.FechaAsigEnMadrinaSalida &&
            validateDate( FechaTransitoIngreso )       === writtendata.FechaTransitoIngreso &&
            validateDate( FechaTransitoSalida )        === writtendata.FechaTransitoSalida */ 

        ) areEqual = true;

        return areEqual;
    }

    const compareCityAndOC = ( CiudadDestino, OrdenDeCompra ) => {
        let areEqual = true;

        const filterSelectedVINS = VINClientes.filter(obj => obj.isVinSelected )

        for (const child of filterSelectedVINS) {

            if ( 
                CiudadDestino.trim() !== child.CiudadDestino.trim() ||
                OrdenDeCompra.trim() !== child.OrdenDeCompra.trim()
            ) areEqual = false;

        }

        return areEqual;

    }

    const compareEqualityFromValueChanging = ( name ) => {
        let areEqual = true;

        const filterSelectedVINS = VINClientes.filter(obj => obj.isVinSelected );

        // if ( filterSelectedVINS.length === 0 ) return true; /* no existen VINS para comparar; retornamos true para que no acceda a la condicionante al llamar esta función */

        const firstObject = filterSelectedVINS[0];

        for (const obj of filterSelectedVINS) {
            
            if ( firstObject[name] !== obj[name] ) areEqual = false;

        }

        return areEqual;

    }

    const isEstatusTyTOnList = ( value ) => {
        return estatusTyTList.includes( value.split('|').shift() ) ? true : false;
    }

    const updateWrittenData = ({ name, value, hasEndDate,hasStartDate, endDateObj, startDateObj }) => {

        if ( hasEndDate && hasStartDate ) {

            setDatesEstatusTyT( endDateObj, startDateObj, especificDate.both, name, value );

            return;
        }
        
        if ( hasStartDate ) {

            setDatesEstatusTyT( endDateObj, startDateObj, especificDate.start, name, value );

            return;
        }
        
        if ( hasEndDate ) {

            setDatesEstatusTyT( endDateObj, startDateObj, especificDate.end, name, value );

            return;
        }
        
        setWrittendata({
            ...writtendata,
            [name] : value
        }) 

    }

    const setDatesEstatusTyT = ( endDateObj, startDateObj, espDate, name, value ) => {

        if ( espDate === especificDate.both ) {

            if ( endDateObj.dateName === estatusKeysTyTList.FechaInterplantaSalida ) {
    
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaInterplantaSalida
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName], //FechaArmViajeIngreso    
                })
    
                return;
            }

            if ( endDateObj.dateName === estatusKeysTyTList.FechaArmViajeSalida ) {

                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaArmViajeSalida
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName], //FechaAsigSinMadrinaIngreso    
                })

                return;
            }

            if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaSalida ) {

                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaAsigSinMadrinaSalida
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName], //FechaAsigEnMadrinaIngreso    
                })

                return;

            }

            if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaSalida ) {

                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida,
                    
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaAsigEnMadrinaSalida
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName], //FechaTransitoIngreso    
                })

                return;

            }

            if ( endDateObj.dateName === estatusKeysTyTList.FechaTransitoSalida ) {
                //it should not enter to this option because only it contains endDateTransito but not no one start date.
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaTransitoIngreso  
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName], //any?
                })

                return;
            }

        }

        if ( espDate === especificDate.start ) {

            if ( startDateObj.dateName === estatusKeysTyTList.FechaInterplantaIngreso ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName],  //FechaInterplantaIngreso
                });

                return;
            }
            
            if ( startDateObj.dateName === estatusKeysTyTList.FechaArmViajeIngreso ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName],  //FechaArmViajeIngreso
                });

                return;
            }
            
            if ( startDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaIngreso ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName],  //FechaAsigSinMadrinaIngreso
                });

                return;
            }
            
            if ( startDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaIngreso ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida,
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName],  //FechaAsigEnMadrinaSalida
                });

                return;
            }
            
            if ( startDateObj.dateName === estatusKeysTyTList.FechaTransitoIngreso ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida,
                    FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso,
                    FechaAsigEnMadrinaSalida : writtendata.FechaAsigEnMadrinaSalida === defaultDate ? startDateObj.date !== null ? startDateObj.date : writtendata.FechaAsigEnMadrinaSalida : writtendata.FechaAsigEnMadrinaSalida,
                    [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : writtendata[startDateObj.dateName],  //FechaTransitoIngreso
                });

                return;
            }

        }
        
        if ( espDate === especificDate.end ) {

            if ( endDateObj.dateName === estatusKeysTyTList.FechaInterplantaSalida ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaInterplantaSalida
                    
                })
                
                return;
            }
            
            if ( endDateObj.dateName === estatusKeysTyTList.FechaArmViajeSalida ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaArmViajeSalida
                    
                })
                
                return;
            }
            
            if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaSalida ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaAsigSinMadrinaSalida
                    
                })
                
                return;
            }
            
            if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaSalida ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida,
                    FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaAsigEnMadrinaSalida
                    
                })
                
                return;
            }
           
            if ( endDateObj.dateName === estatusKeysTyTList.FechaTransitoSalida ) {
                
                setWrittendata({
                    ...writtendata,
                    [name]        : value,
                    FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaIngreso : writtendata.FechaInterplantaIngreso,
                    FechaInterplantaSalida : writtendata.FechaInterplantaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaInterplantaSalida : writtendata.FechaInterplantaSalida,
                    FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeIngreso : writtendata.FechaArmViajeIngreso,
                    FechaArmViajeSalida : writtendata.FechaArmViajeSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaArmViajeSalida : writtendata.FechaArmViajeSalida,
                    FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigSinMadrinaIngreso : writtendata.FechaAsigSinMadrinaIngreso,
                    FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigSinMadrinaSalida : writtendata.FechaAsigSinMadrinaSalida,
                    FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigEnMadrinaIngreso : writtendata.FechaAsigEnMadrinaIngreso,
                    FechaAsigEnMadrinaSalida : writtendata.FechaAsigEnMadrinaSalida === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaAsigEnMadrinaSalida : writtendata.FechaAsigEnMadrinaSalida,
                    FechaTransitoIngreso : writtendata.FechaTransitoIngreso === defaultDate ? endDateObj.date !== null ? endDateObj.date : writtendata.FechaTransitoIngreso : writtendata.FechaTransitoIngreso,
                    [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : writtendata[endDateObj.dateName], //FechaTransitoSalida
                    
                })
                
                return;
            }

        }

    }

    const updateDatesTyTList = ( params ) => {

        const { name, value, hasEndDate, hasStartDate, endDateObj, startDateObj } = params;
        let updateVINSCliente = [];
        let updateVINSClienteGenerados = [];

        if ( hasEndDate && hasStartDate ) { //both

            updateVINSCliente = VINClientes.map((row) => {

                if ( row.isVinSelected && row.EstadoSiniestro !== 1 && row.EstadoSiniestro !== 2 && !row.pasoASiniestro) { /* esta validación no se ocupará modificar. */

                    return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'both' );

                }

                return row;

            });   
            
            updateVINSClienteGenerados = VINClientesGenerados.map((row) => {

                return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'both' );   

            });

            setVINClientes( updateVINSCliente );
            setVINClientesGenerados( updateVINSClienteGenerados );
            return;
        }

        if ( hasStartDate ) { //start

            updateVINSCliente = VINClientes.map((row) => {

                if ( row.isVinSelected && row.EstadoSiniestro !== 1 && row.EstadoSiniestro !== 2 && !row.pasoASiniestro) {

                    return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'start' );

                }

                return row;

            });   
            
            updateVINSClienteGenerados = VINClientesGenerados.map((row) => {

                return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'start' );   

            });

            setVINClientes( updateVINSCliente );
            setVINClientesGenerados( updateVINSClienteGenerados );
            return;
        } 

        if ( hasEndDate ) { //end

            updateVINSCliente = VINClientes.map((row) => {

                if ( row.isVinSelected && row.EstadoSiniestro !== 1 && row.EstadoSiniestro !== 2 && !row.pasoASiniestro) {

                    return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'end' );

                }

                return row;

            });   
            
            updateVINSClienteGenerados = VINClientesGenerados.map((row) => {

                return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'end' );   

            });

            setVINClientes( updateVINSCliente );
            setVINClientesGenerados( updateVINSClienteGenerados );
            return;

        }

        
    }

    const helperDatesTyT = ( name, value,  endDateObj, startDateObj, row, espDate ) => { /* values of espDate: 'both', 'start', 'end' */

        switch ( espDate ) { 
            case 'both':
                
                if ( endDateObj.dateName === estatusKeysTyTList.FechaInterplantaSalida ) {

                    return {
                        ...row,
                        /* NombreCliente          : writtendata.NombreCliente,
                        NumeroCliente          : writtendata.NumeroCliente, */
                        [name]        : value,
                        [endDateObj.dateName]  : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaInterplantaSalida
                        [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName], //FechaArmViajeIngreso    
                    }
                }
        
                if ( endDateObj.dateName === estatusKeysTyTList.FechaArmViajeSalida ) {

                    return {
                        ...row,
                        [name]         : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        [endDateObj.dateName]   : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaArmViajeSalida
                        [startDateObj.dateName] : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName], //FechaAsigSinMadrinaIngreso    
                    }
                }
        
                if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaSalida ) {

                    return {
                        ...row,
                        [name]         : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida     : reduceString(row.FechaArmViajeSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        [endDateObj.dateName]   : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaAsigSinMadrinaSalida
                        [startDateObj.dateName] : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName], //FechaAsigEnMadrinaIngreso  
                    }
        
                }
        
                if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaSalida ) {

                    return {
                        ...row,
                        [name]         : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida     : reduceString(row.FechaArmViajeSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso : reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        FechaAsigSinMadrinaSalida  : reduceString(row.FechaAsigSinMadrinaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaSalida : row.FechaAsigSinMadrinaSalida,
                        [endDateObj.dateName]      : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaAsigEnMadrinaSalida
                        [startDateObj.dateName]    : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName], //FechaTransitoIngreso    
                    }
                }
                
                
                if ( endDateObj.dateName === estatusKeysTyTList.FechaTransitoSalida ) {
                   
                    return {
                        ...row,
                        [name]         : value,
                        [endDateObj.dateName]      : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaTransitoSalida
                        [startDateObj.dateName]    : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName], //any?    
                    }
                }

                break;

            case 'start':

                if ( startDateObj.dateName === estatusKeysTyTList.FechaInterplantaIngreso ) {

                    return {
                        ...row,
                        [name]        : value,
                        [startDateObj.dateName]: startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName],  //FechaInterplantaIngreso
                    }

                }

                if ( startDateObj.dateName === estatusKeysTyTList.FechaArmViajeIngreso ) {
                    return {
                        ...row,
                        [name]        : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        [startDateObj.dateName] : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName],  //FechaArmViajeIngreso
                    }
                }

                if ( startDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaIngreso ) {
                    return {
                        ...row,
                        [name]        : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida     : reduceString(row.FechaArmViajeSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        [startDateObj.dateName] : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName],  //FechaAsigSinMadrinaIngreso
                    } 
                }

                if ( startDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaIngreso ) {
                    return {
                        ...row,
                        [name]        : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida     : reduceString(row.FechaArmViajeSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso : reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        FechaAsigSinMadrinaSalida  : reduceString(row.FechaAsigSinMadrinaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaSalida : row.FechaAsigSinMadrinaSalida,
                        [startDateObj.dateName]    : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName],  //FechaAsigEnMadrinaSalida
                    }
                }

                if ( startDateObj.dateName === estatusKeysTyTList.FechaTransitoIngreso ) {
                    return {
                        ...row,
                        [name]        : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida     : reduceString(row.FechaArmViajeSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso : reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        FechaAsigSinMadrinaSalida  : reduceString(row.FechaAsigSinMadrinaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigSinMadrinaSalida : row.FechaAsigSinMadrinaSalida,
                        FechaAsigEnMadrinaIngreso  : reduceString(row.FechaAsigEnMadrinaIngreso) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigEnMadrinaIngreso : row.FechaAsigEnMadrinaIngreso,
                        FechaAsigEnMadrinaSalida   : reduceString(row.FechaAsigEnMadrinaSalida) === defaultDateDB ? startDateObj.date !== null ? startDateObj.date : row.FechaAsigEnMadrinaSalida : row.FechaAsigEnMadrinaSalida,
                        [startDateObj.dateName]    : startDateObj.date !== null ? startDateObj.date : row[startDateObj.dateName],  //FechaTransitoIngreso
                    }
                }
                
            case 'end':

                if ( endDateObj.dateName === estatusKeysTyTList.FechaInterplantaSalida ) {
                    return {
                        ...row,
                        [name]         : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        [endDateObj.dateName]   : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaInterplantaSalida
                    }
                }

                if ( endDateObj.dateName === estatusKeysTyTList.FechaArmViajeSalida ) {
                    return {
                        ...row,
                        [name]         : value,
                        FechaInterplantaIngreso : reduceString(row.FechaInterplantaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida  : reduceString(row.FechaInterplantaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso    : reduceString(row.FechaArmViajeIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        [endDateObj.dateName]   : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaArmViajeSalida
                    }
                }

                if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigSinMadrinaSalida ) {
                    return {
                        ...row,
                        [name]           : value,
                        FechaInterplantaIngreso   : reduceString(row.FechaInterplantaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida    : reduceString(row.FechaInterplantaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso      : reduceString(row.FechaArmViajeIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida       : reduceString(row.FechaArmViajeSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso: reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        [endDateObj.dateName]     : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaAsigSinMadrinaSalida
                    }
                }

                if ( endDateObj.dateName === estatusKeysTyTList.FechaAsigEnMadrinaSalida ) {
                    return {
                        ...row,
                        [name]                     : value,
                        FechaInterplantaIngreso    : reduceString(row.FechaInterplantaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida     : reduceString(row.FechaInterplantaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso       : reduceString(row.FechaArmViajeIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida        : reduceString(row.FechaArmViajeSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso : reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        FechaAsigSinMadrinaSalida  : reduceString(row.FechaAsigSinMadrinaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigSinMadrinaSalida : row.FechaAsigSinMadrinaSalida,
                        FechaAsigEnMadrinaIngreso  : reduceString(row.FechaAsigEnMadrinaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigEnMadrinaIngreso : row.FechaAsigEnMadrinaIngreso,
                        [endDateObj.dateName]      : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaAsigEnMadrinaSalida
                    }
                }

                if ( endDateObj.dateName === estatusKeysTyTList.FechaTransitoSalida ) {
                    return {
                        ...row,
                        [name]                     : value,
                        FechaInterplantaIngreso    : reduceString(row.FechaInterplantaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaIngreso : row.FechaInterplantaIngreso,
                        FechaInterplantaSalida     : reduceString(row.FechaInterplantaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaInterplantaSalida : row.FechaInterplantaSalida,
                        FechaArmViajeIngreso       : reduceString(row.FechaArmViajeIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeIngreso : row.FechaArmViajeIngreso,
                        FechaArmViajeSalida        : reduceString(row.FechaArmViajeSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaArmViajeSalida : row.FechaArmViajeSalida,
                        FechaAsigSinMadrinaIngreso : reduceString(row.FechaAsigSinMadrinaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigSinMadrinaIngreso : row.FechaAsigSinMadrinaIngreso,
                        FechaAsigSinMadrinaSalida  : reduceString(row.FechaAsigSinMadrinaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigSinMadrinaSalida : row.FechaAsigSinMadrinaSalida,
                        FechaAsigEnMadrinaIngreso  : reduceString(row.FechaAsigEnMadrinaIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigEnMadrinaIngreso : row.FechaAsigEnMadrinaIngreso,
                        FechaAsigEnMadrinaSalida   : reduceString(row.FechaAsigEnMadrinaSalida) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaAsigEnMadrinaSalida : row.FechaAsigEnMadrinaSalida,
                        FechaTransitoIngreso       : reduceString(row.FechaTransitoIngreso) === defaultDate ? endDateObj.date !== null ? endDateObj.date : row.FechaTransitoIngreso : row.FechaTransitoIngreso,
                        [endDateObj.dateName]      : endDateObj.date   !== null ? endDateObj.date   : row[endDateObj.dateName], //FechaTransitoSalida
                    }
                }
        
            /* default:
                return { ...row } */
        }

    }

    const fileChange = (e) => {

        const fileDom = e.target || e.srcElement;
        const excelIO = new IO();
        
        if ( fileDom.files[0]?.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) { /* extensionExcel .xlsx */

            toast.info('Formato no válido, favor de verificar formato (.xlxs)')
            return;

        }
        
        readXlsxFile(fileDom.files[0]).then((rows) => {  /* new library */
            
            getDataFromExcelFile( rows );
        })

        /* excelIO.open(fileDom.files[0], (data) => { //esta librería no funcionó estando en producción  

            const dataExcel = data?.sheets?.rsVINMasivo?.data?.dataTable

            if ( dataExcel === undefined ) {
                toast.info('El archivo importado no coincide con la información para realizar la actualización');
                return;
            }

            getDataFromExcel( dataExcel );

        }); */

    }

    const getDataFromExcelFile = ( rowsExcel ) => {
        
        let finalList = [];

        for (const list of rowsExcel) {
            
            const [ Cliente, VIN, col1, col2, NDist, Dist, Destino, Mod, Marca, Flot, Color,  col3, Year, FVenta, Planta, EstatusPedido, Ubicacion, FEntreg ] = list;
            
            if ( Cliente !== null && VIN !== null ) {

                let objectProperties = {
                    Cliente,
                    VIN,
                    EstatusPedido,
                    Ubicacion
                }

                finalList = [...finalList, objectProperties];
            }

        }

        updateVINSFromExcelData( finalList );
    }

    const getDataFromExcel = ( dataExcel ) => {

        /* let list = [];
        let finalList = [];
        let Cliente = '';
        let VIN = '';
        let EstatusPedido = '';
        let Ubicacion = '';

        for (const obj of Object.keys( dataExcel )) {

            if ( 
                obj !== '1' && 
                obj !== '2' && 
                obj !== '3' && 
                obj !== '4' && 
                obj !== '5' && 
                obj !== '6' && 
                obj !== '7'
                ) {

                list = [ ...list, dataExcel[obj] ]

            }
        }

        for (const obj of list) {

            for (const key of Object.keys( obj )) {

                if ( key === '0' ) {
                    Cliente = obj[key].value;
                }
                if ( key === '1' ) {
                    VIN = obj[key].value;
                }
                if ( key === '15' ) {
                    EstatusPedido = obj[key].value;
                }
                if ( key === '16' ) {
                    Ubicacion = obj[key].value;
                    finalList = [ 
                        ...finalList,
                        {
                            Cliente,
                            VIN,
                            EstatusPedido,
                            Ubicacion,
                        }  
                    ]
                }

            }

        }

        

        updateVINSFromExcelData( finalList ); */
    }

    const updateVINSFromExcelData =  async ( excelData ) => {
        
        let params = {};
        // let params = { name:'EstatusTyT', value: finalEstatusTyT, hasEndDate: false, hasStartDate: false, endDateObj: null, startDateObj: null };

        const updateVINS = await Promise.all(
            VINClientes.map( async objCli => {

                let objInExcelData = excelData.find( objExc => (objExc.VIN === objCli.VIN) && (objExc.Cliente === objCli.NumeroCliente) );

                if ( objInExcelData !== undefined && objCli.EstadoSiniestro !== 1 && objCli.EstadoSiniestro !== 2 && !objCli.pasoASiniestro ) { /* objeto encontrado y el VIN no se encuentra en Siniestro */

                    let finalEstatusTyT = '';
                    let finalPatio = '';
                    let isEstatusChanged = false;
                    
                    finalEstatusTyT = EstatusTyTvalidations( objInExcelData.EstatusPedido, objCli.Agencia );
                    
                    isEstatusChanged = (finalEstatusTyT !== objCli.EstatusTyT) //? true : false;

                    finalEstatusTyT = getClaveEstatusTyT( finalEstatusTyT );
                    
                    finalPatio = PatioUbiValidations( objInExcelData.Ubicacion );
                    
                    finalPatio = getClavePatios( finalPatio );
                    
                    if ( (isEstatusTyTOnList( objCli.EstatusTyT == 0 ? 'EN PATIO' : objCli.EstatusTyT ) || isEstatusTyTOnList( finalEstatusTyT )) && isEstatusChanged ) {
                        
                        params = await getParams( objCli.EstatusTyT == 0 ? 'EN PATIO' : objCli.EstatusTyT, finalEstatusTyT );

                        let newObj = getTotalDates( params, objCli );
                        
                        return {
                            ...newObj,
                            isVinSelected  : true,
                            EstatusTyT     : finalEstatusTyT !== '' ? finalEstatusTyT : objCli.EstatusTyT,
                            Patio          : finalPatio      !== '' ? finalPatio      : objCli.Patio
                        }
                    }

                    return {
                        ...objCli,
                        isVinSelected  : true,
                        EstatusTyT     : finalEstatusTyT !== '' ? finalEstatusTyT : objCli.EstatusTyT,
                        Patio          : finalPatio      !== '' ? finalPatio      : objCli.Patio
                    }
                }

                return objCli;

            })
        )

        toast.success("El archivo Excel ha sido importado exitosamente.");
        inputFileImportExcel.current.value   = null;
        setIsImportExcelActive( true );

        const totalVINSGenerated = updateVINS.filter( obj => obj.isVinSelected );

        if ( totalVINSGenerated.length > 0 ) setVINSGeneratedinBD(false);

        setVINClientes( updateVINS );
        setVINClientesGenerados( totalVINSGenerated );

    }

    const getTotalDates = ( params, row ) => {
        const { name, value, hasEndDate, hasStartDate, endDateObj, startDateObj } = params;

        //both
        if ( hasEndDate && hasStartDate ) {
            
            return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'both' );
        }
        
        //start
        if ( hasStartDate ) {
            
            return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'start' );
        }
        
        //end
        if ( hasEndDate ) {
            
            return helperDatesTyT( name, value,  endDateObj, startDateObj, row, 'end' );
        }
        
    }

    const getParams = async ( currentStatusTyT, nextStatusTyT ) => {

        let params = { name:'EstatusTyT', value: nextStatusTyT, hasEndDate: false, hasStartDate: false, endDateObj: null, startDateObj: null };

        /* anteriorvalor  FechaSalida */
        if ( isEstatusTyTOnList(currentStatusTyT) ) { /* Estatus TyT en el que se encuentra actualmente el VIN */
                
            params.endDateObj = await searchDateEstatusTyT( currentStatusTyT.split('|').shift(), 'salida' );
            if ( params.endDateObj.date !== null ) params.hasEndDate = true;
            
        }
    
        /* nuevovalor FechaIngreso */
        if ( isEstatusTyTOnList(nextStatusTyT) ) { /* Estatus TyT al que pasará el VIN */

            params.startDateObj = await searchDateEstatusTyT( nextStatusTyT.split('|').shift(), 'ingreso' );
            if ( params.startDateObj.date !== null ) params.hasStartDate = true;

        }

        return params;

    }

    const getClaveEstatusTyT = ( finalEstatusTyT ) => {

        let estatusClave = '';

        let estatustyt = statusTytCatList.find( stat => stat.nombreEstatus === finalEstatusTyT );

        if ( estatustyt !== undefined ) {

            estatusClave = `${estatustyt.nombreEstatus}|${estatustyt.clave}`;
            
        }

        return estatusClave;

    }

    const getClavePatios = ( finalPatio ) => {
        
        let patioClave = '';

        let patio = patiosUbiCatList.find( pat => pat.nombrePatio === finalPatio );

        if ( patio !== undefined ) {

            patioClave = `${patio.nombrePatio}|${patio.clave}`;

        }

        return patioClave;

    }

    return (
        <>
            {/* Main Inputs */}
            <div className='ml-2 pb-2'>

                {/* Selects: Client || Order */}

                <div className="row" style={{ backgroundColor:'#D3D3D3' }}>

                    <div className="col-6">
                        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                            {/* <h6 className='mr-4 width__label-input d-inline-flex flex-row' style={{ backgroundColor:'red' }}>Seleccionar Cliente:</h6> */}
                            <h6 className='mr-4 width__label-input-min'  >Seleccionar Cliente:</h6>

                           
                                <select 
                                    className='form-select select-class-1 width__label-input ' 
                                    disabled={ isPreviewTable || isChargingVins }
                                    name='Cliente' 
                                    onChange={OnChange}
                                    ref={ selectClientsRef }
                                    tabIndex={1}
                                    
                                >
                                    {
                                        // clientes
                                        clientesTotales
                                        .map( cliente => (

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
                        <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                                    
                            <h6 className='mr-4 width__label-input-min'>Orden Compra Cliente: </h6>

                            <select 
                                name='ordenDeCompra' 
                                className='form-select select-class-1 width__label-input' 
                                tabIndex={2} 
                                onChange={OnChange}
                                disabled={ isPreviewTable || ordenesDeCompra.length === 0 || isChargingVins}
                                ref={ selectOrderRef }
                            >
                                {
                                    ordenesDeCompra.map( orden => (

                                        <option 
                                            // value={`${orden.OrdenCompra}|${orden.TipoVehiculo}|${orden.Cantidad}`}
                                            value={ orden.OrdenCompra }
                                        >
                                            { orden.OrdenCompra }
                                        </option>

                                    ))

                                }
                            </select>

                        </div>
                    </div>


                </div>

            </div>  

            {/* first carrousel slice */}
            {   
                sliceSelected === slices.first &&                
                <div className={'ml-2 animate__animated animate__fadeInLeft'}> 

                    <div className="row d-flex justify-content-center  header__border-top" style={{backgroundColor:'#E8E8E8', height:'auto' }}>
                        <h6 className='text-bold'style={{height:'auto', paddingTop:6}} >GENERALES</h6>
                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                    <h6 className='mr-4 width__label-input-min'>Estatus GPS: </h6>

                                    <select 
                                        className='form-select select-class-1 width__label-input mt-2' 
                                        disabled={ isPreviewTable }
                                        name='EstatusGPS' 
                                        onChange={OnChange}
                                        ref={selectEstatusGPSRef}
                                        tabIndex={3}
                                    >
                                        <option value="PENDIENTE"> PENDIENTE </option>
                                        <option value="NO APLICA"> NO APLICA </option>
                                        <option value="OK"> OK </option>
                                    </select>

                            </div>

                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Estatus Previa: </h6>

                                <select 
                                    className='form-select select-class-1 width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    name='EstatusPrevia' 
                                    onChange={OnChange}
                                    ref={selectEstatusPreviaRef}
                                    tabIndex={4}
                                >
                                    <option value="NO APLICA"> {PATIO} </option>
                                    <option value="OK"> {DISTRIBUIDOR} </option>
                                    <option value="SIN PREVIA"> {SINPREVIA} </option>
                                </select>

                            </div>
                            
                        </div>   

                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Estatus TyT: </h6>

                                <div className='d-flex justify-content-between width__label-input'>
                                    <select 
                                        className='form-select select-class-1 mt-2' 
                                        disabled={ isPreviewTable }
                                        name='EstatusTyT' 
                                        onChange={OnChange}
                                        ref={selectEstatusTyTRef}
                                        style={{width:'70%', marginRight:'px'}}
                                        tabIndex={5}
                                    >
                                        {
                                            statusTytCatList
                                            .map((status) => {
                                                return (
                                                <option
                                                    value={`${status.nombreEstatus}|${status.clave}`} 
                                                >
                                                    { status.nombreEstatus }
                                                </option>
                                                )
                                            })
                                        }
                                    </select>

                                    <button
                                        className='btn btn-outline-primary m-2'
                                        disabled={ isPreviewTable }
                                        onClick={addNewStatusTyT}
                                        title='Agregar nuevo status tyt'
                                        type='button'
                                        tabIndex={6}
                                    >
                                        <FontAwesomeIcon icon={faAdd}/>
                                    </button>

                                </div>

                            </div>
                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Observaciones TyT: </h6>

                                <input 
                                    autoComplete="off"
                                    className='input-class width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    name="ObservacionesTyT" 
                                    onChange={OnChange}
                                    tabIndex={7}
                                    type="text" 
                                    value={writtendata.ObservacionesTyT} 
                                />

                            </div>

                        </div>  

                    </div>

                    <div className="row">

                        <div className="col-6">
                            
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                                
                                <h6 className='mr-4 width__label-input-min'>Ubicación: </h6>

                                <div className='d-flex justify-content-between width__label-input'>
                                
                                    <select 
                                        className='form-select select-class-1 mt-2' 
                                        disabled={ isPreviewTable }
                                        name='Patio' 
                                        onChange={OnChange}
                                        ref={selectPatioUbiRef}
                                        style={{width:'70%', marginRight:'px'}}
                                        tabIndex={7}
                                    >
                                        {
                                            patiosUbiCatList
                                            .map((status) => {
                                                return (
                                                <option
                                                    value={`${status.nombrePatio}|${status.clave}`} 
                                                >
                                                    { status.nombrePatio }
                                                </option>
                                                )
                                            })
                                        }
                                    </select>

                                </div>   

                            </div>

                        </div>

                        <div className="col-6">
                            <div className="row d-flex justify-content-around pl-2 pr-4">
                            </div>
                            
                        </div> 

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-around pl-2 pr-4">

                            <h6 style={{ visibility:'hidden' }}>tagComodin</h6>

                            </div>
                        </div>

                        <div className="col-6">
                            <div className="row d-flex justify-content-around pl-2 pr-4">

                            </div>
                        </div> 

                    </div>

                    <div className="row">
                    
                        <div className="col-6">
                        
                            <div className="row d-flex justify-content-around pl-2 pr-4">

                            <h6 style={{ visibility:'hidden' }}>tagComodin</h6>

                                

                            </div>

                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-around pl-2 pr-4">

                            </div>

                        </div>

                    </div>
                       

                </div>
            }

            {/* second carrousel slice */}
            {
                sliceSelected === slices.second &&
                <div className={`ml-2 animate__animated ${sliceBeforeSelected === slices.first ? 'animate__fadeInRight' : 'animate__fadeInLeft'}`}>

                    <div className="row d-flex justify-content-center header__border-top" style={{backgroundColor:'#E8E8E8', height:'auto' }}>{/* #FFFACD gainsboro*/}
                        <h6 className='text-bold' style={{height:'auto', paddingTop:6}}>GM</h6>
                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Detención Solicit.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaDetencionSolicit' 
                                    onChange={OnChange}
                                    tabIndex={3}
                                    type="date"
                                    value={writtendata.FechaDetencionSolicit}
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha GPS Solicit.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable || writtendata.EstatusGPS === 'NO APLICA'}
                                    min="2022-01-01" 
                                    name='FechaGPSSolicit' 
                                    onChange={OnChange}
                                    tabIndex={5}
                                    type="date"
                                    value={writtendata.FechaGPSSolicit}
                                />

                            </div>
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Detención Aut./Term.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaDetencionAut' 
                                    onChange={OnChange}
                                    tabIndex={4}
                                    type="date"
                                    value={writtendata.FechaDetencionAut}
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha GPS Aut./Term.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable || writtendata.EstatusGPS === 'NO APLICA' }
                                    min="2022-01-01" 
                                    name='FechaGPSAut' 
                                    onChange={OnChange}
                                    tabIndex={6}
                                    type="date"
                                    value={writtendata.FechaGPSAut}
                                />

                            </div>
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Segregación Solicit.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaSolicitudGPS' 
                                    onChange={OnChange}
                                    tabIndex={7}
                                    type="date"
                                    value={writtendata.FechaSolicitudGPS} /* Fecha Segregacion Solicit En base de datos se registro como FechaSolicitudGPS */
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Acceso Solicit.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01"
                                    name='FechaAccesoSolicit' 
                                    onChange={OnChange}
                                    tabIndex={9}
                                    type="date"
                                    value={writtendata.FechaAccesoSolicit}
                                />

                            </div>
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Segregación Aut./Term.</h6>

                                <input 
                                    className="input-class width__label-input mt-2"
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaSegregacionAut' 
                                    onChange={OnChange}
                                    tabIndex={8}
                                    type="date"
                                    value={writtendata.FechaSegregacionAut}
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Acceso Aut./Term.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    name='FechaAccesoAut' 
                                    onChange={OnChange}
                                    tabIndex={10}
                                    type="date"
                                    value={writtendata.FechaAccesoAut}
                                />

                            </div>
                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Instalación</h6>

                                <input 
                                    className="input-class width__label-input mt-2"
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaAceptacionGPS' 
                                    onChange={OnChange}
                                    tabIndex={11}
                                    type="date"
                                    value={writtendata.FechaAceptacionGPS} /* Fecha Instalacion en Base de Datos se registro como FechaAceptacionGPS*/
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Liberación Solicit.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaLiberacionSolicit' 
                                    onChange={OnChange}
                                    tabIndex={14}
                                    type="date"
                                    value={writtendata.FechaLiberacionSolicit}
                                />

                            </div>
                        </div>

                    </div>
                    
                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Previa Solicit.</h6>

                                <input 
                                    className="input-class width__label-input mt-2"
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaPreviaSolicit' 
                                    onChange={OnChange}
                                    tabIndex={12}
                                    type="date"
                                    value={writtendata.FechaPreviaSolicit}
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Liberación Aut./Term.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaLiberacionAut' 
                                    onChange={OnChange}
                                    tabIndex={15}
                                    type="date"
                                    value={writtendata.FechaLiberacionAut}
                                />

                            </div>
                        </div>

                    </div>
                    
                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Previa Aut./Term.</h6>

                                <input 
                                    className="input-class width__label-input mt-2"
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaPreviaAut' 
                                    onChange={OnChange}
                                    tabIndex={13}
                                    type="date"
                                    value={writtendata.FechaPreviaAut}
                                />

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Calidad Solicit.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaCalidadSolicit' 
                                    onChange={OnChange}
                                    tabIndex={16}
                                    type="date"
                                    value={writtendata.FechaCalidadSolicit}
                                />

                            </div>
                        </div>

                    </div>
                    
                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start pl-2 pr-4">

                            </div>
                        </div>
                        
                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Calidad Aut./Term.</h6>

                                <input 
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaCalidadAut' 
                                    onChange={OnChange}
                                    tabIndex={17}
                                    type="date"
                                    value={writtendata.FechaCalidadAut}
                                />

                            </div>
                        </div>

                    </div>

                </div>
            }
            
            {/* third carrousel slice */}
            {
                sliceSelected === slices.third &&
                <div className={"ml-2 animate__animated animate__fadeInRight"}>
                    
                    <div className="row d-flex justify-content-center header__border-top" style={{backgroundColor:'#E8E8E8', height:'auto' }}>
                        <h6 className='text-bold' style={{height:'auto', paddingTop:6}}>PREVIA ENTREGA DISTRIB.</h6>
                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Pago Solicit.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaPagoSolicit' 
                                    onChange={OnChange}
                                    tabIndex={3}
                                    type="date"
                                    value={writtendata.FechaPagoSolicit}
                                />

                            </div>

                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Fecha Programación Entrega: </h6>{/* Fecha Detención Solicit. */}

                                <input 
                                    className='input-class width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01"
                                    name="FechaEntregaCliente" 
                                    onChange={OnChange}
                                    tabIndex={5}
                                    type="date" 
                                    value={writtendata.FechaEntregaCliente} 
                                />

                            </div>

                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className="mr-4 width__label-input-min">Fecha Pago Aut./Term.</h6>

                                <input
                                    className="input-class width__label-input mt-2" 
                                    disabled={ isPreviewTable }
                                    min="2022-01-01" 
                                    name='FechaPagoAut' 
                                    onChange={OnChange}
                                    tabIndex={4}
                                    type="date"
                                    value={writtendata.FechaPagoAut}
                                />

                            </div>

                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>PDF Factura Pago: </h6>

                                <input 
                                    accept='.pdf'               
                                    className='custom-file-upload width__label-input mt-2'
                                    disabled={isPreviewTable}
                                    name="FacturaPagoPDF"
                                    onChange={OnChange}
                                    ref={inputFileFacturaPagoRef}
                                    style={{ border:'none' }}
                                    tabIndex={6}
                                    type="file" 
                                />

                            </div>

                        </div>  
                    </div>

                    <div className="row d-flex justify-content-center header__border-top" style={{backgroundColor:'#E8E8E8', height:'auto' }}>
                        <h6 className='text-bold' style={{height:'auto', paddingTop:6}}>DOCUMENTOS DE ENTREGA</h6>
                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Fecha Documento Envío: </h6>

                                <input 
                                    className='input-class width__label-input mt-2' 
                                    type="date" 
                                    name="FechaDeEnvioDocum" 
                                    value={writtendata.FechaDeEnvioDocum} 
                                    onChange={OnChange}
                                    disabled={ isPreviewTable }
                                    tabIndex={7}
                                    min="2022-01-01"
                                />

                            </div>  

                        </div> 

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>PDF Carta Cliente: </h6>

                                <input 
                                    accept='.pdf'               
                                    className='custom-file-upload width__label-input mt-2'
                                    disabled={isPreviewTable}
                                    name="CartaClientePDF"
                                    onChange={OnChange}
                                    ref={inputFileCartaClienteRef}
                                    style={{ border:'none' }}
                                    tabIndex={9}
                                    type="file" 
                                /> 
                            
                            </div>

                        </div>

                    </div>

                    <div className="row mb-2">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                    <h6 className='mr-4 width__label-input-min'>Fecha Documento Recepción: </h6>
                                    
                                    <input 
                                        className='input-class width__label-input mt-2' 
                                        disabled={ isPreviewTable }
                                        min="2022-01-01"
                                        name="FechaDeRecepcion" 
                                        onChange={OnChange}
                                        tabIndex={8}
                                        type="date" 
                                        value={writtendata.FechaDeRecepcion} 
                                    />

                            </div>

                        </div>

                        <div className="col-6"></div>

                    </div>

                    <div className="row d-flex justify-content-center header__border-top" style={{backgroundColor:'#E8E8E8', height:'auto' }}>
                        <h6 className='text-bold' style={{height:'auto', paddingTop:6}}>INFORMATIVO</h6>
                    </div>

                    <div className="row">

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Pago: </h6>

                                <select 
                                    className='form-select select-class-1 width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    name='Pago' 
                                    onChange={OnChange}
                                    ref={selectPagoRef}
                                    tabIndex={10}
                                >
                                    <option value="PAGADO"> PAGADO </option>
                                    <option value="CM"> CM </option>
                                </select>

                            </div>

                        </div>

                        <div className="col-6">

                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Observaciones: </h6>

                                <input 
                                    autoComplete="off"
                                    className='input-class width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    name="Observaciones" 
                                    onChange={OnChange}
                                    tabIndex={12}
                                    type="text" 
                                    value={writtendata.Observaciones} 
                                />

                            </div>

                        </div>

                    </div>

                    <div className="row">

                        <div className="col-6">
                            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">

                                <h6 className='mr-4 width__label-input-min'>Observaciones VIN: </h6>

                                <input 
                                    autoComplete="off"
                                    className='input-class width__label-input mt-2' 
                                    disabled={ isPreviewTable }
                                    name="ObservacionesVIN" 
                                    onChange={OnChange}
                                    tabIndex={11}
                                    type='text' 
                                    value={writtendata.ObservacionesVIN} 
                                />

                            </div>    
                        </div>

                        <div className="col-6"></div>

                    </div>

                </div>
            }

            {/* RadioButtons to change Inputs slices */}
            <div className="container mt-2">
                <div className="row">
                    <div className="col"></div>
                    <div className="col text-center">

                        <input 
                            checked={ sliceSelected === slices.first }
                            className='m-2' 
                            disabled={ isPreviewTable || isChargingVins } 
                            name="slices" 
                            onChange={onChangeSlice}
                            title='GENERALES'
                            type="radio" 
                            value="first"
                        />

                        <input 
                            checked={ sliceSelected === slices.second }
                            className='m-2' 
                            disabled={ isPreviewTable || isChargingVins } 
                            name="slices" 
                            onChange={onChangeSlice}
                            title='GM' 
                            type="radio"
                            value="second"
                        />

                        <input 
                            checked={ sliceSelected === slices.third }
                            className='m-2' 
                            disabled={ isPreviewTable || isChargingVins } 
                            name="slices" 
                            onChange={onChangeSlice}
                            title='PREVIA ENTREGA DISTRIB., DOCUMENTOS DE ENTREGA, INFORMATIVO' 
                            type="radio"
                            value="third"
                        />
                   
                    </div>
                    <div className="col"></div>
                </div>
            </div>

            {/* RadioButtons Asignar - Modificar || Button Vista Previa */}                          
            <div className="row m-2 d-flex justify-content-between">

                <div>
                    
                    <input 
                        checked={radioButton === Asignar} 
                        disabled={ isPreviewTable || isChargingVins } 
                        id="asignar" 
                        name="mode" 
                        onChange={onChangeRadioButton}
                        type="radio" 
                        value="Asignar" 
                    />
                    <label htmlFor="asignar" className='ml-2 mr-2'>Asignar</label>

                    <input 
                        checked={radioButton === Modificar} 
                        className='ml-4' 
                        disabled={ isPreviewTable || isChargingVins} 
                        id="modificar" 
                        name="mode" 
                        onChange={onChangeRadioButton}
                        type="radio" 
                        value="Modificar" 
                    />
                    <label htmlFor="modificar" className='ml-2'>Modificar</label>

                </div>

                <div>

                

                    {/* test input  */}
                    {
                        (
                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto && radioButton === Modificar
                        ) &&
                        <>
                            <input
                                accept='.xlsx' 
                                type="file" 
                                className="fileSelect" 
                                onChange={(e) => fileChange(e)}
                                id="raised-button-file"
                                ref={ inputFileImportExcel }
                                style={{ display: 'none' }}
                                disabled={ isPreviewTable }
                            />
                            <label htmlFor="raised-button-file">
                                <Button 
                                    variant="outlined" 
                                    component="span" 
                                    color='success'
                                    disabled={ isPreviewTable }
                                >
                                    <FontAwesomeIcon icon={faFileExcel} />
                                    <small className='ml-2'>Importar Excel</small>
                                </Button>
                            </label> 
                        </>
                    }

                    <button 
                        className='btn btn-info mb- ml-2' 
                        disabled={VINClientesGenerados.length === 0 || isChargingVins}
                        onClick={onGenerateTable}
                        type='button' 
                    >
                        { isPreviewTable ? 'Regresar' : 'Vista Previa'}
                    </button>


                </div>

            </div>

                {
                    ( isChargingVins && !isPreviewTable ) &&
                    <div className="row m-2">
                        <div className="col">
                            <strong>Cargando...</strong>
                            <div className="spinner-border ml-4" role="status" aria-hidden="true"></div>
                        </div>
                    </div>
                }

                

                {/* Renderización Tabla */}                        
                {
                    !isPreviewTable && 
                      
                    <div className="row table-responsive mb-4 ml-2 mr-2 mt-2 animate__animated animate__fadeIn">
                        
                        <table id='statusGPSTable' className='table display compact' style={{ fontSize:11 }}>
                        
                            <thead 
                                className='text-center' 
                                style={{
                                    backgroundColor: '#1565C0', 
                                    color:'white'
                                }}
                            >
                                
                                {/* first header */}
                                <tr>
                                    <th colSpan='16' className='text-center divider__border-right'>GENERALES</th>
                                    <th colSpan='19' className='text-center divider__border-right'>GM</th>
                                    <th colSpan='4' className='text-center divider__border-right'>GMF</th>
                                    <th colSpan='15' className='text-center divider__border-right'>TYT</th>{/* 14 */}
                                    <th colSpan='1' className='text-center divider__border-right'>GMF</th>
                                    <th colSpan='5' className='text-center divider__border-right'>PREVIA ENTREGA DISTRIB.</th>
                                    <th colSpan='4' className='text-center divider__border-right'>DOCUMENTOS DE ENTREGA</th>
                                    <th colSpan='4' className='text-center divider__border-right'>INFORMATIVO</th>
                                </tr>

                                {/* second header */}
                                <tr>

                                    <th></th>

                                    <th 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? HeaderClientSticky 
                                                : HeaderClientStatic
                                        }
                                    >
                                        {/* client space */}
                                    </th>

                                    <th></th>
                                    {/* <th style={{position:'sticky', left:'0px', backgroundColor:'#1565C0', zIndex:1}}> */}
                                    <th 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderSelectAllPendEnt
                                                : secondHeaderSelectAll
                                        }
                                    >

                                        <div className="d-flex justify-content-center">
                                            <input 
                                                className="form-check-input" 
                                                disabled={ disabledVINSelectedAll() }  
                                                name="vin_selected_all" 
                                                onChange={ handleVinSelectedAll }
                                                ref={ checkBoxSelectedAll }
                                                style={{position:'sticky'}}
                                                type="checkbox" 
                                                value="vin_selected_all"
                                                // disabled  
                                            />
                                        </div>    
                                        
                                    </th>
                                    <th colSpan="6" className='text-center divider__border-right'>VEHÍCULOS</th>
                                    <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
                                    <th colSpan="5" className='text-center divider__border-right'>DESTINO</th>
                                    <th colSpan="2" className='text-center divider__border-right'>DETENER</th>
                                    <th colSpan="3" className='text-center'>SEGREGAR/PERMISO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>
                                        <div className="d-flex justify-content-center">
                                            <input 
                                                className="form-check-input" 
                                                disabled={ disabledCheckLlaveAll() } 
                                                name="vin_selected_all" 
                                                onChange={ handleCheckLlaveAll }
                                                // ref={ checkBoxSelectedAll }
                                                style={{position:'sticky'}}
                                                type="checkbox" 
                                                value="vin_selected_retiroLlave"
                                                // disabled  
                                            />
                                        </div>
                                    </th>
                                    <th colSpan="3" className='text-center divider__border-right'>PREVIA</th>
                                    <th colSpan="3" className='text-center divider__border-right'>GPS</th>
                                    <th colSpan="2" className='text-center divider__border-right'>ACCESO (DUPLIC/FOTO/KIT SEG./POLIZA)</th>
                                    <th colSpan="2" className='text-center divider__border-right'>LIBERAR</th>
                                    <th colSpan="2" className='text-center divider__border-right'>CALIDAD</th>
                                    <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
                                    <th colSpan="2" className='text-center divider__border-right'>DPP</th>
                                    <th colSpan="2" className='text-center divider__border-right'>PERMISO</th>
                                    <th colSpan="4" className='text-center divider__border-right'></th>     {/* 3 */}
                                    <th colSpan="2" className='text-center divider__border-right'>INTERPLANTA</th>
                                    <th colSpan="2" className='text-center divider__border-right'>ARMADO DE VIAJE</th>
                                    <th colSpan="2" className='text-center divider__border-right'>ASIG. SIN MADRINA</th>
                                    <th colSpan="2" className='text-center divider__border-right'>ASIG. EN MADRINA</th>
                                    <th colSpan="2" className='text-center divider__border-right'>TRÁNSITO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>FASE 2</th>
                                    <th colSpan="2" className='text-center divider__border-right'>PAGO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>FACT</th>
                                    <th colSpan="1" className='text-center divider__border-right'>PROGRAMACIÓN</th>
                                    <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>ENVÍO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>RECEP</th>
                                    <th colSpan="1" className='text-center divider__border-right'>DOC</th>{/* CARTACLIENTE */}
                                    <th colSpan="1" className='text-center divider__border-right'>TIEMPO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>PAGO</th>
                                    <th colSpan="1" className='text-center divider__border-right'>COMENTARIOS</th>
                                    <th colSpan="2" className='text-center divider__border-right'>MODIFICADO</th>
                                    
                                </tr>

                                {/* third header */}
                                <tr>

                                    {/* GENERALES */}
                                    <th className='noselect divider__border-right' style={{fontSize:11}}>#</th>

                                    {/* <th className='noselect divider__border-right'>Cliente</th> */}
                                    <th 
                                        className='noselect divider__border-right'
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? HeaderClientSticky 
                                                : HeaderClientStatic
                                        }
                                    >
                                        Cliente
                                    </th>

                                    <th className='noselect divider__border-right'>OC</th>

                                    <th 
                                        className='noselect divider__border-right' 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderSelectAllPendEnt
                                                : secondHeaderSelectAll
                                        }
                                    >
                                        { `Selección de VIN (${VINClientesGenerados.length})` }
                                    </th>

                                    {/* <th className='divider__border-right' style={{position:'sticky', left:'90px', backgroundColor:'#1565C0', zIndex:1}}> */}
                                    <th 
                                        className='divider__border-right' 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderVINPendEnt
                                                : secondHeaderVIN
                                        }
                                    >
                                        VIN
                                    </th>

                                    <th className='noselect divider__border-right'>Observaciones VIN</th>

                                    {/* <th className='noselect divider__border-right' style={{position:'sticky', left:'210px', backgroundColor:'#1565C0', zIndex:1}}>Tipo/Paquete</th> */}
                                    <th 
                                        className='noselect divider__border-right' 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderTypePackagePendEnt
                                                : secondHeaderTypePackage
                                        }
                                    >
                                        Tipo/Paquete
                                    </th>

                                    <th className='noselect divider__border-right'>Color</th>

                                    <th className='noselect divider__border-right'>Inv.</th>

                                    <th className='noselect divider__border-right'>Factura</th>

                                    <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Dias</th> {/* DarkSeaGreen */}
                                    
                                    {/* <th className='noselect divider__border-right' style={{position:'sticky', left:'210px', backgroundColor:'#1565C0', zIndex:1}}> */}
                                    {/* <th className='noselect divider__border-right' style={{position:'sticky', left:'322.5px', backgroundColor:'#1565C0', zIndex:1}}> */}
                                    <th 
                                        className='noselect divider__border-right' 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderDestinyPendEnt
                                                : secondHeaderDestiny
                                        }
                                    >
                                        Destino
                                    </th>

                                    <th className='noselect divider__border-right'>Dist-Patio</th>

                                    <th className='noselect divider__border-right'>Domicilio</th>
                                    
                                    <th className='noselect divider__border-right'>Receptor</th>

                                    <th className='noselect divider__border-right'>Celular</th>

                                    {/* GM */}

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* FechaDetencionSolic */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Aut.</th> {/* FechaAutSolic */}

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha SegregaciónSolicit */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Aut.</th> {/* Fecha SegregaciónAut */}

                                    <th className='noselect divider__border-right'>Fecha Instalación</th>

                                    <th className='noselect divider__border-right'>Retiro Llave</th>

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Previa Slc. */}

                                    <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha Previa Aut. */}

                                    <th className='noselect divider__border-right'>Estatus Previa</th>

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha GPS Solic. */}

                                    <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha GPS Aut. */}

                                    <th className='noselect divider__border-right'>Estatus GPS</th>

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Acceso Solic. */}

                                    <th className='noselect divider__border-right'>Fecha Term.</th> {/* Fecha Acceso Aut. */}

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Liberar Solic. */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Aut</th> {/* Fecha Liberar Aut */}

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th> {/* Fecha Calidad Solic */}

                                    <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Calidad Aut */}
                                    
                                    <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Días</th>

                                    {/* GMF */}

                                    <th className='noselect divider__border-right'>Folio</th> {/* Folio DPP */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* Fecha DPP 1 */}

                                    <th className='noselect divider__border-right'>Folio</th> {/* Permiso */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* Fecha Vencimiento Permiso */}

                                    {/* TYT */}

                                    {/* <th className='noselect divider__border-right' style={{position:'sticky', left:'412.5px', backgroundColor:'#1565C0', zIndex:1}}>Estatus TyT</th> */}
                                    <th 
                                        className='noselect divider__border-right' 
                                        style={
                                            writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                ? secondHeaderEstatusTyTPendEnt
                                                : secondHeaderEstatusTyT    
                                        }
                                    >
                                        Estatus TyT
                                    </th>

                                    <th className='noselect divider__border-right'>Patio</th>

                                    <th className='noselect divider__border-right'>Observaciones TyT</th>

                                    <th className='noselect divider__border-right'>Fecha Estatus TyT</th>
                                    
                                    <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Interplanta Ingr */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Interplanta Salid */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha ArmandoViaje Ingr */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha ArmandoViaje Salid */}

                                    <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Asig.SinMadrinIngr */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Asig.SinMadrinSalid */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha Asig.EnMadrinIngr */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Salida</th> {/* Fecha Asig.EnMadrinSalid */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Ingreso</th> {/* Fecha TransitoIngreso */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Entrega</th> {/* Fecha TransitoEntrega */}
                                    
                                    <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Días</th>

                                    {/* GMF */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* fecha DPP 2 */}

                                    {/* PREVIA ENTREGA DISTRIB. */}

                                    <th className='noselect divider__border-right'>Fecha Solicit.</th>  {/* FechaPagoSolic */}
                                    
                                    <th className='noselect divider__border-right'>Fecha Pago</th>  {/* FechaPago */}

                                    <th className='noselect divider__border-right'>PDF</th>  {/* PDF Fact */}

                                    <th className='noselect divider__border-right'>Fecha De Entrega</th> {/* Fecha Entrega Programación */}

                                    <th className='noselect divider__border-right' style={{ backgroundColor:'DarkSeaGreen' }}>Días</th>

                                    {/* DOCUMENTOS DE ENTREGA */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* Fecha De Envio Docum. */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* Fecha De Recepcion */}

                                    <th className='noselect divider__border-right'>PDF</th> {/* DOC / PDF Carta Cliente */}

                                    <th className='noselect divider__border-right' style={{ backgroundColor:'#00b4d8' }}>Días</th>

                                    {/* INFORMATIVO */}
                                    
                                    <th className='noselect divider__border-right'>CM</th> {/* PagoCM */}

                                    <th className='noselect divider__border-right'>Operación</th> {/* Observaciones */}

                                    <th className='noselect divider__border-right'>Por</th> {/* Modificado Por */}

                                    <th className='noselect divider__border-right'>Fecha</th> {/* Fecha Modificado */}

                                </tr>

                            </thead>

                            <tbody style={{backgroundColor:'#FFFFE0'}}>
                                {
                                
                                    VINClientes.length > 0 &&
                                    VINClientes.map((registro, index) => {
                                        return (
                                            <tr className='text-center' style={{fontSize:11}}>

                                                <td className='noselect' style={{fontSize:11}}>{ index + 1 }</td>

                                                <td 
                                                    className='noselect'
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodyClientSticky 
                                                            : BodyClientStatic    
                                                    }
                                                >
                                                    { upperCase( registro.NombreCliente )}
                                                </td>

                                                <td className='noselect'>{ upperCase( registro.OrdenDeCompra ) }</td>

                                                <td 
                                                    className='noselect mb-2' 
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodySelectPendEnt
                                                            : BodySelect
                                                    }
                                                >

                                                    <input 
                                                        checked={registro.isVinSelected} 
                                                        className="form-check-input pb-4 mb-4" 
                                                        disabled={ validationsCheckBox( radioButton, registro ) } 
                                                        name="vin_selected" 
                                                        onChange={( e ) => handleVinSelected( e, registro )}
                                                        type="checkbox" 
                                                    />

                                                </td>

                                                <td 
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodyVINPendEnt
                                                            : BodyVIN    
                                                    }
                                                >
                                                    {registro.VIN}
                                                </td>

                                                <td className='noselect'>{ upperCase( registro.ObservacionesVIN )}</td>

                                                <td 
                                                    className='noselect' 
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodyTypePackagePendEnt
                                                            : BodyTypePackage    
                                                    }
                                                >
                                                    { upperCase( registro.Vehiculo ) }
                                                </td>

                                                <td className='noselect'>{ upperCase( registro.Color ) }</td>

                                                <td className='noselect'>{ upperCase( registro.Inventario.split('-').pop() ) }</td>

                                                <td className='noselect'>{ upperCase( registro.Factura ) }</td>

                                                <td className='noselect'>{ registro.DiasGenerales }</td>
                                                
                                                <td 
                                                    className='noselect' 
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodyDestinyPendEnt
                                                            : BodyDestiny  
                                                    }
                                                >
                                                    { upperCase( registro.CiudadDestino ) }
                                                </td>
                                                
                                                <td className='noselect'>{ upperCase( registro.Agencia ) }</td>

                                                <td className='noselect text-left'>{ upperCase( registro.DomicilioDeEntrega ) }</td>
                                                
                                                <td className='noselect'>{ upperCase( registro.PersonaReceptor ) }</td>

                                                <td className='noselect'>{ registro.CelularDeContacto }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDetencionSolicit)) }</td>
                                               
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDetencionAut)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaSolicitudGPS)) }</td>{/* FechaSolicitudGPS corresponde a FechaSegregacionSolicit */}
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaSegregacionAut)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAceptacionGPS)) }</td>{/* FechaAceptacionGPS corresponde a fecha instalación */}

                                                <td className='noselect'>

                                                    <input 
                                                        checked={registro.retiroDuplicadoLlave == 1} 
                                                        className="form-check-input" 
                                                        // disabled={ radioButton === Asignar && registro.Asignado != 0  || !registro.isVinSelected }
                                                        disabled={ validationsCheckBox( radioButton, registro )  || !registro.isVinSelected }
                                                        name="retiroDuplicadoLlave" 
                                                        onChange={(e) => handleCheckLlave(e, registro)} 
                                                        style={{position:'sticky'}} 
                                                        type="checkbox" 
                                                        value="retiroDuplicadoLlave" 
                                                    />

                                                </td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPreviaSolicit)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPreviaAut)) }</td>

                                                <td className='noselect'>{ upperCase( pipesStatusPrevia(registro.EstatusPrevia) ) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaGPSSolicit)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaGPSAut)) }</td>

                                                <td className='noselect'>{ upperCase( registro.EstatusGPS ) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAccesoSolicit)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAccesoAut)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaLiberacionSolicit)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaLiberacionAut)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaCalidadSolicit)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaCalidadAut)) }</td>

                                                <td className='noselect'>{ registro.DiasGM }</td>

                                                <td className='noselect'>{ upperCase( registro.FolioDPP ) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencDPP1)) }</td>

                                                <td className='noselect'>{ upperCase( registro.FolioDesvio ) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaVencFD)) }</td>

                                                <td 
                                                    className='noselect' 
                                                    style={
                                                        writtendata.NombreCliente === pendientesEntrega[0].Nombre_corto || writtendata.NombreCliente === pendientesEntrega[1].Nombre_corto 
                                                            ? BodyEstatusTyTPendEnt
                                                            : BodyEstatusTyT
                                                    }
                                                >
                                                    { upperCase( validDefaultStatusTyT(registro.EstatusTyT) ) }
                                                </td>

                                                <td className='noselect'>{ upperCase( validPatio(registro.Patio) )}</td> {/* aplicar validación */}

                                                <td className='noselect'>{ upperCase( registro.ObservacionesTyT ) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEstatusTyT)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaInterplantaIngreso)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaInterplantaSalida)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaArmViajeIngreso)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaArmViajeSalida)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigSinMadrinaIngreso)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigSinMadrinaSalida)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigEnMadrinaIngreso)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaAsigEnMadrinaSalida)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaTransitoIngreso)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaTransitoSalida)) }</td>
                                                
                                                <td className='noselect'>{ registro.DiasTyT }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.DPP2)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPagoSolicit)) }</td>
                                                
                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaPagoAut)) }</td>

                                                <td className='noselect'>
                                                    {
                                                        registro.DocFacturaPagoPDF === "1" 
                                                        ? 
                                                        <button
                                                            title='Visualizar Factura Pago'
                                                            type='button'
                                                            name='FacturaPago'
                                                            className='btn btn-outline-danger'
                                                            onClick={() => downloadPDF(FacturaPago, registro.VIN)}
                                                        >
                                                            <FontAwesomeIcon icon={faFilePdf}/>
                                                        </button> 
                                                        : 
                                                        ""
                                                    }
                                                </td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaEntregaCliente)) }</td>

                                                <td className='noselect'>{ registro.DiasPreviaEntrega }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeEnvioDocum)) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaDeRecepcion)) }</td>

                                                <td className='noselect'>
                                                    {
                                                        registro.DocumentoPDF === "1" 
                                                        ? 
                                                        <button
                                                            className='btn btn-outline-danger'
                                                            name='CartaCliente'
                                                            onClick={() => downloadPDF(CartaCliente, registro.VIN)}
                                                            title='Visualizar Carta Cliente'
                                                            type='button'
                                                        >

                                                            <FontAwesomeIcon icon={faFilePdf}/>

                                                        </button> 
                                                        : 
                                                        ""
                                                    }
                                                </td>

                                                <td className='noselect'>{ registro.DiasDocumEntrega }</td>

                                                <td className='noselect'>{ upperCase( registro.Pago ) }</td>

                                                <td className='noselect text-left'>{ upperCase( registro.Observaciones ) }</td>

                                                <td className='noselect'>{ upperCase( registro.UsuarioModificacion ) }</td>

                                                <td className='noselect'>{ validarFecha(isDefaultDate(registro.FechaModificacion))  }</td>

                                                {/* beneath are commoding tags */}
                                                
                                            </tr>
                                        )
                                    })
                                
                                }
                            </tbody>

                        </table>

                    </div>
                }
                
                {/* Renderización Tabla Vista Previa */}
                <TablaAsignarVinsEstatusGPS
                    agencia={agencia}
                    data={VINClientesGenerados}
                    isPreviewTable={isPreviewTable}
                    VINSGeneratedinBD={VINSGeneratedinBD}
                    handleUpdateData={handleUpdateData}
                />
                
                <ModalMini isOpen={isOpenModal} closeModal={closeModal}>
                    <ModalStatusTyT
                        agencia={agencia}
                        handleAfterStatusCreated={handleAfterStatusCreated}
                    />
                </ModalMini>

                <ModalGrande isOpen={ isOpenModalEntregas } closeModal={ closeModalEntregas }>
                    <ModalPendientesEntregas
                        pendienteEntrega={ pendienteEntrega }
                        orderSelected = { ( client ) => onOrderSelected( client ) }
                    />
                </ModalGrande>
            
      </>
    )
}

export default AsignarVinsEstatusGPS