export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiPermissionEntry {
  method: HttpMethod;
  /** Path template without query string. Can include `{param}` placeholders. */
  pathTemplate: string;
  /** Permission code required for this endpoint. `null` means public endpoint. */
  permission: string | null;
  /** If true, endpoint can be called without auth. */
  isPublic: boolean;
}

