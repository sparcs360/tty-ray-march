import { vec3 } from './math';
import { Director, Scene, HPlane, Sphere, TtyRenderer } from './gl';

const leftSphere = new Sphere(new vec3(-1.25, 0.5, 5), 0.5);
const middleSphere = new Sphere(new vec3(0.25, 1, 6), 1);
const rightSphere = new Sphere(new vec3(1.5, 0.25, 4), 0.25);
// const torus = new Torus(new vec3(-5, 0, 20), 4, 0.5);
const createScene = (): Scene => {
  const s = new Scene();
  s.addObject(new HPlane(0));
  s.addObject(leftSphere);
  s.addObject(middleSphere);
  s.addObject(rightSphere);
  // s.addObject(torus);
  return s;
};
const scene = createScene();

const w = process.stdout.columns;
const h = (process.stdout.rows - 2) * 2;
const cameraOrigin = new vec3(0, 1.25, -2);
const renderer = new TtyRenderer(w, h, (scene, uv) => {
  const cameraDirection = new vec3(uv, 1.5).normalise();
  const d = scene.castRay(cameraOrigin, cameraDirection);
  const p = cameraOrigin.add(cameraDirection.mul(d));
  const dif = scene.getLight(p);
  return new vec3(dif, dif, dif);
});

const director = new Director(scene, renderer, (scene, t) => {
  const sineOfT = Math.sin(t);
  leftSphere.position.x = -1.25 + sineOfT;
  middleSphere.position.z = 6 + sineOfT * 2;
  rightSphere.position.y = 0.25 + sineOfT * 0.5 + 0.5;
});

director.action();
