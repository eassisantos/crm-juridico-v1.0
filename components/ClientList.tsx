
import React, { useState, useMemo } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { PlusCircle, Edit, Trash2, Briefcase } from 'lucide-react';
import ClientFormModal from './ClientFormModal';
import { Client } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

const ClientList: React.FC = () => {
  const { clients, cases, addClient, updateClient, deleteClient } = useCrmData();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const clientCaseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach(c => {
        if (c.status !== 'Finalizado' && c.status !== 'Concedido') {
            counts[c.clientId] = (counts[c.clientId] || 0) + 1;
        }
    });
    return counts;
  }, [cases]);

  const handleOpenModalForAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt'> | Client) => {
    if ('id' in clientData) {
      updateClient(clientData);
      addToast('Cliente atualizado com sucesso!', 'success');
    } else {
      addClient(clientData);
      addToast('Cliente adicionado com sucesso!', 'success');
    }
    handleCloseModal();
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Tem certeza que deseja excluir ${client.name}? A ação também removerá todos os casos e dados financeiros associados.`)) {
        deleteClient(client.id);
        addToast('Cliente excluído com sucesso.', 'info');
    }
  };

  return (
    <>
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        initialData={editingClient}
      />
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
            <p className="text-slate-600 mt-1">Gerencie sua carteira de clientes.</p>
          </div>
          <button
            onClick={handleOpenModalForAdd}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Novo Cliente
          </button>
        </header>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-200">
                <tr>
                  <th className="p-3 text-sm font-semibold text-slate-600">Nome</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 hidden md:table-cell">CPF</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 hidden lg:table-cell">Email</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Telefone</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center">
                            <span>{client.name}</span>
                            {clientCaseCounts[client.id] > 0 && (
                                <Link to={`/cases?clientId=${client.id}`} className="ml-2 flex items-center text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors">
                                    <Briefcase size={12} className="mr-1" />
                                    {clientCaseCounts[client.id]}
                                </Link>
                            )}
                        </div>
                    </td>
                    <td className="p-3 text-slate-700 hidden md:table-cell">{client.cpf}</td>
                    <td className="p-3 text-slate-700 hidden lg:table-cell">{client.email}</td>
                    <td className="p-3 text-slate-700">{client.phone}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button onClick={() => handleOpenModalForEdit(client)} className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteClient(client)} className="p-2 text-slate-500 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhum cliente encontrado.</p>
              <button onClick={handleOpenModalForAdd} className="mt-4 text-blue-600 hover:underline">
                Adicionar seu primeiro cliente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientList;
