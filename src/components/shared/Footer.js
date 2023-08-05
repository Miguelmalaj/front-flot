import React from 'react'
import { FechaFormatoHoy } from '../../helpers/fecha'

const Footer = () => {
  return (
    <footer className="main-footer">
        <strong>Sistema Flotillas. </strong>
        Grupo Félix.
        <div className="float-right d-none d-sm-inline-block">
          <em>{FechaFormatoHoy()}</em>
        </div>
    </footer>
  )
}

export default Footer