import React, { useState, useEffect } from 'react';
import api from '../api/api';
import axios from 'axios';
import Swal from 'sweetalert2';
import { maskCPF, maskCEP, maskPhoneBR } from '../utils/masks';
import { useNavigate } from 'react-router-dom';

import {
  isValidName,
  isValidEmail,
  isValidCPF,
  isValidCEP,
  isValidUF,
  isValidPhone,
} from '../utils/validators';
import { useAuth } from '../context/useAuth';

const tiposTelefone = [
  { value: 1, label: 'Residencial' },
  { value: 2, label: 'Celular' },
];

export default function ClienteForm({ onSaved }) {
  const { has } = useAuth();
const navigate = useNavigate();

  const [cliente, setCliente] = useState({
    id: null,
    nome: '',
    cpf: '',
    cep: '',
    logradouro: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    emails: [{email:''}],
    telefones: [{ numero: '', tipo: 2 }],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const canWrite = has('INSERT') || has('UPDATE') || has('DELETE');

  
  useEffect(() => {
    const editData = localStorage.getItem('cliente_edit');
    if (editData) {
      const c = JSON.parse(editData);
      setCliente({
        id:c.id || null,
        nome: c.nome || '',
        cpf: c.cpf || '',
        cep: c.cep || '',
        logradouro: c.logradouro || '',
        complemento: c.complemento || '',
        bairro: c.bairro || '',
        cidade: c.cidade || '',
        uf: c.uf || '',
        emails: c.emails?.map((e) => ({
          email: e.email
        })) || [{email:''}],
        telefones:
          c.telefones?.map((t) => ({
            numero: t.telefone || t.numero || '',
            tipo: t.tipo || 2,
          })) || [{ numero: '', tipo: 2 }],
      });
      localStorage.removeItem('cliente_edit');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (i, field, value) => {
    const arr = [...cliente.emails];
   arr[i] = { ...arr[i], [field]: value };
    setCliente({ ...cliente, emails: arr });

  };

  const addEmail = () =>
    setCliente({ ...cliente, 
      emails: [...cliente.emails, {email: ''}],
    
    });

  const handleTelChange = (i, field, value) => {
    const arr = [...cliente.telefones];
    arr[i] = { ...arr[i], [field]: value };
    setCliente({ ...cliente, telefones: arr });
  };

  const addTel = () =>
    setCliente({
      ...cliente,
      telefones: [...cliente.telefones, { numero: '', tipo: 2 }],
    });

  const buscarCEP = async () => {
    const clean = cliente.cep.replace(/\D/g, '');
    if (clean.length === 8) {
      try {
        const { data } = await axios.get(
          `https://viacep.com.br/ws/${clean}/json/`
        );
        if (!data.erro) {
          setCliente((c) => ({
            ...c,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: (data.uf || '').toUpperCase(),
          }));
        }
      } catch {
        Swal.fire('Erro', 'Não foi possível buscar o CEP.', 'error');
      }
    }
  };

  const validate = () => {
    const e = {};
    if (!isValidName(cliente.nome))
      e.nome =
        'Nome mínimo 3 caracteres; apenas letras, números e espaços.';
    if (!isValidCPF(cliente.cpf)) e.cpf = 'CPF inválido (11 dígitos).';
    if (!isValidCEP(cliente.cep)) e.cep = 'CEP deve ter 8 dígitos.';
    if (!cliente.logradouro) e.logradouro = 'Obrigatório.';
    if (!cliente.bairro) e.bairro = 'Obrigatório.';
    if (!cliente.cidade) e.cidade = 'Obrigatório.';
    if (!isValidUF(cliente.uf)) e.uf = 'UF deve ter 2 letras.';

    const ems = cliente.emails.filter((t) => t.email);
    if (ems.length < 1) e.emails = 'Informe ao menos 1 e-mail.';
    if (ems.some((em) => !isValidEmail(em.email)))
      e.emails = 'Há e-mail inválido.';

    const tels = cliente.telefones.filter((t) => t.numero);
    if (tels.length < 1) e.telefones = 'Informe ao menos 1 telefone.';
    if (tels.some((t) => !isValidPhone(t.numero)))
      e.telefones = 'Telefone inválido (10-11 dígitos).';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      Swal.fire('Atenção', 'Corrija os campos destacados.', 'warning');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id:cliente.id,
      nome: cliente.nome.trim(),
      cpf: cliente.cpf.replace(/\D/g, ''),
      cep: cliente.cep.replace(/\D/g, ''),
      logradouro: cliente.logradouro,
      complemento: cliente.complemento || null,
      bairro: cliente.bairro,
      cidade: cliente.cidade,
      uf: cliente.uf.toUpperCase(),
      emails: cliente.emails.filter((t) => t.email)
        .map((t) => ({
          email: t.email
        })),
      telefones: cliente.telefones
        .filter((t) => t.numero)
        .map((t) => ({
          numero: t.numero.replace(/\D/g, ''),
          tipo: Number(t.tipo),
        })),
    };

    setLoading(true);
try {
  Swal.fire({
    title: 'Salvando...',
    text: 'Aguarde enquanto o cliente é salvo.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  await api.post('/clientes/inserir', payload);

  Swal.close();
  await Swal.fire('Sucesso!', 'Cliente salvo com sucesso.', 'success');

  
  setTimeout(() => navigate('/clientes'), 1000);

} catch (err) {
  console.error(err);
  Swal.close(); 
  
  Swal.fire('Erro', 'Não foi possível salvar o cliente: ' + err.response.data, 'error');
} finally {
  setLoading(false);
}
}

  return (
    <div className="card">
      <h3>Cadastro de Cliente</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loader"></div>
          <p>Salvando cliente...</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="grid">
            <div>
              <label>Nome*</label>
              <input
                name="nome"
                value={cliente.nome}
                onChange={handleChange}
                disabled={!canWrite}
              />
              {errors.nome && <small className="error">{errors.nome}</small>}
            </div>

            <div>
              <label>CPF*</label>
              <input
                name="cpf"
                value={maskCPF(cliente.cpf)}
                onChange={(e) =>
                  setCliente({ ...cliente, cpf: e.target.value })
                }
                disabled={!canWrite}
              />
              {errors.cpf && <small className="error">{errors.cpf}</small>}
            </div>

            <div>
              <label>CEP*</label>
              <input
                name="cep"
                value={maskCEP(cliente.cep)}
                onChange={(e) =>
                  setCliente({ ...cliente, cep: e.target.value })
                }
                onBlur={buscarCEP}
                disabled={!canWrite}
              />
              {errors.cep && <small className="error">{errors.cep}</small>}
            </div>

            <div>
              <label>Logradouro*</label>
              <input
                name="logradouro"
                value={cliente.logradouro}
                onChange={handleChange}
                disabled={!canWrite}
              />
              {errors.logradouro && (
                <small className="error">{errors.logradouro}</small>
              )}
            </div>

            <div>
              <label>Complemento</label>
              <input
                name="complemento"
                value={cliente.complemento}
                onChange={handleChange}
                disabled={!canWrite}
              />
            </div>

            <div>
              <label>Bairro*</label>
              <input
                name="bairro"
                value={cliente.bairro}
                onChange={handleChange}
                disabled={!canWrite}
              />
              {errors.bairro && <small className="error">{errors.bairro}</small>}
            </div>

            <div>
              <label>Cidade*</label>
              <input
                name="cidade"
                value={cliente.cidade}
                onChange={handleChange}
                disabled={!canWrite}
              />
              {errors.cidade && <small className="error">{errors.cidade}</small>}
            </div>

            <div>
              <label>UF*</label>
              <input
                name="uf"
                value={cliente.uf}
                onChange={(e) =>
                  setCliente({ ...cliente, uf: e.target.value.toUpperCase() })
                }
                maxLength={2}
                disabled={!canWrite}
              />
              {errors.uf && <small className="error">{errors.uf}</small>}
            </div>
          </div>

          <h4>E-mails*</h4>
          {cliente.emails.map((em, i) => (
            <div key={i} className="row">
              <input
                type="email"
                value={em.email}
                onChange={(e) => handleEmailChange(i,'email' , e.target.value)}
                disabled={!canWrite}
                placeholder="email@dominio.com"
              />
            </div>
          ))}
          {errors.emails && <small className="error">{errors.emails}</small>}
          {canWrite && (
            <button type="button" onClick={addEmail}>
              + Adicionar e-mail
            </button>
          )}

          <h4>Telefones*</h4>
          {cliente.telefones.map((t, i) => (
            <div key={i} className="row">
              <select
                value={t.tipo}
                onChange={(e) => handleTelChange(i, 'tipo', e.target.value)}
                disabled={!canWrite}
              >
                {tiposTelefone.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                value={maskPhoneBR(t.numero)}
                onChange={(e) => handleTelChange(i, 'numero', e.target.value)}
                disabled={!canWrite}
                placeholder="(11) 98888-7777"
              />
            </div>
          ))}
          {errors.telefones && (
            <small className="error">{errors.telefones}</small>
          )}

          {canWrite && (
            <>
              <button type="button" onClick={addTel}>
                + Adicionar telefone
              </button>
              <br />
              <br />
              <button type="submit" className="primary">
                Salvar
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
