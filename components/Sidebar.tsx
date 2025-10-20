
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Scale, Calendar, FileText, DollarSign, Palette, X } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const activeClass = 'bg-slate-700 text-white';
  const inactiveClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {icon}
      <span className="ml-3">{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        ></div>

        <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-800 text-white flex flex-col p-4 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex-shrink-0`}>
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center">
                    <Scale className="h-8 w-8 text-blue-400" />
                    <h1 className="ml-3 text-xl font-bold tracking-tight">CRM Jurídico</h1>
                </div>
                <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 space-y-2">
                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={onClose} />
                <NavItem to="/clients" icon={<Users size={20} />} label="Clientes" onClick={onClose} />
                <NavItem to="/cases" icon={<Briefcase size={20} />} label="Casos" onClick={onClose} />
                <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendário" onClick={onClose} />
                <NavItem to="/financials" icon={<DollarSign size={20} />} label="Financeiro" onClick={onClose} />
                <NavItem to="/templates" icon={<FileText size={20} />} label="Modelos" onClick={onClose} />
            </nav>
            <div className="mt-auto">
                <NavItem to="/design-system" icon={<Palette size={20} />} label="Design System" onClick={onClose} />
                <div className="text-center text-xs text-slate-400 mt-4">
                    <p>&copy; {new Date().getFullYear()} CRM Jurídico</p>
                    <p>Versão 1.5.0</p>
                </div>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;
