import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import LocalImportPrompt from "@/components/LocalImportPrompt";

export const metadata: Metadata = {
  title: "Minha Maré",
  description: "Organize suas vendas e gastos e acompanhe seus resultados na maré.",
};

export const viewport: Viewport = {
  themeColor: "#7E22CE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans text-mare-ink antialiased">
        <StoreProvider>
          <div className="min-h-dvh w-full bg-mare-bg flex justify-center">
            <div className="relative flex min-h-dvh w-full max-w-md flex-col bg-white shadow-soft">
              <LocalImportPrompt />
              {children}
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
