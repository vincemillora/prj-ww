import type { Metadata } from "next";
import {
  Montserrat,
  Parisienne,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { COUPLE } from "@/lib/wedding";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Calligraphic accent for the couple's names (design `Parisienne`).
const parisienne = Parisienne({
  variable: "--font-parisienne",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${COUPLE} — Wedding`,
    template: `%s · ${COUPLE}`,
  },
  description: "Wedding details, celebration information, and RSVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        montserrat.variable,
        parisienne.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
