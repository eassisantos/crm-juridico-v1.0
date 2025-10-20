
import React, { useState } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { DocumentTemplate } from '../types';
import { FileText, FileSignature, PlusCircle, Edit, Trash2 } from 'lucide-react';
import GenerateDocumentModal from './GenerateDocumentModal';
import TemplateFormModal from './TemplateFormModal';
import { useToast } from '../contexts/ToastContext';

type ModalState = {
    type: 'generate' | 'edit' | 'add';
    template?: DocumentTemplate;
} | null;

const DocumentTemplates: React.FC = () => {
  const { documentTemplates, deleteTemplate } = useCrmData();
  const { addToast } = useToast();
  const [modalState, setModalState] = useState<ModalState>(null);

  const handleGenerateClick = (template: DocumentTemplate) => {
    setModalState({ type: 'generate', template });
  };

  const handleEditClick = (template: DocumentTemplate) => {
    setModalState({ type: 'edit', template });
  };

  const handleAddClick = () => {
    setModalState({ type: 'add' });
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleDelete = (template: DocumentTemplate) => {
    if (confirm(`Tem certeza que deseja excluir o modelo "${template.title}"?`)) {
        deleteTemplate(template.id);
        addToast('Modelo excluído com sucesso!', 'info');
    }
  };

  return (
    <>
      {modalState?.type === 'generate' && modalState.template && (
        <GenerateDocumentModal
          isOpen={true}
          onClose={handleCloseModal}
          template={modalState.template}
        />
      )}
      {(modalState?.type === 'add' || modalState?.type === 'edit') && (
        <TemplateFormModal
          isOpen={true}
          onClose={handleCloseModal}
          initialData={modalState.type === 'edit' ? modalState.template || null : null}
        />
      )}
      
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Modelos de Documentos</h1>
            <p className="text-slate-600 mt-1">Crie, edite e gere documentos rapidamente.</p>
          </div>
          <button onClick={handleAddClick} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} className="mr-2" />
            Novo Modelo
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTemplates.map(template => (
            <div key={template.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start">
                    <FileText className="h-10 w-10 text-blue-500 mb-4" />
                    <div className="flex space-x-2">
                        <button onClick={() => handleEditClick(template)} className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-blue-600 transition-opacity">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(template)} className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-red-600 transition-opacity">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{template.title}</h2>
                <p className="text-sm text-slate-500 mt-2 line-clamp-3">{template.content}</p>
              </div>
              <button onClick={() => handleGenerateClick(template)} className="mt-6 w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                <FileSignature size={20} className="mr-2" />
                Gerar Documento
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DocumentTemplates;
