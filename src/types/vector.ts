export interface Vector2D {
  x: number;
  y: number;
}

export const negate = (v: Vector2D): Vector2D => {
  return {
    x: -v.x,
    y: -v.y,
  };
};
