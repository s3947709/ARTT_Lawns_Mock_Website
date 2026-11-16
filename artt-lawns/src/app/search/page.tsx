import type { Metadata } from "next";
import { Suspense } from "react";
import SiteSearch from "@/components/SiteSearch";
export const metadata: Metadata = { title: "Search" };
export default function SearchPage() {
  return <Suspense fallback={<p>Loading search…</p>}><SiteSearch /></Suspense>;
}

