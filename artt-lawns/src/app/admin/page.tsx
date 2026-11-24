import AdminDashboard from "@/components/AdminDashboard";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default function Page() { return <AdminDashboard />; }

