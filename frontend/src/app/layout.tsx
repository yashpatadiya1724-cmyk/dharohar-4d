import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

export const viewport: Viewport = {
  themeColor: "#0a0f1d",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Dharohar 4D — Neural Heritage Digital Twin & Ancient Epigraphy Engine",
  description: "IIT Gandhinagar Blithchron '27 Heritage Revitalisation Engine (HC26-CULT01) | 3D Stepwell Twin, 4D Time-Travel, AI Stone Epigraphy & Spatial Journeys",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Cinzel:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
              {children}
            </main>
            <BottomNav />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
