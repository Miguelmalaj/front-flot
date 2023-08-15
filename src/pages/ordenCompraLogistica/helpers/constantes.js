export const defaultDateDB = '1900-01-01';
export const defaultDate = '';
export const defaultPay = { PAGADO:'PAGADO', CM:'CM' };
export const defaultEstatusGPS = 'PENDIENTE';
export const defaultEstatusPrevia = 'NO APLICA'; /* PATIO */
export const OK = 'OK';
export const PATIOSTATUSTYT = 'EN PATIO|1';
export const PATIO = 'REALIZADO EN PATIO';
export const DISTRIBUIDOR = 'REALIZADO EN DISTRIBUIDOR';
export const SINPREVIA = 'SIN PREVIA';
export const UBICACIONPATIO = 'PATIO|1';
export const emptyString = '';
export const CartaCliente = 'CartaCliente';
export const ReciboEntrega = 'ReciboEntrega';
export const FacturaPago = 'FacturaPago';
export const Asignar = 'Asignar';
export const Modificar = 'Modificar';

export const slices = { first: 'first', second: 'second', third: 'third' };
export const estatusTyTList = ['INTERPLANTA', 'ARMANDO VIAJE', 'ASIGNADO SIN MADRINA', 'ASIGNADO EN MADRINA', 'EN TRANSITO'];
export const estatusTyTObj = {INTERPLANTA:'INTERPLANTA', ARMANDOVIAJE:'ARMANDO VIAJE', ASIGNADOSINMADRINA:'ASIGNADO SIN MADRINA', ASIGNADOENMADRINA:'ASIGNADO EN MADRINA', ENTRANSITO: 'EN TRANSITO'};
export const estatusKeysTyTList = {
    FechaInterplantaIngreso   :'FechaInterplantaIngreso', 
    FechaInterplantaSalida    :'FechaInterplantaSalida', 
    FechaArmViajeIngreso      :'FechaArmViajeIngreso', 
    FechaArmViajeSalida       :'FechaArmViajeSalida', 
    FechaAsigSinMadrinaIngreso:'FechaAsigSinMadrinaIngreso', 
    FechaAsigSinMadrinaSalida :'FechaAsigSinMadrinaSalida', 
    FechaAsigEnMadrinaIngreso :'FechaAsigEnMadrinaIngreso', 
    FechaAsigEnMadrinaSalida  :'FechaAsigEnMadrinaSalida', 
    FechaTransitoIngreso      :'FechaTransitoIngreso', 
    FechaTransitoSalida       :'FechaTransitoSalida'
};
export const pendientesEntrega = [
    { Fancliente:'2.2', Id:2.2, Nombre_corto:'Vehículos Pendiente Entrega (V.P.E)', Num_cliente: 2.2, RFC:'2.2', Razon_social: '', Ubicacion: '' },
    { Fancliente:'3.3', Id:3.3, Nombre_corto:'Documentos Pendiente Entrega (D.P.E)', Num_cliente: 3.3, RFC:'3.3', Razon_social: '', Ubicacion: '' }
];

export const especificDate = { start: 'start', end: 'end', both: 'both' };

export let estatusTyTDynamicObj = {
    FechaInterplantaIngreso   : defaultDateDB, 
    FechaInterplantaSalida    : defaultDateDB, 
    FechaArmViajeIngreso      : defaultDateDB, 
    FechaArmViajeSalida       : defaultDateDB, 
    FechaAsigSinMadrinaIngreso: defaultDateDB, 
    FechaAsigSinMadrinaSalida : defaultDateDB, 
    FechaAsigEnMadrinaIngreso : defaultDateDB, 
    FechaAsigEnMadrinaSalida  : defaultDateDB, 
    FechaTransitoIngreso      : defaultDateDB, 
    FechaTransitoSalida       : defaultDateDB
};

