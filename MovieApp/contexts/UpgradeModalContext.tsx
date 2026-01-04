import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ModalState {
  isVisible: boolean;
  requiredPermission: string | null;
  message: string | null;
}

interface UpgradeModalContextType {
  modalState: ModalState;
  showUpgradeModal: (params: { requiredPermission: string; message?: string }) => void;
  hideUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

export const useUpgradeModal = () => {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error('useUpgradeModal must be used within an UpgradeModalProvider');
  }
  return context;
};

export const UpgradeModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isVisible: false,
    requiredPermission: null,
    message: null,
  });

  const showUpgradeModal = useCallback((params: { requiredPermission: string; message?: string }) => {
    setModalState({
      isVisible: true,
      requiredPermission: params.requiredPermission,
      message: params.message || 'This feature requires a higher subscription plan. Please upgrade to continue.',
    });
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setModalState({
      isVisible: false,
      requiredPermission: null,
      message: null,
    });
  }, []);

  return (
    <UpgradeModalContext.Provider value={{ modalState, showUpgradeModal, hideUpgradeModal }}>
      {children}
    </UpgradeModalContext.Provider>
  );
};

