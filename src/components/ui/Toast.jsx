import React from 'react';
import { useFitmate } from '../../context/FitmateContext';

export const Toast = () => {
  const { toast } = useFitmate();

  if (!toast.show) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-moss text-carbon px-4 py-2.5 rounded-2xl font-heading font-extrabold text-xs shadow-2xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap animate-bounce">
      <i className="fa-solid fa-circle-check text-sm"></i>
      <span>{toast.message}</span>
    </div>
  );
};
