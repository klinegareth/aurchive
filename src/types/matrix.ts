import { Vector2D } from ".";
import { negate } from "./vector";

import { toDomPrecision } from "../canvas.ts";

export interface Matrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export const toCssString = (m: Matrix2D) => {
  return `${toDomPrecision(m.a)}, ${toDomPrecision(m.b)}, ${toDomPrecision(
    m.c,
  )}, ${toDomPrecision(m.d)}, ${toDomPrecision(m.e)}, ${toDomPrecision(m.f)}`;
};

export const identity: Matrix2D = {
  a: 1.0,
  b: 0.0,
  c: 0.0,
  d: 1.0,
  e: 0.0,
  f: 0.0,
};

export const translate = (v: Vector2D): Matrix2D => {
  return {
    a: 1.0,
    b: 0.0,
    c: 0.0,
    d: 1.0,
    e: v.x,
    f: v.y,
  };
};

// Compose a matrix using an array of transformation matrices
export const compose =
  (...matrices: Matrix2D[]) =>
  (matrix: Matrix2D = identity): Matrix2D =>
    matrices.reduce((last, current) => multiply(current)(last), matrix);

export const scale = (factor: number): Matrix2D => {
  return {
    a: factor,
    b: 0.0,
    c: 0.0,
    d: factor,
    e: 0.0,
    f: 0.0,
  };
};

const multiply =
  (m1: Matrix2D) =>
  (m2: Matrix2D): Matrix2D => {
    return {
      a: m1.a * m2.a + m1.c * m2.b,
      b: m1.b * m2.a + m1.d * m2.b,
      c: m1.a * m2.c + m1.c * m2.d,
      e: m1.a * m2.e + m1.c * m2.f + m1.e,
      d: m1.b * m2.c + m1.d * m2.d,
      f: m1.b * m2.e + m1.d * m2.f + m1.f,
    };
  };

// Used when zooming at the cursor position
export const scaleAt =
  (matrix: Matrix2D) => (position: Vector2D) => (factor: number) =>
    compose(scaleAtMatrix(factor)(position))(matrix);

export const scaleAtMatrix = (factor: number) => (pivot: Vector2D) => {
  return {
    a: factor,
    b: 0,
    c: 0,
    d: factor,
    e: pivot.x - factor * pivot.x,
    f: pivot.y - factor * pivot.y,
  };
};

export const invert = (m: Matrix2D): Matrix2D => {
  const denom = m.a * m.d - m.b * m.c;
  return {
    a: m.d / denom,
    b: m.b / -denom,
    c: m.c / -denom,
    d: m.a / denom,
    e: (m.d * m.e - m.c * m.f) / -denom,
    f: (m.b * m.e - m.a * m.f) / denom,
  };
};

export const applyToPoint =
  (m: Matrix2D) =>
  (v: Vector2D): Vector2D => {
    return {
      x: m.a * v.x + m.c * v.y + m.e,
      y: m.b * v.x + m.d * v.y + m.f,
    };
  };
