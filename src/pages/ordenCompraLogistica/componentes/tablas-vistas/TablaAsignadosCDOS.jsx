import { useState, Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { ApiUrl } from '../../../../services/ApiRest';
import { axiosPatchService } from '../../../../services/asignacionLoteService/AsignacionLoteService';
import { useEffect } from 'react';

class TablaAsignadosCDOSClass extends Component {
    render() {
        // const typeOrders = this.props.typeOrders;
        // const { asigCDOS } = this.props;
        const { filteredList } = this.props;

        return (
            <table className='table display compact' style={{width:'100%', fontSize:11}}>
                    <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                        <tr className='text-center'>
                            <th style={{width:'16.66%'}}>Cliente</th>
                            <th style={{width:'16.66%'}}>OC</th>
                            <th style={{width:'16.66%'}}>Unidad</th>
                            <th style={{width:'16.66%'}}>Cantidad</th>
                            <th style={{width:'16.66%'}}>Asignados</th>
                            <th style={{width:'16.66%'}}>CDO</th>
                            <th style={{width:'16.66%'}}>Sin Asignar</th>
                            <th style={{width:'16.66%'}}>Sin CDO</th>
                        </tr>
                    </thead>
                    <tbody style={{backgroundColor:'#FFFFE0'}}>
                        {
                            filteredList.length > 0 ?
                            filteredList.map((type) => (
                                <tr className='text-center'>
                                    <td style={{width:'16.66%'}}>{ type.Nombre_corto }</td>
                                    <td style={{width:'16.66%'}}>{ type.OrdenCompra }</td>
                                    <td style={{width:'16.66%'}}>{ type.TipoVehiculo }</td>
                                    <td style={{width:'16.66%'}}>{ type.Cantidad }</td>
                                    <td style={{width:'16.66%'}}>{ type.Asignados }</td>
                                    <td style={{width:'16.66%'}}>{ type.CDO }</td>
                                    <td style={{width:'16.66%'}}>{ type.Cantidad - type.Asignados }</td>
                                    <td style={{width:'16.66%'}}>{ type.Cantidad - type.CDO }</td>
                                </tr>
                            ))
                            :
                            <tr>
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

export const TablaAsignadosCDOS = ({ 
    agencia, 
    asigCDOS,
    asigCDOSAltered,
    handleGuardarTipos,
    isPreviewTable,
    numCliente,
    // typeOrders,
    updatedInBD,
}) => {
    let url = '';

    const [filteredList, setFilteredList] = useState([]);

    

    useEffect(() => {
      
        let updateAsigCDOSList = asigCDOS.filter( ({ TipoVehiculo, Num_cliente, OrdenCompra }) => { 

            const searchObj = asigCDOSAltered.find( obj2 => obj2.TipoVehiculo === TipoVehiculo && obj2.Num_cliente === Num_cliente && obj2.OrdenCompra === OrdenCompra);

            return searchObj !== undefined ? true : false;

        })

        updateAsigCDOSList = updateAsigCDOSList.map( obj => {
            let newObj = { ...obj };
            
            if ( obj.CDO === "" ) newObj = { ...newObj, CDO: 0 };
            if ( obj.Asignados === "" ) newObj = { ...newObj, Asignados: 0 };

            return newObj;
            
        })

        setFilteredList( updateAsigCDOSList );

    }, [asigCDOS])
    

    const onGuardarTipos = async () => {

        url = ApiUrl + "api/asignadoscdos/update_tipos_vehiculos";

        const body = { 
            agencia     : agencia, 
            data        : filteredList,//typeOrders, //
            Num_cliente : numCliente 
        }


        const result = await axiosPatchService( url, body );

        if ( result.isUpdated ) {

            toast.success("La información ha sido actualizada exitosamente.");

            handleGuardarTipos();

            setFilteredList([]);
            
            return;

        }

        toast.error("Error con servidor, no fue posible realizar la actualización de los tipos vehiculos.")
    }
    
  return (
    isPreviewTable &&
    <>
        <div className='row m-2'>
            < TablaAsignadosCDOSClass 
                // typeOrders = { typeOrders } 
                // asigCDOS = { asigCDOS }
                filteredList = { filteredList }
            />
        </div>
        <button
            title='Guardar en Base de Datos'
            type='button'
            className='btn btn-info mt-2 mb-2 ml-2'
            onClick={onGuardarTipos}
            disabled={ updatedInBD }
        >
            <FontAwesomeIcon  icon={faUpload} />
            <small className='ml-2'>Guardar Cambios</small>
        </button>
    </>
    
  )
}
