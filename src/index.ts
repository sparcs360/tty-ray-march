import { vec3 } from './math';
import {
  Director,
  Scene,
  HPlane,
  Sphere,
  DiffusedLight,
  TtyRenderer,
} from './gl';

const leftSphere = new Sphere(new vec3(-1.25, 0.5, 5), 0.5);
const middleSphere = new Sphere(new vec3(0.25, 1, 6), 1);
const rightSphere = new Sphere(new vec3(1.5, 0.25, 4), 0.25);
// const torus = new Torus(new vec3(-5, 0, 20), 4, 0.5);
const leftLight = new DiffusedLight(new vec3(-10, 5, -2), 0.5);
const backLight = new DiffusedLight(new vec3(0, 5, 20), 0.5);

const scene = new Scene();
scene.addObject(new HPlane(0));
scene.addObject(leftSphere);
scene.addObject(middleSphere);
scene.addObject(rightSphere);
// scene.addObject(torus);
scene.addLight(leftLight);
scene.addLight(backLight);

const w = process.stdout.columns;
const h = (process.stdout.rows - 2) * 2;
const cameraOrigin = new vec3(0, 1.25, -2);
const sky = new vec3(0.3, 0.3, 1);
const renderer = new TtyRenderer(w, h, (scene, uv) => {
  const cameraDirection = new vec3(uv, 1.5).normalise();
  const ray = scene.castRay(cameraOrigin, cameraDirection);
  if (ray.isHit) {
    const i = scene.getLightIntensityAt(ray.hitObjectAt);
    return new vec3(i, i, i);
  }
  return sky;
});

const director = new Director(scene, renderer, (scene, t) => {
  const sineOfT = Math.sin(t);
  leftSphere.position.x = -1.25 + sineOfT;
  middleSphere.position.z = 6 + sineOfT * 2;
  rightSphere.position.y = 0.25 + sineOfT * 0.5 + 0.5;
});

director.action();
