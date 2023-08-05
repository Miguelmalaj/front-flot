import React, { Component, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { ApiUrl } from '../../../../services/ApiRest';
import { axiosPostService, axiosPatchService, axiosDeleteServide } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { upperCase } from '../../../../helpers/converToUpperCase';

class TablaAsignarVinsOrdenDeCompraClass extends Component {
    render() {
        const data = this.props.data;

       return (
        
            <table className='table display compact' style={{fontSize:11}}>
                <thead className='text-center' style={{ position: 'sticky', top:'0', backgroundColor:'#1565C0', color:'white'}}>
                <tr>
                    <th className='noselect' style={{fontSize:11}}>#</th>
                    <th className='noselect'>Inv</th>
                    <th>VIN</th>
                    <th className='noselect'>Vehiculo</th>
                    <th className='noselect'>Orden de Compra</th>
                    <th className='noselect'>Persona Receptor</th>
                    <th className='noselect'># Cel.</th>
                    <th className='noselect'>Agencia</th>
                    <th className='noselect'>Ciudad Destino</th>
                    <th className='noselect'>Domicilio</th>
                </tr>
                </thead> 
                <tbody style={{backgroundColor:'#FFFFE0'}}>
                    {
                    data.length > 0 ?
                    data.map((registro, index) => {
                        return (
                        <tr className='text-center' style={{fontSize:11}}>
                            <td style={{fontSize:11}}>{ index + 1 }</td>
                            <td className='noselect' style={{fontSize:12}}>{ registro.Inventario.replace('  ','-').split('-').pop().trim() }</td>
                            <td style={{fontSize:12}}>{ registro.Vin }</td>
                            <td className='noselect' style={{fontSize:12}}>{ upperCase( registro.Vehiculo ) }</td>
                            <td className='noselect'>{ upperCase( registro.OrdenDeCompra ) }</td>
                            <td className='noselect'>{ upperCase( registro.PersonaReceptor ) }</td>
                            <td className='noselect'>{ registro.CelularDeContacto }</td>
                            <td className='noselect'>{ upperCase( registro.Agencia ) }</td>
                            <td className='noselect'>{ upperCase( registro.CiudadDestino ) }</td>
                            <td className='noselect'>{ upperCase( registro.DomicilioDeEntrega ) }</td>
                        </tr>
                        )
                    })
                    :
                    <tr className='p-2'>
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
        
       ) 
    }
}

export const TablaAsignarVinsOrdenDeCompra = ({
    agencia, 
    copyVINS,
    data, 
    handleGuardarVinsConOrdenCompra,
    isPreviewTable,
    TiposYCantidades,
    VINClientestoDelete,
    VINSGeneratedinBD,
    NumeroCliente
}) => {
    let url = '';

    const onGuardarVinsConOrdenCompra = async () => {

        //console.log('data', data);

        let VINClientesToDel = overWriteNumClient( VINClientestoDelete );

        if ( VINClientestoDelete.length > 0 ) {
            url = ApiUrl + "api/asignarvins/delete_vins_of_orden_compra"
            const deleteVINS = await axiosDeleteServide( url, {agencia, VINClientestoDelete: VINClientesToDel} );
            if ( deleteVINS.isDeleted === undefined) {
                toast.error("Error con servidor, no fue posible eliminar VINS deseleccionados.")
                return;
            }
        }

         url = ApiUrl + "api/asignarvins/create_vins_with_orden_compra"
         let newData = overWriteNumClient( data );
         const body = { agencia: agencia, data: newData }

         const result = await axiosPostService(url, body)
       
         if ( result.isCreated ) {
            if ( result.vinsToUpdateList.length > 0 ) {
                const resultUpdate = await updateVINList( result.vinsToUpdateList )
                if ( resultUpdate.isUpdated === undefined) {
                    toast.error("Error con servidor, no fue posible realizar la actualización de vins seleccionados.")
                    return;
                }
            }

            url = ApiUrl + "api/update_tipos_orden_compra";
            const updateTipos = await axiosPatchService( url, {agencia ,TiposYCantidades, NumeroCliente} );
            if ( updateTipos.isUpdated === undefined ) {
                toast.error("Error con servidor, no fue posible realizar la actualización de los tipos vehiculos seleccionados.")
                return;
            }

            handleGuardarVinsConOrdenCompra();
            toast.success("Los VINS fueron agregados a la orden de compra exitosamente.")
            return;
         }
        
        toast.error("Error con servidor, no fue posible realizar el registro.");
    }

    const updateVINList = async ( vinList ) => {
        url = ApiUrl + "api/asignarvins/update_vins_with_orden_compra"
        let newVinList = overWriteNumClient( vinList );
        // const body = { agencia: agencia, data: vinList }
        const body = { agencia: agencia, data: newVinList }
        const result = await axiosPatchService( url, body );
        return result;
    }

    const overWriteNumClient = ( list ) => {
        return list.map((obj) => {
            return {
                ...obj,
                NumCliente: NumeroCliente
            }
        })
    }

    const showVINS = () => {
        copyVINS();
    }

  return (
    isPreviewTable &&
    <>
        <div className='row m-2' style={{display:'block', height:'500px', overflowY: 'scroll'}}>
            <TablaAsignarVinsOrdenDeCompraClass data={data} />
        </div>

        <button
        title='Guardar en Base de Datos'
        type='button'
        className='btn btn-info  mt-2 mb-2 ml-2'
        onClick={onGuardarVinsConOrdenCompra}
        disabled={ (data.length === 0 && VINClientestoDelete.length === 0) || VINSGeneratedinBD }
        >
            <FontAwesomeIcon  icon={faUpload} />
            <small className='ml-2'>Guardar</small>
        </button>
        <button
        title='Copiar VINS'
        type='button'
        className='btn btn-info mt-2 mb-2 ml-2'
        onClick={showVINS}
        disabled={ data.length === 0 }
        >
        Copiar VINS  
        </button>
    </>
  )
}
