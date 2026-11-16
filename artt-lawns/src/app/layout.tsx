import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ARTT Lawns and Garden Maintenance", template: "%s | ARTT Lawns" },
  description: "ARTT Lawns and Garden Maintenance mock website and before-and-after gallery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Navigation />
    <main id="main-content" className="container">{children}</main>
    <Footer />
  </body></html>;
}

