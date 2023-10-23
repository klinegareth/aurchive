import "./style.css";
import * as canvas from "./canvas";

const main = () => {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  canvas.init();
};

window.addEventListener("load", main);
