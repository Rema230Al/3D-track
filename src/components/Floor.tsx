import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Viewport floor: a perspective grid that recedes to a horizon, like a 3D app's ground
// plane, drifting slowly toward the camera. Drawn on a 2D canvas (a few dozen lines at
// ~30 fps) rather than a huge 3D-transformed CSS layer, which is much lighter on phones.

const HORIZON = 0.36; // horizon height, as a share of the viewport
const CELL = 0.25; // grid spacing in floor units (camera height = 1)
const SPEED = 0.04; // floor units per second
const FAR = 22;

export default function Floor() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let hz = 0;
    let lines: CanvasGradient | null = null;
    let axis: CanvasGradient | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hz = Math.round(h * HORIZON);
      lines = ctx.createLinearGradient(0, hz, 0, h);
      lines.addColorStop(0, "rgb(163 128 255 / 0)");
      lines.addColorStop(0.3, "rgb(163 128 255 / 0.06)");
      lines.addColorStop(1, "rgb(163 128 255 / 0.2)");
      axis = ctx.createLinearGradient(0, hz, 0, h);
      axis.addColorStop(0, "rgb(165 224 122 / 0)");
      axis.addColorStop(1, "rgb(165 224 122 / 0.22)");
    };

    const draw = (t: number) => {
      // Focal length chosen so the nearest line (depth 1) sits on the bottom edge.
      const f = h - hz;
      const cx = w / 2;
      const phase = ((t / 1000) * SPEED) % CELL;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      ctx.strokeStyle = lines!;
      ctx.beginPath();
      // Depth lines (parallel to the horizon), drifting toward the camera.
      for (let z = 1 - phase; z < FAR; z += CELL) {
        if (z < 0.6) continue;
        const y = Math.round(hz + f / z) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      // Lines running into the distance all meet at the vanishing point.
      const step = CELL * f;
      const n = Math.ceil(w / (2 * step)) * 6;
      const near = 1 / 0.6; // start just below the screen (depth 0.6)
      for (let k = -n; k <= n; k++) {
        if (k === 0) continue;
        ctx.moveTo(cx + k * step * near, hz + f * near);
        ctx.lineTo(cx, hz);
      }
      ctx.stroke();

      // The Y axis down the middle, in its viewport green.
      ctx.strokeStyle = axis!;
      ctx.beginPath();
      ctx.moveTo(cx + 0.5, h);
      ctx.lineTo(cx + 0.5, hz);
      ctx.stroke();
    };

    resize();
    let frame = 0;
    let last = -Infinity;
    const loop = (t: number) => {
      if (t - last >= 33) {
        last = t;
        draw(t);
      }
      frame = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      draw(reduce ? 0 : performance.now());
    };
    window.addEventListener("resize", onResize);
    if (reduce) draw(0);
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return <canvas ref={ref} className="floor" aria-hidden="true" />;
}
