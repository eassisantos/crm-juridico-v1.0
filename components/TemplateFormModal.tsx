
import React, { useState, useEffect, useMemo } from 'react';
import { DocumentTemplate, Client, Case, RepresentativeData } from '../types';
import { useCrmData } from '../hooks/useCrmData';
import { X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DocumentTemplate | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addTemplate, updateTemplate } = useCrmData();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const placeholders = useMemo(() => {
    const clientKeys = Object.keys({} as Client).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'legalRepresentative');
    const repKeys = Object.keys({} as RepresentativeData);
    const caseKeys = Object.keys({} as Case).filter(k => !['id', 'lastUpdate', 'aiSummary', 'documents', 'tasks', 'legalDocuments'].includes(k));
    
    const clientPlaceholders = clientKeys.map(key => `{{cliente.${key}}}`);
    const repPlaceholders = repKeys.map(key => `{{cliente.legalRepresentative.${key}}}`);
    const casePlaceholders = caseKeys.map(key => `{{caso.${key}}}`);

    return {
        "Cliente": clientPlaceholders.sort(),
        "Representante Legal": repPlaceholders.sort(),
        "Caso": casePlaceholders.sort(),
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    if (initialData) {
      updateTemplate({ ...initialData, title, content });
      addToast('Modelo atualizado com sucesso!', 'success');
    } else {
      addTemplate({ title, content });
      addToast('Novo modelo criado com sucesso!', 'success');
    }
    onClose();
  };

  const copyPlaceholder = (p: string) => {
    navigator.clipboard.writeText(p);
    addToast('Placeholder copiado!', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Editar Modelo' : 'Novo Modelo'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} className="text-slate-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            <div className="md:w-2/3 flex flex-col">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título do Modelo</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" />
                </div>
                <div className="flex-1 flex flex-col">
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700">Conteúdo</label>
                    <textarea id="content" value={content} onChange={e => setContent(e.target.value)} required className="mt-1 block w-full flex-1 border-slate-300 rounded-md shadow-sm sm:text-sm font-mono" />
                </div>
            </div>
            <div className="md:w-1/3 p-4 bg-slate-50 rounded-lg overflow-y-auto">
                <h4 className="font-semibold text-slate-700 mb-2">Placeholders Disponíveis</h4>
                <p className="text-xs text-slate-500 mb-3">Clique para copiar e cole no conteúdo.</p>
                {Object.entries(placeholders).map(([group, list]) => (
                    <div key={group} className="mb-4">
                        <h5 className="font-semibold text-sm text-slate-600 mb-2">{group}</h5>
                        <ul className="space-y-1">
                            {list.map(p => (
                                <li key={p}><button type="button" onClick={() => copyPlaceholder(p)} className="w-full text-left p-1 rounded text-xs font-mono bg-slate-200 hover:bg-blue-100">{p}</button></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
          </div>
          <div className="p-6 bg-slate-100 border-t flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Salvar Modelo</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateFormModal;
