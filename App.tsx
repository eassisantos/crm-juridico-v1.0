
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import CalendarView from './components/CalendarView';
import DocumentTemplates from './components/DocumentTemplates';
import Financials from './components/Financials';
import DesignSystemGuide from './components/DesignSystemGuide';
import { CrmProvider, useCrmData } from './hooks/useCrmData';
import DeadlineAlertModal from './components/DeadlineAlertModal';
import { Menu } from 'lucide-react';
import { ToastProvider } from './contexts/ToastContext';

const AppContent: React.FC = () => {
  const { getUrgentTasks } = useCrmData();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const urgentTasks = getUrgentTasks();
    const lastDismissed = localStorage.getItem('deadlineAlertDismissed');
    const today = new Date().toDateString();

    if (urgentTasks.length > 0 && lastDismissed !== today) {
      setIsAlertModalOpen(true);
    }
  }, [getUrgentTasks]);

  const handleCloseAlertModal = (dismiss: boolean) => {
    if (dismiss) {
      localStorage.setItem('deadlineAlertDismissed', new Date().toDateString());
    }
    setIsAlertModalOpen(false);
  };

  return (
    <>
      <DeadlineAlertModal isOpen={isAlertModalOpen} onClose={handleCloseAlertModal} />
      <div className="flex h-screen bg-slate-100 text-slate-800">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="lg:hidden flex items-center justify-between bg-white shadow-md p-4 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-blue-600">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-blue-600">CRM Jurídico</h1>
          </header>
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/cases" element={<CaseList />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/templates" element={<DocumentTemplates />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/design-system" element={<DesignSystemGuide />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <CrmProvider>
      <ToastProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </ToastProvider>
    </CrmProvider>
  );
};

export default App;
