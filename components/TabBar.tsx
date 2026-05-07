"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

type Tab = { href: string; label: string; match: (path: string) => boolean; icon: React.ReactNode };

const SCOUT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const TODAY_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M4 9h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const PIPE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]"><path d="M5 5v14M12 9v10M19 13v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const TRIP_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]"><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M5 20c1-4 4.5-5.5 7-5.5s6 1.5 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);

const TABS: Tab[] = [
  { href: "/scout",    label: "Scout",    match: p => p.startsWith("/scout") || p.startsWith("/prospect"), icon: SCOUT_ICON },
  { href: "/today",    label: "Today",    match: p => p.startsWith("/today"),    icon: TODAY_ICON },
  { href: "/pipeline", label: "Pipeline", match: p => p.startsWith("/pipeline"), icon: PIPE_ICON },
  { href: "/plan",     label: "Trip",     match: p => p.startsWith("/plan"),     icon: TRIP_ICON },
];

export function TabBar() {
  const pathname = usePathname() ?? "";
  if (pathname === "/") return null;
  return (
    <nav
      className="
        absolute bottom-0 left-0 right-0
        flex justify-around
        pt-2.5 pb-6
        border-t border-rule
        bg-bg/90 backdrop-blur
        z-30
      "
    >
      {TABS.map(t => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cx(
              "flex flex-col items-center gap-[3px] px-3 py-1 rounded-lg",
              "text-[10px] font-medium transition-colors",
              "active:scale-[.96]",
              active ? "text-ink" : "text-mute"
            )}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
