import React from 'react';
import Style from "./App.css";
import { Routes, Route } from "react-router-dom";
import LeftMenu from "./Components/LeftMenu";
import { useAuth0 } from '@auth0/auth0-react';
import Main from "./Components/Main";

function App() {
    const { isAuthenticated } = useAuth0(); // Obtener estado de autenticación

    return (
        <div className={Style.App}>
            {isAuthenticated && <LeftMenu />} {/* Renderiza el menú lateral solo si está autenticado */}
            <Routes>
                <Route path="/" element={<Main />} /> {/* Ruta base para Main */}
                {/* No necesitas definir las rutas aquí, se manejarán en LeftMenu */}
            </Routes>
        </div>
    );
}

export default App;
