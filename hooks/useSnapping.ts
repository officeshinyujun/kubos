/**
 * Snaps a value to the nearest increment.
 */
export function snapValue(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

/**
 * Snaps a 3D vector to the nearest grid increment.
 */
export function snapVector3(
  x: number,
  y: number,
  z: number,
  increment: number,
): { x: number; y: number; z: number } {
  return {
    x: snapValue(x, increment),
    y: snapValue(y, increment),
    z: snapValue(z, increment),
  };
}
