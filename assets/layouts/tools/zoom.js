import { common } from "../../scripts/common.js"

const zoomToActualSize = () => {
  // app instance
  const app = common.getApp("zoomToActualSize")
  // zoom to actual size
  app.workspace.zoom = 100
  // reset pan position
  app.workspace.pan = { x: 0, y: 0 }
}

const zoomToFittingSize = () => {
  // app instance
  const app = common.getApp("zoomToFittingSize")
  // get workspace dimensions
  const wWidth = window.innerWidth - 700
  const wHeight = window.innerHeight - 62
  // get canvas dimensions
  const cWidth = app.canvas.width
  const cHeight = app.canvas.height
  // get ratios in directions
  const vRatio = wWidth / cWidth
  const hRatio = wHeight / cHeight
  // check minimum ratio
  if (hRatio < vRatio) {
    // adjust zoom by height
    app.workspace.zoom = Math.floor(100 * (wHeight * 0.85) / cHeight)
  } else {
    // adjust zoom by width
    app.workspace.zoom = Math.floor(100 * (wWidth * 0.85) / cWidth)
  }
  // reset pan position
  app.workspace.pan = { x: 0, y: 0 }
}

const switchZoomMode = () => {
  // app instance
  const app = common.getApp()
  // check current zoom state
  if (parseInt(app.workspace.zoom) === 100) {
    zoomToFittingSize()
  } else {
    zoomToActualSize()
  }
}

export const zoom = {
  zoomToActualSize,
  zoomToFittingSize,
  switchZoomMode
}
