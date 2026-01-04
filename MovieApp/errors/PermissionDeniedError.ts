export class PermissionDeniedError extends Error {
  public readonly requiredPermission: string;
  public readonly method: string;
  public readonly path: string;

  constructor(params: { requiredPermission: string; method: string; path: string; message?: string }) {
    super(params.message || 'Permission denied');
    this.name = 'PermissionDeniedError';
    this.requiredPermission = params.requiredPermission;
    this.method = params.method;
    this.path = params.path;
  }
}

