import { Vector2D } from ".";
import { Matrix2D, compose, identity, scaleAt, translate } from "./matrix";
import { AurObject } from "./objects";

export interface AurchiveState {
  objects: AurObject[];
}

export interface UIState {
  matrix: Matrix2D;
  offset: Vector2D;
  zoom: number;
}

export const initAurchiveState = (): AurchiveState => {
  return { objects: [] };
};

export const addObject = (
  object: AurObject,
  state: AurchiveState,
): AurchiveState => {
  state.objects.push(object);
  return state;
};

export const updateObject = (
  state: AurchiveState,
  id: string,
  property: string,
  value: any,
): AurchiveState => {
  const object = getObjectById(state, id);
  object[property] = value;
  return state;
};

const getObjectById = (
  state: AurchiveState,
  id: string,
): Object | undefined => {
  return state.objects.find((object) => object.id === id);
};

export const initUIState: UIFunction = (): UIState => {
  return {
    matrix: identity,
    offset: { x: 0, y: 0 },
    zoom: 1,
  };
};

export const setZoom = (
  cursor: Vector2D,
  zoom: number,
  state: UIState,
): UIState => {
  state.matrix = scaleAt(state.matrix)(cursor)(zoom);
  return state;
};

export const setOffset: UIFunction = (
  offset: Vector2D,
  state: UIState,
): UIState => {
  state.offset = vectorAdd(state.offset, offset);
  state.matrix = compose(translate(offset))(state.matrix);
  return state;
};

type UIFunction = (...args: any[]) => UIState;

export const vectorAdd = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
};
