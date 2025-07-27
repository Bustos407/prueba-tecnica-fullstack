import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { UserRoleProvider } from '@/lib/auth/UserRoleContext';

const App = ({ Component, pageProps }: AppProps) => (
  <UserRoleProvider>
    <Component {...pageProps} />
  </UserRoleProvider>
);

export default App;
