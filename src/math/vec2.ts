export class vec2 {
  x: number;
  y: number;

  constructor (x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
