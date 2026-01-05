import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';

/**
 * A hook to guard actions based on user permissions.
 * It checks if the user has the required permission before executing an action.
 * If the user lacks permission, it shows an upgrade modal instead.
 *
 * @returns A function `guardAction` that takes a required permission and a callback to execute.
 */
export function usePermissionGuard() {
  const { authState } = useAuth();
  const { showUpgradeModal } = useUpgradeModal();

  const guardAction = useCallback(
    (requiredPermission: string | null, action: () => void | Promise<void>): Promise<void> => {
      if (!requiredPermission) {
        const result = action(); // No permission required, proceed.
        return result instanceof Promise ? result : Promise.resolve();
      }

      const userPermissions = authState.permissions || [];
      const hasPermission = userPermissions.includes(requiredPermission);

      if (hasPermission) {
        const result = action(); // User has permission, proceed.
        return result instanceof Promise ? result : Promise.resolve();
      } else {
        // User lacks permission, show upgrade modal.
        showUpgradeModal({
          requiredPermission,
          message: 'Tính năng này đang yêu cầu quý khách nâng cấp tài khoản để trải nghiệm.',
        });
        // Return a rejected promise to indicate the action was blocked
        return Promise.reject(new Error(`Permission denied: ${requiredPermission}`));
      }
    },
    [authState.permissions, showUpgradeModal]
  );

  return { guardAction };
}

