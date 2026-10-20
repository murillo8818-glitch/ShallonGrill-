// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Shalon Grill | Cardápio Digital',
  description: 'O melhor espetinho de Araguari. Peça pelo nosso cardápio digital!',
  keywords: 'espetinho, churrasco, cardápio, shalon grill, araguari, jóquei clube',
  openGraph: {
    title: 'Shalon Grill | Cardápio Digital',
    description: 'O espetinho que você nunca viu. Peça agora!',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
