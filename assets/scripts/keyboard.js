import { common } from "./common.js"
import { assets } from "../layouts/listings/assets.js"
import { layers } from "../layouts/listings/layers.js"
import { zoom } from "../layouts/tools/zoom.js"
import { file } from "./file.js"

// input elements
const inputTags = [
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION"
]

// allowed control events on input elements
const inputShortcut = (isCtrl, key) => ([
  isCtrl && key === "c",
  isCtrl && key === "x",
  isCtrl && key === "v",
  isCtrl && key === "a",
  isCtrl && key === "z",
  isCtrl && key === "y"
]).some(match => match)

window.addEventListener("keydown", event => {
  // app instance
  const app = common.getApp()
  // app data
  const clipboard = app.clipboard
  const currentAsset = app.currentAsset
  const currentLayer = app.currentLayer
  // event target element
  const target = event.target
  // event key
  const key = event.key
  const char = event.key.toUpperCase()
  // event states
  const isCtrl = event.ctrlKey
  const isAlt = event.altKey
  const isShift = event.shiftKey
  const isFn = /^F(?:[1-9]|1[0-2])$/.test(key)
  // check for input element
  const isInput = inputTags.includes(target.tagName)

  // return to accept input shortcuts
  if (isInput && inputShortcut(isCtrl, key)) { return }

  // prevent control and function event
  if (isCtrl || isFn) { event.preventDefault() }

  // allowed actions on anywhere
  if (key === "F1") {
    // show about
    common.about()
  } else if (key === "F2") {
    // show github
    common.github()
  } else if (key === "F11") {
    // switch fullscreen
    common.switchFullscreen()
  } else if (char === "0" && isCtrl && !isAlt) {
    // fitting zoom
    zoom.zoomToFittingSize()
  } else if (char === "0" && isCtrl && isAlt) {
    // actual zoom
    zoom.zoomToActualSize()
  } else if (char === "I" && isCtrl) {
    // import assets
    assets.importAssets()
  } else if (char === "C" && isCtrl && isAlt) {
    // import assets
    app.openCanvasPopup()
  } else if (char === "S" && isCtrl && !isShift) {
    // save file
    file.saveFile()
  } else if (char === "S" && isCtrl && isShift) {
    // save file as
    file.saveFile(true)
  } else if (char === "O" && isCtrl) {
    // open file
    file.openFile()
  } else if (char === "E" && isCtrl) {
    // open export popup
    app.openExportPopup()
  } else if (char === "Z" && isCtrl) {
    // undo action
    app.applyHistory(-1)
  } else if (char === "Y" && isCtrl) {
    // redo action
    app.applyHistory(1)
  }

  // return if on input elements
  if (isInput) { return false }

  // listing actions
  if (key === "PageUp") {
    // move layer up
    layers.moveCurrentLayerUp()
  } else if (key === "PageDown") {
    // move layer down
    layers.moveCurrentLayerDown()
  } else if (key === "Home") {
    // move layer to top
    layers.moveCurrentLayerToTop()
  } else if (key === "End") {
    // move layer to bottom
    layers.moveCurrentLayerToBottom()
  } else if (char === "J" && isCtrl && currentLayer !== null) {
    // duplicate layer to top
    layers.duplicateLayer(app.layer)
  } else if (char === "C" && isCtrl && !isShift && currentLayer !== null) {
    // copy layer data to clipboard
    clipboard.data = common.clone(app.layer)
    clipboard.type = "layer"
  } else if (char === "V" && isCtrl && !isShift && clipboard.data) {
    // duplicate layer with clipboard data
    if (clipboard.type !== "layer") { return }
    layers.duplicateLayer(clipboard.data, currentLayer)
  } else if (char === "C" && isCtrl && isShift && currentLayer !== null) {
    // copy layer data to clipboard
    clipboard.data = common.clone(app.layer)
    clipboard.type = "style"
  } else if (char === "V" && isCtrl && isShift && clipboard.data) {
    // apple layer style with clipboard data
    if (clipboard.type !== "style") { return }
    layers.applyLayerStyle(clipboard.data, currentLayer)
  } else if (key === "Delete") {
    // target type
    const targetType = target.getAttribute("data-type")
    const isAssetType = targetType === "image" || targetType === "font"
    // check target type
    if (currentAsset !== null && isAssetType) {
      // delete asset
      assets.deleteCurrentAsset()
    } else {
      // delete layer
      layers.deleteCurrentLayer()
    }
  }

  // tool switching
  if (char === "M") {
    // switch to move tool
    app.workspace.tool = "move"
  } else if (char === "H") {
    // switch to hand tool
    app.workspace.tool = "hand"
  } else if (char === " ") {
    // enable quick hand
    app.workspace.hand = true
  }
  // avoid propagation
  event.stopImmediatePropagation()
  event.stopPropagation()
  return false
})

window.addEventListener("keyup", event => {
  // app instance
  const app = window.$app
  // check event key
  if (event.key === " ") {
    // disable quick hand
    app.workspace.hand = false
  }
})

export const events = {}
