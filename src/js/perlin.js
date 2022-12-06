import { createNoise2D } from "simplex-noise";

export var perlinParams = new (function () {
  this.OCTAVECNT = 3;
  this.LACUNARITY = 2;
  this.PERSISTANCE = 0.5;
  this.SMOOTHING = 450;
})();

const NOISE2D = createNoise2D();

function perlin_base(amp, freq, v_i, v_i2) {
  return (
    amp *
    NOISE2D(
      (v_i * freq) / perlinParams.SMOOTHING,
      (v_i2 * freq) / perlinParams.SMOOTHING
    )
  );
}

export function perlin(perlinParams, v_i, v_i2) {
  let acc = 0;
  let amp = 1;
  let freq = 1;
  for (let i = 0; i < perlinParams.OCTAVECNT; i++) {
    acc += perlin_base(amp, freq, v_i, v_i2);
    amp *= perlinParams.PERSISTANCE;
    freq *= perlinParams.LACUNARITY;
  }
  return acc;
}
