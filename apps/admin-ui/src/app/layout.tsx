//import Header from '../shared/widgets/header/header';
import './global.css';
import { Poppins, Roboto } from 'next/font/google';
import Providers from './providers';

export const metadata = {
  title: 'Unimart Admin',
  description: 'Manage Unimart Operations',
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-900 font-sans antialiased ${roboto.variable} ${poppins.variable}`}>
        <Providers>
          {/* <Header /> */}
          {children}
        </Providers>

      </body>
    </html>
  )
}
