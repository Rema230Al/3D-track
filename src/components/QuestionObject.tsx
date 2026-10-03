import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  AmbientLight,
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
  type BufferGeometry,
} from "three";
import { CubeIcon } from "./Icons3D";

// One primitive per question, in question order, so every question gets its own object.
const SHAPES: (() => BufferGeometry)[] = [
  () => new BoxGeometry(1.2, 1.2, 1.2),
  () => new SphereGeometry(0.88, 7, 5),
  () => new TorusGeometry(0.62, 0.26, 10, 28),
  () => new ConeGeometry(0.8, 1.5, 16),
  () => new CylinderGeometry(0.66, 0.66, 1.3, 18),
  () => new OctahedronGeometry(0.98),
  () => new IcosahedronGeometry(0.95),
  () => new DodecahedronGeometry(0.92),
  () => new TorusKnotGeometry(0.5, 0.17, 72, 8),
  () => new TetrahedronGeometry(1.08),
  () => new CapsuleGeometry(0.45, 0.7, 4, 12),
  () => new ConeGeometry(0.95, 1.35, 4),
  () => new CylinderGeometry(0.75, 0.75, 1.1, 6),
  () => new IcosahedronGeometry(0.95, 1),
  () => new CylinderGeometry(0.85, 0.85, 1.15, 3),
  () => new TorusKnotGeometry(0.48, 0.14, 96, 8, 3, 4),
  () => new SphereGeometry(0.9, 24, 16),
  () =>
    new LatheGeometry(
      [
        [0.01, -0.8],
        [0.55, -0.75],
        [0.62, -0.35],
        [0.35, 0.15],
        [0.3, 0.55],
        [0.5, 0.8],
      ].map(([x, y]) => new Vector2(x, y)),
      16
    ),
];

const APRICOT = new Color("#ffc49b");
const VIOLET = new Color("#a380ff");

interface Stage {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}

// A single renderer for the whole app: its canvas moves into whichever question is
// on screen, so stepping through questions never piles up WebGL contexts.
let stage: Stage | null | undefined;

function getStage(): Stage | null {
  if (stage !== undefined) return stage;
  try {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    const scene = new Scene();
    scene.add(new AmbientLight(0xffffff, 1.05));
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(2.5, 3, 4);
    const rim = new DirectionalLight(0xa380ff, 1.4);
    rim.position.set(-3, -1, -2);
    scene.add(key, rim);
    const camera = new PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 4.4);
    stage = { renderer, scene, camera };
  } catch {
    stage = null; // no WebGL: the static icon fallback is shown instead
  }
  return stage;
}

/**
 * A small primitive beside the question title, slowly turning. It is a violet
 * wireframe until the question is answered, then shades in solid apricot.
 * Reduced motion: no rotation and no fade, the object just switches state.
 */
export default function QuestionObject({ index, solid, className = "" }: { index: number; solid: boolean; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const target = useRef(solid ? 1 : 0);
  const kick = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    target.current = solid ? 1 : 0;
    kick.current();
  }, [solid]);

  useEffect(() => {
    const el = host.current;
    const s = getStage();
    if (!el || !s) {
      setFailed(true);
      return;
    }
    const { renderer, scene, camera } = s;

    const geometry = SHAPES[index % SHAPES.length]();
    const wireMat = new MeshBasicMaterial({ color: VIOLET, wireframe: true, transparent: true });
    const solidMat = new MeshStandardMaterial({ color: APRICOT, roughness: 0.45, metalness: 0.05, flatShading: true, transparent: true });
    const group = new Group();
    const body = new Mesh(geometry, solidMat);
    const wire = new Mesh(geometry, wireMat);
    wire.scale.setScalar(1.002);
    group.add(body, wire);
    group.rotation.set(0.45, 0.6 + index * 0.7, 0);
    scene.add(group);

    el.appendChild(renderer.domElement);
    const fit = () => {
      const w = el.clientWidth || 64;
      const h = el.clientHeight || w;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();

    let mix = target.current;
    let pop = 0;
    let frame = 0;
    let last = performance.now();

    const draw = () => {
      body.material.opacity = mix;
      body.visible = mix > 0.01;
      wireMat.opacity = 1 - mix * 0.92;
      wireMat.color.copy(VIOLET).lerp(APRICOT, mix);
      group.scale.setScalar(1 + pop * 0.16);
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      group.rotation.y += dt * 0.55;
      group.rotation.x += dt * 0.18;
      const before = mix;
      mix += (target.current - mix) * Math.min(1, dt * 7);
      if (target.current === 1 && before < 0.5 && mix >= 0.5) pop = 1;
      pop *= Math.max(0, 1 - dt * 6);
      draw();
      frame = requestAnimationFrame(tick);
    };

    if (reduce) {
      kick.current = () => {
        mix = target.current;
        draw();
      };
      draw();
    } else {
      kick.current = () => {};
      frame = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(() => {
      fit();
      if (reduce) draw();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      kick.current = () => {};
      scene.remove(group);
      geometry.dispose();
      wireMat.dispose();
      solidMat.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [index, reduce]);

  return (
    <div ref={host} aria-hidden="true" className={`relative ${className}`}>
      {failed && <CubeIcon size="100%" strokeWidth={1.2} className={solid ? "text-tq-apricot" : "text-tq-violet/70"} />}
    </div>
  );
}
