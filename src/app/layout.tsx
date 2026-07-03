import type { Metadata } from "next";
import { Barlow_Condensed, Cinzel, DM_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { SiteThemeProvider } from "@/components/SiteThemeProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { RiotApiBanner } from "@/components/RiotApiBanner";
import { SiteAdLayout } from "@/components/SiteAdLayout";
import { SiteFooter } from "@/components/SiteFooter";
import { siteMetadata } from "@/lib/site-metadata";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-condensed",
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cinzel.variable} ${dmSans.variable} ${barlow.variable}`}
      data-site-theme="gold"
    >
      <body>
        <SiteThemeProvider>
          <RiotApiBanner />
          <Nav />
          <SiteAdLayout>
            <main className="page-shell">{children}</main>
          </SiteAdLayout>
          <SiteFooter />
          <PwaRegister />
        </SiteThemeProvider>
      </body>
    </html>
  );
}
