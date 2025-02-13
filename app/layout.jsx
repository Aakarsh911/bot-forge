import { Inter } from "next/font/google";
import Provider from "../components/Provider";
import './global.css';
import MobileNotSupported from '../components/MobileNotSupported';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BotForge",
  description: "A bot building platform",
};

const RootLayout = ({ children }) => (
  <html lang='en'>
    <body>

      <Provider>
          <MobileNotSupported />
        <div className='main'>
          <div className='gradient' />
        </div>

        <main className='app'>
          {children}
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
