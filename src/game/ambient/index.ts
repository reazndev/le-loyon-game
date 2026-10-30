/** Ambient detail for any scene: particles, sway, flicker, small life, and sound layers. See docs/ambient.md. */
export { breathVapor } from './breath';
export { drips, type DripSpot } from './drips';
export { eyesInBeam, type EyesOptions } from './eyes';
export { animateLight, flameLevel, fluorescentTube, tubeLevel } from './flicker';
export { cat, caw, crows, fliesOver, mothsAround, type Perch } from './life';
export { outdoorWeather, type OutdoorWeather } from './outdoors';
export { particles, type ParticleShape, type ParticleSpec } from './particles';
export { drizzle, dustMotes, fallingLeaves, flies, fogWisps, moths } from './presets';
export { around, everyFrame, nowAndThen } from './schedule';
export * as sounds from './sounds';
export { distantDog, distantTraffic, hourBells, loop, miceInTheWalls, windInTrees } from './soundscape';
export { suddenLife, type Setting } from './suddenLife';
export { sway, windSway } from './sway';
export { brushSound, touches } from './touches';
export { weather, type Weather } from './weather';
