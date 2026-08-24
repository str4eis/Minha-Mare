import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Minha Maré — Precificação para marisqueiras",
  description:
    "Organize suas vendas, controle seus gastos e acompanhe o resultado do seu trabalho na maré.",
};

export const viewport: Viewport = {
  themeColor: "#5B2A86",
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
            <div className="w-full max-w-md min-h-dvh bg-white relative flex flex-col shadow-[0_0_60px_-15px_rgba(59,26,92,0.25)]">
              {children}
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
