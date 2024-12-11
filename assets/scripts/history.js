import { common } from "./common.js"

const appendHistory = () => {
  // app instance
  const app = common.getApp("appendHistory")
  // get history objet
  const history = app.history
  // create history item
  const item = {
    canvas: common.clone(app.canvas),
    assets: common.clone(app.assets),
    layers: common.clone(app.layers),
    currentAsset: app.currentAsset,
    currentLayer: app.currentLayer
  }
  // update history data array
  history.data = [...history.data.slice(0, history.index + 1), item]
  // update history index
  history.index = history.data.length - 1
}

const clearHistory = () => {
  // app instance
  const app = common.getApp("clearHistory")
  // reset history data
  app.history.data = []
  app.history.index = -1
}

const applyHistory = direction => {
  // app instance
  const app = common.getApp("undo")
  // get previous history item
  const item = app.history.data[app.history.index + direction]
  // return if no item
  if (!item) { return }
  // restore app data
  app.canvas = common.clone(item.canvas)
  app.assets = common.clone(item.assets)
  app.layers = common.clone(item.layers)
  app.currentAsset = item.currentAsset
  app.currentLayer = item.currentLayer
  // set history index
  app.history.index += direction
}

window.addEventListener("beforeunload", event => {
  // app instance
  const app = common.getApp()
  // avoid if unsaved
  if (!app.saved) {
    event.preventDefault()
  }
})

export const history = {
  appendHistory,
  applyHistory,
  clearHistory
}
