import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ClienteForm from './components/ClienteForm';
import ClienteList from './components/ClienteList';
import { useAuth } from './context/useAuth';
import "./styles.css";

function Home() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#0a6fb1',
      }}
    >
      Bem-vindo 👋
    </div>
  );
}

function Layout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        marginTop: '20%',
        fontSize: '1.2rem',
        color: '#0a6fb1'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Desafio Backend - Front React</h1>
        <div className="spacer" />

        {user && (
          <div className="userbox">
            <small>
              Usuário: <b>{user.user}</b>
            </small>
            <button onClick={logout}>Sair</button>
          </div>
        )}
      </header>

      <nav>
        {!user && <a href="/">Login</a>}

        {user && (
          <>
            <a href="/inicio">Início</a>
            <a href="/clientes">Clientes</a>
            {/* <a href="/cliente/novo">Novo Cliente</a> */}
          </>
        )}
      </nav>

      <main>
        <Routes>
          {!user && <Route path="*" element={<Login />} />}
          {user && (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/inicio" element={<Home />} />
              <Route path="/clientes" element={<ClienteList />} />
              <Route
                path="/cliente/novo"
                element={<ClienteForm onSaved={() => {}} />}
              />
            </>
          )}
        </Routes>
      </main>

  
    </div>
  );
}

export default function App() {
  return <Layout />;
}
