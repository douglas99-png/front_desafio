import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import api from '../api/api';
import { maskCPF, maskPhoneBR } from '../utils/masks';
import { useAuth } from "../context/AuthContext";

export default function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { has } = useAuth();
  const navigate = useNavigate();
debugger;
  const canInsert = has('INSERT');
  const canDelete = has('DELETE');
  const canUpdate = has('UPDATE');
  const canSelect = has('SELECT');

const load = async () => {
  setLoading(true);
  try {
    const { data } = await api.get('/clientes/listar');

    const parsed =
      typeof data === "string"
        ? JSON.parse(data)
        : data;

    const lista = Array.isArray(parsed)
      ? parsed
      : parsed
      ? Object.values(parsed)
      : [];

    setClientes(lista);

  } catch (err) {
    setClientes([]); // evita quebra
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!canDelete) return;

    const result = await Swal.fire({
      title: 'Excluir cliente?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await api.delete(`/clientes/${id}`);
        await Swal.fire('Excluído!', 'O cliente foi removido com sucesso.', 'success');
      } catch {
        
      }
      await load();
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div>
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Clientes</h3>
        <div>
        
          {canInsert && (
            <button className="primary"  onClick={() => navigate('/cliente/novo')}>
              + Novo Cliente
            </button>
          )}
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <div>Nome</div>
          <div>CPF</div>
          <div>Cidade/UF</div>
          <div style={{ textAlign: 'right' }}>Ações</div>
        </div>

        {clientes.map((c) => (
          <div key={c.idCliente || c.id} className="trow">
            <div>{c.nome}</div>
            <div>{maskCPF(c.cpf)}</div>
            <div>{c.cidade}/{c.uf}</div>
            <div style={{ textAlign: 'right' }}>
              {canUpdate ? (
                <button
                  onClick={() => {
                    localStorage.setItem('cliente_edit', JSON.stringify(c));
                    navigate('/cliente/novo');
                  }}
                >
                  Editar
                </button>
              ) : (
                '-'
              )}{' '}
              {canDelete ? (
                <button className="danger" onClick={() => remove(c.idCliente || c.id)}>
                  Excluir
                </button>
              ) : (
                '-'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
