import { Vector2D } from "./vector";

export interface AurBaseObject {
  id: string;
  coordinates: Vector2D;
  width?: number;
  height?: number;
}

export enum AurObject {
  AurSvgObject,
  AurFileObject,
}

export interface AurSvgObject extends AurBaseObject {
  points: Vector2D[];
  strokeColor?: string;
  strokeWidth?: number;
  fill?: string;
}

export interface Stroke {
  from: Vector2D;
  to: Vector2D;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AurFileObject extends AurBaseObject {
  file: File;
}
