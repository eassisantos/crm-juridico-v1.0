
import React, { useState } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { Users, Briefcase, AlertTriangle, CheckCircle, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Case, CaseStatus, Task } from '../types';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center transition-transform hover:scale-105">
    <div className={`p-3 rounded-full mr-4 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const UrgentTasksList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const { getCaseById } = useCrmData();
    if (tasks.length === 0) return <div className="text-center py-8"><CheckCircle className="mx-auto h-12 w-12 text-green-500" /><h3 className="mt-2 text-sm font-medium text-slate-900">Tudo em dia!</h3><p className="mt-1 text-sm text-slate-500">Nenhum prazo urgente.</p></div>;
    return (
        <ul className="divide-y divide-slate-200">
            {tasks.map(task => {
                const caseData = getCaseById(task.caseId);
                const dueDate = new Date(task.dueDate);
                const today = new Date(); today.setHours(0,0,0,0);
                const isOverdue = dueDate < today;
                return (
                    <li key={task.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                            <Link to={`/cases/${task.caseId}`} className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-600 truncate hover:underline">{task.description}</p>
                                <p className="text-sm text-slate-500 truncate">Caso: {caseData?.caseNumber || 'N/A'}</p>
                            </Link>
                            <div className={`ml-4 text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-yellow-700'}`}><div className="flex items-center"><CalendarClock size={16} className="mr-1.5" /><span>{dueDate.toLocaleDateString('pt-BR')}</span></div></div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

const RecentActivityTable: React.FC<{ cases: Case[] }> = ({ cases }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="border-b-2 border-slate-200"><tr><th className="p-3 text-sm font-semibold text-slate-600">Nº do Caso</th><th className="p-3 text-sm font-semibold text-slate-600">Tipo de Benefício</th><th className="p-3 text-sm font-semibold text-slate-600">Status</th><th className="p-3 text-sm font-semibold text-slate-600">Última Atualização</th></tr></thead>
            <tbody>
                {cases.map(c => (<tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="p-3"><Link to={`/cases/${c.id}`} className="text-blue-600 hover:underline font-medium">{c.caseNumber.substring(0, 15)}...</Link></td><td className="p-3 text-slate-700">{c.benefitType}</td><td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{c.status}</span></td><td className="p-3 text-slate-500">{new Date(c.lastUpdate).toLocaleDateString('pt-BR')}</td></tr>))}
            </tbody>
        </table>
    </div>
);

const Dashboard: React.FC = () => {
  const { clients, cases, getUrgentTasks } = useCrmData();
  const [activeTab, setActiveTab] = useState<'admin' | 'judicial'>('admin');

  const activeCases = cases.filter(c => c.status !== CaseStatus.FINALIZADO && c.status !== CaseStatus.CONCEDIDO);
  const urgentTasks = getUrgentTasks();

  const recentActivity = [...cases].sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()).slice(0, 10);
  const adminCases = recentActivity.filter(c => c.status !== CaseStatus.JUDICIAL);
  const judicialCases = recentActivity.filter(c => c.status === CaseStatus.JUDICIAL);

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-bold text-slate-900">Dashboard</h1><p className="text-slate-600 mt-1">Visão geral do seu escritório.</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={24} className="text-blue-800" />} title="Total de Clientes" value={clients.length} color="bg-blue-100" />
        <StatCard icon={<Briefcase size={24} className="text-green-800" />} title="Casos Ativos" value={activeCases.length} color="bg-green-100" />
        <StatCard icon={<AlertTriangle size={24} className="text-yellow-800" />} title="Prazos Urgentes" value={urgentTasks.length} color="bg-yellow-100" />
        <StatCard icon={<CheckCircle size={24} className="text-indigo-800" />} title="Casos Finalizados" value={cases.length - activeCases.length} color="bg-indigo-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Atividade Recente nos Casos</h2>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('admin')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'admin' ? 'bg-white shadow' : 'text-slate-600'}`}>Administrativos</button>
                    <button onClick={() => setActiveTab('judicial')} className={`px-3 py-1 text-sm font-medium rounded-md ${activeTab === 'judicial' ? 'bg-white shadow' : 'text-slate-600'}`}>Judiciais</button>
                </div>
            </div>
            {activeTab === 'admin' ? <RecentActivityTable cases={adminCases} /> : <RecentActivityTable cases={judicialCases} />}
        </div>
        <div className="bg-white rounded-lg shadow-md"><h2 className="text-xl font-bold text-slate-800 mb-4 p-6 pb-2">Prazos e Tarefas Urgentes</h2><UrgentTasksList tasks={urgentTasks} /></div>
      </div>
    </div>
  );
};

export default Dashboard;
