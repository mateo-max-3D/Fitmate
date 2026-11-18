import React from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const Navbar = () => {
  const { currentTab, setCurrentTab } = useFitmate();

  const navItems = [
    { id: 'explore', label: 'Explorar', icon: 'fa-solid fa-person' },
    { id: 'training', label: 'Entrenar', icon: 'fa-solid fa-dumbbell' },
    { id: 'body', label: 'Cuerpo', icon: 'fa-solid fa-ruler' },
    { id: 'dashboard', label: 'Progreso', icon: 'fa-solid fa-chart-line' }
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-forest border-t border-forestLight px-2 py-2 z-40 flex justify-around items-center shadow-2xl">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl transition-all ${
              isActive
                ? 'text-moss bg-carbon/40'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-semibold'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
