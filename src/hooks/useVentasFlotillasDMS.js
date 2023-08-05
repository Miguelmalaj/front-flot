import { useState, useEffect } from "react";
import { axiosPostService } from "../services/asignacionLoteService/AsignacionLoteService";
import { ApiUrl } from "../services/ApiRest";

export const useVentasFlotillasDMS = ( agencia ) => {

    const [isUpdated, setIsUpdated] = useState( false );

    const updateTablaVentasFlotillasDMS = async () => {
        //Endpoint located in asignacion_lotes.routes.js
        let url = ApiUrl + "api/updateregistrosoracle"
        const body =  { agencia: agencia }
        const { isUpdated } = await axiosPostService( url,body );
        if ( isUpdated ) setIsUpdated( true );
    } 

    useEffect(() => {
        updateTablaVentasFlotillasDMS();
    }, [])
    

    return {
        isUpdated
    }
}
