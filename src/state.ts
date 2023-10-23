import { AurchiveState, Object, Vector2D } from "./types";

export const initAurchiveState = (): AurchiveState => {
  return { objects: [] };
};

export const addObject = (
  object: Object,
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

interface UIState {
  offset: Vector2D;
  zoom: number;
}

export const initUIState: UIFunction = (): UIState => {
  return {
    offset: { x: 0, y: 0 },
    zoom: 1,
  };
};

export const setZoom = (zoom: number, state: UIState): UIState => {
  state.zoom = zoom;
  return state;
};

export const setOffset: UIFunction = (
  offset: Vector2D,
  state: UIState,
): UIState => {
  state.offset = vectorAdd(state.offset, offset);
  return state;
};

type UIFunction = (...args: any[]) => UIState;

export const vectorAdd = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
};
