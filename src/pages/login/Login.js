import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';

import { ApiUrl } from "../../services/ApiRest"
import image_gf from "../../assets/images/LogoGF.png"
import '../../css/login/login.css'

const Login = () => {
    const [usuario, setUsuario] = useState({
        Nombre   : "",
        Clave    : "",
        Empresa  : "5",
        Sucursal : "1"
      })
    const [showPass, setShowPass] = useState(false)
    let url = "";
    const history = useHistory()

    const onChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value.toLowerCase()
          })
    }

    const keyEventPressed = (e) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }
    
    const muestraContra = () => {
        setShowPass(!showPass)
    }
    
    const handleLogin = () => {
        if (usuario.Nombre === "") {
            toast.info("Debe ingresar un nombre de usuario");
            return
        }
        
        if (usuario.Clave === "") {
            toast.info("Debe ingresar una contraseña");
            return
        }
        iniciarSesionUsuariosDMS()
    }

    const iniciarSesion = async() => {
        url = ApiUrl + "api/login"
        await axios.post( url, usuario )
        .then( response => {
            const data = response['data'];
            if (!data.isUserFound) {
                toast.info('Usuario o contraseña incorrecta')
                return;  
            }

            asignarVariablesDeSesion(data)
            redireccionar(data)
            
        })
        .catch(err => {
            toast.error('Usuario o contraseña incorrecta')
        })

    }

    const iniciarSesionUsuariosDMS = async() => {
        url = ApiUrl + "api/login/usersDMS"
        await axios.post( url, usuario)
            .then( response => {
                if ( !response['data'].isUserFound ) {
                    toast.info('Usuario o contraseña incorrecta')
                    return;
                }

                window.sessionStorage.setItem('nombre',  response['data'].Nombre);
                window.sessionStorage.setItem('usuario', response['data'].Usuario.toUpperCase());
                iniciarSesion()
            })
            .catch(err => {
                toast.error('Usuario o contraseña incorrecta')
            })
    }

    const asignarVariablesDeSesion = (data) => {
        window.sessionStorage.setItem('empresa', data.Empresa)
        window.sessionStorage.setItem('sucursal', data.Sucursal)
        window.sessionStorage.setItem('asig_contratos', data.Asig_Contratos)
        window.sessionStorage.setItem('clientes_flotillas', data.Clientes_Flotillas)
        window.sessionStorage.setItem('orden_de_compra', data.OrdenDeCompra_F)
        window.sessionStorage.setItem('datos_dpp', data.DatosDPP)
        window.sessionStorage.setItem('responsable', data.Responsable)
    }

    const redireccionar = (data) => {
        const responsable = data.Responsable
        if ( responsable === 12 ) { 
            history.push("/datosdpp")
            return;
        }
        if ( responsable === 14 || responsable === 13 ) { 
            history.push("/ordendecompra")
            return;
        }
        if ( responsable === 7 || responsable === 11 ){ 
            history.push("/asignacioncontratos")
            return;
        }

        toast.info("No cuentas con permisos de acceso")
    }

  return (
    <div className="hold-transition login-page">
        <div className='login-box'>
            <div className='card card-outline card-primary'>
                <div className='card-header text-center'>
                    <div className='text-center'>
                        <img  
                            alt="logo flotillas" 
                            className='profile-user-img img-fluid img-circle image-width'
                            src={image_gf} 
                        />
                    </div>
                </div>
                <div className='card-body'>
                    <h5 className="login-box-msg mb-3">INICIAR SESIÓN</h5>
                    <form>
                    <div className="form-group mb-3">
                        <label className="input-group-text font-weight-normal ">Agencia</label>
                        <select name='Agencia' className='form-select select-width' disabled={true}>
                        {/* <select name='agencia' className='form-select' onChange={onChange}> */}
                            <option value={0}>Seleccionar Agencia</option>
                            <option value={1}>MOCHIS</option>
                            <option value={2}>GUASAVE</option>
                            <option value={3}>CULIACÁN ZAPATA</option>
                            <option value={4}>CULIACÁN AEROPUERTO</option>
                            <option value={4} selected={true}>CULIACÁN FLOTILLAS</option>
                            <option value={5}>CADILLAC</option>
                        </select>
                    </div>

                    <label className="input-group-text font-weight-normal ">Usuario</label>
                    <div className="input-group mb-3">
                        <input 
                            type="email" 
                            className="form-control" 
                            onChange={onChange} 
                            onKeyPress={(e) => keyEventPressed(e)} 
                            placeholder="Nombre de usuario" 
                            name="Nombre" 
                            aria-label="correo electronico" 
                            aria-describedby="basic-addon2" 
                            required 
                            autoComplete='off' 
                        />
                        <div className="input-group-append">
                            <div className="input-group-text">
                                <span className="fas fa-user"></span>
                            </div>
                        </div>
                    </div>

                    <div className="input-group mb-3">
                        <input 
                            type={showPass ? "text" : "password"} 
                            className="form-control" 
                            onChange={onChange} 
                            onKeyPress={(e) => keyEventPressed(e)} 
                            placeholder="Contraseña" 
                            name="Clave" 
                            aria-label="correo electronico" 
                            aria-describedby="basic-addon2" 
                            required 
                        />
                        <div className="input-group-append">
                            <div className="input-group-text">
                                <span className="fas fa-lock"></span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <center>
                            <input className="form-check-input" type="checkbox" value="" id="mostrarContrasena" onClick={muestraContra} />
                            <label className="form-check-label" htmlFor="mostrarContrasena">
                                Mostrar contraseña
                            </label>
                        </center>
                    </div>

                    <div className="mb-0 text-center">
                        <button type="button" onClick={handleLogin} className="btn btn-primary" id="btnSesion">INICIAR</button>
                    </div>

                    </form>
                </div>
            </div>
        </div>
        <ToastContainer />
    </div>
  )
}

export default Login
