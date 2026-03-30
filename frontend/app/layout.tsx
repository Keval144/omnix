import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import App from "@/app/app";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Omnix - AI-Powered Notebooks",
    template: "%s | Omnix",
  },
  description:
    "Omnix turns scattered ideas, class notes, meetings, and research into clean AI-generated notebooks that are easy to review, share, and act on.",
  keywords: ["AI", "machine learning", "notebooks", "data science", "Python", "Jupyter"],
  authors: [{ name: "Omnix" }],
  openGraph: {
    title: "Omnix - AI-Powered Notebooks",
    description: "Transform your ideas into clean AI-generated notebooks",
    url: "https://omnix.easelabs.in/",
    siteName: "Omnix",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omnix - AI-Powered Notebooks",
    description: "Transform your ideas into clean AI-generated notebooks",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${syne.variable}   antialiased`}>
        <App>{children}</App>
      </body>
    </html>
  );
}
