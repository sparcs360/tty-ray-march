import { vec2 } from './vec2';

export class vec3 {
  x: number;
  y: number;
  z: number;

  constructor (...args) {
    switch (args.length) {
      case 3: {
        this.x = args[0];
        this.y = args[1];
        this.z = args[2];
        break;
      }
      case 2: {
        const v2 = args[0] as vec2;
        this.x = v2.x;
        this.y = v2.y;
        this.z = args[1];
        break;
      }
      case 1: {
        const v3 = args[0] as vec3;
        this.x = v3.x;
        this.y = v3.y;
        this.z = v3.z;
        break;
      }
      default: {
        throw Error(`bad args, (got ${args.length}) - ${JSON.stringify(args)}`);
      }
    }
  }

  add (v: vec3): vec3 {
    return new vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub (v: vec3): vec3 {
    return new vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  mul (f: number): vec3 {
    return new vec3(this.x * f, this.y * f, this.z * f);
  }

  length (): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalise (): vec3 {
    const l = this.length();
    if (l === 0) {
      return new vec3(0, 0, 0);
    }
    return new vec3(this.x / l, this.y / l, this.z / l);
  }

  dot (v: vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
}
