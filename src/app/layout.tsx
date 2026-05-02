import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Cinzel } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "21K Training League",
  description: "Leh Half Marathon · 13 Sept 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} ${cinzel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
