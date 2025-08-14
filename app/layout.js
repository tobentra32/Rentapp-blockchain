import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from './context';
import Header from "./components/Header";
import Footer from "./components/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Blockchain Rent App",
  description: "A decentralized application for managing rental properties",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="">
      <body className="antialiased"> 
        <ContextProvider>
          <Header />
          {children}
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
