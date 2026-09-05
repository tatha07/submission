import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AppNavigator } from './components/navigation/AppNavigator';
import { LoginScreen } from './screens/LoginScreen';

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F2ED]">
        <div className="w-8 h-8 border-4 border-[#2D4F1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <AppNavigator /> : <LoginScreen />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <div className="min-h-screen bg-[#E5E0D8] flex items-center justify-center p-0 sm:p-4 md:p-6 font-sans antialiased selection:bg-[#D4A373]/30">
              <div className="w-full sm:max-w-[420px] h-screen sm:h-[880px] sm:max-h-[92vh] bg-[#F5F2ED] sm:rounded-[36px] sm:shadow-[0_25px_60px_-15px_rgba(45,79,30,0.18)] sm:border-[8px] sm:border-stone-900 overflow-hidden flex flex-col relative ring-1 ring-black/5">
                <div className="hidden sm:flex items-center justify-between px-6 py-2 bg-[#2D4F1E] text-white text-[11px] font-semibold select-none border-b border-[#233e17] shrink-0">
                  <span>09:41</span>
                  <div className="w-20 h-4 bg-stone-900 rounded-full mx-auto" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="w-4 h-2 border border-white rounded-xs p-0.5 flex items-center">
                      <div className="h-full w-2.5 bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative">
                  <AuthGate />
                </div>
              </div>
            </div>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