export const stylesObjects = {
    HeaderClientSticky: {
        position         : 'sticky', 
        left             : '0px', 
        backgroundColor  : '#1565C0', 
        zIndex           : 1,
        boxShadow       : '2px 0px #1565C0'  
    },
    HeaderClientStatic: {
        position         : 'static', 
        left             : '0px', 
        backgroundColor  : '#1565C0', 
        zIndex           : 'auto'
    },
    BodyClientSticky: {
        position         : 'sticky', 
        left             : '0px', 
        backgroundColor  : '#FFFFE0', 
        zIndex           : 1,
        boxShadow       : '2px 0px #FFFFE0'  
    },
    BodyClientStatic: {
        position         : 'static', 
        left             : '0px', 
        backgroundColor  : '#FFFFE0', 
        zIndex           : 'auto'
    },
    secondHeaderSelectAll: {
        position        : 'sticky', 
        left            : '0px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1,
        boxShadow       : '10px 0px #1565C0'
    },
    secondHeaderSelectAllPendEnt: {
        position        : 'sticky', 
        left            : '80px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1
    },
    BodySelect: {
        position        : 'sticky', 
        left            : '0px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1,
        boxShadow       : '10px 0px #FFFFE0'
    },
    BodySelectPendEnt: {
        position        : 'sticky', 
        left            : '80px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1
    },
    secondHeaderVIN: {
        position        : 'sticky', 
        // left            : '95px', 
        left            : '100px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #1565C0',
        paddingRight    : '2px'
    },
    secondHeaderVINPendEnt: {
        position        : 'sticky', 
        left            : '170px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #1565C0',
    },
    BodyVIN: {
        position        : 'sticky', 
        left            : '100px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #FFFFE0',
        // paddingRight    : '2px'
    },
    BodyVINPendEnt: {
        position        : 'sticky', 
        left            : '170px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #FFFFE0',
    },
    secondHeaderTypePackage: {
        position        : 'sticky', 
        // left            : '210px', 
        left            : '217px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1
    },
    secondHeaderTypePackagePendEnt: {
        position        : 'sticky', 
        left            : '302px',/* '290px',  */
        backgroundColor : '#1565C0', /* '#778899' */
        zIndex          : 1,
        boxShadow       : '5px 0px #1565C0',
    },
    BodyTypePackage: {
        position        : 'sticky', 
        // left            : '210px', 
        left            : '219px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1
    },
    BodyTypePackagePendEnt: {
        position        : 'sticky', 
        left            : '302px',/* '290px',  */
        backgroundColor : '#FFFFE0', /* '#778899', */
        zIndex          : 1,
        boxShadow       : '5px 0px #FFFFE0',
    },
    secondHeaderDestiny: {
        position        : 'sticky', 
        // left            : '322.5px', 
        left            : '329.5px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1
    },
    secondHeaderDestinyPendEnt: {
        position        : 'sticky', 
        left            : '416px',/* '402.5px',  */
        backgroundColor : '#1565C0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #1565C0',
    },
    BodyDestiny: {
        position        : 'sticky', 
        // left            : '322.5px', 
        left            : '329.5px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1
    },
    BodyDestinyPendEnt: {
        position        : 'sticky', 
        left            : '416px',/* '402.5px',  */
        backgroundColor : '#FFFFE0', 
        zIndex          : 1,
        boxShadow       : '5px 0px #FFFFE0',
    },
    secondHeaderEstatusTyT: {
        position        : 'sticky', 
        left            : '412.5px', 
        backgroundColor : '#1565C0', 
        zIndex          : 1
    },
    secondHeaderEstatusTyTPendEnt: {
        position        : 'sticky', 
        left            : '503px',/* '492.5px', */ /* '522px', */
        backgroundColor : '#1565C0', 
        zIndex          : 1
    },
    BodyEstatusTyT: {
        position        : 'sticky', 
        left            : '412.5px', 
        backgroundColor : '#FFFFE0', 
        zIndex          : 1
    },
    BodyEstatusTyTPendEnt: {
        position        : 'sticky', 
        left            : '503px',/* '492.5px', */ /* '522px', */
        backgroundColor : '#FFFFE0', 
        zIndex          : 1
    },
    

}

