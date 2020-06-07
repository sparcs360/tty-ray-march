import { vec3 } from '../../math';

export abstract class SceneObject {
  position: vec3;
  colour: vec3;
  constructor (position: vec3, colour: vec3) {
    this.position = position;
    this.colour = colour;
  }

  abstract distanceFrom (p: vec3): number;
}
