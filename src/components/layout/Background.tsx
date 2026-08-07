/**
 * Static ambient layer: a subtle ink grid + radial vignette.
 * Deliberately motionless — the only ambient motion on the site are the
 * per-section glyphs (SectionDecor), so the atmosphere has one voice and
 * mobile GPUs are left alone (the old animated blur blobs were removed).
 */
export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      {/* Ink grid — light mode */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,90,240,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,90,240,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ink grid — dark mode, slightly stronger */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(125,137,244,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125,137,244,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial vignette — fades edges for depth */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(255,255,255,0.6) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(3,7,18,0.7) 100%)',
        }}
      />
    </div>
  )
}
