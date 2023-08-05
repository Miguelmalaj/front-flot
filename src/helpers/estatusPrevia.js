
export const pipesStatusPrevia = ( statusPrevia ) => {
    /* nota: No aplica = Patio, OK = Distribuidor */
    if ( statusPrevia === 'NO APLICA' )  return 'PATIO'
    if ( statusPrevia === 'OK' )  return 'DISTRIBUIDOR'
}