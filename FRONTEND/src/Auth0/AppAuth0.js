import { useAuth0 } from '@auth0/auth0-react';
import Style from "./App.module.css";
import { Button } from 'antd';

function AppAuth0() {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div className={Style.Container}>
      {!isAuthenticated ? (
        <div className={Style.LoginContainer}>
          {/* Imagen opcional antes de login */}
          <img src="https://ps.w.org/login-customizer/assets/icon-256x256.png?rev=2455454" alt="Imagen" height={200} className={Style.LoginImage} />
          <Button type="primary" className={Style.BotonLogin} onClick={() => loginWithRedirect()}>
            Log In
          </Button>
        </div>
      ) : (
        <Button type="primary" danger className={Style.BotonLogout} onClick={() => logout()}>
          Log Out
        </Button>
      )}

      {isAuthenticated && (
        <div className={Style.UserInfo}>
          <img src={user.picture} alt={user.name} className={Style.UserImage} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}

export default AppAuth0;
