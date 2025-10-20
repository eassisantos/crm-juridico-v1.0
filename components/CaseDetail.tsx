
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { Case, Client, SuggestedTask, Fee, Expense } from '../types';
import { ArrowLeft, User, Briefcase, Calendar, ListTodo, Bot, Loader2, AlertCircle, PlusCircle, MapPin, Sparkles, DollarSign, TrendingDown, Scale } from 'lucide-react';
import { generateCaseSummary, suggestTasksFromNotes } from '../services/geminiService';
import DocumentChecklist from './DocumentChecklist';
import LegalDocumentsManager from './LegalDocumentsManager';
import { useToast } from '../contexts/ToastContext';
import FeeFormModal from './FeeFormModal';
import ExpenseFormModal from './ExpenseFormModal';

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="text-slate-500 mt-1">{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="text-md text-slate-800">{value}</div>
    </div>
  </div>
);

const Spinner: React.FC = () => <Loader2 className="animate-spin" />;

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const sanitizeHTML = (htmlString: string) => {
    // A simple sanitizer to prevent XSS. For a real-world app, use a library like DOMPurify.
    const allowedTags = ['h3', 'strong', 'br'];
    const sanitized = htmlString
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/###\s*(.*?)\n/g, '<h3>$1</h3>')
        .replace(/\*\*\s*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
    
    // This is a basic check, not a full XSS prevention
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    tempDiv.querySelectorAll('*').forEach(el => {
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            el.remove();
        }
        for (const attr of el.attributes) {
            el.removeAttribute(attr.name);
        }
    });
    return tempDiv.innerHTML;
};

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCaseById, getClientById, updateCase, addTaskToCase, updateTask, cases, getFinancialsByCaseId, addFee, addExpense } = useCrmData();
  const { addToast } = useToast();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSuggestingTasks, setIsSuggestingTasks] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setIsLoading(true);
    if (id) {
      const foundCase = getCaseById(id);
      if (foundCase) {
        setCaseData(foundCase);
        const foundClient = getClientById(foundCase.clientId);
        setClient(foundClient || null);
      }
    }
    setTimeout(() => setIsLoading(false), 300);
  }, [id, getCaseById, getClientById, cases]);

  const handleGenerateSummary = async () => {
    if (!caseData || !client) return;
    setIsGeneratingSummary(true);
    setError(null);
    try {
      const summary = await generateCaseSummary(caseData, client.name);
      updateCase({ ...caseData, aiSummary: summary });
      addToast('Resumo gerado com sucesso!', 'success');
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSuggestTasks = async () => {
    if (!caseData?.notes) return;
    setIsSuggestingTasks(true);
    setError(null);
    setSuggestedTasks([]);
    try {
        const suggestionsString = await suggestTasksFromNotes(caseData.notes);
        const suggestions: SuggestedTask[] = JSON.parse(suggestionsString);
        setSuggestedTasks(suggestions);
        addToast(`${suggestions.length} tarefa(s) sugerida(s) pela IA.`, 'info');
    } catch (e: any) {
        setError(e.message || "Falha ao sugerir tarefas.");
    } finally {
        setIsSuggestingTasks(false);
    }
  };

  const handleAddSuggestedTask = (suggestedTask: SuggestedTask) => {
    if (!caseData) return;
    addTaskToCase(caseData.id, {
        description: suggestedTask.description,
        dueDate: suggestedTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false
    });
    setSuggestedTasks(prev => prev.filter(t => t.description !== suggestedTask.description));
    addToast('Tarefa sugerida adicionada!', 'success');
  };

  const handleToggleTask = (taskId: string) => {
    if (!caseData) return;
    const task = caseData.tasks.find(t => t.id === taskId);
    if (task) {
        updateTask({ ...task, completed: !task.completed });
        addToast(`Tarefa ${task.completed ? 'marcada como pendente' : 'concluída'}!`, 'success');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !newNote.trim()) return;
    const timestamp = new Date().toLocaleString('pt-BR');
    const updatedNotes = `${caseData.notes}\n\n--- ${timestamp} ---\n${newNote}`;
    updateCase({ ...caseData, notes: updatedNotes.trim() });
    addToast('Nova nota adicionada com sucesso!', 'success');
    setNewNote('');
  };

  const handleSaveFee = (feeData: Omit<Fee, 'id'>) => {
    addFee(feeData);
    addToast('Novo honorário adicionado com sucesso!', 'success');
    setIsFeeModalOpen(false);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    addExpense(expenseData);
    addToast('Nova despesa adicionada com sucesso!', 'success');
    setIsExpenseModalOpen(false);
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!caseData || !client) {
    return <div className="text-center py-10"><h2 className="text-xl font-semibold">Caso não encontrado</h2><p className="text-slate-500">O caso que você está procurando não existe ou foi removido.</p></div>;
  }

  const { totalFees, totalExpenses, balance } = getFinancialsByCaseId(caseData.id);

  return (
    <>
      <FeeFormModal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} onSave={handleSaveFee} preselectedCaseId={caseData.id} />
      <ExpenseFormModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} preselectedCaseId={caseData.id} />
      <div className="space-y-6">
        <Link to="/cases" className="flex items-center text-blue-600 hover:underline"><ArrowLeft size={18} className="mr-2" />Voltar para Casos</Link>
        <header className="pb-4 border-b"><h1 className="text-3xl font-bold text-slate-900">Painel do Caso</h1><p className="text-slate-600 mt-1">{caseData.caseNumber}</p></header>
        {error && <div className="my-4 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">{error}</div>}
        
        {suggestedTasks.length > 0 && (<div className="bg-indigo-50 p-6 rounded-lg shadow-md border border-indigo-200"><h2 className="text-xl font-bold text-indigo-800 mb-4 flex items-center"><Sparkles size={22} className="mr-2"/> Tarefas Sugeridas pela IA</h2><ul className="space-y-3">{suggestedTasks.map((task, index) => (<li key={index} className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between"><div><p className="font-medium text-slate-800">{task.description}</p><p className="text-xs text-slate-500 mt-1"><strong>Justificativa:</strong> {task.reasoning}</p></div><button onClick={() => handleAddSuggestedTask(task)} className="ml-4 flex-shrink-0 flex items-center bg-green-500 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-green-600"><PlusCircle size={16} className="mr-1.5"/> Adicionar</button></li>))}</ul></div>)}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-800 flex items-center"><Bot size={24} className="mr-2 text-blue-600"/> Resumo com IA</h2><button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-slate-400">{isGeneratingSummary ? <Spinner /> : <Bot size={20} />}<span className="ml-2">{isGeneratingSummary ? 'Gerando...' : 'Gerar Resumo'}</span></button></div>
                    {caseData.aiSummary ? <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-lg border" dangerouslySetInnerHTML={{ __html: sanitizeHTML(caseData.aiSummary) }} /> : <div className="text-center py-8 text-slate-500"><p>Clique para criar um resumo do caso usando IA.</p></div>}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-800">Notas / Andamentos</h2><button onClick={handleSuggestTasks} disabled={isSuggestingTasks || !caseData.notes} className="flex items-center text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-200 disabled:bg-slate-100 disabled:text-slate-400">{isSuggestingTasks ? <Spinner /> : <Sparkles size={14} />}<span className="ml-1.5">Sugerir Tarefas</span></button></div>
                    <div className="max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-lg border mb-4"><pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{caseData.notes || "Nenhuma nota adicionada."}</pre></div>
                    <form onSubmit={handleAddNote}><textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Adicionar nova nota..." rows={3} className="w-full border-slate-300 rounded-md shadow-sm text-sm"></textarea><button type="submit" disabled={!newNote.trim()} className="mt-2 w-full flex justify-center items-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400"><PlusCircle size={16} className="mr-2"/>Adicionar Nota</button></form>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md"><LegalDocumentsManager caseData={caseData} /></div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4"><h2 className="text-xl font-bold text-slate-800">Informações Gerais</h2><DetailItem icon={<User size={20} />} label="Cliente" value={client.name} /><DetailItem icon={<Briefcase size={20} />} label="Tipo de Benefício" value={caseData.benefitType} /><DetailItem icon={<AlertCircle size={20} />} label="Status" value={<span className="px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">{caseData.status}</span>} /></div>
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4"><h2 className="text-xl font-bold text-slate-800">Balanço Financeiro</h2>
                    <DetailItem icon={<DollarSign size={20} className="text-green-500" />} label="Total de Honorários" value={<span className="font-semibold text-green-600">{formatCurrency(totalFees)}</span>} />
                    <DetailItem icon={<TrendingDown size={20} className="text-red-500" />} label="Total de Despesas" value={<span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>} />
                    <DetailItem icon={<Scale size={20} className="text-indigo-500" />} label="Balanço do Caso" value={<span className="font-bold text-lg text-indigo-600">{formatCurrency(balance)}</span>} />
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsFeeModalOpen(true)} className="flex-1 text-xs flex items-center justify-center bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200"><PlusCircle size={14} className="mr-1"/>Honorário</button>
                        <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 text-xs flex items-center justify-center bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"><PlusCircle size={14} className="mr-1"/>Despesa</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold text-slate-800 mb-4">Tarefas</h2><ul className="space-y-3 max-h-60 overflow-y-auto">{caseData.tasks.length > 0 ? caseData.tasks.map(task => (<li key={task.id} className="flex items-center"><input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><span className={`ml-3 ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.description}</span><span className="ml-auto text-sm text-slate-400">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span></li>)) : <p className="text-slate-500 text-center py-4">Nenhuma tarefa para este caso.</p>}</ul></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-xl font-bold text-slate-800 mb-4">Checklist de Documentos</h2><DocumentChecklist caseData={caseData} /></div>
            </div>
        </div>
      </div>
    </>
  );
};

const SkeletonLoader: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded w-3/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-200 p-6 rounded-lg h-64"></div>
                <div className="bg-slate-200 p-6 rounded-lg h-48"></div>
            </div>
            <div className="space-y-6">
                <div className="bg-slate-200 p-6 rounded-lg h-80"></div>
            </div>
        </div>
    </div>
);

export default CaseDetail;
