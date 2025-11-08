import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revista Portal - Gerenciamento de Quadrinhos",
  description: "Portal completo para gerenciamento de revistas em quadrinhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2025 Revista Portal. Todos os direitos reservados.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
