"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const pages = [
  { href: "/", title: "Home", description: "About ARTT Lawns and Garden Maintenance, our story, team and business information. Before and after job gallery. Get a quote." },
  { href: "/contact", title: "Contact", description: "Contact details will be added here." },
  { href: "/services", title: "Services", description: "Lawns and garden maintenance. Service details will be added here." },
];

export default function SiteSearch() {
  const query = (useSearchParams().get("query") ?? "").trim().slice(0, 100);
  const results = query ? pages.filter((page) => `${page.title} ${page.description}`.toLowerCase().includes(query.toLowerCase())) : [];
  return <>
    <h1>Search</h1>
    {!query ? <p>Use the search box to find a page.</p> : <>
      <p>Results for &ldquo;{query}&rdquo;</p>
      {results.length ? <ul className="search-results">{results.map((page) => <li key={page.href}><Link href={page.href}>{page.title}</Link><p>{page.description}</p></li>)}</ul> : <p>No pages found. Try &ldquo;garden&rdquo;, &ldquo;services&rdquo; or &ldquo;contact&rdquo;.</p>}
    </>}
  </>;
}

