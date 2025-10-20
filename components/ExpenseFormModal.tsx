
import React, { useState, useEffect } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { Expense } from '../types';
import { X } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const { cases } = useCrmData();
  const [formData, setFormData] = useState({
    caseId: '',
    description: '',
    amount: '',
    date: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        caseId: cases.length > 0 ? cases[0].id : '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, cases]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId || !formData.description || !formData.amount || !formData.date) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Adicionar Despesa</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} className="text-slate-600" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="caseId" className="block text-sm font-medium text-slate-700">Associar ao Caso</label>
              <select name="caseId" id="caseId" value={formData.caseId} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm">
                {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.benefitType}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição da Despesa</label>
              <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Valor (R$)</label>
                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700">Data da Despesa</label>
                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
                </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700">Salvar Despesa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
