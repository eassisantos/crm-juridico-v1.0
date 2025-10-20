
import React, { useState, useMemo } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { PlusCircle, Edit, Trash2, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import CaseFormModal from './CaseFormModal';
import { Case } from '../types';
import { useToast } from '../contexts/ToastContext';

const CaseList: React.FC = () => {
  const { cases, getClientById, addCase, updateCase, deleteCase } = useCrmData();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  const clientIdFilter = searchParams.get('clientId');
  const filteredCases = useMemo(() => {
    if (!clientIdFilter) return cases;
    return cases.filter(c => c.clientId === clientIdFilter);
  }, [cases, clientIdFilter]);

  const clientFilterName = useMemo(() => {
    if (!clientIdFilter) return null;
    return getClientById(clientIdFilter)?.name;
  }, [clientIdFilter, getClientById]);

  const handleOpenModalForAdd = () => {
    setEditingCase(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (caseData: Case) => {
    setEditingCase(caseData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
  };

  const handleSaveCase = (caseData: Omit<Case, 'id' | 'lastUpdate' | 'documents' | 'tasks' | 'legalDocuments'> | Case) => {
    if ('id' in caseData) {
      updateCase(caseData);
      addToast('Caso atualizado com sucesso!', 'success');
    } else {
      addCase(caseData);
      addToast('Novo caso adicionado com sucesso!', 'success');
    }
    handleCloseModal();
  };

  const handleDeleteCase = (caseData: Case) => {
    if (confirm(`Tem certeza que deseja excluir o caso ${caseData.caseNumber}?`)) {
        deleteCase(caseData.id);
        addToast('Caso excluído com sucesso.', 'info');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concedido': return 'bg-green-100 text-green-800';
      case 'Negado': return 'bg-red-100 text-red-800';
      case 'Em Exigência': return 'bg-yellow-100 text-yellow-800';
      case 'Fase Recursal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
      <CaseFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveCase} initialData={editingCase} />
      <div className="space-y-6 h-full flex flex-col">
        <header className="flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Casos</h1>
            <p className="text-slate-600 mt-1">Gerencie todos os processos do escritório.</p>
          </div>
          <button onClick={handleOpenModalForAdd} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} className="mr-2" />
            Novo Caso
          </button>
        </header>

        {clientFilterName && (
            <div className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-md">
                <span>Filtrando casos para: <strong>{clientFilterName}</strong></span>
                <button onClick={() => setSearchParams({})} className="ml-auto p-1 rounded-full hover:bg-blue-200"><XCircle size={18} /></button>
            </div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-200">
                <tr>
                  <th className="p-3 text-sm font-semibold text-slate-600">Nº do Caso</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Cliente</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 hidden md:table-cell">Benefício</th>
                  <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => {
                  const client = getClientById(c.clientId);
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3"><Link to={`/cases/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.caseNumber}</Link></td>
                      <td className="p-3 text-slate-800">{client?.name || 'Cliente não encontrado'}</td>
                      <td className="p-3 text-slate-700 hidden md:table-cell">{c.benefitType}</td>
                      <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>{c.status}</span></td>
                      <td className="p-3 text-right"><div className="flex justify-end items-center space-x-2"><button onClick={() => handleOpenModalForEdit(c)} className="p-2 text-slate-500 hover:text-blue-600 transition-colors"><Edit size={18} /></button><button onClick={() => handleDeleteCase(c)} className="p-2 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={18} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredCases.length === 0 && (<div className="text-center py-12"><p className="text-slate-500">Nenhum caso encontrado.</p><button onClick={handleOpenModalForAdd} className="mt-4 text-blue-600 hover:underline">Adicionar um caso</button></div>)}
        </div>
      </div>
    </>
  );
};

export default CaseList;
