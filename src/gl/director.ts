import { Scene } from './scene';
import { TtyRenderer } from '.';

export type SceneUpdateFunction = (scene: Scene, t: number) => void;

const MOTIONLESS: SceneUpdateFunction = () => {};

export class Director {
  time: number;
  private scene: Scene;
  private renderer: TtyRenderer;
  private sceneUpdateFunction: SceneUpdateFunction;

  constructor (
    scene: Scene,
    renderer: TtyRenderer,
    sceneUpdateFunction: SceneUpdateFunction = MOTIONLESS,
  ) {
    this.time = 0;
    this.scene = scene;
    this.renderer = renderer;
    this.sceneUpdateFunction = sceneUpdateFunction;
  }

  action () {
    const timeout = setInterval(() => this.animate(), 0);
    process.on('SIGINT', function () {
      clearInterval(timeout);
    });
  }

  private animate () {
    this.sceneUpdateFunction(this.scene, this.time);
    const frameDuration = this.renderer.render(this.scene, this.time);
    this.advanceTime(frameDuration / 1000);
  }

  advanceTime (ms: number) {
    this.time = this.time + ms;
  }
}
