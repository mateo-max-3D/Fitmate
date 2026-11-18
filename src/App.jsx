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
import { ConfirmModal } from './components/ui/ConfirmModal';

export function App() {
  const { currentUser, currentModule, confirmModal, closeConfirm } = useFitmate();

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="w-full max-w-md bg-carbon min-h-screen flex flex-col relative shadow-2xl border-x border-forest/40 pb-12">
      <Header />
      <Drawer />
      <RestTimerDrawer />

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {currentModule === 'explore'    && <ExploreModule />}
        {currentModule === 'routines'   && <TrainingModule />}
        {currentModule === 'calendar'   && <CalendarModule />}
        {currentModule === 'body'       && <BodyModule />}
        {currentModule === 'dashboard'  && <DashboardModule />}
      </main>

      {/* Global Modals */}
      <SyncModal />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        isDanger={confirmModal.isDanger}
        onConfirm={() => {
          confirmModal.onConfirm?.();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default App;
