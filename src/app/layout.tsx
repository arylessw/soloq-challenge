import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import { Nav } from "@/components/Nav";
import { PwaRegister } from "@/components/PwaRegister";
import { RiotApiBanner } from "@/components/RiotApiBanner";
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

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${dmSans.variable}`}>
      <body>
        <RiotApiBanner />
        <Nav />
        <main className="page-shell">{children}</main>
        <SiteFooter />
        <PwaRegister />
      </body>
    </html>
  );
}
