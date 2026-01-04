import { API_PERMISSIONS } from '../constants/api-permission-map';
import { ApiPermissionEntry, HttpMethod } from '../types/api-permissions';

export interface MatchedPermission {
  entry: ApiPermissionEntry;
  /** Clean path (no query string) that was matched */
  path: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const templateToRegex = (template: string) => {
  // Split by {param} placeholders
  // Example: /users/{id} => ^/users/[^/]+$
  const parts = template.split(/\{[^}]+\}/g).map(escapeRegex);
  const placeholderCount = (template.match(/\{[^}]+\}/g) || []).length;

  let pattern = '';
  for (let i = 0; i < parts.length; i++) {
    pattern += parts[i];
    if (i < placeholderCount) pattern += '[^/]+';
  }

  return new RegExp(`^${pattern}$`);
};

// Cache compiled regex for performance
const compiled = API_PERMISSIONS.map((e) => ({
  entry: e,
  regex: templateToRegex(e.pathTemplate),
}));

/**
 * Find the permission entry that matches the given HTTP method and path.
 * Policy: return null if no match (loose).
 */
export function matchApiPermission(method: string, endpoint: string): MatchedPermission | null {
  const httpMethod = (method || 'GET').toUpperCase() as HttpMethod;
  const path = endpoint.split('?')[0];

  for (const { entry, regex } of compiled) {
    if (entry.method !== httpMethod) continue;
    if (regex.test(path)) {
      return { entry, path };
    }
  }

  return null;
}

