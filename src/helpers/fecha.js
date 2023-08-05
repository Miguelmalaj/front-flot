export const FechaFormatoHoy = () => {
    const Fecha = new Date();
    const Months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];       

    const Mes = Fecha.getMonth();
    const Dia = Fecha.getDate();
    const Anio = Fecha.getFullYear();      
    return `${Dia.toString().length > 1? Dia: '0' + Dia}` + ` de ${Months[Mes]} de ${Anio}`;
}

export const FechaDeHoyYYMMDD =() => {
    let Fecha = new Date();
    let Mes = Fecha.getMonth() + 1;
    let Dia = Fecha.getDate();
    let Anio = Fecha.getFullYear();      
    return `${Anio}-` + `${Mes.toString().length > 1? Mes: '0' + Mes}-${Dia.toString().length > 1? Dia: '0' + Dia}`;
}

export const invertirCadenaFecha = ( fecha ) => {
    let dia = fecha.slice(0,4)
    let mes = fecha.slice(5,7)
    let anio = fecha.slice(8,10)
    let ordenarFecha = [anio, mes, dia]
    let fechaFinal = ordenarFecha.join('-');
    return fechaFinal;
}

export const invertirCadenaFechaDiagonal = ( fecha ) => {
    let dia = fecha.slice(0,4)
    let mes = fecha.slice(5,7)
    let anio = fecha.slice(8,10)
    let ordenarFecha = [anio, mes, dia]
    let fechaFinal = ordenarFecha.join('/');
    return fechaFinal;
}

export const validarFecha = (fecha) => {
    return fecha !== null
    ? invertirCadenaFecha(fecha.substring(0, 10)) 
    : ""
}

export const validarFechaExcel = (fecha) => {
    return fecha !== null
    ? invertirCadenaFechaDiagonal(fecha.substring(0, 10)) 
    : ""
}

export const invertirCadenaFechaDiagonalDPP = ( fecha ) => {

    const Months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ];

    let dia = fecha.slice(0,4)
    let mes = fecha.slice(5,7)

    let nombreMes = mes.toString().substring(0,1) == 0 ? Months[Number(mes.toString().substring(1,2)) - 1] : Months[Number(mes) - 1];   


    let anio = fecha.slice(8,10)
    let ordenarFecha = [anio, nombreMes, dia]
    let fechaFinal = ordenarFecha.join('/');
    return fechaFinal;
}

export const validarFechaExcelDPP = (fecha) => {
    return fecha !== null
    ? invertirCadenaFechaDiagonalDPP(fecha.substring(0, 10)) 
    : ""
}

export const isDefaultDate = ( fecha ) => {
    if ( fecha === null ) return fecha;
    if ( fecha === undefined ) return null;
    if ( fecha.substring(0, 10) === "1900-01-01" ) return null;
    return fecha;
}

export const reduceString = ( fecha ) => {
    if ( fecha.substring(0, 10) === "1900-01-01" ) return fecha.substring(0, 10);
    return fecha;

}

export const dateAndHour = ( dateFormat ) => {
    const [ date, hour ] = dateFormat.split("T");
    const [ hms ] = hour.split(".");
    return `${invertirCadenaFecha(date)} ${militaryTime(hms)}`
}

export const militaryTime = ( time ) => {
time = time.split(':');

let hours = Number(time[0]);
let minutes = Number(time[1]);
let seconds = Number(time[2]);

let timeValue;

if (hours > 0 && hours <= 12) {
  timeValue= "" + hours;
} else if (hours > 12) {
  timeValue= "" + (hours - 12);
} else if (hours == 0) {
  timeValue= "12";
}
 
timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  
timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds; 
timeValue += (hours >= 12)  ? " P.M." : " A.M."; 

return timeValue;
}

