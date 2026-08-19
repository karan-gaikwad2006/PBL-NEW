import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false
}) {
  const isDanger = variant === 'danger';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-[#304355]/10 text-[#304355]'}`}>
          {isDanger ? <AlertTriangle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-base font-bold text-[#1F2933]">{title}</h4>
          <p className="text-sm text-[#64707A] mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
