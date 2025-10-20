
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Case, CaseStatus, BenefitType, Document, Task, Fee, FeeStatus, FeeType, DocumentTemplate, LegalDocument, Expense, Installment } from '../types';

// --- MOCK DATA ---
const getInitialClients = (): Client[] => {
    return [
        { id: 'cli-1', name: 'José da Silva', cpf: '111.222.333-44', rg: '12.345.678-9', rgIssuer: 'SSP', rgIssuerUF: 'SP', dataEmissao: '2010-05-20', motherName: 'Maria da Silva', fatherName: 'João da Silva', dateOfBirth: '1958-10-15', nacionalidade: 'Brasileiro', naturalidade: 'São Paulo/SP', estadoCivil: 'Casado', profissao: 'Motorista', email: 'jose.silva@example.com', phone: '(11) 98765-4321', cep: '01001-000', street: 'Praça da Sé', number: '123', complement: 'Lado par', neighborhood: 'Sé', city: 'São Paulo', state: 'SP', createdAt: new Date(2023, 10, 15).toISOString() },
        { id: 'cli-2', name: 'Maria Oliveira', cpf: '222.333.444-55', rg: '23.456.789-0', rgIssuer: 'SSP', rgIssuerUF: 'RJ', dataEmissao: '2015-11-10', motherName: 'Ana Oliveira', fatherName: 'Pedro Oliveira', dateOfBirth: '1980-05-20', nacionalidade: 'Brasileira', naturalidade: 'Rio de Janeiro/RJ', estadoCivil: 'Solteira', profissao: 'Enfermeira', email: 'maria.o@example.com', phone: '(21) 91234-5678', cep: '22070-011', street: 'Avenida Atlântica', number: '456', complement: 'Apto 101', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', createdAt: new Date(2023, 11, 20).toISOString() },
    ];
};

const getInitialCases = (): Case[] => {
    const defaultLegalDocs: LegalDocument[] = [
        { templateId: 'tmpl-1', title: 'Procuração Ad Judicia', status: 'Pendente' },
        { templateId: 'tmpl-2', title: 'Contrato de Honorários', status: 'Pendente' },
    ];
    return [
        { id: 'case-1', caseNumber: '1234567-89.2023.4.01.0001', clientId: 'cli-1', benefitType: BenefitType.APOSENTADORIA_IDADE, status: CaseStatus.JUDICIAL, startDate: new Date(2023, 10, 25).toISOString(), notes: '--- 25/10/2023 10:00:00 ---\nCliente completou 65 anos. Documentação completa enviada.', documents: [{id: 'doc-1', name: 'PETICAO_INICIAL.pdf', url: '#', uploadedAt: new Date().toISOString()}], tasks: [{id: 'task-1', description: 'Verificar andamento no Meu INSS', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), completed: false, caseId: 'case-1'}], legalDocuments: defaultLegalDocs, lastUpdate: new Date().toISOString() },
        { id: 'case-2', caseNumber: '9876543-21.2023.4.01.0002', clientId: 'cli-2', benefitType: BenefitType.AUXILIO_DOENCA, status: CaseStatus.EM_ANALISE_INSS, startDate: new Date(2023, 11, 28).toISOString(), notes: '--- 28/11/2023 14:30:00 ---\nINSS solicitou laudo médico complementar.', documents: [], tasks: [{id: 'task-2', description: 'Contatar cliente para agendar nova perícia', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), completed: false, caseId: 'case-2'}], legalDocuments: defaultLegalDocs, lastUpdate: new Date().toISOString() },
    ];
};

const getInitialFees = (): Fee[] => {
    return [
        {id: 'fee-1', caseId: 'case-1', type: FeeType.INICIAL, description: 'Entrada do processo', amount: 1200, dueDate: '2023-10-26', status: FeeStatus.PAGO},
        {id: 'fee-2', caseId: 'case-2', type: FeeType.CONSULTA, description: 'Consulta inicial', amount: 350, dueDate: '2023-11-27', status: FeeStatus.PAGO},
        {id: 'fee-3', caseId: 'case-1', type: FeeType.EXITO, description: '30% sobre o benefício', amount: 15000, dueDate: '2024-08-30', status: FeeStatus.PENDENTE},
        {id: 'fee-4', caseId: 'case-2', type: FeeType.PARCELADO, description: 'Honorários parcelados', amount: 3000, dueDate: '2024-12-31', status: FeeStatus.PARCIALMENTE_PAGO, installments: Array.from({length: 6}, (_, i) => ({ id: `inst-${i}`, amount: 500, dueDate: `2024-0${i+1}-10`, status: i < 2 ? 'Pago' : 'Pendente' }))},
    ];
};

const getInitialExpenses = (): Expense[] => {
    return [
        {id: 'exp-1', caseId: 'case-1', description: 'Cópia de documentos', amount: 25.50, date: '2023-10-20'},
        {id: 'exp-2', caseId: 'case-1', description: 'Transporte para audiência', amount: 50.00, date: '2024-02-15'},
    ];
};

