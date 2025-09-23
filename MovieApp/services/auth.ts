export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Sample credentials for testing
const SAMPLE_USER: User & { password: string } = {
  id: 'u1',
  name: 'Quân Vũ',
  email: 'test@demo.com',
  password: '123456',
};

let currentUser: User | null = null;

export function signInWithEmailPassword(email: string, password: string): { ok: boolean; user?: User; error?: string } {
  if (email.trim().toLowerCase() === SAMPLE_USER.email && password === SAMPLE_USER.password) {
    currentUser = { id: SAMPLE_USER.id, name: SAMPLE_USER.name, email: SAMPLE_USER.email };
    return { ok: true, user: currentUser };
  }
  return { ok: false, error: 'Email hoặc mật khẩu không đúng' };
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function signOut(): void {
  currentUser = null;
}


