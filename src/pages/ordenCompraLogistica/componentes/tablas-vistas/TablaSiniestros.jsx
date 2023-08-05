
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

import { validarFecha } from "../../../../helpers"
import { axiosPatchService } from "../../../../services/asignacionLoteService/AsignacionLoteService"
import { ApiUrl } from "../../../../services/ApiRest"
import { toast } from "react-toastify"

export const TablaSiniestros = ({
    agencia,
    handleAfterUpdated,
    isPreviewTable,
    sinisterGenerated,
    VINSGeneratedinBD,
}) => {

    let url = '';

    const onGuardarSiniestros = async () => {

        // console.log('sinisterGenerated', sinisterGenerated);

        url = `${ ApiUrl }api/ordencompra/update_estatus_vin_sinister`;

        const { isUpdated } = await axiosPatchService(url, { data: sinisterGenerated });

        if ( isUpdated ) {

            toast.success('Los siniestros han sido actualizados exitosamente.');
            handleAfterUpdated();
            return;
        }

        toast.error("Error con el servidor.");

    }

    return (
        isPreviewTable &&
        <>
            <div className="row table-responsive mb-4">

                <table className='table display compact' style={{ fontSize:11 }}>
                    
                    <thead className='text-center' style={{backgroundColor:'#1565C0', color:'white'}}>
                        <tr>
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
                            sinisterGenerated.length > 0 &&
                            sinisterGenerated.map( sinister => (

                                <tr key={ sinister.Id } className="text-center">
                                    
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

            <button
                className="btn btn-info mt-2 mb-2 ml-2"
                disabled={ sinisterGenerated.length === 0 || VINSGeneratedinBD }
                onClick={ onGuardarSiniestros }
                title="Guardar Siniestros"
                type="button"
            >
                <FontAwesomeIcon icon={faUpload} />
                <small className='ml-2'>Guardar</small>
            </button>
        </>
    )

}
