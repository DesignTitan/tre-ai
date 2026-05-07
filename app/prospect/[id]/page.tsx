import { PROSPECTS } from "@/lib/data/prospects";
import ProspectDetailClient from "./client";

export function generateStaticParams() {
  return PROSPECTS.map((p) => ({ id: p.id }));
}

export default function Page() {
  return <ProspectDetailClient />;
}
