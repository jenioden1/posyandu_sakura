/**
 * ToastContext.jsx
 * 
 * Context untuk mengelola toast notifications di seluruh aplikasi
 */

import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer, { useToast } from '../components/common/ToastContainer';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const { showToast, removeToast, toasts } = useToast();

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    return showToast(message, type, duration);
  }, [showToast]);

  const value = {
    toast,
    success: (message, duration) => toast(message, 'success', duration),
    error: (message, duration) => toast(message, 'error', duration),
    warning: (message, duration) => toast(message, 'warning', duration),
    info: (message, duration) => toast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

