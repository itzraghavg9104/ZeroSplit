import React, { useState } from 'react';
import Layout from './components/Layout';
import GroupDashboard from './components/GroupDashboard';
import AddExpenseForm from './components/AddExpenseForm';
import GroupsList from './components/GroupsList';
import Profile from './components/Profile';
import { AppProvider } from './context/AppContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'profile'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Simple view router
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <GroupDashboard />;
      case 'groups':
        return <GroupsList />;
      case 'profile':
        return <Profile />;
      default:
        return <GroupDashboard />;
    }
  };

  return (
    <Layout
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onAddClick={() => setIsAddModalOpen(true)}
    >
      <div className="animate-in fade-in duration-300">
        {renderContent()}
      </div>
      
      {isAddModalOpen && (
        <AddExpenseForm onClose={() => setIsAddModalOpen(false)} />
      )}
    </Layout>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;