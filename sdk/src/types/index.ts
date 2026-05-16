export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
