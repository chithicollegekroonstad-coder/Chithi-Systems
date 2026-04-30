export function PageBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-red-50/40 to-white" />
      <div className="absolute top-[-20%] left-1/2 h-[520px] w-[min(1200px,100vw)] -translate-x-1/2 rounded-full bg-gradient-to-br from-red-100/80 via-red-50/50 to-transparent blur-3xl" />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.92_0.02_25_/_0.35)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.02_25_/_0.35)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      />
    </div>
  );
}
