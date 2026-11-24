import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteTemplate from "@/templates/SiteTemplate";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ARTT Lawns and Garden Maintenance", template: "%s | ARTT Lawns" },
  description: "ARTT Lawns and Garden Maintenance mock website and before-and-after gallery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <SiteTemplate>{children}</SiteTemplate>;
}

