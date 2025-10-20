
import React, { useState, useMemo } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { Fee, FeeStatus, FeeType, Expense } from '../types';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle, AlertCircle, Clock, PlusCircle, TrendingDown, Scale } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import FeeFormModal from './FeeFormModal';
import ExpenseFormModal from './ExpenseFormModal';
import InstallmentManagerModal from './InstallmentManagerModal';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Financials: React.FC = () => {
  const { fees, expenses, cases, clients, updateFee, addFee, addExpense } = useCrmData();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'fees' | 'expenses'>('fees');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [managingInstallments, setManagingInstallments] = useState<Fee | null>(null);

  const totalRecebido = useMemo(() => fees.filter(f => f.status === FeeStatus.PAGO).reduce((sum, f) => sum + f.amount, 0), [fees]);
  const totalDespesas = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const balanco = totalRecebido - totalDespesas;

  const getFeeStatusColor = (status: FeeStatus) => {
    switch (status) {
        case FeeStatus.PAGO: return 'bg-green-100 text-green-800';
        case FeeStatus.ATRASADO: return 'bg-red-100 text-red-800';
        case FeeStatus.PARCIALMENTE_PAGO: return 'bg-blue-100 text-blue-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
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

  return (
    <>
      <FeeFormModal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} onSave={handleSaveFee} />
      <ExpenseFormModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={handleSaveExpense} />
      {managingInstallments && <InstallmentManagerModal fee={managingInstallments} onClose={() => setManagingInstallments(null)} />}

      <div className="space-y-8">
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gestão Financeira</h1>
                <p className="text-slate-600 mt-1">Controle de honorários, despesas e recebíveis.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                    <PlusCircle size={20} className="mr-2" />
                    Adicionar Despesa
                </button>
                <button onClick={() => setIsFeeModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PlusCircle size={20} className="mr-2" />
                    Adicionar Honorário
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<CheckCircle size={24} className="text-green-800" />} title="Total Recebido" value={formatCurrency(totalRecebido)} color="bg-green-100" />
          <StatCard icon={<TrendingDown size={24} className="text-red-800" />} title="Total de Despesas" value={formatCurrency(totalDespesas)} color="bg-red-100" />
          <StatCard icon={<Scale size={24} className="text-indigo-800" />} title="Balanço" value={formatCurrency(balanco)} color="bg-indigo-100" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="border-b border-slate-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('fees')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Honorários</button>
                    <button onClick={() => setActiveTab('expenses')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'expenses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Despesas</button>
                </nav>
            </div>

            {activeTab === 'fees' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-200"><tr><th className="p-3 text-sm font-semibold text-slate-600">Descrição</th><th className="p-3 text-sm font-semibold text-slate-600">Cliente</th><th className="p-3 text-sm font-semibold text-slate-600">Valor</th><th className="p-3 text-sm font-semibold text-slate-600">Vencimento</th><th className="p-3 text-sm font-semibold text-slate-600 text-center">Status</th></tr></thead>
                        <tbody>
                        {fees.map(fee => {
                            const caseData = cases.find(c => c.id === fee.caseId);
                            const client = clients.find(c => c.id === caseData?.clientId);
                            return (
                            <tr key={fee.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-800"><p>{fee.description}</p><Link to={`/cases/${fee.caseId}`} className="text-xs text-blue-600 hover:underline">{caseData?.caseNumber || 'Caso não encontrado'}</Link></td>
                                <td className="p-3 text-slate-700">{client?.name || 'Cliente não encontrado'}</td>
                                <td className="p-3 font-semibold text-slate-800">{formatCurrency(fee.amount)}</td>
                                <td className="p-3 text-slate-500">{new Date(fee.dueDate).toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 text-center">
                                    {fee.type === FeeType.PARCELADO ? (
                                        <button onClick={() => setManagingInstallments(fee)} className={`text-xs font-semibold w-full px-2 py-1 rounded-full ${getFeeStatusColor(fee.status)}`}>
                                            {fee.status} ({fee.installments?.filter(i => i.status === 'Pago').length}/{fee.installments?.length})
                                        </button>
                                    ) : (
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getFeeStatusColor(fee.status)}`}>{fee.status}</span>
                                    )}
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-200"><tr><th className="p-3 text-sm font-semibold text-slate-600">Descrição</th><th className="p-3 text-sm font-semibold text-slate-600">Cliente</th><th className="p-3 text-sm font-semibold text-slate-600">Valor</th><th className="p-3 text-sm font-semibold text-slate-600">Data</th></tr></thead>
                        <tbody>
                        {expenses.map(expense => {
                            const caseData = cases.find(c => c.id === expense.caseId);
                            const client = clients.find(c => c.id === caseData?.clientId);
                            return (
                            <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-800"><p>{expense.description}</p><Link to={`/cases/${expense.caseId}`} className="text-xs text-blue-600 hover:underline">{caseData?.caseNumber || 'Caso não encontrado'}</Link></td>
                                <td className="p-3 text-slate-700">{client?.name || 'Cliente não encontrado'}</td>
                                <td className="p-3 font-semibold text-red-600">-{formatCurrency(expense.amount)}</td>
                                <td className="p-3 text-slate-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default Financials;
