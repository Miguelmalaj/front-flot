import axios from "axios";
import { ApiUrl } from "../ApiRest"



export const SumarDiasAFecha = async ( dias, fechaDeEntrega ) => {
    const url = ApiUrl + "api/dpp_contado/fechaDePago";

    let fecha;

    await axios.post( url, { dias, fechaDeEntrega } )
        .then(resp => {
            fecha = resp;
        })
        .catch(err => {
            fecha = "1900-01-01"
        });


    return fecha;
}
