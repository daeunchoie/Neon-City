import { CityScene } from './scenes/CityScene.js';
new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: 360, height: 640, backgroundColor: '#05020f',
  pixelArt: true, roundPixels: true, input: { touch: { capture: true } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [CityScene],
});
