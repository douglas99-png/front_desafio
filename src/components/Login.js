import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/useAuth';
import "../styles.css";


export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


 const submit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await api.post("/auth/login", {
      login: form.username,
      senha: form.password,
    });

    const data = response.data;

    if (data?.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.user);
      localStorage.setItem("authorities", data.authorities);


      login({
        token: data.token,
        user: data.user,
        authorities: data.authorities
      });
    } else {
      throw new Error("Resposta inválida do servidor");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    setError("Usuário ou senha inválidos.");
  }
};


  return (
    <div className="card">
      <h2>Autenticação</h2>

      <form onSubmit={submit}>
        <label>Usuário</label>
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          required
        />

        <label>Senha</label>
        <input
          name="password"
          value={form.password}
          onChange={onChange}
          type="password"
          required
        />

        <button type="submit">Entrar</button>
      </form>

      {error && <p className="error">{error}</p>}


    </div>
  );
}
