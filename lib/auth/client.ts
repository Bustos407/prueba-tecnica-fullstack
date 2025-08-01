import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000/api/auth',
});

export const { useSession } = authClient;
export const { signIn } = authClient;
export const { signOut } = authClient;
