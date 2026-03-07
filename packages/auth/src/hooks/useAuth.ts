import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';

/**
 * Convenience hook for consuming the AuthContext.
 *
 * Must be used inside an `<AuthProvider>`. Throws at development time
 * if the provider is missing so bugs surface early.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth() must be used within an <AuthProvider>. ' +
        'Wrap your component tree with <AuthProvider> from @ai-learning/auth.',
    );
  }

  return context;
}
