import './globals.css';
import Shell from '@/components/Shell';

export const metadata = {
  title: 'MOG Fitness',
  description: 'Track your journey to 165 lb by Oct 10, 2026',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
