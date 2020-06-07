import { SceneObject } from './sceneObject';
import { vec3 } from '../../math';

export class Sphere extends SceneObject {
  radius: number;
  constructor (position: vec3, radius: number) {
    super(position);
    if (radius <= 0) {
      throw Error('radius must be > 0');
    }
    this.radius = radius;
  }

  distanceFrom (p: vec3): number {
    return p.sub(this.position).length() - this.radius;
  }
}
