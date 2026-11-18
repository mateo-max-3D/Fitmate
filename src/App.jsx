import React from 'react';
import { useFitmate } from './context/FitmateContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/layout/Header';
import { Drawer } from './components/layout/Drawer';
import { RestTimerDrawer } from './components/layout/RestTimerDrawer';
import { ExploreModule } from './components/modules/ExploreModule';
import { TrainingModule } from './components/modules/TrainingModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { BodyModule } from './components/modules/BodyModule';
import { DashboardModule } from './components/modules/DashboardModule';
import { SyncModal } from './components/modals/SyncModal';
import { Toast } from './components/ui/Toast';

export function App() {
  const { currentUser, currentModule } = useFitmate();

  // If not logged in, show Auth Screen with Fitmate Logo
  if (!currentUser) {
    return (
      <>
        <Toast />
        <AuthScreen />
      </>
    );
  }

  return (
    <div className="w-full max-w-md bg-carbon min-h-screen flex flex-col relative shadow-2xl border-x border-forest/40 pb-12">
      <Toast />
      <Header />
      <Drawer />
      <RestTimerDrawer />

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {currentModule === 'explore' && <ExploreModule />}
        {currentModule === 'routines' && <TrainingModule />}
        {currentModule === 'calendar' && <CalendarModule />}
        {currentModule === 'body' && <BodyModule />}
        {currentModule === 'dashboard' && <DashboardModule />}
      </main>

      {/* Global Modals */}
      <SyncModal />
    </div>
  );
}

export default App;
