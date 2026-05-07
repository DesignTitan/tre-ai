/**
 * DeviceFrame — wraps the app in a centered iPhone-style frame on desktop,
 * collapses to fullscreen on mobile. The chrome is purely visual (notch +
 * border + shadow); all real layout happens inside .device-screen.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        min-h-screen min-h-svh
        flex items-center justify-center
        p-0 sm:p-6
        bg-bg
        sm:bg-[radial-gradient(ellipse_at_50%_40%,#F4F1EC_0%,#DDD7C9_100%)]
      "
    >
      {/* Brand pill on desktop */}
      <span
        className="
          hidden sm:inline-flex
          fixed top-6 left-6 items-center
          bg-white/60 backdrop-blur
          px-3.5 py-2 rounded-full
          text-[11px] font-semibold tracking-cadence uppercase
          text-ink border border-black/[.06]
          z-50
        "
      >
        <b className="text-accent font-bold">tre.ai</b>
        <span className="ml-2 text-mute font-medium normal-case tracking-normal">prototype v0.1</span>
      </span>

      <div
        className="
          relative flex-none
          w-screen h-screen h-svh sm:w-[380px] sm:h-[780px]
          rounded-none sm:rounded-[50px]
          bg-[#0B0E11] sm:p-2.5
          shadow-none sm:shadow-device
        "
      >
        {/* Notch (desktop only) */}
        <span
          aria-hidden
          className="
            hidden sm:block
            absolute top-[18px] left-1/2 -translate-x-1/2
            w-[118px] h-[32px] bg-[#0B0E11] rounded-[18px] z-50
          "
        />
        <div className="
          w-full h-full
          rounded-none sm:rounded-[39px]
          bg-bg overflow-hidden
          flex flex-col relative
        ">
          {children}
        </div>
      </div>
    </div>
  );
}
