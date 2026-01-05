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
          message: 'Tính năng này đang yêu cầu quý khách nâng cấp tài khoản để trải nghiệm.',
        });
        return true;
      }

      return false;
    },
    [showUpgradeModal]
  );

  return { handleApiError };
}

