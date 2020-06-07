import { SceneObject } from './sceneObject';
import { vec2, vec3 } from '../../math';

export class Torus extends SceneObject {
  outerRadius: number;
  innerRadius: number;

  constructor (
    centre: vec3,
    outerRadius: number,
    innerRadius: number,
    colour: vec3,
  ) {
    super(centre, colour);
    if (outerRadius <= 0) {
      throw Error('outerRadius must be > 0');
    }
    if (innerRadius <= 0) {
      throw Error('innerRadius must be > 0');
    }
    if (innerRadius >= outerRadius) {
      throw Error('innerRadius must be smaller than outerRadius');
    }

    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
  }

  distanceFrom (p: vec3): number {
    const q = new vec2(
      new vec2(p.x - this.position.x, p.z - this.position.z).length() -
        this.outerRadius,
      p.y - this.position.y,
    );
    return q.length() - this.innerRadius;
  }
}
