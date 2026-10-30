/** Ambient detail for any scene: particles, sway, flicker, small life, and sound layers. See docs/ambient.md. */
export { breathVapor } from './breath';
export { drips, type DripSpot } from './drips';
export { animateLight, flameLevel, fluorescentTube, tubeLevel } from './flicker';
export { cat, caw, crows, fliesOver, mothsAround, type Perch } from './life';
export { particles, type ParticleShape, type ParticleSpec } from './particles';
export { drizzle, dustMotes, fallingLeaves, flies, fogWisps, moths } from './presets';
export { around, everyFrame, nowAndThen } from './schedule';
export * as sounds from './sounds';
export { distantDog, distantTraffic, hourBells, loop, miceInTheWalls, windInTrees } from './soundscape';
export { sway, windSway } from './sway';
export { weather, type Weather } from './weather';
