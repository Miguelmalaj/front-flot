export const isADotValue = ( digito ) => {
    if ( digito.slice(-1) === "." ) return true;
    return false;
}

export const isASpaceValue = ( digito ) => {
    if ( digito.slice(-1) === " " ) return true;
    return false;
}

export const hasPointTheInputValue = (value) => {
    if (value.includes('.')) return true;
    return false;
}

export const isNumber = (digito) => {
    if (isNaN(digito.slice(-1))) return false;
    return true;
}

export const getTotalPoints = (value) => {
    let contar = 0;
    let start = 0;
    while ((start = value.indexOf(".", start) + 1) > 0) {
        contar++;
    }
    return contar;
}