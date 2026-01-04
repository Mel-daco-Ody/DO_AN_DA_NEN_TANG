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
    (requiredPermission: string | null, action: () => void) => {
      if (!requiredPermission) {
        action(); // No permission required, proceed.
        return;
      }

      const userPermissions = authState.permissions || [];
      const hasPermission = userPermissions.includes(requiredPermission);

      if (hasPermission) {
        action(); // User has permission, proceed.
      } else {
        // User lacks permission, show upgrade modal.
        showUpgradeModal({
          requiredPermission,
          message: `Tính năng này yêu cầu quyền '${requiredPermission}'. Vui lòng nâng cấp tài khoản của bạn.`,
        });
      }
    },
    [authState.permissions, showUpgradeModal]
  );

  return { guardAction };
}

