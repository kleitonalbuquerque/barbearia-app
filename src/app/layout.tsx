import { Geist, Geist_Mono } from "next/font/google";


import NavMenu from "@/components/NavMenu";
import Footer from "../components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import "./globals.css";
import BrandingEffect from "@/components/BrandingEffect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <TenantProvider>
          <AuthProvider>
            <NavMenu />
            <main className="flex-1">
              <BrandingEffect />
              {children}
            </main>
          </AuthProvider>
        </TenantProvider>
        <Footer />
      </body>
    </html>
  );
}
