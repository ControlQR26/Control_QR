import { Providers } from '@/app/providers';
import '@/app/globals.css';

export const metadata = {
  title: 'ControlQR - Sistema de Control de Ingreso',
  description: 'Control de ingreso estudiantil mediante QR y notificaciones automáticas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
