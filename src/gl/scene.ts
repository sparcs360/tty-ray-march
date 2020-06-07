const debug = require('debug')('gl:scene');

import { vec3 } from '../math';
import { SceneObject } from './objects';
import { Light } from './lights';

class ObjectDistance {
  object: SceneObject;
  distance: number;

  constructor () {
    this.object = null;
    this.distance = Ray.MAX_DIST;
  }

  checkIfNearer (object: SceneObject, p: vec3) {
    const distance = object.distanceFrom(p);
    if (distance < this.distance) {
      this.object = object;
      this.distance = distance;
    }
  }
}

export class Ray {
  static MAX_MARCHES: number = 128;
  static MAX_DIST: number = 100;
  static HIT_DIST: number = 0.01;

  origin: vec3;
  dir: vec3;
  isHit: boolean;
  hitObject?: SceneObject;
  hitObjectAt?: vec3;
  distance: number;

  constructor (origin: vec3, dir: vec3) {
    this.origin = origin;
    this.dir = dir;
    this.isHit = false;
    this.distance = 0;
  }

  cast (scene: Scene) {
    for (let i = 0; i < Ray.MAX_MARCHES; i++) {
      const p = this.origin.add(this.dir.mul(this.distance));
      debug('p=%o', p);
      const nearestObject = this.getNearestObjectTo(scene, p);
      debug('nearestObject=%o', nearestObject);
      this.distance = this.distance + nearestObject.distance;
      debug('ray.distance=%d', this.distance);
      if (this.distance > Ray.MAX_DIST) {
        debug('out of scene');
        break;
      }
      if (nearestObject.distance < Ray.HIT_DIST) {
        debug('hit');
        this.isHit = true;
        this.hitObject = nearestObject.object;
        this.hitObjectAt = p;
        break;
      }
    }
  }

  private getNearestObjectTo (scene: Scene, p: vec3): ObjectDistance {
    const nearestObject = new ObjectDistance();
    for (const object of scene.objects) {
      nearestObject.checkIfNearer(object, p);
    }
    return nearestObject;
  }
}

export class Scene {
  objects: SceneObject[];
  lights: Light[];

  constructor () {
    this.objects = [];
    this.lights = [];
  }

  addObject (obj: SceneObject) {
    this.objects.push(obj);
  }

  addLight (light: Light) {
    this.lights.push(light);
  }

  castRay (origin: vec3, dir: vec3): Ray {
    debug('castRay(origin=%o, dir=%o)', origin, dir);
    const ray = new Ray(origin, dir);
    ray.cast(this);
    return ray;
  }

  getNearestDistanceTo (p: vec3): number {
    const distances = this.objects.map(o => o.distanceFrom(p));
    return Math.min(...distances);
  }

  calculateNormal (p: vec3): vec3 {
    const d = this.getNearestDistanceTo(p);
    const n = new vec3(
      d - this.getNearestDistanceTo(new vec3(p.x - 0.01, p.y, p.z)),
      d - this.getNearestDistanceTo(new vec3(p.x, p.y - 0.01, p.z)),
      d - this.getNearestDistanceTo(new vec3(p.x, p.y, p.z - 0.01)),
    );
    return n.normalise();
  }

  getLightIntensityAt (p: vec3): number {
    let i: number = 0;
    for (const light of this.lights) {
      i = i + light.getIntensityAt(this, p);
    }
    return i;
  }
}
