import { Sora, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'TaskFlow — Task Management',
  description: 'Manage your tasks efficiently with TaskFlow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0f172a',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
