import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari, Geist_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
// LenisProvider removed — was causing scroll jank. Native scroll is faster.

// ── Self-hosted variable fonts via next/font (DESIGN_INTELLIGENCE §2) ──
// adjustFontFallback prevents FOUT/CLS; display:swap avoids invisible text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Mangal", "Nirmala UI", "sans-serif"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false, // hero-only font — deferred to keep LCP fast
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "ग्राम पंचायत चंद्रा — डिजिटल शासन पोर्टल | Gram Panchayat Chandra",
  description:
    "विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश | OSINT-Verified • DPDP 2023 Compliant • Bilingual (HI/EN) Digital Governance Portal",
  keywords: [
    "Gram Panchayat Chandra",
    "Shankargarh",
    "Prayagraj",
    "Uttar Pradesh",
    "MGNREGA",
    "PMAY-G",
    "Jal Jeevan Mission",
    "GPDP",
    "Digital Governance",
    "3145021064",
  ],
  authors: [{ name: "Gram Panchayat Chandra" }],
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  applicationName: "Gram Panchayat Chandra",
  appleWebApp: {
    capable: true,
    title: "GP Chandra",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    address: false,
    email: true,
  },
  openGraph: {
    title: "Gram Panchayat Chandra — Digital Governance Portal",
    description:
      "OSINT-Verified bilingual portal for Gram Panchayat Chandra, Shankargarh, Prayagraj, UP",
    type: "website",
    locale: "hi_IN",
    siteName: "Gram Panchayat Chandra Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gram Panchayat Chandra — Digital Governance Portal",
    description: "OSINT-Verified bilingual portal — Shankargarh, Prayagraj, UP",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icons/icon-192x192.png"],
    apple: [
      { url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "theme-color": "#0a0a0a",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-tap-highlight": "no",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "GP Chandra",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// ── Blocking inline script — applies .dark class BEFORE paint to prevent FOUC ──
// DESIGN_INTELLIGENCE §7: dark mode default. Reads localStorage, falls back to dark.
const themeInitScript = `
(function(){
  try {
    var raw = localStorage.getItem('gpchandra-theme');
    var theme = 'dark';
    if (raw) {
      var parsed = JSON.parse(raw);
      var stored = parsed && parsed.state && parsed.state.theme;
      if (stored === 'light' || stored === 'dark' || stored === 'auto') theme = stored;
    }
    var resolved = theme;
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = resolved;
  } catch(e) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${notoDevanagari.variable} ${geistMono.variable} ${dmSerif.variable} antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden`}
        style={{ fontFamily: "var(--font-inter), var(--font-devanagari), system-ui, sans-serif" }}
      >
        {/* Grain overlay removed — mix-blend-mode was causing compositing lag */}
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
