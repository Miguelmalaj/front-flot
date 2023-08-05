export const formatoMoneda = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    let arr = number.toString().split('.');
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join('.') : arr[0];
}

export const removerComas = (number) => {
    let arr = number.toString().split('.');
    arr[0] = arr[0].replace(/\D/g,"");
    return arr[1] ? arr.join('.') : arr[0];
}

export const ValidTwoDecimals = ( number ) => {
    /* let [ thousands, decimals ] = number.toString().split('.');

    if ( decimals.length === 1 ) decimals = `${decimals}0`

    return `${thousands}.${decimals}`; */

    let arr = number.toString().split('.');

    if ( arr[1] === undefined ) return number.toString();

    if ( arr[1].length === 1 ) arr[1] = `${arr[1]}0`

    return `${arr[0]}.${arr[1]}`;

}