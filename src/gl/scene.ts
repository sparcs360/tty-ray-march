const debug = require('debug')('gl:scene');

import { vec3 } from '../math';
import { SceneObject } from './objects';
import { Light } from './lights';

export class Scene {
  static MAX_MARCHES: number = 128;

  time: number;
  private objects: SceneObject[];
  private lights: Light[];

  constructor () {
    this.time = 0;
    this.objects = [];
    this.lights = [];
  }

  addObject (obj: SceneObject) {
    this.objects.push(obj);
  }

  addLight (light: Light) {
    this.lights.push(light);
  }

  castRay (origin: vec3, dir: vec3): number {
    debug('castRay(origin=%o, dir=%o)', origin, dir);
    let dist = 0;

    for (let i = 0; i < Scene.MAX_MARCHES; i++) {
      const p = origin.add(dir.mul(dist));
      debug('p=%o', p);
      const marchDist = this.getNearestDistanceTo(p);
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

  advanceTime (ms: number) {
    this.time = this.time + ms;
  }
}
