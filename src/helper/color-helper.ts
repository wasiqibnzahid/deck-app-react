export function interpolate(
  start: number,
  end: number,
  factor: number
): number {
  return Math.round(start + (end - start) * factor);
}

export function colorHelper(
  value: number,
  min: number,
  max: number,
  opacity?: number
): [number, number, number, number] {
  // Hardcoded RGB colors as arrays [R, G, B]
  const lowColor = [255, 0, 0]; // Red
  const mediumColor = [255, 255, 0]; // Yellow
  const highColor = [0, 255, 0]; // Green

  let factor;
  let resultColor: [number, number, number];

  if (value <= (min + max) / 2) {
    // Interpolate between low and medium colors
    factor = (value - min) / ((min + max) / 2 - min);
    resultColor = [
      interpolate(lowColor[0], mediumColor[0], factor), // Red channel
      interpolate(lowColor[1], mediumColor[1], factor), // Green channel
      interpolate(lowColor[2], mediumColor[2], factor), // Blue channel
    ];
  } else {
    // Interpolate between medium and high colors
    factor = (value - (min + max) / 2) / (max - (min + max) / 2);
    resultColor = [
      interpolate(mediumColor[0], highColor[0], factor), // Red channel
      interpolate(mediumColor[1], highColor[1], factor), // Green channel
      interpolate(mediumColor[2], highColor[2], factor), // Blue channel
    ];
  }

  // Return the interpolated RGB color as an array [R, G, B]
  return [...resultColor, opacity || 255];
}
