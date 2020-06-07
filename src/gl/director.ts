import { Scene } from './scene';
import { TtyRenderer } from '.';

export type SceneUpdateFunction = (scene: Scene, t: number) => void;

const MOTIONLESS: SceneUpdateFunction = () => {};

export class Director {
  private scene: Scene;
  private renderer: TtyRenderer;
  private sceneUpdateFunction: SceneUpdateFunction;

  constructor (
    scene: Scene,
    renderer: TtyRenderer,
    sceneUpdateFunction: SceneUpdateFunction = MOTIONLESS,
  ) {
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
    // TODO: Move time into this class - need to decouple scene lighting first
    this.sceneUpdateFunction(this.scene, this.scene.time);
    const frameDuration = this.renderer.render(this.scene);
    this.scene.advanceTime(frameDuration / 1000);
  }
}
