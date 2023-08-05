import { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";

import { TablaSiniestros } from "./tablas-vistas/TablaSiniestros";
import { ApiUrl } from "../../../services/ApiRest";
import { axiosGetService, axiosPostService } from "../../../services/asignacionLoteService/AsignacionLoteService";
import { validarFecha } from "../../../helpers/fecha";
import { isASpaceValue, isNumber } from "../../../helpers";
import { FechaDeHoyYYMMDD } from "../../../helpers/fecha";
import { statusGPSDataTable } from "../../../components/datatable/conf";
import $ from 'jquery';


const DefaultEstatus         = 'EN REVISION|1';
const estatusTerminado       = 'TERMINADO|3';
const estatusCancelado       = 'CANCELADO|4';
const DefaultDateEndSinister = '1900-01-01';

const Siniestros = ({
    agencia,
    clientes
}) => {

    const [isPreviewTable, setIsPreviewTable] = useState(false);
    const [sinisterList, setSinisterList] = useState([]);
    const [sinisterEstatus, setSinisterEstatus] = useState([]);
    const [sinisterGenerated, setSinisterGenerated] = useState([]);
    const [VINSGeneratedinBD, setVINSGeneratedinBD] = useState(false);
    const [inputValues, setInputValues] = useState({
        Estatus           : DefaultEstatus,
        FechaSiniestro    : '',
        Contacto          : '',
        Telefono          : '',
        Correo            : '',
        Comentario        : '',
        ComentarioEstProc : ''
    });
    const selectEstatusRef = useRef();

    let url = '';

    useEffect(() => {
        getSinisters();
        getSinistersEstatus();
    }, [])

    const getSinisters = async () => {

        url = `${ ApiUrl }api/ordencompra/get_sinisters`;
        let sinisters = await axiosPostService( url, { agencia } );

        sinisters = addExtraProperties( sinisters );

        try {

            dataTableDestroy();
            setSinisterList( sinisters );
            dataTable();

        } catch (error) {
            toast.error("Error al cargar registros en tabla.")
            console.log(error)
        }


    }

    const getSinistersEstatus = async () => {
        url = `${ ApiUrl }api/ordencompra/get_sinisters_estatus`;
        const sinisterEstatus = await axiosGetService( url );
        // console.log('sinisterEstatus', sinisterEstatus);
        setSinisterEstatus( sinisterEstatus );

    }

    const addExtraProperties = ( sinisters ) => {
        return sinisters.map( obj => {
            return {
                ...obj,
                isVINSelected: false
            }
        })
    }

    const handleVinSelected = ( { target }, sinister ) => {

        const { checked } = target;
        
        if ( existVINSSelected() && checked ) {
            
            if ( !compareInputs(sinister) ) {
                toast.info('Los valores del VIN a seleccionar no coinciden con los valores en las cajas de texto');
                return;
            }

        }
        
        if ( !existVINSSelected() && checked ) { 
            
            const { Comentario, ComentarioEstProc, Contacto, Telefono, Correo, FechaSiniestro, Estatus, NombreEstatus } = sinister;

            setInputValues({
                Comentario, 
                ComentarioEstProc, 
                Contacto, 
                Telefono, 
                Correo, 
                FechaSiniestro : FechaSiniestro.substring(0, 10),
                Estatus : `${NombreEstatus}|${Estatus}`
            });

            selectEstatusRef.current.value = `${NombreEstatus}|${Estatus}`;

        }

        const updateVIN = sinisterList.map( obj => {

            if ( obj.VIN === sinister.VIN ) {

                addToVINSGenerated({ ...obj, isVINSelected: checked }, checked );

                return {
                    ...obj,
                    isVINSelected: checked
                }

            }

            return obj;
        })

        setSinisterList( updateVIN );

        setVINSGeneratedinBD(false);

    }

    const addToVINSGenerated = ( sinister, checked ) => {

        if ( !checked ) {

            const updateList = sinisterGenerated.filter( obj => obj.VIN !== sinister.VIN );
            setSinisterGenerated( updateList );

            return;
        }

        setSinisterGenerated([
            ...sinisterGenerated,
            { ...sinister }
        ])
    }

    const onChange = ({ target }) => {

        if ( target.name === 'Telefono' && ( !isNumber( target.value ) || isASpaceValue( target.value ) || target.value.length === 11 ) ) return;

        setInputValues({
            ...inputValues,
            [target.name] : target.value
        });

        if ( !existVINSSelected() ) return;

        updateValuesProperties( target );

        setVINSGeneratedinBD(false);

    }

    const updateValuesProperties = ( target ) => {
        const { name, value } = target;

        let estatusChanged = false;
        let dateEndSinister = DefaultDateEndSinister;


        if ( name === 'Estatus' ) {
            estatusChanged = true;
            if ( value === estatusTerminado || value === estatusCancelado ) dateEndSinister = FechaDeHoyYYMMDD();
        }

        const updateSinisterList = sinisterList.map( obj => {

            if ( obj.isVINSelected ) {

                if ( estatusChanged ) {
                    return {
                        ...obj,
                        [name]            : value.split('|').pop(),
                        NombreEstatus     : value.split('|').shift(),
                        FechaFinSiniestro : dateEndSinister

                    }
                }

                return {
                    ...obj,
                    [name] : value
                }
            }

            return obj;
        })

        const updateSinisterGenerated = sinisterGenerated.map( obj => {

            if ( estatusChanged ) {
                return {
                    ...obj,
                    [name]            : value.split('|').pop(),
                    NombreEstatus     : value.split('|').shift(),
                    FechaFinSiniestro : dateEndSinister
                }
            }

            return {...obj,[name] : value}

        });

        setSinisterList( updateSinisterList );
        setSinisterGenerated( updateSinisterGenerated );

    }

    const compareInputs = ( sinister ) => {
        const { Comentario, ComentarioEstProc, Contacto, Telefono, Correo } = sinister;
        let passValidation = false;

        if ( 
            inputValues.Comentario === Comentario &&
            inputValues.Contacto === Contacto &&
            inputValues.Telefono === Telefono &&
            inputValues.Correo === Correo &&
            inputValues.ComentarioEstProc === ComentarioEstProc 
        ) passValidation = true;

        return passValidation;

    }

    const existVINSSelected = () => {
        const filterVINSSelected = sinisterList.find( obj => obj.isVINSelected );
        return filterVINSSelected !== undefined ? true : false
    }

    const dataTable = () => {
        setTimeout(() => {
            $('#sinisterTable').DataTable(statusGPSDataTable);
        }, 500);
    }

    const dataTableDestroy = () => {
        $("#sinisterTable").DataTable().destroy();
    }

    const onGenerateTable = () => {
        if ( VINSGeneratedinBD ) setSinisterGenerated([]);

        setIsPreviewTable( !isPreviewTable );

        if ( isPreviewTable ) {
            try {
                dataTableDestroy();
                dataTable();
            } catch (error) {
                toast.error("Error al cargar registros en tabla.");
                console.log(error);  
            }
        }

    }

    const handleAfterUpdated = () => {
        setVINSGeneratedinBD(true);
        getSinisters();
    }
    

    return (

        <>
            <div className="row ml-2">

                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Estatus:</h6>
                        <select 
                            className='form-select select-class-1 width__label-input mt-2'
                            disabled={ sinisterList.length === 0 }
                            name="Estatus" 
                            onChange={ onChange }
                            ref={selectEstatusRef}
                            tabIndex={1}
                        >
                            {
                                sinisterEstatus.map(est => (
                                    <option value={ `${est.Estado}|${est.Id}` }>
                                        { est.Estado }
                                    </option>
                                ))
                            }
                        </select>
                    </div>  
                </div>
                
                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Correo</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2'
                            disabled={ sinisterList.length === 0 }
                            name="Correo" 
                            onChange={ onChange }
                            tabIndex={4}
                            type="text" 
                            value={ inputValues.Correo } 
                        />
                    </div>
                </div>
                
            </div>
            
            <div className="row ml-2">

                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Fecha Siniestro:</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2' 
                            disabled
                            name="FechaSiniestro" 
                            onChange={ onChange }
                            tabIndex={3} 
                            type="date" 
                            value={ inputValues.FechaSiniestro } 
                        />
                    </div>  
                </div>
                
                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Comentario</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2' 
                            disabled={ sinisterList.length === 0 }
                            name="Comentario" 
                            onChange={ onChange }
                            tabIndex={5} 
                            type="text" 
                            value={ inputValues.Comentario } 
                        />
                    </div>
                </div>

            </div>
            
            <div className="row ml-2">

                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Contacto:</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2'
                            disabled={ sinisterList.length === 0 }
                            name="Contacto" 
                            onChange={ onChange } 
                            tabIndex={2} 
                            type="text" 
                            value={ inputValues.Contacto } 
                        />
                    </div>  
                </div>
                
                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Comentario (En Proceso):</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2' 
                            disabled={ inputValues.Estatus !== 'EN PROCESO|2' }
                            name="ComentarioEstProc" 
                            onChange={ onChange }
                            tabIndex={6} 
                            type="text" 
                            value={ inputValues.ComentarioEstProc } 
                        />
                    </div>
                </div>

            </div>
            
            <div className="row ml-2">

                <div className="col-6">
                    <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                        <h6 className="mr-4 width__label-input-min">Teléfono:</h6>
                        <input 
                            autoComplete="off"
                            className='input-class width__label-input mt-2'
                            disabled={ sinisterList.length === 0 }
                            name="Telefono" 
                            onChange={ onChange } 
                            tabIndex={3} 
                            type="text" 
                            value={ inputValues.Telefono } 
                        />
                    </div>  
                </div>
                
                <div className="col-6">
                    
                </div>

            </div>

            <div className="row d-flex justify-content-between m-2">
                
                <div></div>

                <button
                    className='btn btn-info mt-2 mb-2'
                    type="button"
                    disabled={ sinisterGenerated.length === 0 }
                    onClick={ onGenerateTable }
                >
                    { isPreviewTable ? 'Regresar' : 'Vista Previa'}
                </button>

            </div>

            {

                !isPreviewTable &&
                <div className="row table-responsive mb-4 animate__animated animate__fadeIn">

                    <table id="sinisterTable" className='table display compact' style={{ fontSize:11 }}>

                        <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                            <tr>
                                <th>{`Seleccionar (${sinisterGenerated.length})`}</th>
                                <th>Cliente</th>
                                <th>OC</th>
                                <th>VIN</th>
                                <th>Destino</th>
                                <th>Fecha Siniestro</th>
                                <th>Estatus</th>
                                <th>Comentario</th>
                                <th>Contacto</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Estatus Proceso (comentario)</th>
                                <th>Días Siniestro</th>
                            </tr>
                        </thead>

                        <tbody style={{backgroundColor:'#FFFFE0'}}>
                            {
                                sinisterList.length > 0 &&
                                sinisterList.map( sinister => (

                                    <tr key={ sinister.Id } className="text-center">
                                        <td> 
                                            <input 
                                                checked={ sinister.isVINSelected } 
                                                className="form-check-input pb-4 mb-4" 
                                                name="vin_selected" 
                                                onChange={( e ) => handleVinSelected( e, sinister )}
                                                style={{position:'sticky'}}
                                                type="checkbox" 
                                            />    
                                        </td>
                                        <td>{ sinister.NombreCliente }</td>
                                        <td>{ sinister.OrdenDeCompra }</td>
                                        <td>{ sinister.VIN }</td>
                                        <td>{ sinister.Destino }</td>
                                        <td>{ validarFecha(sinister.FechaSiniestro) }</td>
                                        <td>{ sinister.NombreEstatus }</td>
                                        <td>{ sinister.Comentario }</td>
                                        <td>{ sinister.Contacto }</td>
                                        <td>{ sinister.Telefono }</td>
                                        <td>{ sinister.Correo }</td>
                                        <td>{ sinister.ComentarioEstProc }</td>
                                        <td>{ sinister.DiasSiniestro }</td>
                                    </tr>

                                ))    
                            }
                        </tbody>

                    </table>

                </div>

            }

            <TablaSiniestros
                agencia={agencia}
                handleAfterUpdated={handleAfterUpdated}
                isPreviewTable={isPreviewTable}
                sinisterGenerated={sinisterGenerated}
                VINSGeneratedinBD={VINSGeneratedinBD}
            />
        </>

    )

}

export default Siniestros;