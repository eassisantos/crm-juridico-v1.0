
import React, { useState, useEffect } from 'react';
import { Case, BenefitType, CaseStatus } from '../types';
import { useCrmData } from '../hooks/useCrmData';
import { X } from 'lucide-react';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Omit<Case, 'id' | 'lastUpdate' | 'documents' | 'tasks' | 'legalDocuments'> | Case) => void;
  initialData: Case | null;
}

const CaseFormModal: React.FC<CaseFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { clients } = useCrmData();
  const [formData, setFormData] = useState({
    caseNumber: '',
    clientId: '',
    benefitType: BenefitType.APOSENTADORIA_IDADE,
    status: CaseStatus.ANALISE_INICIAL,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        caseNumber: initialData.caseNumber,
        clientId: initialData.clientId,
        benefitType: initialData.benefitType,
        status: initialData.status,
        startDate: new Date(initialData.startDate).toISOString().split('T')[0],
        notes: initialData.notes,
      });
    } else {
      setFormData({
        caseNumber: '',
        clientId: clients.length > 0 ? clients[0].id : '',
        benefitType: BenefitType.APOSENTADORIA_IDADE,
        status: CaseStatus.ANALISE_INICIAL,
        startDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [initialData, isOpen, clients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
        alert("Por favor, selecione um cliente.");
        return;
    }
    if (initialData) {
      onSave({ ...initialData, ...formData });
    } else {
      // FIX: Correctly cast the type for new cases
      onSave(formData as Omit<Case, 'id' | 'lastUpdate' | 'documents' | 'tasks' | 'legalDocuments'>);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Editar Caso' : 'Novo Caso'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <X size={24} className="text-slate-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="caseNumber" className="block text-sm font-medium text-slate-700">Número do Processo/Caso</label>
              <input type="text" name="caseNumber" id="caseNumber" value={formData.caseNumber} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">Cliente</label>
              <select name="clientId" id="clientId" value={formData.clientId} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm">
                <option value="" disabled>Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="benefitType" className="block text-sm font-medium text-slate-700">Tipo de Benefício</label>
              <select name="benefitType" id="benefitType" value={formData.benefitType} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm">
                {Object.values(BenefitType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm">
                {Object.values(CaseStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Data de Início</label>
              <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notas Iniciais</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseFormModal;
