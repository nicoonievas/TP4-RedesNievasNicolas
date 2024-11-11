import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import AppAuth0 from '../Auth0/AppAuth0';

import Home from './Home';

function Main() {
    const { isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("isAuthenticated:", isAuthenticated);
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div>
            {!isAuthenticated ? (
                <AppAuth0 />
            ) : (
                <Routes>
                    <Route path="/home" element={<Home />} />

                </Routes>
            )}
        </div>
    );
}

export default Main;
