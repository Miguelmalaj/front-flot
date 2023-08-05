import React, { useState, useEffect, useRef } from 'react'

import { ResumenDeContratosTable } from './reactToPrint/ResumenDeContratosTable'
import { invertirCadenaFecha } from '../../../helpers/fecha'
import { axiosPostService } from '../../../services/asignacionLoteService/AsignacionLoteService'
import '../../../css/asignacionContratos/asignacionReferencia/asignacionReferencia.css'
import { ApiUrl } from '../../../services/ApiRest'

const ResumenDeContratos = ({ 
  agencia, 
  clientes,
  updateMainValues,
  fatherInputs  
}) => {
    const [VINClientes, setVINClientes] = useState([])
    const [NombresLoteCliente, setNombresLoteCliente] = useState([])
    const [isShowedTable, setIsShowedTable] = useState(false)
    const [inputsObject, setInputsObject] = useState({
      NombreCliente : '',
      NombreLote    : '',
      Ubicacion     : '',
      numCliente    : 0
    })

    const clientsSelect   = useRef();
    const folioLoteSelect = useRef();
    const currentFolio    = useRef(0);
  	const helperRef       = useRef(false);

    let url = '';

    useEffect(() => {

      getNombresLoteCliente( clientes[0], true );

    }, [clientes])

    useEffect(() => {
      
      if ( NombresLoteCliente.length > 0 && helperRef.current ) {

        folioLoteSelect.current.value = currentFolio.current;
        helperRef.current = false;
        currentFolio.current = 0;

      }

    }, [NombresLoteCliente]);

    useEffect(() => {

      updateMainValues( inputsObject );
  
    }, [inputsObject])
    

    const getNombresLoteCliente = async( cliente, firstRender = false ) => {

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

      url = ApiUrl + "api/resumen/getNombresLotesCliente";

      const body = { 
        agencia      : agencia, 
        Nombre_corto : finalNombreCliente, 
        Ubicacion    : finalUbicacion, 
        numCliente   : finalNumCliente 
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
        finalValidation ? obj?.Folio_lote !== undefined ? obj.Folio_lote : Folio_lote : Folio_lote,//Folio_lote, 
        finalNombreCliente, 
        finalNumCliente
      );
     
      setInputsObject({
        ...inputsObject, 
        NombreLote    : finalValidation ? obj?.Folio_lote !== undefined ? NombreLoteFI : Nombre_lote : Nombre_lote,
        NombreCliente : finalNombreCliente, 
        Ubicacion     : finalUbicacion, 
        numCliente    : finalNumCliente
      });
    }

    const getLoteCliente = async ( Folio_lote, Nombre_corto, NumCliente ) => {
      url = ApiUrl + "api/resumen/getLoteCliente";
      const body_lote = { agencia: agencia, Folio_lote: Folio_lote, NumCliente: NumCliente};
      const vins_lote = await axiosPostService( url, body_lote );

      setVINClientes( vins_lote )
    }

    const resetValuesVINClientes = () => {
      setVINClientes([]);
      setNombresLoteCliente([])
    }
    
    const changeSelectClientes = (e) => {
      const split = e.target.value.split("|")
      const [ Ubicacion, Nombre_cliente, Num_cliente ] = split;
      setInputsObject({...inputsObject, NombreCliente: Nombre_cliente, Ubicacion: Ubicacion, numCliente: Num_cliente})
      const objetoCliente = { Nombre_corto: Nombre_cliente, Ubicacion: Ubicacion, Num_cliente: Num_cliente }
      getNombresLoteCliente( objetoCliente )
    }

    const changeSelectNombresLoteCliente = (e) => {
      const Folio_lote     = e.target.value;
      const Nombre_cliente = inputsObject.NombreCliente;
      const Num_Cliente    = inputsObject.numCliente;

      const { Nombre_lote } = NombresLoteCliente.find( obj => obj.Folio_lote == Folio_lote )

      setInputsObject({
        ...inputsObject, 
        NombreLote: Nombre_lote
      });
      
      getLoteCliente( Folio_lote, Nombre_cliente, Num_Cliente );

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
          <div className="row m-2 bottom-space">
            <div className="col-6">
              <div className="row d-flex justify-content-start align-items-center pl-2 pr-4">
                  <h6 className='mr-4 width__label-input-min'>Nombre de Bloque: </h6>
                  <select 
                    className='form-select select-class-1 width__label-input mt-2' 
                    disabled={NombresLoteCliente.length === 0}
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
          <div className='row m-2'>
            <h6>Información Bloque:</h6>
          </div>
          
          <ResumenDeContratosTable
            data={VINClientes}
          />
      </>
    )
}

export default ResumenDeContratos