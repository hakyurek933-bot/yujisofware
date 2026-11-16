import './globals.css';
import SiteProvider from '@/components/SiteProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Floating from '@/components/Floating';

export const metadata = {
  title: 'Yujisofware — Premium Game Tools',
  description: 'Undetected premium game tools, anında teslimat, 7/24 destek.',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <SiteProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Floating />
        </SiteProvider>
      </body>
    </html>
  );
}
