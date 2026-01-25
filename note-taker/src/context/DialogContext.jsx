import React, { createContext, useState, useContext, useCallback } from 'react';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import './Dialog.css';

const DialogContext = createContext(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    variant: 'primary' // 'primary' or 'danger'
  });

  const showAlert = useCallback((title, message, confirmText = 'OK') => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'alert',
        confirmText,
        variant: 'primary',
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((options) => {
    const { 
      title, 
      message, 
      confirmText = 'Confirm', 
      cancelText = 'Cancel', 
      variant = 'primary' 
    } = options;

    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal 
        isOpen={dialog.isOpen} 
        onClose={dialog.onCancel || dialog.onConfirm}
        showCloseButton={false}
        size="sm"
      >
        <div className="dialog-container">
          <div className="dialog-header">
            <h3>{dialog.title}</h3>
          </div>
          <div className="dialog-body">
            <p>{dialog.message}</p>
          </div>
          <div className="dialog-actions">
            {dialog.type === 'confirm' && (
              <Button 
                variant="ghost" 
                onClick={dialog.onCancel}
              >
                {dialog.cancelText}
              </Button>
            )}
            <Button 
              variant={dialog.variant} 
              onClick={dialog.onConfirm}
            >
              {dialog.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};
