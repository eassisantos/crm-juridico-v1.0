
import React, { useState, useMemo, useEffect } from 'react';
import { DocumentTemplate, Client, Case } from '../types';
import { useCrmData } from '../hooks/useCrmData';
import { X, Copy, Printer } from 'lucide-react';

interface GenerateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: DocumentTemplate;
  preselectedClientId?: string;
  preselectedCaseId?: string;
  onGenerationComplete?: () => void;
}

const replacePlaceholders = (content: string, client: Client, caseData?: Case): string => {
    let replacedContent = content;
    
    const allData = {
        cliente: client,
        caso: caseData,
    };

    replacedContent = content.replace(/{{(.*?)}}/g, (match, key) => {
        const keys = key.trim().split('.');
        let current: any = allData;
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return match; // Placeholder not found, keep it
            }
        }
        return current || '';
    });

    return replacedContent;
};

const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ isOpen, onClose, template, preselectedClientId, preselectedCaseId, onGenerationComplete }) => {
  const { clients, cases } = useCrmData();
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || '');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(preselectedCaseId || '');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (preselectedClientId) setSelectedClientId(preselectedClientId);
    if (preselectedCaseId) setSelectedCaseId(preselectedCaseId);
  }, [preselectedClientId, preselectedCaseId, isOpen]);

  const clientCases = useMemo(() => {
    return cases.filter(c => c.clientId === selectedClientId);
  }, [selectedClientId, cases]);

  const generatedContent = useMemo(() => {
    if (!selectedClientId) return template.content;
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return template.content;
    
    const caseData = cases.find(c => c.id === selectedCaseId);
    return replacePlaceholders(template.content, client, caseData);
  }, [template, selectedClientId, selectedCaseId, clients, cases]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent).then(() => {
      setCopySuccess('Copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Falha ao copiar.');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handlePrint = () => {
    const printableWindow = window.open('', '_blank');
    if (printableWindow) {
        printableWindow.document.write(`
            <html>
                <head><title>${template.title}</title></head>
                <body style="font-family: sans-serif; white-space: pre-wrap;">${generatedContent}</body>
            </html>
        `);
        printableWindow.document.close();
        printableWindow.print();
        onGenerationComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Gerar: {template.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} className="text-slate-600" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b">
            <div>
                <label htmlFor="client-select" className="block text-sm font-medium text-slate-700">Selecione o Cliente</label>
                <select id="client-select" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm" disabled={!!preselectedClientId}>
                    <option value="">-- Selecione --</option>
                    {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="case-select" className="block text-sm font-medium text-slate-700">Selecione o Caso (Opcional)</label>
                <select id="case-select" value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} disabled={!selectedClientId || clientCases.length === 0 || !!preselectedCaseId} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm disabled:bg-slate-100">
                    <option value="">-- Nenhum --</option>
                    {clientCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.benefitType}</option>)}
                </select>
            </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{generatedContent}</pre>
        </div>
        <div className="p-6 bg-slate-100 border-t flex justify-end space-x-3">
          <button onClick={handleCopyToClipboard} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
            <Copy size={16} className="mr-2" /> {copySuccess || 'Copiar Texto'}
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 flex items-center">
            <Printer size={16} className="mr-2" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocumentModal;
