
export enum CaseStatus {
  ANALISE_INICIAL = "Análise Inicial",
  AGUARDANDO_DOCUMENTOS = "Aguardando Documentos",
  PROTOCOLO_INSS = "Protocolado no INSS",
  EM_ANALISE_INSS = "Em Análise (INSS)",
  EXIGENCIA = "Em Exigência",
  CONCEDIDO = "Concedido",
  NEGADO = "Negado",
  RECURSO = "Fase Recursal",
  JUDICIAL = "Fase Judicial",
  FINALIZADO = "Finalizado",
}

export enum BenefitType {
  APOSENTADORIA_IDADE = "Aposentadoria por Idade",
  APOSENTADORIA_CONTRIBUICAO = "Aposentadoria por Tempo de Contribuição",
  APOSENTADORIA_ESPECIAL = "Aposentadoria Especial",
  APOSENTADORIA_INVALIDEZ = "Aposentadoria por Invalidez",
  AUXILIO_DOENCA = "Auxílio-Doença",
  AUXILIO_ACIDENTE = "Auxílio-Acidente",
  BPC_LOAS = "BPC/LOAS",
  PENSAO_MORTE = "Pensão por Morte",
  SALARIO_MATERNIDADE = "Salário Maternidade",
}

export interface RepresentativeData {
  name: string;
  motherName: string;
  fatherName: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  rgIssuerUF: string;
  dataEmissao: string;
  dateOfBirth: string;
  nacionalidade: string;
  naturalidade: string;
  estadoCivil: string;
  profissao: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  rgIssuerUF: string;
  dataEmissao: string; // YYYY-MM-DD
  motherName: string;
  fatherName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nacionalidade: string;
  naturalidade: string;
  estadoCivil: string;
  profissao: string;
  legalRepresentative?: RepresentativeData; // Objeto para dados do representante
  email: string;
  phone: string;
  // Endereço estruturado
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  createdAt: string;
}

export type LegalDocumentStatus = 'Pendente' | 'Gerado' | 'Assinado';

export interface LegalDocument {
    templateId: string;
    title: string;
    status: LegalDocumentStatus;
}

export interface Case {
  id: string;
  caseNumber: string;
  clientId: string;
  benefitType: BenefitType;
  status: CaseStatus;
  startDate: string;
  notes: string;
  documents: Document[];
  tasks: Task[];
  legalDocuments: LegalDocument[];
  lastUpdate: string;
  aiSummary?: string;
}

export interface Document {
  id: string;
  name: string;
  url?: string; // URL is now optional
  uploadedAt: string;
  textContent?: string; // For AI analysis
  aiAnalysis?: string; // To store AI analysis result
}

export interface Task {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
  caseId: string; // Link back to the case
}

export interface SuggestedTask {
    description: string;
    dueDate?: string; // Formato YYYY-MM-DD
    reasoning: string;
}

export enum FeeStatus {
    PENDENTE = "Pendente",
    PAGO = "Pago",
    ATRASADO = "Atrasado",
    PARCIALMENTE_PAGO = "Parcialmente Pago",
}

export enum FeeType {
    EXITO = "Êxito",
    INICIAL = "Inicial",
    PARCELADO = "Parcelado",
    CONSULTA = "Consulta",
    RPV = "RPV",
}

export interface Installment {
    id: string;
    amount: number;
    dueDate: string;
    status: 'Pendente' | 'Pago';
}

export interface Fee {
    id: string;
    caseId: string;
    type: FeeType;
    description: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
    status: FeeStatus;
    installments?: Installment[];
}

export interface Expense {
    id: string;
    caseId: string;
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
}

export interface DocumentTemplate {
    id: string;
    title: string;
    content: string;
}
