import { common } from "../../scripts/common.js"
import { zoom } from "../tools/zoom.js"

const openCanvasPopup = () => {
  // app instance
  const app = common.getApp("openCanvasPopup")
  // return if export popup opened
  if (app.popups.export.open === true) { return }
  // set dimensions from canvas
  app.popups.canvas.width = app.canvas.width
  app.popups.canvas.height = app.canvas.height
  // set resize popup
  app.popups.canvas.open = true
}

const closeCanvasPopup = apply => {
  // app instance
  const app = common.getApp("closeCanvasPopup", { apply })
  // check apply flag
  if (apply) {
    // set dimensions to canvas
    app.canvas.width = app.popups.canvas.width
    app.canvas.height = app.popups.canvas.height
    // set to fitting size
    zoom.zoomToFittingSize()
    // update saved status
    app.saved = false
    app.appendHistory()
  }
  // set close state
  app.popups.canvas.open = false
}

export const resizeCanvas = {
  openCanvasPopup,
  closeCanvasPopup
}
