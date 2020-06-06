const debug = require('debug')('raymarch');
import { vec2, vec3 } from './gl';

const CLEAR_SCREEN = '\x1b[2J';
const CURSOR_HOME = '\x1b[1;1H';
const CURSOR_HIDE = '\x1b[?25l';
const CURSOR_SHOW = '\x1b[?25h';

const rgb = (v: vec3) => `\x1b[38;2;${v.x};${v.y};${v.z}m`;
const bgRgb = (v: vec3) => `\x1b[48;2;${v.x};${v.y};${v.z}m`;

const boundColour = c => {
  if (c < 0) {
    c = 0;
  } else if (c > 1) {
    c = 1;
  }
  return ~~(c * 255);
};
const colour = (v: vec3): vec3 =>
  new vec3(boundColour(v.x), boundColour(v.y), boundColour(v.z));

//################################################################################

let t = 0;

const sdfSphere = (p: vec3, c: vec3, r: number): number =>
  p.sub(c).length() - r;

const sdfTorus = (p: vec3, c: vec3, r1: number, r2: number): number => {
  const q = new vec2(new vec2(p.x - c.x, p.z - c.z).length() - r1, p.y - c.y);
  return q.length() - r2;
};

const getDist = (p: vec3): number => {
  const distances = [];

  distances.push(p.y); // horizontal plane at y=0;
  distances.push(sdfSphere(p, new vec3(0.25, 1, 6 + Math.sin(t)), 1));

  distances.push(
    sdfSphere(p, new vec3(-1.25, 0.5, 5 + Math.sin(t + 3.141) * 0.5), 0.5),
  );

  distances.push(
    sdfSphere(p, new vec3(1.5, 0.25 + Math.abs(Math.sin(t) * 0.5), 4), 0.25),
  );
  // distances.push(
  //   sdfSphere(p, new vec3(2, 0.25 + Math.abs(Math.sin(t + 1) * 0.5), 4), 0.25),
  // );
  // distances.push(
  //   sdfSphere(
  //     p,
  //     new vec3(2.5, 0.25 + Math.abs(Math.sin(t + 2) * 0.5), 4),
  //     0.25,
  //   ),
  // );
  // distances.push(
  //   sdfSphere(p, new vec3(3, 0.25 + Math.abs(Math.sin(t + 3) * 0.5), 4), 0.25),
  // );
  // distances.push(
  //   sdfSphere(
  //     p,
  //     new vec3(3.5, 0.25 + Math.abs(Math.sin(t + 4) * 0.5), 4),
  //     0.25,
  //   ),
  // );
  // distances.push(sdfTorus(p, new vec3(0, 3, 6), 5, 0.1));
  return Math.min(...distances);
};

const castRay = (origin: vec3, dir: vec3): number => {
  debug('castRay(origin=%o, dir=%o)', origin, dir);
  let dist = 0;

  for (let i = 0; i < 128; i++) {
    const p = origin.add(dir.mul(dist));
    debug('p=%o', p);
    const marchDist = getDist(p);
    debug('marchDist=%d', marchDist);
    dist = dist + marchDist;
    debug('dist=%d', dist);
    if (dist > 100) {
      debug('out of scene');
      break;
    }
    if (marchDist < 0.01) {
      debug('hit');
      break;
    }
  }

  return dist;
};

const calcNormal = (p: vec3): vec3 => {
  const d = getDist(p);
  const n = new vec3(
    d - getDist(new vec3(p.x - 0.01, p.y, p.z)),
    d - getDist(new vec3(p.x, p.y - 0.01, p.z)),
    d - getDist(new vec3(p.x, p.y, p.z - 0.01)),
  );
  return n.normalise();
};

const getLight = (p: vec3): number => {
  debug('getLight(%o)', p);

  const hitNormal = calcNormal(p);
  debug('hitNormal=%o', hitNormal);

  const lightPos = new vec3(0, 4, 6).add(
    new vec3(Math.sin(t), 0, Math.cos(t) * 2),
  );
  debug('lightPos=%o', lightPos);
  const lightDirection = new vec3(lightPos).sub(p).normalise();
  debug('lightDirection=%o', lightDirection);

  let diffusion = hitNormal.dot(lightDirection);
  debug('diffusion=%d', diffusion);

  const pu = new vec3(p).add(hitNormal.mul(0.02));
  const d = castRay(pu, lightDirection);
  if (d < 2.5) {
    diffusion = diffusion * 0.2;
  }
  return diffusion;
};

//################################################################################

const cameraOrigin = new vec3(0, 1.25, -2);

const shade = async (uv: vec2): Promise<vec3> => {
  debug('shade(uv=%o)', uv);

  const cameraDirection = new vec3(uv, 1.5).normalise();
  const d = castRay(cameraOrigin, cameraDirection);
  const p = cameraOrigin.add(cameraDirection.mul(d));
  const dif = getLight(p);

  return new vec3(dif, dif, dif);
};

//################################################################################

const frameRenderer = async (width: number, height: number) => {
  let buffer = CURSOR_HOME;
  for (let y = height; y >= 0; y -= 2) {
    for (let x = 0; x < width; x++) {
      const uv = new vec2(
        (x - 0.5 * width) / height,
        (y - 0.5 * height) / height,
      );

      let c = await shade(uv);
      debug('c=%o', c);
      c = colour(c);
      debug('c=%o', c);
      buffer += rgb(c);

      uv.y = (y + 1 - 0.5 * height) / height;
      c = await shade(uv);
      debug('c=%o', c);
      c = colour(c);
      debug('c=%o', c);
      buffer += bgRgb(c);
      buffer += '▄';
    }
  }
  return buffer;
};

(async () => {
  const w = process.stdout.columns;
  const h = (process.stdout.rows - 2) * 2;
  const frameDurationColour =
    bgRgb(new vec3(0, 0, 0)) + rgb(new vec3(255, 255, 255));

  try {
    process.stdout.write(CURSOR_HIDE + CLEAR_SCREEN);

    while (true) {
      const start = process.hrtime.bigint();
      const frame = await frameRenderer(w, h);
      const end = process.hrtime.bigint();
      const frameDuration = Number.parseFloat(
        ((end - start) / BigInt(1000000)).toString(),
      );

      process.stdout.write(frame);
      process.stdout.write(frameDurationColour);
      process.stdout.write(
        `${(1000 / frameDuration).toFixed(2)} FPS (${frameDuration}ms)`,
      );
      process.stdout.write('  ');

      t = t + frameDuration / 1000;
    }
  } catch (err) {
    console.log(err);
  } finally {
    process.stdout.write(CURSOR_SHOW);
  }
})();
