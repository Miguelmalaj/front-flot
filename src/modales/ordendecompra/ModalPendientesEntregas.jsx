import { useEffect, useState } from "react";

import { ApiUrl } from "../../services/ApiRest";
import { axiosPostService } from "../../services/asignacionLoteService/AsignacionLoteService";

let todos = { Cantidad: 0, Cliente: 0, NombreCliente: 'TODOS', OrdenDeCompra:'TODAS', Ubicacion:'' };

export const ModalPendientesEntregas = ({
    pendienteEntrega,
    orderSelected
}) => {

    let url = '';

    const [clientsSummary, setClientsSummary] = useState([]);
    
    useEffect(() => {

      getPendingDocumentos();

    }, [ pendienteEntrega ]);

    const getPendingDocumentos = async () => {

        url = `${ ApiUrl }api/ordencompra/pending_documents_summary`;

        let summary = await axiosPostService( url, { PendienteEntrega: pendienteEntrega } );

        if ( summary.length > 0 ) {

            const sumaTotalVINS = summary.reduce( ( cont, obj ) => { return cont + obj.Cantidad }, 0 );

            todos = { ...todos, Cantidad: sumaTotalVINS };
            
            summary = [ todos ,...summary];

        }

        setClientsSummary( summary );

    }
    
    const displayOrderInfo = ( client ) => {
        
        client = { ...client, pendienteEntrega };

        orderSelected( client );
        
    }

    return (
        <div className='bg-white-modal'>

            <div className="row animate__animated animate__fadeIn" style={{marginTop:'4rem', display:'block', height:'500px', overflowY: 'scroll'}}>
                <table className="table table-sm table-bordered table-striped compact">
                    <thead style={{ position: 'sticky', top:'0', backgroundColor:'#1565C0', color:'white'}}>
                        <tr className="text-center">
                            <th colSpan="3">{`${ pendienteEntrega } Pendientes de Entrega`}</th>
                        </tr>
                        <tr className="text-center">
                            <th><small>Cliente</small></th>
                            <th><small>OC</small></th>
                            <th><small>Cantidad</small></th>
                        </tr>
                    </thead>
                    <tbody style={{backgroundColor:'#FFFFE0'}}>

                        {

                            clientsSummary.map( client => (
                                <tr className="text-center">
                                    <td style={{ width:'40%', paddingLeft:'10px', textAlign:'left' }}>{ client.NombreCliente }</td>
                                    <td 
                                        style={{ width:'35%' }} 
                                        className="cursor-above"
                                        onClick={ () => displayOrderInfo(client)}
                                    >
                                        { client.OrdenDeCompra }
                                    </td>
                                    <td style={{ width:'25%' }}>{ client.Cantidad }</td>
                                </tr>
                                
                            ))

                        }
                        
                    </tbody>
                </table>
            </div>

        </div>
    )

}
