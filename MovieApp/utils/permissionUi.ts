import { PermissionDeniedError } from '../errors/PermissionDeniedError';

/**
 * Returns required permission for a "saved movies" action.
 * We use `saved_movie.manage` for write actions and `saved_movie.read` for read actions.
 */
// Saved Movie permissions
export const SAVED_MOVIE_READ = 'saved_movie.read';
export const SAVED_MOVIE_MANAGE = 'saved_movie.manage';

// Movie permissions
export const MOVIE_WATCH_STREAM = 'movie.watch_stream';

// Comment permissions
export const COMMENT_CREATE = 'comment.create';
export const COMMENT_UPDATE = 'comment.update_own';
export const COMMENT_DELETE = 'comment.delete_own';

// Rating permissions
export const RATING_CREATE = 'rating.create';
export const RATING_UPDATE = 'rating.update';
export const RATING_DELETE = 'rating.delete';

// Subscription permissions
export const SUBSCRIPTION_CANCEL = 'subscription.cancel';
export const SUBSCRIPTION_READ_OWN = 'subscription.read_own';

// Invoice/Order permissions
export const INVOICE_READ_OWN = 'invoice.read_own';
export const ORDER_READ_OWN = 'order.read_own';

// Payment permissions
export const PAYMENT_CHECKOUT = 'payment.checkout';

export function isPermissionDeniedError(err: unknown): err is PermissionDeniedError {
  return err instanceof PermissionDeniedError;
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  if (!Array.isArray(userPermissions) || !Array.isArray(required)) {
    return false;
  }
  return required.some(p => userPermissions.includes(p));
}

/**
 * Check if user has all of the required permissions
 */
export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  if (!Array.isArray(userPermissions) || !Array.isArray(required)) {
    return false;
  }
  return required.every(p => userPermissions.includes(p));
}

