"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header">
    <nav className="navigation" aria-label="Main navigation">
      <Link className="site-brand" href="/" aria-label="ARTT Lawns home" onClick={() => setOpen(false)}>
        <Image src="/images/ARTTLogo.jpg" alt="ARTT" width={650} height={140} sizes="(max-width: 767px) 150px, 190px" className="nav-logo" priority />
        <span className="site-brand-description">Lawns &amp; Garden Maintenance</span>
      </Link>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)}>Menu</button>
      <div id="navigation-links" className={open ? "navigation-links is-open" : "navigation-links"}>
        <ul>{[["/", "Home"], ["/contact", "Contact"], ["/services", "Services"]].map(([href, label]) =>
          <li key={href}><Link href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link></li>
        )}</ul>
        <form action="/search" method="get" className="search-form" onSubmit={() => setOpen(false)}>
          <input type="search" name="query" placeholder="Search" aria-label="Search site" required maxLength={100} />
          <button type="submit">Search</button>
        </form>
      </div>
    </nav>
  </header>;
}

