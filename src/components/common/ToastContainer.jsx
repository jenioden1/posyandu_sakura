/**
 * ToastContainer.jsx
 * 
 * Container untuk menampilkan multiple toast notifications
 */

import { useState, useCallback } from 'react';
import Toast from './Toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastIdCounter;
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { showToast, removeToast, toasts };
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none" style={{ maxWidth: '500px' }}>
      <div className="flex flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

