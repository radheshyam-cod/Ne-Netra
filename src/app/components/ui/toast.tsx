import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
export { toast };

/**
 * Toast Notification Provider
 * Wraps the entire app to enable toast notifications throughout
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: 'white',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: 'white',
                        },
                    },
                }}
            />
        </>
    );
}

/**
 * Toast notification helpers
 */
export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    info: (message: string) => toast(message, { icon: 'ℹ️' }),
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => toast.promise(promise, messages),
};
