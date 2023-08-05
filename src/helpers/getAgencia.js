export const getAgencia = () => {
    const empresa = window.sessionStorage.getItem("empresa")
    const sucursal = window.sessionStorage.getItem("sucursal")
    return { Empresa: empresa, Sucursal: sucursal }
}