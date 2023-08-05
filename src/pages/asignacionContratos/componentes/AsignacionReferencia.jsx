import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

import { VistaPreviaReferencias } from './reactToPrint/VistaPreviaReferencias'
import { ApiUrl } from '../../../services/ApiRest'
import { invertirCadenaFecha, isDefaultDate, validarFecha } from '../../../helpers/fecha'
import '../../../css/asignacionContratos/asignacionReferencia/asignacionReferencia.css'
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import { upperCase } from '../../../helpers/converToUpperCase'
import { ValidTwoDecimals } from '../../../helpers/formatoMoneda'

const PENDIENTES = 'PENDIENTES';

const AsignacionReferencia = ({ 
  agencia, 
  clientes,
  fatherInputs,
  updateMainValues 
}) => {
  const [VINClientes, setVINClientes] = useState([])
  const [NombresLoteCliente, setNombresLoteCliente] = useState([])
  const [isShowedTable, setIsShowedTable] = useState(false)
  const [Folio_lote_edit, setFolio_lote_edit] = useState(-1)
  const [isActiveButtonExcel, setisActiveButtonExcel] = useState(true)
  const [isActiveButtonActualizar, setisActiveButtonActualizar] = useState(false)
  const [inputsObject, setInputsObject] = useState({
    NombreCliente: "",
    NombreLote: "",
    Ubicacion: "",
    Estado: PENDIENTES,
    numCliente: 0
  })

  const clientsSelect       = useRef();
  const folioLoteSelect     = useRef();
  const currentFolio        = useRef(0);
  const helperRef           = useRef(false);

  let url = '';

  useEffect(() => {

    getNombresLoteCliente( clientes[0], PENDIENTES, true )
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
  
  const getNombresLoteCliente = async ( cliente, estado, firstRender = false  ) => {

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

    url = ApiUrl + "api/referencia/getNombresLotesCliente";

    const body = { 
      agencia      : agencia, 
      Nombre_corto : finalNombreCliente,
      Ubicacion    : finalUbicacion,
      numCliente   : finalNumCliente,
      Estado       : estado 
    }
    
    const nombres_lote_cliente = await axiosPostService( url, body );

    if ( nombres_lote_cliente.length === 0 ) {
      setInputsObject({
        ...inputsObject,
        NombreLote    : finalValidation ? NombreLoteFI : '', 
        NombreCliente : finalNombreCliente,
        Ubicacion     : finalUbicacion,
        numCliente    : finalNumCliente, 
        Estado        : estado
      });

      resetValuesVINClientes();
      return;
    }
    
    const { Folio_lote, NumCliente, Nombre_lote } = nombres_lote_cliente[0];

    setNombresLoteCliente( nombres_lote_cliente );

    const obj = nombres_lote_cliente.find(obj => obj.Nombre_lote === NombreLoteFI);

    if ( obj !== undefined ) currentFolio.current = obj.Folio_lote;
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
      numCliente    : finalNumCliente, 
      Estado        : estado
    });

  }

  const getLoteCliente = async (Folio_lote, Nombre_corto, NumCliente) => {
    
    setFolio_lote_edit( Folio_lote );
    url = ApiUrl + "api/referencia/getLoteCliente";
    const body_lote = { agencia: agencia, Folio_lote: Folio_lote, NumCliente: NumCliente };
    const vins_lote = await axiosPostService( url, body_lote );

    setVINClientes( vins_lote )
  }

  const resetValuesVINClientes = () => {
    setVINClientes([]);
    setNombresLoteCliente([])
  }

  const changeSelectStatus = (e) => {

    const objetoCliente = { 
      Nombre_corto  : inputsObject.NombreCliente, 
      Ubicacion     : inputsObject.Ubicacion, 
      Num_cliente   : inputsObject.numCliente 
    }
    
    const { NombreLote } = fatherInputs;

    getNombresLoteCliente( objetoCliente, e.target.value, NombreLote === '' ? false : true );
  }

  const changeSelectClientes = (e) => {

    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false);
    if ( !isActiveButtonExcel ) setisActiveButtonExcel(true);

    setIsShowedTable(false)

    const split = e.target.value.split("|");
    const [ Ubicacion, Nombre_cliente, Num_cliente ] = split;

    const objetoCliente = { 
      Nombre_corto : Nombre_cliente, 
      Ubicacion    : Ubicacion, 
      Num_cliente  : Num_cliente 
    }

    getNombresLoteCliente( objetoCliente, inputsObject.Estado )
  }

  const changeSelectNombresLoteCliente = (e) => {

    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false)
    if ( !isActiveButtonExcel )  setisActiveButtonExcel(true)
    
    setIsShowedTable( false );

    const Folio_lote     = e.target.value;
    const Nombre_cliente = inputsObject.NombreCliente;
    const Num_Cliente    = inputsObject.numCliente;

    const { Nombre_lote } = NombresLoteCliente.find( obj => obj.Folio_lote == Folio_lote )

    setInputsObject({
      ...inputsObject, 
      NombreLote: Nombre_lote
    });

    setFolio_lote_edit(Folio_lote)
    getLoteCliente( Folio_lote, Nombre_cliente, Num_Cliente)

  }

  const onChange = (e, vinRegistro) => {
    

    const updateListaClientes = VINClientes.map((row) => {
      if ( row.VIN === vinRegistro ) {
        let updaterow = {
          ...row,
          Referencia: e.target.value
        }
        return updaterow
      }
      return row
    })

    setVINClientes(updateListaClientes)

    if ( !isActiveButtonActualizar ) setisActiveButtonActualizar(true)
    if ( isActiveButtonExcel ) setisActiveButtonExcel(false)
    
  }

  const handleStateButtonUpdateLote = () => {
    if ( isActiveButtonActualizar ) setisActiveButtonActualizar(false)
    if ( !isActiveButtonExcel )  setisActiveButtonExcel(true)
    
  }

  const onGenerateTable = () => {
    setIsShowedTable(!isShowedTable)
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
                        //selected={cliente.Id === 1}
                        key={cliente.Num_cliente}
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
      </div>
      <div className="row m-2">
        <div className="col-6">
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
            <h6 className='mr-4 width__label-input-min'>Estado: </h6>
            <select 
              className='form-select select-class-1 width__label-input mt-2' 
              name='EstatusGPS' 
              onChange={changeSelectStatus}
              tabIndex={6}
            >
                <option value="PENDIENTES"> PENDIENTES </option>
                <option value="COMPLETOS"> COMPLETOS </option>
            </select>      
          </div>
        </div>
      </div>
      <div className="row m-2 bottom-space">
        <div className="col-6" >
          <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
              <h6 className='mr-4 width__label-input-min'>Nombre de Bloque: </h6>
                <select 
                  className='form-select select-class-1 width__label-input mt-2' 
                  disabled={ NombresLoteCliente.length === 0 }
                  onChange={(e) => changeSelectNombresLoteCliente(e)} 
                  ref={folioLoteSelect}
                >
                 { 
                    NombresLoteCliente.map(objeto => {
                      return (
                        <option 
                          selected={NombresLoteCliente[0].Nombre_lote == objeto.Nombre_lote}
                          value={objeto.Folio_lote} 
                        >
                          { 
                          // `${objeto.Nombre_lote} ${invertirCadenaFecha(objeto.Fecha_elaboracion.substring(0, 10))}` 
                          `${objeto.Nombre_lote} ${invertirCadenaFecha(objeto.Fecha_firma_contrato.substring(0, 10))}` 
                          }
                        </option>
                      )
                    })
                 }
                </select>
          </div>
        </div>
      </div>
      <div className="row m-2">
        <h6>3.- Asignar Referencias</h6>
      </div>
      {
        !isShowedTable &&
        <div className="row table-responsive heightTable">
        <table className='table display compact' style={{width:'2906px'}}>
          <thead style={{position: 'sticky', top:'0', zIndex:1, backgroundColor:'#1565C0', color:'white', fontSize:11, boxShadow:'-10px -10px #1565C0'}}>
            <tr className='text-center'>
              <th className='noselect' style={{width:'153.8px'}}>#</th>     
              <th style={{width:'150px', position:'sticky', left:'0', backgroundColor:'#1565C0', zIndex:1}}>VIN</th>     
              <th className='noselect' style={{width:'253.8px'}}>Cliente</th>     
              <th className='noselect' style={{width:'353.8px'}}>Distribuidor</th>     
              <th className='noselect' style={{width:'153.8px'}}>Marca</th>     
              <th className='noselect' style={{width:'353.8px'}}>Unidad</th>     
              <th className='noselect' style={{width:'153px'}}>Paquete</th>     
              <th className='noselect' style={{width:'253px'}}>Modelo</th>     
              <th className='noselect' style={{width:'153.8px'}}>No. Factura</th>     
              <th className='noselect' style={{width:'153.8px'}}>Precio Factura</th>     
              <th className='noselect' style={{width:'153.8px'}}>Orden Compra</th>     
              <th className='noselect' style={{width:'153.8px'}}>Firma Contrato</th>     
              <th className='noselect' style={{width:'253.8px'}}>Referencia</th>     
              <th className='noselect' style={{width:'153.8px'}}>Porcentaje Enganche</th>     
              <th className='noselect' style={{width:'153.8px'}}>Inversión Inicial</th>     
              <th className='noselect' style={{width:'153.8px'}}>Monto a Financiar</th>     
            </tr>
          </thead>
          <tbody style={{ position: 'sticky', zIndex:0}} className={VINClientes.length > 0 ? 'withData' : 'withNoData'}>
            {
              VINClientes.length > 0 ?
              VINClientes.map((registro, index) => {
                return (
                  <tr className='text-center'>
                    <td className='noselect'>{ index + 1 }</td>
                    <td style={{ position:'sticky', left:'0', backgroundColor:'#FFFFE0', zIndex:1 }}>{registro.VIN}</td>
                    <td className='noselect'>{ upperCase( registro.Nombre_cliente ) }</td>
                    <td className='noselect'>CULIACAN MOTORS SA DE CV</td>
                    <td className='noselect'>{ upperCase( registro.Marca ) }</td>
                    <td className='noselect'>{ upperCase( registro.Unidad ) }</td>
                    <td className='noselect'>{ upperCase( registro.Paquete ) }</td>
                    <td className='noselect'>{ upperCase( registro.Modelo ) }</td>
                    <td className='noselect'>{ upperCase( registro.Numero_factura ) }</td>
                    <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Precio_factura) ) }</td>
                    <td className='noselect'>{ upperCase( registro.Orden_compra ) }</td>
                    <td className='noselect'>{ validarFecha(isDefaultDate(registro.Fecha_firma_contrato)) }</td>
                    <td className='noselect'>
                      <input type="text" className="form-control" onChange={(e) => onChange(e, registro.VIN)} value={ upperCase( registro.Referencia ) } name="referencia" autoComplete='off' />
                    </td>
                    <td className='noselect'>{registro.Tasa_porcentaje_enganche}</td>
                    <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Inversion_inicial) ) }</td>
                    <td className='noselect'>{ ValidTwoDecimals( new Intl.NumberFormat('es-MX').format(registro.Monto_total) ) }</td>
                  </tr>
                )
              })
              :
              <tr className='p-2'>
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
                <td></td>
              </tr>

            }
          </tbody>
        </table>
      </div>
      }

      <VistaPreviaReferencias
        agencia={ agencia }
        data={ VINClientes }
        handleStateButtonUpdateLote={handleStateButtonUpdateLote}
        isActiveButtonActualizar={isActiveButtonActualizar}
        isActiveButtonExcel={isActiveButtonExcel}
        isShowedTable={isShowedTable}
      />

      <div className="row m-2">
        <button
          className='btn btn-info mt-2 mb-2'
          disabled={VINClientes.length === 0}
          onClick={onGenerateTable}
          type='button'
        >
          { isShowedTable ? "Editar" : "Vista Previa"}
        </button>
      </div>
    </>
  )
}

export default AsignacionReferencia