const getInitialDocumentTemplates = (): DocumentTemplate[] => {
    return [
        { id: 'tmpl-1', title: 'Procuração Ad Judicia', content: 'PROCURAÇÃO AD JUDICIA ET EXTRA\n\nOUTORGANTE: {{cliente.name}}, nacionalidade, estado civil, profissão, portador(a) do RG nº {{cliente.rg}} {{cliente.rgIssuer}}/{{cliente.rgIssuerUF}} e do CPF nº {{cliente.cpf}}, residente e domiciliado(a) na {{cliente.street}}, nº {{cliente.number}}, {{cliente.neighborhood}}, {{cliente.city}}/{{cliente.state}}, CEP {{cliente.cep}}.\n\nOUTORGADO(S): NOME DO ADVOGADO, OAB/UF XXXXX.\n\nPODERES: (...)' },
        { id: 'tmpl-2', title: 'Contrato de Honorários', content: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS\n\nCONTRATANTE: {{cliente.name}}, CPF nº {{cliente.cpf}}.\n\nCONTRATADO(A): NOME DO ADVOGADO, OAB/UF XXXXX.\n\nCLÁUSULA 1ª - DO OBJETO: O objeto do presente contrato é a prestação de serviços advocatícios para a propositura de Ação de Concessão de Benefício Previdenciário de {{caso.benefitType}}.\n\nCLÁUSULA 2ª - DOS HONORÁRIOS: (...)' },
    ];
};

interface CrmDataContextType {
  clients: Client[];
  cases: Case[];
  fees: Fee[];
  expenses: Expense[];
  documentTemplates: DocumentTemplate[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  addCase: (newCase: Omit<Case, 'id' | 'lastUpdate' | 'documents' | 'tasks' | 'legalDocuments'>) => void;
  updateCase: (updatedCase: Case) => void;
  deleteCase: (caseId: string) => void;
  getCaseById: (caseId: string) => Case | undefined;
  getClientById: (clientId: string) => Client | undefined;
  addTaskToCase: (caseId: string, task: Omit<Task, 'id' | 'caseId'>) => void;
  updateTask: (updatedTask: Task) => void;
  addDocumentToCase: (caseId: string, document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocumentInCase: (caseId: string, updatedDocument: Document) => void;
  updateCaseLegalDocumentStatus: (caseId: string, templateId: string, status: LegalDocumentStatus) => void;
  addFee: (fee: Omit<Fee, 'id'>) => void;
  updateFee: (updatedFee: Fee) => void;
  updateInstallmentStatus: (feeId: string, installmentId: string, status: 'Pago' | 'Pendente') => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  getUrgentTasks: () => Task[];
  getFinancialsByCaseId: (caseId: string) => { totalFees: number; totalExpenses: number; balance: number };
  addTemplate: (template: Omit<DocumentTemplate, 'id'>) => void;
  updateTemplate: (template: DocumentTemplate) => void;
  deleteTemplate: (templateId: string) => void;
}

const CrmDataContext = createContext<CrmDataContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('crm_clients') || 'null') || getInitialClients());
  const [cases, setCases] = useState<Case[]>(() => JSON.parse(localStorage.getItem('crm_cases') || 'null') || getInitialCases());
  const [fees, setFees] = useState<Fee[]>(() => JSON.parse(localStorage.getItem('crm_fees') || 'null') || getInitialFees());
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('crm_expenses') || 'null') || getInitialExpenses());
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>(() => JSON.parse(localStorage.getItem('crm_templates') || 'null') || getInitialDocumentTemplates());

  useEffect(() => { localStorage.setItem('crm_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('crm_cases', JSON.stringify(cases)); }, [cases]);
  useEffect(() => { localStorage.setItem('crm_fees', JSON.stringify(fees)); }, [fees]);
  useEffect(() => { localStorage.setItem('crm_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('crm_templates', JSON.stringify(documentTemplates)); }, [documentTemplates]);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => setClients(prev => [...prev, { ...client, id: `cli-${Date.now()}`, createdAt: new Date().toISOString() }]);
  const updateClient = (updatedClient: Client) => setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  const deleteClient = (clientId: string) => {
    const casesToDelete = cases.filter(c => c.clientId === clientId).map(c => c.id);
    setClients(prev => prev.filter(c => c.id !== clientId));
    setCases(prev => prev.filter(c => c.clientId !== clientId));
    setFees(prev => prev.filter(f => !casesToDelete.includes(f.caseId)));
    setExpenses(prev => prev.filter(e => !casesToDelete.includes(e.caseId)));
  };

  const addCase = (newCaseData: Omit<Case, 'id' | 'lastUpdate' | 'documents' | 'tasks' | 'legalDocuments'>) => {
    const defaultLegalDocs: LegalDocument[] = documentTemplates.map(t => ({
        templateId: t.id,
        title: t.title,
        status: 'Pendente'
    }));
    setCases(prev => [...prev, { ...newCaseData, id: `case-${Date.now()}`, lastUpdate: new Date().toISOString(), documents: [], tasks: [], legalDocuments: defaultLegalDocs }]);
  };
  const updateCase = (updatedCase: Case) => setCases(prev => prev.map(c => c.id === updatedCase.id ? { ...updatedCase, lastUpdate: new Date().toISOString() } : c));
  const deleteCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
    setFees(prev => prev.filter(f => f.caseId !== caseId));
    setExpenses(prev => prev.filter(e => e.caseId !== caseId));
  };

  const getCaseById = (caseId: string) => cases.find(c => c.id === caseId);
  const getClientById = (clientId: string) => clients.find(c => c.id === clientId);

  const addTaskToCase = (caseId: string, task: Omit<Task, 'id' | 'caseId'>) => {
    const newTask: Task = { ...task, id: `task-${Date.now()}`, caseId };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, tasks: [...c.tasks, newTask] } : c));
  };
  const updateTask = (updatedTask: Task) => setCases(prev => prev.map(c => c.id === updatedTask.caseId ? { ...c, tasks: c.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } : c));

  const addDocumentToCase = (caseId: string, document: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDoc: Document = { ...document, id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString() };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, documents: [...c.documents, newDoc] } : c));
  };
  const updateDocumentInCase = (caseId: string, updatedDocument: Document) => setCases(prev => prev.map(c => c.id === caseId ? { ...c, documents: c.documents.map(d => d.id === updatedDocument.id ? updatedDocument : d) } : c));
  
  const updateCaseLegalDocumentStatus = (caseId: string, templateId: string, status: LegalDocumentStatus) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, legalDocuments: c.legalDocuments.map(doc => doc.templateId === templateId ? { ...doc, status } : doc) } : c));
  };

  const addFee = (fee: Omit<Fee, 'id'>) => setFees(prev => [...prev, { ...fee, id: `fee-${Date.now()}`}]);
  const updateFee = (updatedFee: Fee) => setFees(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
  const addExpense = (expense: Omit<Expense, 'id'>) => setExpenses(prev => [...prev, { ...expense, id: `exp-${Date.now()}`}]);

  const updateInstallmentStatus = (feeId: string, installmentId: string, status: 'Pago' | 'Pendente') => {
    setFees(prevFees => {
        return prevFees.map(fee => {
            if (fee.id === feeId && fee.installments) {
                const newInstallments = fee.installments.map(inst => inst.id === installmentId ? { ...inst, status } : inst);
                const allPaid = newInstallments.every(inst => inst.status === 'Pago');
                const somePaid = newInstallments.some(inst => inst.status === 'Pago');
                let newStatus = fee.status;
                if (allPaid) newStatus = FeeStatus.PAGO;
                else if (somePaid) newStatus = FeeStatus.PARCIALMENTE_PAGO;
                else newStatus = FeeStatus.PENDENTE;
                return { ...fee, installments: newInstallments, status: newStatus };
            }
            return fee;
        });
    });
  };

  const getUrgentTasks = () => {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return cases.flatMap(c => c.tasks).filter(t => !t.completed && new Date(t.dueDate) <= sevenDaysFromNow).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getFinancialsByCaseId = (caseId: string) => {
    const caseFees = fees.filter(f => f.caseId === caseId);
    const caseExpenses = expenses.filter(e => e.caseId === caseId);
    const totalFees = caseFees.reduce((sum, f) => sum + f.amount, 0);
    const totalExpenses = caseExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { totalFees, totalExpenses, balance: totalFees - totalExpenses };
  };

  const addTemplate = (template: Omit<DocumentTemplate, 'id'>) => setDocumentTemplates(prev => [...prev, { ...template, id: `tmpl-${Date.now()}`}]);
  const updateTemplate = (updatedTemplate: DocumentTemplate) => setDocumentTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  const deleteTemplate = (templateId: string) => {
    setDocumentTemplates(prev => prev.filter(t => t.id !== templateId));
    setCases(prevCases => prevCases.map(c => ({
        ...c,
        legalDocuments: c.legalDocuments.filter(ld => ld.templateId !== templateId)
    })));
  };

  return (
    <CrmDataContext.Provider value={{ clients, cases, fees, expenses, documentTemplates, addClient, updateClient, deleteClient, addCase, updateCase, deleteCase, getCaseById, getClientById, addTaskToCase, updateTask, addDocumentToCase, updateDocumentInCase, updateCaseLegalDocumentStatus, addFee, updateFee, updateInstallmentStatus, addExpense, getUrgentTasks, getFinancialsByCaseId, addTemplate, updateTemplate, deleteTemplate }}>
      {children}
    </CrmDataContext.Provider>
  );
};

export const useCrmData = () => {
  const context = useContext(CrmDataContext);
  if (context === undefined) throw new Error('useCrmData must be used within a CrmProvider');
  return context;
};
