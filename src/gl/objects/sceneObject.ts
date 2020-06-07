import { vec3 } from '../../math';

export abstract class SceneObject {
  position: vec3;
  constructor (position: vec3) {
    this.position = position;
  }

  abstract distanceFrom (p: vec3): number;
}
