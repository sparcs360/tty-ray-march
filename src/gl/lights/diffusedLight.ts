const debug = require('debug')('gl:lights:DiffusedLight');

import { Light } from './light';
import { Scene } from '../scene';
import { vec3 } from '../../math';

export class DiffusedLight extends Light {
  power: number;

  constructor (position: vec3, power: number) {
    super(position);
    this.power = power;
  }

  getIntensityAt (scene: Scene, p: vec3): number {
    debug('lightAt(%o)', p);

    const hitNormal = scene.calculateNormal(p);
    debug('hitNormal=%o', hitNormal);

    const lightDirection = this.position.sub(p).normalise();
    debug('lightDirection=%o', lightDirection);

    let angleToLight = hitNormal.dot(lightDirection);
    angleToLight = Math.max(0, Math.min(angleToLight, 1));
    debug('angleToLight=%d', angleToLight);

    const pu = new vec3(p).add(hitNormal.mul(0.02));
    const d = scene.castRay(pu, lightDirection);
    if (d < this.position.sub(p).length()) {
      angleToLight = angleToLight * 0.1;
    }
    return angleToLight * this.power;
  }
}
