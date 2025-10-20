
import React, { useState, useEffect } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { X } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { cases, addTaskToCase } = useCrmData();
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [caseId, setCaseId] = useState('');

  useEffect(() => {
    if (initialDate) {
      setDueDate(initialDate.toISOString().split('T')[0]);
    }
    if (cases.length > 0) {
      setCaseId(cases[0].id);
    }
  }, [initialDate, cases, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !dueDate || !caseId) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    addTaskToCase(caseId, { description, dueDate, completed: false });
    onClose();
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Nova Tarefa</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} className="text-slate-600" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
              <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Data do Prazo</label>
              <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
              <label htmlFor="caseId" className="block text-sm font-medium text-slate-700">Associar ao Caso</label>
              <select id="caseId" value={caseId} onChange={e => setCaseId(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm">
                {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.benefitType}</option>)}
              </select>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Salvar Tarefa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
