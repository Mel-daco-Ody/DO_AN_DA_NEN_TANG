import { useCallback } from 'react';
import { PermissionDeniedError } from '../errors/PermissionDeniedError';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';

/**
 * Centralized handler for API-layer errors.
 *
 * Usage (example):
 *   const { handleApiError } = useApiErrorHandler();
 *   try { ... } catch (e) { handleApiError(e); }
 */
export function useApiErrorHandler() {
  const { showUpgradeModal } = useUpgradeModal();

  const handleApiError = useCallback(
    (error: unknown) => {
      if (error instanceof PermissionDeniedError) {
        showUpgradeModal({
          requiredPermission: error.requiredPermission,
          message: error.message,
        });
        return true;
      }

      return false;
    },
    [showUpgradeModal]
  );

  return { handleApiError };
}

