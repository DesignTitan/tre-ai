"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/utils";
import type { PlaceSuggestion } from "@/lib/crawl/sources";
import { readRecents, pushRecent, type RecentQuery } from "@/lib/data/recents";

const RANGE_OPTIONS = [5, 10, 25, 50];

export default function PlanTripPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recents, setRecents] = useState<RecentQuery[]>([]);

  useEffect(() => {
    setRecents(readRecents());
  }, []);
  const lastFetchedRef = useRef<string>("");
  const skipNextFetchRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      if (lastFetchedRef.current === q) return;
      lastFetchedRef.current = q;
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: PlaceSuggestion[] };
        if (lastFetchedRef.current !== q) return;
        setSuggestions(data.suggestions ?? []);
        setActiveIndex(-1);
      } catch {
        // typing fast can race; the next keystroke retries
      }
    }, 220);
    return () => clearTimeout(handle);
  }, [query]);

  function chooseSuggestion(s: PlaceSuggestion) {
    skipNextFetchRef.current = true;
    setQuery(s.query);
    setSuggestions([]);
    setShowSuggestions(false);
    void startTripWith(s.query);
  }

  async function startTripWith(q: string) {
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
      pushRecent({ query: q, radiusMi: range });
      const params = new URLSearchParams({ q, radius: String(range) });
      router.push(`/scout?${params.toString()}`);
    } catch {
      setError("Network problem. Try again.");
      setBusy(false);
    }
  }

  function startTrip(e?: FormEvent) {
    e?.preventDefault();
    void startTripWith(query.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
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
        <div className="relative">
          <label className="block">
            <span className="sr-only">City or ZIP</span>
            <div className={cx(
              "bg-card border rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-colors",
              showSuggestions && suggestions.length > 0
                ? "border-ink rounded-b-none"
                : "border-rule focus-within:border-ink"
            )}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-none text-accent">
                <path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleKeyDown}
                placeholder="city or zip"
                className="flex-1 bg-transparent text-[16px] font-semibold text-ink placeholder:text-mute placeholder:font-medium outline-none tracking-tightx min-w-0"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="search"
                aria-autocomplete="list"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls="city-suggestions"
                data-1p-ignore
                data-lpignore="true"
              />
              {query && !busy && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear"
                  className="flex-none text-mute text-[14px] w-5 h-5 rounded-full hover:bg-black/[.04] flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </label>

          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="city-suggestions"
              role="listbox"
              className="
                absolute left-0 right-0 top-full
                bg-card border border-ink border-t-0 rounded-b-2xl
                shadow-soft overflow-hidden z-30
                max-h-[280px] overflow-y-auto
              "
            >
              {suggestions.map((s, i) => (
                <li key={`${s.title}|${s.subtitle}|${i}`} role="option" aria-selected={activeIndex === i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => chooseSuggestion(s)}
                    className={cx(
                      "w-full text-left px-4 py-2.5 border-t border-rule first:border-t-0 transition-colors",
                      activeIndex === i ? "bg-black/[.04]" : "bg-transparent"
                    )}
                  >
                    <div className="text-[14px] font-semibold tracking-tight2 text-ink leading-tight">{s.title}</div>
                    {s.subtitle && (
                      <div className="text-[11px] text-mute mt-0.5 leading-tight truncate">{s.subtitle}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="text-[12px] text-red mt-2 font-medium" role="alert">{error}</div>
        )}

        {recents.length > 0 && (
          <div className="mt-4">
            <span className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase">Recent</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recents.map(r => (
                <button
                  key={r.ts}
                  type="button"
                  onClick={() => {
                    skipNextFetchRef.current = true;
                    setQuery(r.query);
                    setRange(r.radiusMi);
                    setShowSuggestions(false);
                  }}
                  className="text-[11px] rounded-full px-2.5 py-1.5 font-medium bg-card border border-rule text-ink2 active:scale-[.95] transition-transform"
                  title={`${r.radiusMi}mi radius`}
                >
                  {r.query}
                </button>
              ))}
            </div>
          </div>
        )}

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
