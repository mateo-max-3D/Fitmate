import React from 'react';
import { useFitmate } from './context/FitmateContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { RestTimerDrawer } from './components/layout/RestTimerDrawer';
import { Navbar } from './components/layout/Navbar';
import { ExploreModule } from './components/modules/ExploreModule';
import { TrainingModule } from './components/modules/TrainingModule';
import { BodyModule } from './components/modules/BodyModule';
import { DashboardModule } from './components/modules/DashboardModule';
import { ProfileModal } from './components/modals/ProfileModal';
import { RoutineModal } from './components/modals/RoutineModal';
import { SyncModal } from './components/modals/SyncModal';
import { Toast } from './components/ui/Toast';

export function App() {
  const { currentUser, currentTab } = useFitmate();

  // If not authenticated, show AuthScreen with the Fitmate Logo
  if (!currentUser) {
    return (
      <>
        <Toast />
        <AuthScreen />
      </>
    );
  }

  return (
    <div className="w-full max-w-md bg-carbon min-h-screen flex flex-col relative shadow-2xl border-x border-forest/40 pb-24">
      <Toast />
      <Header />
      <RestTimerDrawer />

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {currentTab === 'explore' && <ExploreModule />}
        {currentTab === 'training' && <TrainingModule />}
        {currentTab === 'body' && <BodyModule />}
        {currentTab === 'dashboard' && <DashboardModule />}
      </main>

      <Navbar />

      {/* Modals */}
      <ProfileModal />
      <RoutineModal />
      <SyncModal />
    </div>
  );
}

export default App;
