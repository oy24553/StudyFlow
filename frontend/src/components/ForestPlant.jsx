export default function ForestPlant({ pct = 0, active = false, variant = 'focus' }) {
  const p = clamp01((pct || 0) / 100);
  const stage = p < 0.18 ? 0 : p < 0.45 ? 1 : p < 0.78 ? 2 : 3;

  const trunkH = 14 + Math.round(32 * p);
  const canopyS = 0.65 + 0.55 * p;
  const bud = stage >= 1 ? 1 : 0;
  const leaves = stage >= 2 ? 1 : 0;
  const crown = stage >= 3 ? 1 : 0;

  const tint =
    variant === 'break'
      ? { canopy: '#0f766e', leaf: '#14b8a6' }
      : variant === 'long'
        ? { canopy: '#16a34a', leaf: '#22c55e' }
        : { canopy: '#15803d', leaf: '#22c55e' };

  return (
    <div className={`forest-plant ${active ? 'active' : ''}`} style={{ '--active': active ? 1 : 0 }}>
      <svg viewBox="0 0 120 120" role="img" aria-label="Growth">
        {/* Ground */}
        <ellipse cx="60" cy="98" rx="34" ry="10" fill="rgba(180, 83, 9, .18)" />
        <ellipse cx="60" cy="100" rx="28" ry="8" fill="rgba(180, 83, 9, .28)" />

        {/* Trunk */}
        <rect
          x="56"
          y={92 - trunkH}
          width="8"
          height={trunkH}
          rx="4"
          fill="rgba(132, 78, 30, .95)"
        />

        {/* Canopy group */}
        <g className="canopy" transform={`translate(60 ${92 - trunkH}) scale(${canopyS}) translate(-60 -${92 - trunkH})`}>
          {/* Bud */}
          <circle cx="60" cy={68 - trunkH * 0.15} r="10" fill={tint.canopy} opacity={0.35 + 0.35 * bud} />
          <circle cx="50" cy={74 - trunkH * 0.15} r="9" fill={tint.canopy} opacity={0.25 + 0.45 * bud} />
          <circle cx="70" cy={74 - trunkH * 0.15} r="9" fill={tint.canopy} opacity={0.25 + 0.45 * bud} />

          {/* Leaves */}
          <circle cx="60" cy={60 - trunkH * 0.15} r="14" fill={tint.leaf} opacity={0.12 + 0.62 * leaves} />
          <circle cx="44" cy={70 - trunkH * 0.15} r="12" fill={tint.leaf} opacity={0.10 + 0.55 * leaves} />
          <circle cx="76" cy={70 - trunkH * 0.15} r="12" fill={tint.leaf} opacity={0.10 + 0.55 * leaves} />

          {/* Crown */}
          <circle cx="60" cy={54 - trunkH * 0.15} r="16" fill={tint.leaf} opacity={0.08 + 0.55 * crown} />
        </g>
      </svg>
    </div>
  );
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

