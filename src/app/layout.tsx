import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  title: { default: "Sauti — Hear Kenya", template: "%s · Sauti" },
  description: "Discover what's playing around you, help artists get heard, and connect with the DJs and matatus shaping Kenya's sound.",
  openGraph: { title: "Sauti — Hear Kenya", description: "Artists promote music. DJs and matatus play it. Sauti tracks the campaign and everyone sees the results.", type: "website" },
  twitter: { card: "summary_large_image", title: "Sauti — Hear Kenya", description: "Discover what's playing around you and help Kenyan music move." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}><body>{children}<Toaster richColors position="top-center" /></body></html>;
}
