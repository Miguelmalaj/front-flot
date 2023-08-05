import React from 'react'
import image_gf from '../../assets/images/LogoGF.png'
const ErrorPage = () => {
    return (
        <div className='content-wrapper '>
            <div className='container d-flex h-100 justify-content-center align-items-center'>
                <div className=' card p-2'>
                    <div className="brand-link" >
                        <div className="text-center">
                            <img className='profile-user-img img-fluid img-circle' src={image_gf} alt="User profile picture" />
                        </div>
                    </div>
                    
                    <center><p>Lo sentimos, no cuenta con permisos de acceso. Favor de consultar con el administrador.</p></center>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage