import React, { useEffect, useState } from 'react';
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import { useAuth0 } from '@auth0/auth0-react';
import CrearInforme from './CrearInforme';
import TablaAlumnos from './TablaAlumnos';
import CrearAlumno from './CrearAlumno';
import TablaInformes from './TablaInformes';

const { Header, Sider, Content } = Layout;

const LeftMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { user, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const tokenClaims = await getIdTokenClaims();
      setToken(tokenClaims?.__raw || "");
      //console.log("Token:", tokenClaims?.__raw);
      const token = tokenClaims?.__raw;

      return token;
    };
    fetchToken();
  }, [getIdTokenClaims]);


  console.log("Tokenfinal:", token);

  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
        >
          <Menu.Item
            icon={<img src="https://cdn-icons-png.flaticon.com/512/7377/7377110.png" alt="JustWrite" style={{ height: '100px' }} />}
          >
            JUSTWrite
          </Menu.Item>
          <Menu.Item key="1" icon={<HomeOutlined />}><Link to="/home">Home</Link></Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}><Link to="/agregarinforme">Agregar Informe</Link></Menu.Item>
          <Menu.Item key="3" icon={<ToolOutlined />}><Link to="/agregaralumno">Agregar Alumno</Link></Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}><Link to="/verinformes">Ver Informes</Link></Menu.Item>
          <Menu.Item key="5" icon={<ToolOutlined />}><Link to="/veralumnos">Ver Alumnos</Link></Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div className="Container" style={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated && (
                <div className="UserInfo" style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={user.picture} alt={user.name} style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }} />
                  <span>{user.name}</span>
                  <Button
                    type="primary"
                    onClick={() => logout({ returnTo: window.location.origin })}
                    style={{ marginLeft: '10px' }}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            marginTop: '20px',
          }}
        >
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/agregaralumno" element={<CrearAlumno />} />
            <Route path="/agregarinforme" element={<CrearInforme />} />
            <Route path="/veralumnos" element={<TablaAlumnos />} />
            <Route path="/verinformes" element={<TablaInformes />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LeftMenu;
