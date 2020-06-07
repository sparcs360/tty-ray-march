const debug = require('debug')('gl:scene');

import { vec3 } from '../math';
import { SceneObject } from './objects/sceneObject';

export class Scene {
  static MAX_MARCHES: number = 128;

  time: number;
  private objects: SceneObject[];

  constructor () {
    this.time = 0;
    this.objects = [];
  }

  addObject (obj: SceneObject) {
    this.objects.push(obj);
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

  getLight (p: vec3): number {
    debug('getLight(%o)', p);

    const hitNormal = this.calculateNormal(p);
    debug('hitNormal=%o', hitNormal);

    const lightPos = new vec3(0, 4, 6).add(
      new vec3(Math.sin(this.time), 0, Math.cos(this.time) * 2),
    );
    debug('lightPos=%o', lightPos);
    const lightDirection = new vec3(lightPos).sub(p).normalise();
    debug('lightDirection=%o', lightDirection);

    let diffusion = hitNormal.dot(lightDirection);
    debug('diffusion=%d', diffusion);

    const pu = new vec3(p).add(hitNormal.mul(0.02));
    const d = this.castRay(pu, lightDirection);
    if (d < 2.5) {
      diffusion = diffusion * 0.2;
    }
    return diffusion;
  }

  advanceTime (ms: number) {
    this.time = this.time + ms;
  }
}
