import { vec3 } from '../../math';
import { Scene } from '../scene';

export abstract class Light {
  position: vec3;
  constructor (position: vec3) {
    this.position = position;
  }

  abstract getIntensityAt (scene: Scene, p: vec3): number;
}
