import {
  addObject,
  initAurchiveState,
  initUIState,
  setOffset,
  setZoom,
} from "./types/state";
import { Rect, AurObject, Vector2D, AurchiveState, UIState } from "./types";
import { AurSvgObject } from "./types/objects";
import { applyToPoint, toCssString, invert } from "./types/matrix";

export const init = () => {
  const canvas: HTMLDivElement = document.body.getElementsByClassName(
    "aur-canvas",
  )[0] as HTMLDivElement;
  const aurState = initAurchiveState();
  const uiState = initUIState();
  addListeners(canvas, aurState, uiState);
};

export const toDomPrecision = (v: number) => {
  return +v.toFixed(4);
};

const precise = (A: Vector2D) => {
  return `${toDomPrecision(A.x)}, ${toDomPrecision(A.y)} `;
};

const average = (A: Vector2D, B: Vector2D) => {
  return `${toDomPrecision((A.x + B.x) / 2)}, ${toDomPrecision(
    (A.y + B.y) / 2,
  )} `;
};

const boundingRectFromPoints = (points: Vector2D[]): Rect => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let point: Vector2D;

  for (let i = 0; i < points.length; i++) {
    point = points[i];
    minX = Math.min(point.x, minX);
    minY = Math.min(point.y, minY);
    maxX = Math.max(point.x, maxX);
    maxY = Math.max(point.y, maxY);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

const svgPathFromPoints = (points: Vector2D[], closed = false): string => {
  const len = points.length;

  if (len < 2) {
    return "";
  }

  let a = points[0];
  let b = points[1];

  if (len === 2) {
    return `M${precise(a)}L${precise(b)}`;
  }

  let result = "";

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += average(a, b);
  }

  if (closed) {
    return `M${average(points[0], points[1])}Q${precise(points[1])}${average(
      points[1],
      points[2],
    )}T${result}${average(points[len - 1], points[0])}${average(
      points[0],
      points[1],
    )}Z`;
  } else {
    return `M${precise(points[0])}Q${precise(points[1])}${average(
      points[1],
      points[2],
    )}${len > 3 ? "T" : ""}${result}L${precise(points[len - 1])}`;
  }
};

// Adapted from https://stackoverflow.com/a/13650579
export function normalizeWheel(event: WheelEvent) {
  const MAX_ZOOM_STEP = 10;
  const IS_DARWIN = /Mac|iPod|iPhone|iPad/.test(
    typeof window === "undefined" ? "node" : window.navigator.platform,
  );

  let { deltaY, deltaX } = event;
  let deltaZ = 0;

  if (event.ctrlKey || event.altKey || event.metaKey) {
    const signY = Math.sign(event.deltaY);
    const absDeltaY = Math.abs(event.deltaY);

    let dy = deltaY;

    if (absDeltaY > MAX_ZOOM_STEP) {
      dy = MAX_ZOOM_STEP * signY;
    }

    deltaZ = dy / 100;
  } else {
    if (event.shiftKey && !IS_DARWIN) {
      deltaX = deltaY;
      deltaY = 0;
    }
  }

  return { x: -deltaX, y: -deltaY, z: -deltaZ };
}

export const addListeners = (
  canvas: HTMLDivElement,
  aurState: AurchiveState,
  uiState: UIState,
) => {
  const onResize = () => {};
  window.addEventListener("resize", onResize);

  let pointerDown = false;

  const onPointerDown = (event: PointerEvent) => {
    pointerDown = true;
    placeObject(
      {
        id: String(Math.floor(Math.random() * 999999)),
        coordinates: scaledCoordinates({ x: event.x, y: event.y }),
        points: [scaledCoordinates({ x: event.x, y: event.y })],
      },
      aurState,
      canvas,
    );
  };

  const onPointerMove = (event: PointerEvent) => {
    if (pointerDown) {
      addPointToObjectPath(
        scaledCoordinates({ x: event.x, y: event.y }),

        aurState.objects[aurState.objects.length - 1],
      );
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointerDown = false;
  };
  const onPointerOut = (event: PointerEvent) => {
    //onPointerUp(event);
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (event.ctrlKey) {
      setZoom(
        { x: event.x, y: event.y },
        uiState.zoom * (1 + -event.deltaY / 100),
        uiState,
      );
    } else {
      setOffset(
        {
          x: normalizeWheel(event).x,
          y: normalizeWheel(event).y,
        },
        uiState,
      );
    }
    canvas.style.transform = `matrix(${toCssString(uiState.matrix)})`;
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    console.log(event.dataTransfer?.files);
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        switch (files[i].type) {
          case "image/png":
            console.log(files[i]);
            break;

          default:
            break;
        }
      }
    }
  };

  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp, false);
  window.addEventListener("pointerout", onPointerOut, false);
  window.addEventListener("pointermove", onPointerMove, false);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("dragover", onDragOver);
  window.addEventListener("drop", onDrop);
  const scaledCoordinates = (cursor: Vector2D) => {
    // const coordinates: Vector2D = {
    //   x: cursor.x / scale - offset.x,
    //   y: cursor.y / scale - offset.y,
    // };
    return applyToPoint(invert(uiState.matrix))(cursor);
  };
};

const placeObject = (
  object: AurObject,
  aurState: AurchiveState,
  canvas: HTMLDivElement,
) => {
  addObject(object, aurState);
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "aur-svg-container");
  svg.setAttribute("id", `aurobject-${object.id}`);
  canvas.append(svg);
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", svgPathFromPoints(object.points));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#000");
  path.setAttribute("stroke-width", "8");
  svg.append(path);
};

const addPointToObjectPath = (point: Vector2D, object: AurSvgObject) => {
  object.points.push(point);
  const objectSvg = document.getElementById(`aurobject-${object.id}`);
  const objectPath = objectSvg?.firstChild as SVGPathElement;
  objectPath.setAttribute("d", svgPathFromPoints(object.points));
};
