import type { SVGProps } from "react";

// 3D-software glyphs (cube, sphere, mesh, camera, light, vertices, axes), drawn on a 24px grid
// with currentColor strokes so they take whatever text color they sit in.

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Icon({ size = "1em", children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CubeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4Z" />
    <path d="M4 7.4 12 12l8-4.6M12 12v9.2" />
  </Icon>
);

export const SphereIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="9" ry="3.4" />
    <ellipse cx="12" cy="12" rx="3.6" ry="9" />
  </Icon>
);

export const MeshIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 5h18v14H3Z" />
    <path d="M3 12h18M9 5v14M15 5v14M3 5l6 7-6 7M9 5l6 7-6 7M15 5l6 7-6 7" strokeWidth={1.2} />
  </Icon>
);

export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="7" width="13" height="10" rx="1.6" />
    <path d="m15.5 10.2 6-3.2v10l-6-3.2" />
    <circle cx="9" cy="12" r="2.2" />
  </Icon>
);

export const LightIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="10" r="4.2" />
    <path d="M12 2v1.6M4.2 10H2.6M21.4 10h-1.6M6.5 4.5l1.1 1.1M17.5 4.5l-1.1 1.1M10 17.5h4M10.6 20.6h2.8" />
  </Icon>
);

export const VerticesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 18 9 6l10 3-3 10Z" strokeWidth={1.1} strokeDasharray="2 2" />
    {[
      [5, 18],
      [9, 6],
      [19, 9],
      [16, 19],
    ].map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x - 2} y={y - 2} width="4" height="4" fill="currentColor" stroke="none" />
    ))}
  </Icon>
);

/** X / Y / Z axes in the usual viewport colors. Ignores currentColor on purpose. */
export const AxesIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M7 17h13" stroke="var(--color-ax-x)" />
    <path d="M7 17V3.5" stroke="var(--color-ax-z)" />
    <path d="m7 17-4.2 4.2" stroke="var(--color-ax-y)" />
    <circle cx="7" cy="17" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
);

/**
 * Navigation gizmo like the one in a 3D viewport's corner: three labelled axes
 * around a pivot. Pure decoration.
 */
export function AxesGizmo({ className = "" }: { className?: string }) {
  const axis = (x: number, y: number, color: string, label: string, back = false) => (
    <g>
      <line x1="40" y1="40" x2={x} y2={y} stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity={back ? 0.45 : 1} />
      <circle cx={x} cy={y} r="7.5" fill={back ? "transparent" : color} stroke={color} strokeWidth="1.6" opacity={back ? 0.55 : 1} />
      {!back && (
        <text x={x} y={y + 3.1} textAnchor="middle" fontSize="8.5" fontWeight="800" fontFamily="var(--font-mono)" fill="#0e0b18">
          {label}
        </text>
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="rgb(22 18 37 / 0.6)" stroke="rgb(163 128 255 / 0.18)" />
      {axis(16, 54, "var(--color-ax-x)", "X", true)}
      {axis(58, 54, "var(--color-ax-y)", "Y", true)}
      {axis(40, 68, "var(--color-ax-z)", "Z", true)}
      {axis(22, 26, "var(--color-ax-y)", "Y")}
      {axis(40, 12, "var(--color-ax-z)", "Z")}
      {axis(64, 26, "var(--color-ax-x)", "X")}
      <circle cx="40" cy="40" r="2.4" fill="var(--color-tq-apricot)" />
    </svg>
  );
}
