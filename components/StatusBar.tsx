/** iOS-style status bar — purely visual. */
export function StatusBar() {
  return (
    <div className="hidden sm:flex flex-none justify-between items-center px-7 pt-3.5 pb-1 text-[13px] font-semibold text-ink">
      <span>9:41</span>
      <span className="flex gap-1.5 items-center">
        <span className="icon-wifi" aria-hidden />
        <span className="icon-bat" aria-hidden />
      </span>
    </div>
  );
}
