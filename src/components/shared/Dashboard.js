import React, { useState, useEffect } from 'react'
import {
    // BrowserRouter as Router,
    // Link,
    useHistory,
    NavLink
} from 'react-router-dom'
import image_gf from '../../assets/images/LogoGF.png'
import {removeVariables} from '../../helpers/removeSessionStorage'
import '../../css/dashboard/dashboard.css'

const Dashboard = () => {
    const history = useHistory()
    const [usuario, setUsuario] = useState("");
    const [isFlotillas, setIsFlotillas] = useState(false)
    let t;

    useEffect(() => {
      readRol()
      resetTimer()
    }, [])

    useEffect(() => {
      setUsuario(window.sessionStorage.getItem('nombre'))
    }, [usuario])

    const resetTimer = () => {
        clearTimeout(t)
        t = setTimeout(cerrarSesion, 1800000)  
    }

    const cerrarSesion = () => {
      removeVariables()
      history.push("/")
    }
    
    const readRol = () => {
      //esta logica se utiliza cuando manejamos los demás acordeones.
        const responsable = window.sessionStorage.getItem('responsable')
          if (responsable === "7") setIsFlotillas(!isFlotillas) 
          if (responsable === "11") setIsFlotillas(!isFlotillas) 
          if (responsable === "12") setIsFlotillas(!isFlotillas) 
          if (responsable === "13") setIsFlotillas(!isFlotillas)
          if (responsable === "14") setIsFlotillas(!isFlotillas)

    }

    const fleetCategory = () => {
      setIsFlotillas(!isFlotillas)
      //when created more category so passed to false them
    }

    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

  return (
    <>
      <nav className="main-header navbar navbar-expand navbar-white navbar-light sidebar-mini">
        
        {/* Left navbar links */}
        <ul className="navbar-nav">
          <li className="nav-item ">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
              <i className="fas fa-bars"/>
            </a>
          </li>
        </ul>

        {/* Right navbar links */}
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <span>{usuario.toUpperCase()}</span>
            <button type="button" class="btn btn-secondary ml-3" onClick={cerrarSesion}>
              Salir
              <i class="fas fa-sign-out-alt ml-2"></i>
            </button>
          </li>
        </ul>

      </nav>
      {/* Barra Lateral - Dashboard */}
      <aside className=" main-sidebar sidebar-light-primary nav-legacy elevation-4 arreglos">

      {/* Brand Logo */}
      <div className="brand-link">
        <div className="text-center">
          <img className='profile-user-img img-fluid img-circle' src={image_gf} alt="User profile picture" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar ml-1">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className={isFlotillas ? "menu-open nav-item color-fuente" : "nav-item color-fuente"}>
              <a 
              className={ isFlotillas ? 'nav-link active pointer' : 'nav-link bg__categorias color-fuente pointer'}
              onClick={fleetCategory}
              >
                <i className="nav-icon fas fa-grip-horizontal" />
                <p>
                  FLOTILLAS
                  <i className="right fas fa-angle-left" />
                </p>
              </a>
              <ul className="nav nav-treeview">

                <li className='nav-item'>
                  <NavLink to='/ordendecompra' className="nav-link color-fuente" activeClassName="bg__categorias_children">
                    <i className="nav-icon fas fa-money-check" />
                    <p className='font-size-15'>Logística</p> {/* Orden de Compra */}
                  </NavLink>
                </li>

                <li className='nav-item'>
                  <NavLink to='/asignacioncontratos' className="nav-link color-fuente" activeClassName="bg__categorias_children">
                    <i className="nav-icon fas fa-list-ul" />
                    <p className='font-size-15'>Asignación Contratos</p>
                  </NavLink>
                </li>
                
                <li className='nav-item'>
                  <NavLink to='/datosdpp' className="nav-link color-fuente" activeClassName="bg__categorias_children">
                    <i className="nav-icon 	fas fa-file-invoice"/>
                    <p className='font-size-15'>Datos DPP</p>
                  </NavLink>
                </li>

                <li className='nav-item'>
                  <NavLink to='/clientes' className="nav-link color-fuente" activeClassName="bg__categorias_children">
                    <i className="nav-icon 	fas fa-user-tie" />
                    <p className='font-size-15'>Clientes</p>
                  </NavLink>
                </li>

              </ul>
            </li>
          </ul>
        </nav>
      </div>

      </aside>
      
    </>
  )
}

export default Dashboard