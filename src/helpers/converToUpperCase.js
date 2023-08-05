
export const upperCase = ( string ) => {
    return string !== null 
    ? string !== undefined ? string.toUpperCase() : string
    : string;
}