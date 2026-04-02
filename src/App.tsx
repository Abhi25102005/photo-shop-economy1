import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Upload } from './components/Upload';

type View = 'dashboard' | 'upload';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard onNavigateToUpload={() => setCurrentView('upload')} />
      )}
      {currentView === 'upload' && (
        <Upload onNavigateToDashboard={() => setCurrentView('dashboard')} />
      )}
    </>
  );
}

export default App;
