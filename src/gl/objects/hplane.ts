import { SceneObject } from './sceneObject';
import { vec3 } from '../../math';

export class HPlane extends SceneObject {
  constructor (height: number) {
    super(new vec3(0, height, 0));
  }

  distanceFrom (p: vec3): number {
    return p.y - this.position.y;
  }
}
