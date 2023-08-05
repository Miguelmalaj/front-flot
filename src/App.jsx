import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/shared/Dashboard";
import Footer from "./components/shared/Footer";
import Login from "./pages/login/Login";
import AsignacionContratos from "./pages/asignacionContratos/AsignacionContratos";
import Clientes from "./pages/clientes/Clientes";
import ErrorPage from "./pages/accessDenied/ErrorPage";
import OrdenDeCompra from "./pages/ordenCompraLogistica/OrdenDeCompra";
import DatosDPP from "./pages/DatosDPP/DatosDPP";
import 'datatables.net'
import "datatables.net-dt/css/jquery.dataTables.min.css"
import { AppTheme } from "./theme";

function App() {
  return (
    <div className="wrapper">
      <AppTheme>
        <Router>
          <Switch>
            
            <Route exact path="/">
              <Login />
            </Route>

            <Route exact path="/datosdpp" render={() => {
              
              if (window.sessionStorage.getItem('nombre') === null) return <Redirect to="/" />
              return window.sessionStorage.getItem('datos_dpp') === 'S' ? <><Dashboard/><DatosDPP/><Footer/></> : <><Dashboard/><ErrorPage /><Footer/></>
            }}/>

            <Route exact path="/ordendecompra" render={() => {
              if (window.sessionStorage.getItem('nombre') === null) return <Redirect to="/" />
              return window.sessionStorage.getItem('orden_de_compra') === 'S' ? <><Dashboard/><OrdenDeCompra/><Footer/></> : <><Dashboard/><ErrorPage /><Footer/></>
            }}/>

            <Route exact path="/clientes" render={() => {
              if (window.sessionStorage.getItem('nombre') === null) return <Redirect to="/" />
              return window.sessionStorage.getItem('clientes_flotillas') === 'S' ? <><Dashboard/><Clientes/><Footer/></> : <><Dashboard/><ErrorPage /><Footer/></>
            }}/>
            
            <Route exact path="/asignacioncontratos" render={() => {
              if (window.sessionStorage.getItem('nombre') === null) return <Redirect to="/" />
              return window.sessionStorage.getItem('asig_contratos') === 'S' ? <><Dashboard/><AsignacionContratos/><Footer/></> : <><Dashboard/><ErrorPage /><Footer/></>
            }}/>

            <Route exact path="/*">
              <Redirect to="/"/>
            </Route>
            
            
          </Switch>
        </Router>
      </AppTheme>
    </div>
  );
}

export default App;
