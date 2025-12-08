/**
 * ConfirmDialog.jsx
 * 
 * Komponen dialog konfirmasi yang modern dan menarik
 */

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya, Hapus', cancelText = 'Batal', type = 'danger' }) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      confirmBg: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    warning: {
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      icon: (
        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </h3>
          )}

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white font-medium rounded-lg transition-colors shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