const ESTATUS_DICTIONARY = {
    'ASIGNADO SIN MADRINA'                   : 'ASIGNADO SIN MADRINA',
    'EN ALMACEN, DISPONIBLE PARA LIBERAR'    : 'ARMANDO VIAJE',//'ARMADO DE VIAJE',
    'ACCESORIZACION'                         : 'ARMANDO VIAJE',//'ARMADO DE VIAJE',
    'SÓLO VENTA, NO DISPONIBLE'              : 'NO DISPONIBLE PARA TYT',
    'ASIGNADO EN MADRINA NO'                 : 'ENTREGADO EN AGENCIA',
    'UNIDAD ENTREGADA'                       : 'ENTREGADO/ENTREGADO EN AGENCIA',
    'EN AREA DE CONSOLIDACION, POR EMBARCAR' : 'ARMANDO VIAJE',//'ARMADO DE VIAJE',
    'EN TRANSITO'                            : 'EN TRANSITO',
    'EN TRÁNSITO'                            : 'EN TRANSITO',
    'ASIGNADO EN MADRINA'                    : 'ASIGNADO EN MADRINA',
    'DISPONIBLE PARA EMBARQUE'               : 'ARMANDO VIAJE'
    // 'SINIESTRO' : 'SE AGREGA MANUAL',
}

const PATIOS_DICTIONARY = {
    'PATIO TYT ALMACEN QUERETARO'   : 'PATIO',
    'PATIO TYT QUERETARO'           : 'PATIO',
    'PATIO TYT SOYANIQUILPAN'       : 'PATIO TYT SOYANIQUILPAN',
    'VDC QUERETARO'                 : 'DETENIDO EN GM',
    'VDC RAMOS'                     : 'PATIO RAMOS ARIZPE',
    'INTERPLANTA RAMOS'             : 'PATIO RAMOS ARIZPE',
    'VDC SAN LUIS'                  : 'PATIO SAN LUIS',
    'SILAO'                         : 'PATIO SILAO',
    'CONSOL. EN TYT RAMOS ARIZPE'   : 'PATIO RAMOS ARIZPE',
    'PATIO TYT RAMOS ARIZPE'        : 'PATIO RAMOS ARIZPE',
    'CONSOL. EN TYT SILAO'          : 'PATIO SILAO',
    'PATIO TYT ALMACEN SILAO'       : 'PATIO SILAO',
    'SU TRANSPORTE RAMOS ARIZPE'    : 'PATIO RAMOS ARIZPE',
}

const expReg = /ASIGNADO EN MADRINA NO.*/

export const EstatusTyTvalidations = ( estatusPedido, agencia ) => {

    let finalEstatus = '';

    for (const key of Object.keys(ESTATUS_DICTIONARY)) {

        if ( key === 'ASIGNADO EN MADRINA NO' && estatusPedido === key ) {
            
             finalEstatus = ( estatusPedido.match( expReg ) ) ? ESTATUS_DICTIONARY[key] : '';

        } else if ( key === 'UNIDAD ENTREGADA' && estatusPedido === key ) {

            finalEstatus =  ( agencia !== '' ) ? ESTATUS_DICTIONARY[key].split('/').pop() : ESTATUS_DICTIONARY[key].split('/').shift();

        } else {
           
            finalEstatus = ( key === estatusPedido ) ? ESTATUS_DICTIONARY[key] : finalEstatus;

        }
    }

    return finalEstatus; //IT CAN BE EMPTY STRING;

}

export const PatioUbiValidations = ( ubicacion ) => {

    let finalPatio = '';

    for (const key of Object.keys(PATIOS_DICTIONARY)) {
        
        finalPatio = ( key === ubicacion ) ? PATIOS_DICTIONARY[key] : finalPatio;

        /* if ( key === ubicacion ) {
            finalPatio = PATIOS_DICTIONARY[key];
        } */

    }

    return finalPatio;
}


/* {
    position:'sticky', 
    left: '492.5px' : '412.5px', 
    backgroundColor:'#1565C0', 
    zIndex:1
} */




