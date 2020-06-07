import { vec2, vec3 } from '../math';
import { Scene } from './scene';

export type ShaderFunction = (scene: Scene, uv: vec2) => vec3;

export class TtyRenderer {
  private static CURSOR_HOME = '\x1b[1;1H';
  private static CURSOR_HIDE = '\x1b[?25l';
  private static CURSOR_SHOW = '\x1b[?25h';
  private static ERASE_EOL = '\x1b[K';

  private static FRAME_DURATION_COLOUR =
    TtyRenderer.bgRgb(new vec3(0.2, 0.2, 0.8)) +
    TtyRenderer.rgb(new vec3(1, 1, 0.1));

  width: number;
  height: number;
  shader: ShaderFunction;

  constructor (width: number, height: number, shader: ShaderFunction) {
    if (width <= 0) {
      throw Error('width must be > 0');
    }
    if (height <= 0) {
      throw Error('height must be > 0');
    }

    this.width = width;
    this.height = height;
    this.shader = shader;
  }

  render (scene: Scene, time: number): number {
    const start = process.hrtime.bigint();

    let buffer = TtyRenderer.CURSOR_HIDE + TtyRenderer.CURSOR_HOME;
    const hw = 0.5 * this.width;
    const hh = 0.5 * this.height;
    for (let y = this.height; y >= 0; y -= 2) {
      const v1 = (y - hh) / this.height;
      const v2 = (y + 1 - hh) / this.height;
      for (let x = 0; x < this.width; x++) {
        const u = (x - hw) / this.height;

        let c = this.shader(scene, new vec2(u, v1));
        buffer += TtyRenderer.rgb(c);

        c = this.shader(scene, new vec2(u, v2));
        buffer += TtyRenderer.bgRgb(c);

        buffer += '▄';
      }
    }
    buffer + TtyRenderer.CURSOR_SHOW;
    process.stdout.write(buffer);
    const end = process.hrtime.bigint();

    const frameDuration = Number.parseFloat(
      ((end - start) / BigInt(1000000)).toString(),
    );

    process.stdout.write(
      `${TtyRenderer.FRAME_DURATION_COLOUR}elapsed=${time.toFixed(
        2,
      )}s, frame=${frameDuration}ms, fps=${(1000 / frameDuration).toFixed(2)}${
        TtyRenderer.ERASE_EOL
      }`,
    );

    return frameDuration;
  }

  private static rgb (v: vec3) {
    const rgb = TtyRenderer.toRgb(v);
    return `\x1b[38;2;${rgb.x};${rgb.y};${rgb.z}m`;
  }

  private static bgRgb (v: vec3) {
    const rgb = TtyRenderer.toRgb(v);
    return `\x1b[48;2;${rgb.x};${rgb.y};${rgb.z}m`;
  }

  private static toRgb (v: vec3): vec3 {
    return new vec3(
      TtyRenderer.mapToColourRange(v.x),
      TtyRenderer.mapToColourRange(v.y),
      TtyRenderer.mapToColourRange(v.z),
    );
  }

  private static mapToColourRange (c: number): number {
    if (c < 0) {
      c = 0;
    } else if (c > 1) {
      c = 1;
    }
    return ~~(c * 255);
  }
}
