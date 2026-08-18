import toast from 'react-hot-toast';

export const showSuccess = (message: string): string =>
  toast.success(message, {
    iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
  });

export const showError = (message: string): string =>
  toast.error(message, {
    iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
  });

export const showWarning = (message: string): string =>
  toast(message, {
    icon: '⚠️',
  });

export const showInfo = (message: string): string => toast(message, { icon: 'ℹ️' });

export const showLoading = (message = 'Please wait…'): string =>
  toast.loading(message);

export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};

export const updateToastToSuccess = (toastId: string, message: string): void => {
  toast.success(message, { id: toastId });
};

export const updateToastToError = (toastId: string, message: string): void => {
  toast.error(message, { id: toastId });
};
