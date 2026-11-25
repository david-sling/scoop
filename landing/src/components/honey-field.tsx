import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

/** A point of light in scene units, with a strength from 0 to 1. */
export type Light = { x: number; y: number; on: number };

type Geometry = {
  /** Size of the drawing the honeycomb is measured in. */
  w: number;
  h: number;
  /** Cell size from centre to point. */
  a: number;
  /** Centre of cell (0, 0). */
  x0: number;
  y0: number;
};

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * Every pixel finds the honeycomb cell it is in. Each cell is a flat plate with its own small
 * fixed lean, so it catches the one shared light a little differently from its neighbours.
 * The cursor and the travelling signal push the plates near them to lean further, which is
 * what makes the light sweep across them. Everything stays in the one cream hue of the page;
 * only lightness changes. Nothing is drawn as an outline: cells show only
 * because their surfaces answer the light differently.
 */
const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uOrigin;
uniform float uScale;
uniform float uTime;
uniform vec2 uLight;
uniform vec3 uHover;
uniform vec3 uSignal;
uniform vec3 uCell;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  float A = uCell.x;
  float HH = A * 0.8660254;
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 p = (px - uOrigin) / uScale;

  // The nearest cell centre, checked over the three closest columns.
  float cw = 1.5 * A;
  float cf = floor((p.x - uCell.y) / cw + 0.5);
  vec2 centre = vec2(0.0);
  vec2 id = vec2(0.0);
  float best = 1e9;
  for (int i = -1; i <= 1; i++) {
    float col = cf + float(i);
    float off = mod(col, 2.0) > 0.5 ? HH : 0.0;
    float row = floor((p.y - uCell.z - off) / (2.0 * HH) + 0.5);
    vec2 c = vec2(uCell.y + cw * col, uCell.z + off + 2.0 * HH * row);
    float d = distance(p, c);
    if (d < best) {
      best = d;
      centre = c;
      id = vec2(col, row);
    }
  }

  float h1 = hash(id + 3.1);
  float h2 = hash(id + 19.7);
  float h3 = hash(id + 41.3);

  // The plate's own lean, then the extra lean towards the signal. The cursor does not
  // change how plates are lit. It only shrinks them, further down.
  vec3 N = normalize(vec3((vec2(h2, h3) - 0.5) * 0.2, 1.0));
  vec2 hv = (centre - uHover.xy) / 230.0;
  float hw = exp(-dot(hv, hv)) * uHover.z;
  vec2 sv = (centre - uSignal.xy) / 130.0;
  float sw = exp(-dot(sv, sv)) * uSignal.z;
  N = normalize(N + vec3(-sv * sw * 0.9, 0.0));

  vec2 s = (px - 0.5 * uRes) / uRes.y;
  vec3 V = normalize(vec3(-s.x, s.y, 1.15));
  vec3 L = normalize(vec3(uLight, 1.0));
  vec3 Hv = normalize(L + V);
  float ndh = max(dot(N, Hv), 0.0);

  // Cream, lighter where the plate faces the light.
  vec3 shade = vec3(0.982, 0.928, 0.878);
  vec3 bright = vec3(1.0, 0.988, 0.972);
  vec3 col = mix(shade, bright, smoothstep(0.93, 1.0, ndh));

  // One hue only. Near the signal the plates swing further between shade
  // and bright, so the light is easier to see there, but the colour never changes.
  float swing = dot(Hv.xy - N.xy, vec2(0.8, 0.6));
  col = mix(col, mix(shade, bright, 0.5 + 0.5 * sin(swing * 9.0 + h1 * 2.0)), 0.4 * sw);
  // A small glint where a plate faces the light head on.
  col += pow(ndh, 220.0) * 0.05;

  // Plates near the cursor shrink about their own centres, the closest ones the most. The
  // gaps that open between them show a slightly deeper cream, like the board underneath.
  vec2 v = abs(p - centre);
  float reach = max(v.y, 0.5 * v.y + 0.8660254 * v.x) / HH;
  float size = 1.0 - 0.2 * hw * hw;
  float edge = 1.5 / (uScale * HH);
  float plate = 1.0 - smoothstep(size - edge, size + edge, reach);
  col = mix(col, shade * vec3(0.975, 0.965, 0.955), (1.0 - plate) * smoothstep(0.03, 0.25, hw));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/**
 * The honeycomb behind the whole hero, drawn by the graphics card. It lines up with the
 * drawing that holds the logos (found by `sceneId`). Where that drawing is not shown, on
 * narrow screens, the honeycomb is simply centred. Without WebGL the hero stays plain cream.
 */
export function HoneyField({
  sceneId,
  geometry,
  signal,
}: {
  sceneId: string;
  geometry: Geometry;
  signal: RefObject<Light>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes");
    const uOrigin = u("uOrigin");
    const uScale = u("uScale");
    const uTime = u("uTime");
    const uLight = u("uLight");
    const uHover = u("uHover");
    const uSignal = u("uSignal");
    gl.uniform3f(u("uCell"), geometry.a, geometry.x0, geometry.y0);

    // Where the scene sits inside the canvas, in canvas pixels.
    const view = { ox: 0, oy: 0, scale: 1, dpr: 1 };
    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(box.width * dpr));
      const height = Math.max(1, Math.round(box.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      const scene = document.getElementById(sceneId)?.getBoundingClientRect();
      if (scene && scene.width > 0) {
        view.scale = (scene.width / geometry.w) * dpr;
        view.ox = (scene.left - box.left) * dpr;
        view.oy = (scene.top - box.top) * dpr;
      } else {
        view.scale = 0.8 * dpr;
        view.ox = width / 2 - (geometry.w / 2) * view.scale;
        view.oy = height / 2 - (geometry.h / 2) * view.scale;
      }
      view.dpr = dpr;
      return box;
    };

    const target = { x: 0, y: 0, on: 0 };
    const hover = { x: 0, y: 0, on: 0 };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const box = canvas.getBoundingClientRect();
      target.x = ((e.clientX - box.left) * view.dpr - view.ox) / view.scale;
      target.y = ((e.clientY - box.top) * view.dpr - view.oy) / view.scale;
      const inside =
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom;
      if (inside && hover.on < 0.01) {
        hover.x = target.x;
        hover.y = target.y;
      }
      target.on = inside ? 1 : 0;
    };
    const leave = () => {
      target.on = 0;
    };

    let frame = 0;
    const start = performance.now();
    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      measure();
      hover.x += (target.x - hover.x) * 0.18;
      hover.y += (target.y - hover.y) * 0.18;
      hover.on += (target.on - hover.on) * 0.08;
      // With reduced motion the shared light stays put. The cursor still lights what it is over.
      const t = reduced ? 0 : (performance.now() - start) / 1000;
      const s = signal.current ?? { x: 0, y: 0, on: 0 };
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uOrigin, view.ox, view.oy);
      gl.uniform1f(uScale, view.scale);
      gl.uniform1f(uTime, t);
      gl.uniform2f(
        uLight,
        -0.1 + 0.22 * Math.sin(t * 0.11),
        0.3 + 0.14 * Math.cos(t * 0.083),
      );
      gl.uniform3f(uHover, hover.x, hover.y, hover.on);
      gl.uniform3f(uSignal, s.x, s.y, s.on);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    frame = requestAnimationFrame(draw);

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [sceneId, geometry, signal, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 size-full"
    />
  );
}
