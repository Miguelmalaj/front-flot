

import React,{ useState, useEffect, useRef } from 'react'

import { ApiUrl } from '../../services/ApiRest';
import { axiosPostService } from '../../services/asignacionLoteService/AsignacionLoteService';
import { removerComas } from '../../helpers/formatoMoneda';
import { useReactToPrint } from 'react-to-print';
import '../../css/formatoFacturacion/formFact.css'

export const ModalFormatoFactura = ({ 
    paramFormFacturar, 
    agencia, 
    VINFacturacion,
    fanCliente,
    tipoVehiculo,
    razonSocial,
    handleAfterPrint,
    numCliente
}) => {

    const [parametros, setParametros] = useState({
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
    const [percentResults, setPercentResults] = useState({
        General      : 0,
        Bonificacion : 0
    })
    const [isFormShowed, setIsFormShowed] = useState(true);
    const componentRef = useRef()
    let url = '';

    useEffect(() => {
      requestParamsFlot();
    }, [paramFormFacturar])

    const requestParamsFlot = async () => {
        url = ApiUrl + "api/asignarvins/param_formato_facturacion";
        const { PrecioFactura, PrecioCDO, BonificacionGeneral, BonificacionExtra } = paramFormFacturar; 
        const response =  await axiosPostService(url, {agencia});
        const { AdminFlotilla, GteFlotilla, GteAdmin, Logistica, ElaboroPedido, RevisoPedido } = response[0]; 
        
        setParametros({
            PrecioFactura       : PrecioFactura,
            PrecioCDO           : PrecioCDO,
            BonificacionGeneral : BonificacionGeneral,
            BonificacionExtra   : BonificacionExtra,
            AdminFlotilla       : AdminFlotilla,
            GteFlotilla         : GteFlotilla,
            GteAdmin            : GteAdmin,
            Logistica           : Logistica,
            ElaboroPedido       : ElaboroPedido,
            RevisoPedido        : RevisoPedido
        })
        setIsFormShowed(true);
        
    }

    const onChange = ( e ) => {
        setParametros({
            ...parametros,
            [e.target.name] : e.target.value
        })
    }

    const onFocus = (e) => {}
    const onBlur = (e) => {}

    const changeScreen = () => {
        
        setPercentResults({
            General       : new Intl.NumberFormat('es-MX').format( Number((parametros.PrecioCDO * ( parametros.BonificacionGeneral / 100)).toFixed(2) ) ),
            Bonificacion  : new Intl.NumberFormat('es-MX').format( Number((parametros.PrecioCDO * (parametros.BonificacionExtra / 100)).toFixed(2) ) )
        })
        setIsFormShowed(!isFormShowed);
    }

    const imprimirFormato = ( action ) => {

        if ( action === 'Impreso' ) {
            handlePrint();
            handleAfterPrint(action);
            
        }

        if ( action === 'Cerrar' ) {
            handleAfterPrint(action);
            
        }
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    })
    

  return (
    <div className='bg-white-modal'>
        <h5 className='text-center text-dark'>Formato Facturación</h5>

        {
            isFormShowed ?

            <div className='container'>
                <form>
                    <div className="row marginBottomSheet mt-4">

                        <div className="col-4">

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Precio Factura
                            </label>
                            <input 
                                type="number" 
                                className="form-control mb-2" 
                                tabIndex={10} 
                                value={parametros.PrecioFactura} 
                                onChange={onChange}
                                onFocus={(e) => onFocus(e)}
                                onBlur={(e) => onBlur(e)}  
                                name="PrecioFactura" 
                                autoComplete='off' 
                            />
                            
                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Bonificación Extra
                            </label>
                            <input 
                                type="number" 
                                className="form-control mb-2" 
                                tabIndex={12} 
                                value={parametros.BonificacionExtra} 
                                onChange={onChange}  
                                name="BonificacionExtra" 
                                autoComplete='off' 
                            />
                            
                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Gerente Administrativo
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={15} 
                                value={parametros.GteAdmin} 
                                onChange={onChange}  
                                name="GteAdmin" 
                                autoComplete='off' 
                            />
                            
                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Revisó Pedido
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={18} 
                                value={parametros.RevisoPedido} 
                                onChange={onChange}  
                                name="RevisoPedido" 
                                autoComplete='off' 
                            />

                        </div>

                        <div className="col-4">

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Precio CDO
                            </label>
                            <input 
                                type="number" 
                                className="form-control mb-2" 
                                tabIndex={11} 
                                value={parametros.PrecioCDO} 
                                onChange={onChange}
                                onFocus={(e) => onFocus(e)}
                                onBlur={(e) => onBlur(e)} 
                                name="PrecioCDO" 
                                autoComplete='off' 
                            />

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Administrador Flotillas
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={13} 
                                value={parametros.AdminFlotilla} 
                                onChange={onChange}  
                                name="AdminFlotilla" 
                                autoComplete='off' 
                            /> 

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Logística
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={16} 
                                value={parametros.Logistica} 
                                onChange={onChange}  
                                name="Logistica" 
                                autoComplete='off' 
                            />

                        </div>
                        
                        <div className="col-4" >

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Bonificación General
                            </label>
                            <input 
                                type="number" 
                                className="form-control mb-2" 
                                value={parametros.BonificacionGeneral} 
                                readOnly  
                                name="BonificacionGeneral" 
                                autoComplete='off' 
                                disabled
                            />

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Gerente Flotillas
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={14} 
                                value={parametros.GteFlotilla} 
                                onChange={onChange}  
                                name="GteFlotilla" 
                                autoComplete='off' 
                            /> 

                            <label 
                                className="bg-secondary input-group-text text-light font-weight-normal"
                            >
                                Elaboró Pedido
                            </label>
                            <input 
                                type="text" 
                                className="form-control mb-2" 
                                tabIndex={17} 
                                value={parametros.ElaboroPedido} 
                                onChange={onChange}  
                                name="ElaboroPedido" 
                                autoComplete='off' 
                            />

                        </div>
                    </div>

                </form> 
            </div>           
            
            :

            <div ref={componentRef}>
                
                    <div className='row marginLeftSheet marginRightSheet marginTopSheet'>
                        <div className='col-12'>
                            <h4 className='borderTop borderRight borderLeft noMargin text-center'>{`OC ${VINFacturacion.length} ${tipoVehiculo}`}</h4>
                            <h4 className='borderRight borderLeft borderTop noMargin text-center'>{razonSocial}</h4>
                            
                            <div className="row noMargin borderTop borderLeft borderRight" style={{ padding:0, margin:0 }}>

                                <div className="col-6 borderRight">
                                    <h4 className='text-center' style={{ padding:0, margin:0 }}>{`CTE ${numCliente}`}</h4>
                                    
                                </div>
                                <div className="col-6">
                                    <h4 className='text-center' style={{ padding:0, margin:0 }}>{`Fan ${fanCliente}`}</h4>

                                </div>
                            </div>

                            <h4 className='borderRight borderLeft borderTop borderBottom text-center'>{`Precio Fact. ${ new Intl.NumberFormat('es-MX').format(parametros.PrecioFactura) }` }</h4>
                            
                        </div>
                        {/* <div className='col-2'>
                            
                        </div> */}
                    </div>
                    <div className='row marginLeftSheet marginRightSheet'>
                        <div className='col-12'>
                            <table className='table table-sm table-bordered'>
                                <thead>
                                    <tr className='text-center'>
                                        <th><small></small></th>
                                        <th><small>Inv.</small></th>
                                        <th><small>Exterior</small></th>
                                        <th><small>Serie</small></th>
                                        <th><small>Modelo</small></th>
                                        <th><small>{`${parametros.BonificacionGeneral} %`}</small></th>
                                        <th>
                                            <small>{`${parametros.BonificacionExtra}% `}</small>
                                            <small>Bonificación</small>
                                        </th>
                                        <th><small>Destino</small></th>
                                        <th><small>Folio Fact.</small></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        VINFacturacion.map((reg, index) => (
                                            <tr className='text-center'>
                                                <td><small>{ index + 1 }</small></td>
                                                <td><small>{ reg.Inv }</small></td>
                                                <td><small>{ reg.Color }</small></td>
                                                <td><small>{ reg.Vin }</small></td>
                                                <td><small>{ reg.Modelo }</small></td>
                                                <td><small>{ `$ ${percentResults.General}` }</small></td>
                                                <td><small>{ `$ ${percentResults.Bonificacion}` }</small></td>
                                                <td><small>{ `${reg.CiudadDestino}` }</small></td>
                                                <td></td>  {/* reg.Factura  */}
                                            </tr>
                                        ))
                                    }
                                    
                                </tbody>
                            </table>
                        </div>
                        {/* <div className='col-2'>
                            <table className='table table-sm table-bordered'>
                                <thead>
                                    <tr>
                                        <th className="row d-flex justify-content-between ml-2 mr-2 bg-goldenRod">
                                            <small>$</small>
                                            <small>{ new Intl.NumberFormat('es-MX').format(parametros.PrecioCDO) }</small>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div> */}
                    </div>
                    <div className='row marginTop8 marginLeftSheet marginRightSheet marginBottomSheet'>
                        <div className='col-12'>
                            <div className="row">
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>ADMINISTRADOR FLOTILLAS</small></div>
                                        <div className="row justify-content-center"><small>{parametros.AdminFlotilla}</small></div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>GERENTE DE FLOTILLAS</small></div>
                                        <div className="row justify-content-center"><small>{parametros.GteFlotilla}</small></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row marginTop8">
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>GERENTE ADMINISTRATIVO</small></div>
                                        <div className="row justify-content-center"><small>{parametros.GteAdmin}</small></div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>LOGÍSTICA</small></div>
                                        <div className="row justify-content-center"><small>{parametros.Logistica}</small></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row marginTop8">
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>ELABORÓ PEDIDO</small></div>
                                        <div className="row justify-content-center"><small>{parametros.ElaboroPedido}</small></div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className='d-flex flex-column'>
                                        <div className='signLine marginBottom2'></div>
                                        <div className="row justify-content-center"><small>REVISÓ PEDIDO</small></div>
                                        <div className="row justify-content-center"><small>{parametros.RevisoPedido}</small></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className='col-2'>
                            
                        </div> */}
                    </div>

                
            </div>
        }

        <div className="row justify-content-center">
            <div className='col-auto'>

                <button
                    className='btn btn-secondary text-light font-italic mt-4'
                    type='button'
                    tabIndex={19}
                    onClick={ () => { changeScreen() } }
                >
                        {isFormShowed ? 'Vista Previa' : 'Editar'}
                </button>

                <button
                    className="btn btn-info text-light font-italic mt-4 ml-4"
                    disabled={ isFormShowed }
                    onClick={ () => imprimirFormato('Impreso') }
                    tabIndex={20}
                    title='Imprimir'
                    type='button'
                >
                    
                    Generar
                </button>

                <button
                    className="btn btn-danger text-light font-italic mt-4 ml-4"
                    onClick={ () => imprimirFormato('Cerrar') }
                    tabIndex={21}
                    title='Cerrar'
                    type='button'
                >
                    
                    Cerrar
                </button>

            </div>
        </div>
    </div>
  )
}
