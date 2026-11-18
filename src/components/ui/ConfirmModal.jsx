import React from 'react';

/**
 * Modal de confirmación in-app.
 * Reemplaza window.confirm() con una UI propia de GOT.
 *
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string
 *  - confirmLabel?: string  (default "Eliminar")
 *  - cancelLabel?: string   (default "Cancelar")
 *  - isDanger?: boolean     (botón confirm en rojo vs musgo)
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export const ConfirmModal = ({
  isOpen,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xs bg-carbonCard border border-forest rounded-3xl shadow-2xl p-6 space-y-5 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${isDanger ? 'bg-red-950/60' : 'bg-forest'}`}>
          <i className={`fa-solid ${isDanger ? 'fa-triangle-exclamation text-red-400' : 'fa-circle-question text-moss'} text-xl`}></i>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="font-heading font-extrabold text-base text-cream">{title}</h3>
          {message && (
            <p className="text-xs text-cream/70 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl border border-forest bg-carbon hover:bg-forest/50 text-cream/80 text-xs font-bold transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold font-heading transition-all ${
              isDanger
                ? 'bg-red-700 hover:bg-red-600 text-white border border-red-600'
                : 'bg-moss hover:bg-moss/90 text-carbon'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
