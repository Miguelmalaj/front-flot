import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

import { VistaPreviaFolioCompra } from './reactToPrint/VistaPreviaFolioCompra'
import { invertirCadenaFecha, isDefaultDate, validarFecha } from '../../../helpers/fecha'
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import '../../../css/asignacionContratos/asignacionReferencia/asignacionReferencia.css'
import { ApiUrl } from '../../../services/ApiRest'
import { ValidTwoDecimals, removerComas } from '../../../helpers/formatoMoneda'
import { isADotValue, hasPointTheInputValue, isNumber, getTotalPoints } from '../../../helpers/validarInputs'
import { upperCase } from '../../../helpers/converToUpperCase'

const AsignacionFolioCompra = ({ 
  agencia, 
  clientes,
  updateMainValues,
  fatherInputs 
}) => {
  const [VINClientes, setVINClientes] = useState([])
  const [NombresLoteCliente, setNombresLoteCliente] = useState([])
  const [isActiveButtonExcel, setisActiveButtonExcel] = useState(true)
  const [isActiveButtonActualizar, setisActiveButtonActualizar] = useState(false)
  const [isShowedTable, setIsShowedTable] = useState(false)
  const [porcentajeEnganche, setPorcentajeEnganche] = useState(5)
  const [inputsObject, setInputsObject] = useState({
    NombreCliente : "",
    NombreLote    : "",
    Ubicacion     : "",
    numCliente    : 0
  })

  const clientsSelect       = useRef();
  const folioLoteSelect     = useRef();
  const currentFolio        = useRef(0);
  const helperRef           = useRef(false);

  let url = '';

  useEffect(() => {

    getNombresLoteCliente( clientes[0], true )

  }, [clientes])

  useEffect(() => {

    if ( NombresLoteCliente.length > 0 && helperRef.current ) {

        folioLoteSelect.current.value = currentFolio.current;
        
    }

    helperRef.current = false;
    currentFolio.current = 0;

  }, [NombresLoteCliente])

  useEffect(() => {

    updateMainValues( inputsObject );

  }, [inputsObject])

  const getNombresLoteCliente = async ( cliente, firstRender = false ) => {

    const { NombreCliente:NombreClienteFI, NombreLote:NombreLoteFI, Ubicacion: UbicacionFI, numCliente: numClienteFI } = fatherInputs;
    
    const { Nombre_corto, Ubicacion: UbicacionCliente, Num_cliente } = cliente;

    const containsFatherInputs = numClienteFI !== 0;
    const finalValidation      = containsFatherInputs && firstRender; 
    const finalNombreCliente   = finalValidation ? NombreClienteFI : Nombre_corto;
    const finalNumCliente      = finalValidation ? numClienteFI    : Num_cliente;
    const finalUbicacion       = finalValidation ? UbicacionFI     : UbicacionCliente;
    
    if ( finalValidation ) {
      clientsSelect.current.value = `${UbicacionFI}|${NombreClienteFI}|${numClienteFI}`;
      helperRef.current = true;

    }

    url = ApiUrl + "api/foliocompra/getNombresLotesCliente"

    const body = { 
      agencia       : agencia, 
      Nombre_corto  : finalNombreCliente, 
      Ubicacion     : finalUbicacion, 
      numCliente    : finalNumCliente 
    }
    
    const nombres_lote_cliente = await axiosPostService( url, body );
    
    if ( nombres_lote_cliente.length === 0 ) {
      setInputsObject({
        ...inputsObject, 
        NombreLote    : finalValidation ? NombreLoteFI : '',
        NombreCliente : finalNombreCliente,
        Ubicacion     : finalUbicacion,
        numCliente    : finalNumCliente
      });

      resetValuesVINClientes();
      return;
    }
    
    const { Folio_lote, NumCliente, Nombre_lote } = nombres_lote_cliente[0];
    //setNombresLoteCliente([]);

    setNombresLoteCliente( nombres_lote_cliente );

    const obj = nombres_lote_cliente.find(obj => obj.Nombre_lote === NombreLoteFI);
    
    if ( obj !== undefined ) currentFolio.current = obj?.Folio_lote;
    
    if ( obj === undefined ) currentFolio.current = Folio_lote;
    

    getLoteCliente( 
      finalValidation ? obj?.Folio_lote !== undefined ? obj.Folio_lote : Folio_lote : Folio_lote, 
      finalNombreCliente, 
      finalNumCliente 
    );
    

    setInputsObject({
      ...inputsObject, 
      NombreLote    : finalValidation ? obj?.Folio_lote !== undefined ? NombreLoteFI : Nombre_lote : Nombre_lote,
      NombreCliente : finalNombreCliente, 
      Ubicacion     : finalUbicacion, 
      numCliente    : finalNumCliente
    })

  }

  const getLoteCliente = async (Folio_lote, Nombre_corto, NumCliente) => {
    url = ApiUrl + "api/foliocompra/getLoteCliente"
    const body_lote = { agencia: agencia, Folio_lote: Folio_lote, NumCliente: NumCliente };
    const vins_lote = await axiosPostService( url, body_lote );

    setPorcentajeEnganche(vins_lote[0].Tasa_porcentaje_enganche)

    setVINClientes( vins_lote )

  }

  const resetValuesVINClientes = () => {
    setVINClientes([]);
    setNombresLoteCliente([])
  } 
  
  const changeSelectClientes = (e) => {
    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false)
    if ( !isActiveButtonExcel ) setisActiveButtonExcel(true)
    setIsShowedTable(false)
    const split = e.target.value.split("|")
    const [ Ubicacion, Nombre_cliente, Num_cliente ] = split;
    setInputsObject({...inputsObject, NombreCliente: Nombre_cliente, Ubicacion: Ubicacion, numCliente: Num_cliente})
    const objetoCliente = { Nombre_corto: Nombre_cliente, Ubicacion: Ubicacion, Num_cliente: Num_cliente }
    getNombresLoteCliente( objetoCliente )
  }

  const changeSelectNombresLoteCliente = (e) => {
    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false)
    if ( !isActiveButtonExcel ) setisActiveButtonExcel(true)
    
    setIsShowedTable( false );
    
    const Folio_lote     = e.target.value;
    const Nombre_cliente = inputsObject.NombreCliente;
    const Num_Cliente    = inputsObject.numCliente;

    const { Nombre_lote } = NombresLoteCliente.find( obj => obj.Folio_lote == Folio_lote )

    setInputsObject({
      ...inputsObject, 
      NombreLote: Nombre_lote
    });
    
    getLoteCliente( Folio_lote, Nombre_cliente, Num_Cliente)
  }

  const onGenerateTable = () => {
    setIsShowedTable(!isShowedTable)
  }

  const validateInput = (e, vinRegistro, valorDelCampoEnArreglo) => {

    if (isNumber( e.target.value )) { 
      calcularValores(e.target.name, vinRegistro, removerComas(e.target.value) ) //remover comas cuando es un valor copy/paste.
      return;
    }
    
    if (!isNumber( e.target.value )) { 
      if (isADotValue( e.target.value )) { 
          (!hasPointTheInputValue( valorDelCampoEnArreglo )) 
          ? calcularValores(e.target.name, vinRegistro, e.target.value )
          : (getTotalPoints( e.target.value ) !== 2) && calcularValores(e.target.name, vinRegistro, valorDelCampoEnArreglo.substring(0, valorDelCampoEnArreglo.toString().length - 1))
          
      }
    }

  }

  const calcularValores = (propiedad, vinRegistro, valor) => {

      const updateListaClientes = VINClientes.map((row) => {
        if ( row.VIN === vinRegistro ) {
          let updaterow;
          if ( propiedad === "Monto_plan_piso" ) {
            updaterow = {
              ...row,
              [propiedad] : valor
            }
          }
          if ( propiedad === "Monto_deposito_cuenta_cheques" ) {
            updaterow = {
              ...row,
              [propiedad] : valor
            }
          }
          
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
          
          return updaterow
        }
        return row
      })
      setVINClientes(updateListaClientes)

  }

  const onChange = (e, vinRegistro, valorDelCampoEnArreglo) => {
    if ( !isActiveButtonActualizar ) setisActiveButtonActualizar(true)
    if ( isActiveButtonExcel ) setisActiveButtonExcel(false)

    if ( e.target.name === "Monto_plan_piso" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }
    
    if ( e.target.name === "Monto_deposito_cuenta_cheques" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }
    
    if ( e.target.name === "Monto_total" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }

    if ( e.target.name === "Inversion_inicial" ) {
      validateInput(e, vinRegistro, valorDelCampoEnArreglo)
      return;
    }

    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === vinRegistro ) {
        let updaterow;
        if ( e.target.name === "Tasa_porcentaje_enganche" ) {
          updaterow = {
            ...row,
            [e.target.name]       : e.target.value,
            ['Monto_total']       : new Intl.NumberFormat('es-MX').format(row.Precio_factura * (1 - (e.target.value / 100))),
            ['Inversion_inicial'] : new Intl.NumberFormat('es-MX').format(row.Precio_factura * (e.target.value / 100) ),
          }
        }
        else { //thispoint changes compra contrato.
          updaterow = {
            ...row,
            [e.target.name]: e.target.value
          }
        }
        
        return updaterow
      }
      return row
    })

    setVINClientes(updateListaClientes)
  }

  const handleStateButtonUpdateLote = () => {
    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false)
    if ( !isActiveButtonExcel ) setisActiveButtonExcel(true);
  }

  const onBlur = (e, registro) => {
    if ( e.target.name === "Monto_plan_piso" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Monto_deposito_cuenta_cheques" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Monto_total" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Inversion_inicial" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
  }

  const onFocus = (e, registro) => {
    if ( e.target.name === "Monto_plan_piso" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Monto_deposito_cuenta_cheques" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Monto_total" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }
    if ( e.target.name === "Inversion_inicial" ) {
      updateArregloClientes(e, registro, e.type)
      return;
    }

  }

  const updateArregloClientes = ( e, registro, tipo ) => {
    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === registro.VIN ) {
        let updaterow;
        if ( e.target.name === "Monto_plan_piso" ) {
          updaterow = {
            ...row,
            [e.target.name] : tipo === "blur" ? new Intl.NumberFormat('es-MX').format(e.target.value) : removerComas(e.target.value)
          }
        }
        if ( e.target.name === "Monto_deposito_cuenta_cheques" ) {
          
          updaterow = {
            ...row,
            [e.target.name] : tipo === "blur" ? new Intl.NumberFormat('es-MX').format(e.target.value) : removerComas(e.target.value)
          }
        }
        if ( e.target.name === "Monto_total" ) {
          return calcularMontoTotal(e,row,tipo,registro);
          
        }
        if ( e.target.name === "Inversion_inicial" ) {
          return calcularInversionInicial(e,row,tipo,registro);
          
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
      let precioVehiculo = removerComas(registro.Precio_factura);
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
      let precioVehiculo = removerComas(registro.Precio_factura);
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

  const updateTasa = ( e ) => {
    let value = e.target.value;
    if ( value < 0 ) return;
    setPorcentajeEnganche(value)
    const updateListaClientes = VINClientes.map((row) => ( 
        {
            ...row,
            Tasa_porcentaje_enganche  : value,
            Monto_total               : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(      Number( (removerComas(row.Precio_factura) * (1 - (value / 100))).toFixed(2) )     )),
            Inversion_inicial         : ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(      Number( (removerComas(row.Precio_factura) * (value / 100)).toFixed(2) )           )),
            /* Monto_total               : new Intl.NumberFormat('es-MX').format(removerComas( row.Precio_factura ) * (1 - (value / 100))),
            Inversion_inicial         : new Intl.NumberFormat('es-MX').format(removerComas( row.Precio_factura ) * (value / 100) ), */
        }
    ))
    setVINClientes(updateListaClientes)
  }

  return (
    <>
      <div className="row m-2">
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            <h6 className='mr-4 width__label-input-min'>Seleccionar Cliente: </h6>

            <select 
              className='form-select select-class-1 width__label-input mt-2' 
              onChange={(e) => changeSelectClientes(e)}
              ref={clientsSelect}
            >
                {
                  clientes.map(cliente => {
                    return (
                      <option 
                        value={`${cliente.Ubicacion}|${cliente.Nombre_corto}|${cliente.Num_cliente}`} 
                        key={cliente.Num_cliente}
                        //selected={cliente.Id === 1}
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
      <div className="row m-2 ">
          <div className="col-6">
            <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                <h6 className='mr-4 width__label-input-min'>Nombre de Bloque: </h6>

                <select 
                  className='form-select select-class-1 width__label-input mt-2' 
                  onChange={(e) => changeSelectNombresLoteCliente(e)} 
                  disabled={ NombresLoteCliente.length === 0 }
                  ref={folioLoteSelect}
                >
                { 
                    NombresLoteCliente.map(objeto => {
                      return (
                        <option 
                          selected={NombresLoteCliente[0].Nombre_lote == objeto.Nombre_lote}
                          value={objeto.Folio_lote} 
                          key={objeto.Folio_lote}
                        >
                          { 
                          `${objeto.Nombre_lote} ${invertirCadenaFecha(objeto.Fecha_firma_contrato.substring(0, 10))}` 
                          // `${objeto.Nombre_lote} ${invertirCadenaFecha(objeto.Fecha_firma_contrato.substring(0, 10))}` 
                          }
                        </option>
                      )
                    })
                 }
                </select>

            </div>
          </div>
      </div>
      
      <hr style={{backgroundColor:"gainsboro"}}/>

      <div className='row m-2'>
         <h6>Asignar Folio de Compra</h6>
      </div>
      {
        !isShowedTable &&
        <div className='row table-responsive heightTable'>
          <table className='table display compact' style={{width:'3772px', tableLayout:'fixed'}}>
            <thead style={{position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white', fontSize:11, boxShadow:'-10px -10px #1565C0'}}>
              <tr style={{ fontSize:15, textAlign:'right', outline:'2px solid #1565C0'}}>
                <th colSpan='17'></th>
                <th style={{ padding:'5px'}}>
                  <div class="d-flex justify-content-center">

                    <input 
                      autoComplete='off'
                      className="form-control" 
                      style={{height:'20px', fontSize:18}}
                      name="Tasa_porcentaje_enganche" 
                      onChange={ updateTasa } 
                      type="number" 
                      value={porcentajeEnganche} />

                    <small className='ml-2'>%</small>

                  </div>  
                </th>
                <th colSpan='2'></th>
              </tr>

              <tr className='text-center' style={{ outline:'1px solid #1565C0' }}>
                <th style={{width:'100.6px'}}>#</th>     
                <th style={{width:'634px', position:'sticky', left:'0', backgroundColor:'#1565C0', zIndex:1 }}>VIN</th>     
                <th style={{width:'207.6px'}}>Cliente</th>     
                <th style={{width:'307px'}}>Distribuidor</th>     
                <th style={{width:'117.6px'}}>Marca</th>     
                <th style={{width:'234.6px'}}>Unidad</th>     
                <th style={{width:'234px'}}>Paquete</th>     
                <th style={{width:'234px'}}>Modelo</th>     
                <th style={{width:'117.6px'}}>No. Factura</th>     
                <th className='text-right' style={{width:'117.6px'}}>Precio Factura</th>     
                <th style={{width:'117.6px'}}>Orden Compra</th>     
                <th style={{width:'157.6px'}}>Referencia</th>
                <th style={{width:'117.6px'}}>Fecha Firma</th>

                <th style={{width:'197.6px'}}>Compra Contrato</th>
                <th style={{width:'117.6px'}}>Fecha Compra</th>
                <th style={{width:'157.6px'}}>Plan Piso</th>
                <th style={{width:'157.6px'}}>Cuenta Cheques</th>
                <th style={{width:'117.6px'}}>Porcentaje Enganche</th>{/* Tasa */}
                <th style={{width:'117.6px'}}>Inversión Inicial</th>     
                <th style={{width:'117.6px'}}>Monto a Financiar</th>     
              </tr>

            </thead>
            {/* <tbody style={{backgroundColor:'#FFFFE0', fontSize:11}}> */}
            <tbody style={{ position: 'sticky', zIndex:0}} className={VINClientes.length > 0 ? 'withData' : 'withNoData'}>
              {
                VINClientes.length > 0 ?
                VINClientes.map((registro, index) => {
                  return (
                    <tr className='text-center' key={ registro.VIN }>
                      <td>{ index + 1 }</td>
                      <td style={{ position:'sticky', left:'0', backgroundColor:'#FFFFE0', zIndex:1 }}>{registro.VIN}</td>
                      <td>{ upperCase( registro.Nombre_cliente ) }</td>
                      <td>CULIACAN MOTORS SA DE CV</td>
                      <td>{ upperCase( registro.Marca ) }</td>
                      <td>{ upperCase( registro.Unidad ) }</td>
                      <td>{ upperCase( registro.Paquete ) }</td>
                      <td>{ upperCase( registro.Modelo ) }</td>
                      <td>{ upperCase( registro.Numero_factura ) }</td>
                      <td className='text-right'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Precio_factura) )}</td>
                      <td>{ upperCase( registro.Orden_compra ) }</td>
                      <td>{ upperCase( registro.Referencia ) }</td>
                      <td>{ validarFecha(isDefaultDate(registro.Fecha_firma_contrato)) }</td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control" 
                          onChange={(e) => onChange(e, registro.VIN, registro.Folio_compra_contrato)} 
                          value={ upperCase( registro.Folio_compra_contrato ) } 
                          name="Folio_compra_contrato" 
                          autoComplete='off'
                        />
                      </td>
                      <td>
                        <input 
                          type="date" 
                          className="form-control" 
                          min="2018-01-01" 
                          onChange={(e) => onChange(e, registro.VIN, registro.Fecha_compra_contrato)} 
                          value={registro.Fecha_compra_contrato.substring(0,10)} 
                          name="Fecha_compra_contrato" 
                          autoComplete='off'
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control"
                          onFocus={(e) => onFocus(e, registro)}
                          onBlur={(e) => onBlur(e, registro)}
                          onChange={(e) => onChange(e, registro.VIN, registro.Monto_plan_piso)} 
                          value={registro.Monto_plan_piso} 
                          name="Monto_plan_piso" 
                          autoComplete='off'
                        />
                      </td>
                      {/* <td style={{width:'12.41%'}}> */}
                      <td>
                        <input 
                          type="text" 
                          className="form-control"
                          onFocus={(e) => onFocus(e, registro)}
                          onBlur={(e) => onBlur(e, registro)} 
                          onChange={(e) => onChange(e, registro.VIN, registro.Monto_deposito_cuenta_cheques)} 
                          value={registro.Monto_deposito_cuenta_cheques} 
                          name="Monto_deposito_cuenta_cheques" 
                          autoComplete='off'
                        />
                      </td>
                      <td>{registro.Tasa_porcentaje_enganche}</td>
                      <td>{registro.Inversion_inicial}</td>
                      <td>{registro.Monto_total}</td>
                    </tr>
                  )
                })
                :
                <tr className='p-2'>
                  <td><small>No existen lotes creados del cliente seleccionado</small></td>
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
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>

              }
            </tbody>
          </table>
        </div>
      }
      <VistaPreviaFolioCompra
        agencia={ agencia }
        data={ VINClientes }
        isShowedTable={isShowedTable}
        handleStateButtonUpdateLote={handleStateButtonUpdateLote}
        isActiveButtonExcel={isActiveButtonExcel}
        isActiveButtonActualizar={isActiveButtonActualizar}
      />
      <div className='row m-2'>
        <button
          type='button'
          className='btn btn-info mt-2 mb-2'
          onClick={onGenerateTable}
          disabled={VINClientes.length === 0}
        >
          { isShowedTable ? "Editar" : "Vista Previa"}
        </button>
      </div>
    </>
  )
}

export default AsignacionFolioCompra