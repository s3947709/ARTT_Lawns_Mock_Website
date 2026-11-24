import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Shared HTML structure for every page.
// {children} is where Next.js inserts the current page's content.
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>

        <Navigation />

        <main id="main-content" className="container">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
