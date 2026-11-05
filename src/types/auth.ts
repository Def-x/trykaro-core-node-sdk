// @defx/storefront-core

export interface AuthUser {
  id?: string | number;
  userId?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface AuthState {
  isSignedIn?: boolean;
  isLoading?: boolean;
  user?: AuthUser | null;
  userId?: string | number | null;
  token?: string | null;
  access_token?: string | null;
  logout?: () => Promise<void> | void;
  openSignIn?: () => void;
  openSignUp?: () => void;
  setAuth?: (auth: AuthState | ((prev: AuthState) => AuthState)) => void;
  clearAuth?: () => void;
  [key: string]: any;
}
