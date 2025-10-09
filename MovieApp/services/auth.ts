// Legacy auth service - DEPRECATED
// Use AuthContext instead for FilmZone backend integration

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Sample credentials for testing - DEPRECATED
const SAMPLE_USER: User & { password: string } = {
  id: 'u1',
  name: 'Quân Vũ',
  email: 'test@demo.com',
  password: '123456',
};

let currentUser: User | null = null;

export function signInWithEmailPassword(email: string, password: string): { ok: boolean; user?: User; error?: string } {
  // DEPRECATED: This is now handled by AuthContext
  console.warn('signInWithEmailPassword is deprecated. Use AuthContext.signIn instead.');
  
  if (email.trim().toLowerCase() === SAMPLE_USER.email && password === SAMPLE_USER.password) {
    currentUser = { id: SAMPLE_USER.id, name: SAMPLE_USER.name, email: SAMPLE_USER.email };
    return { ok: true, user: currentUser };
  }
  return { ok: false, error: 'Email hoặc mật khẩu không đúng' };
}

export function getCurrentUser(): User | null {
  // DEPRECATED: This is now handled by AuthContext
  console.warn('getCurrentUser is deprecated. Use AuthContext.authState.user instead.');
  return currentUser;
}

export function signOut(): void {
  // DEPRECATED: This is now handled by AuthContext
  console.warn('signOut is deprecated. Use AuthContext.signOut instead.');
  currentUser = null;
}


