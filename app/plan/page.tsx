"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/utils";

const RANGE_OPTIONS = [5, 10, 25, 50];
const QUICK_PICKS = [
  { label: "Detroit, MI", q: "Detroit, MI" },
  { label: "Grand Rapids, MI", q: "Grand Rapids, MI" },
  { label: "Cleveland, OH", q: "Cleveland, OH" },
  { label: "Pittsburgh, PA", q: "Pittsburgh, PA" },
  { label: "Indianapolis, IN", q: "Indianapolis, IN" },
];

export default function PlanTripPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startTrip(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("Enter a city or ZIP code.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setError("Couldn't find that location. Try a city + state, or ZIP.");
        setBusy(false);
        return;
      }
      const params = new URLSearchParams({ q, radius: String(range) });
      router.push(`/scout?${params.toString()}`);
    } catch {
      setError("Network problem. Try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="px-6 pt-3.5 pb-0.5">
        <div className="text-[11px] text-accent font-semibold tracking-cadence uppercase">New trip</div>
        <h2 className="text-[30px] font-semibold tracking-tighter mt-1 leading-[1.05]">
          Where are you<br />headed?
        </h2>
        <p className="text-[13px] text-mute mt-1.5">Drop a city or ZIP. We&apos;ll crawl the area and surface owners likely thinking about an exit.</p>
      </div>

      <form onSubmit={startTrip} className="px-6 mt-4.5">
        <label className="block">
          <span className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase">City or ZIP</span>
          <div className="mt-2 bg-card border border-rule rounded-2xl px-4 py-3.5 flex items-center gap-3 focus-within:border-ink transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-none text-accent">
              <path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Detroit, MI · 90210 · Cleveland Heights, OH"
              className="flex-1 bg-transparent text-[16px] font-semibold text-ink placeholder:text-mute placeholder:font-medium outline-none tracking-tightx min-w-0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="search"
            />
          </div>
        </label>

        {error && (
          <div className="text-[12px] text-red mt-2 font-medium" role="alert">{error}</div>
        )}

        <div className="mt-4">
          <span className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase">Quick picks</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_PICKS.map(qp => (
              <button
                key={qp.q}
                type="button"
                onClick={() => setQuery(qp.q)}
                className="text-[11px] rounded-full px-2.5 py-1.5 font-medium bg-card border border-rule text-ink2 active:scale-[.95] transition-transform"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase">Drive radius</span>
            <b className="text-[13px] text-ink font-semibold tracking-tight2">{range} miles</b>
          </div>
          <div className="flex gap-1.5">
            {RANGE_OPTIONS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setRange(v)}
                className={cx(
                  "flex-1 text-[12px] font-medium rounded-full py-2 border transition-colors active:scale-[.95]",
                  range === v ? "bg-ink text-white border-ink" : "bg-card text-ink2 border-rule"
                )}
              >
                {v}mi
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 mb-6 rounded-2xl border border-rule bg-card/60 p-3.5">
          <div className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase mb-1.5">What gets crawled</div>
          <ul className="text-[12px] text-ink2 leading-[1.45] space-y-1">
            <li>· OpenStreetMap business POIs in the radius (skilled trades, manufacturing, professional services)</li>
            <li>· Chains and franchises filtered out</li>
            <li>· Score model is provisional — owner & succession data fills in once enrichment ships</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="
            w-full bg-ink text-white rounded-2xl p-4
            flex justify-between items-center font-semibold
            shadow-cta active:scale-[.98] transition-transform
            disabled:opacity-60 disabled:scale-100
            mb-6
          "
        >
          <span className="text-[15px] tracking-tight2">{busy ? "Locating…" : "Start trip"}</span>
          <span className="text-[11px] opacity-70 font-medium">{range}mi radius</span>
        </button>
      </form>
    </div>
  );
}
