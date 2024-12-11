import { common } from "../scripts/common.js"

// cursor points data
const data = {
  // origin pan position
  origin: null,
  // mouse down event
  down: null,
  // mouse move event
  move: null
}

const onMouseDown = event => {
  // app instance
  const app = common.getApp()
  // store mouse down event
  data.down = event
  // set down state
  app.workspace.down = true
  // switch by tool
  if (app.workspace.tool === "hand" || app.workspace.hand) {
    // store current pan position
    data.origin = { ...app.workspace.pan }
  } else if (app.workspace.tool === "move" && app.layer) {
    // store current layer position
    data.origin = { ...app.layer.position }
  }
}

const onMouseMove = event => {
  // app instance
  const app = common.getApp()
  // return if no down event
  if (!data.down) { return }
  // store mouse move event
  data.move = event
  // set drag state
  app.workspace.drag = true
  // get cursor pan difference
  const x = event.screenX - data.down.screenX
  const y = event.screenY - data.down.screenY
  // get pan factor by zoom level
  const factor = 100 / app.workspace.zoom
  // switch by tool
  if (app.workspace.tool === "hand" || app.workspace.hand) {
    // update pan points
    app.workspace.pan.x = parseFloat(data.origin.x) + x * factor
    app.workspace.pan.y = parseFloat(data.origin.y) + y * factor
  } else if (app.workspace.tool === "move" && app.layer) {
    // update layer position
    if (app.layer.mode === "object" || app.layer.mode === "text") {
      app.layer.position.x = parseFloat(data.origin.x) + x * factor
      app.layer.position.y = parseFloat(data.origin.y) + y * factor
    }
  }
}

const onMouseUp = () => {
  // app instance
  const app = common.getApp()
  // check for document changes
  if (data.move && (app.layer.mode === "object" || app.layer.mode === "text")) {
    // update saved status
    app.saved = false
    app.appendHistory()
  }
  // reset events
  data.down = null
  data.move = null
  // reset down and drag states
  app.workspace.down = false
  app.workspace.drag = false
}

window.addEventListener("wheel", event => {
  // prevent default zoom event
  if (event.ctrlKey) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  // get target class name
  const targetClass = event.target.className
  // return if target is not workspace
  if (!targetClass.includes("workspace")) { return }
  // app instance
  const app = common.getApp()
  // check wheel direction
  if (event.deltaY < 0) {
    // increase zoom level limited to max level
    app.workspace.zoom = Math.min(parseInt(app.workspace.zoom) + 5, 500)
  } else if (event.deltaY > 0) {
    // decrease zoom level limited to min level
    app.workspace.zoom = Math.max(parseInt(app.workspace.zoom) - 5, 10)
  }
}, { passive: false })

export const workspace = {
  onMouseDown,
  onMouseMove,
  onMouseUp
}
