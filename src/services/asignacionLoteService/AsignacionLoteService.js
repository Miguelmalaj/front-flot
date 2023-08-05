import axios from 'axios'

export const axiosPostService = async (url, body) => {
    let data;
    await axios.post(url, body)
    .then(response => {
        data = response['data'];
    })
    .catch(err => {
        data = []
    })
    return data;
}

export const axiosGetService = async (url) => {
    let data;
    await axios.get(url)
    .then(response => {
        data = response['data'];
    })
    .catch(err => {
        data = []
    })
    return data;
}

export const axiosPatchService = async (url, body) => {
    let data;
    await axios.patch(url, body)
    .then(response => {
        data = response['data'];
    })
    .catch(err => {
        data = []
    })
    return data;
}

export const axiosDeleteServide = async ( url, body ) => {
    let data;
    await axios.delete( url, { data: body } )
        .then( response => {
            data = response['data'];
        })
        .catch( err => {
            data = []
        })
    return data;
}