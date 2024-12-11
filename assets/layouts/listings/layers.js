import { common } from "../../scripts/common.js"

const findNextPossibleNumber = (items, check) => {
  // layer name index
  let targetName = 1
  // for each layer
  for (let i = 0; i < items.length + 1; i++) {
    // if no item as layer index name
    if (!items.find(item => check(item, i))) {
      // store target name
      targetName = i + 1
      // break loop
      break
    }
  }
  return targetName
}

const createLayer = (index = null, options = {}) => {
  // app instance
  const app = common.getApp("createLayer")
  // get canvas
  const canvas = app.canvas
  // layer index or set next possible index
  const targetIndex = (index !== null ? index : app.currentLayer) || 0
  // layer name index
  const targetNumber = findNextPossibleNumber(app.layers, (item, i) => (
    item.name === `Layer ${i + 1}`
  ))
  // layer object
  const layer = {
    // layer id
    id: crypto.randomUUID() + "-" + Date.now(),
    // display name
    name: "Layer " + targetNumber,
    // behavior mode
    mode: "surface",
    // object dimensions
    dimensions: {
      width: Math.floor(canvas.width * 0.8),
      height: Math.floor(canvas.height * 0.8)
    },
    // layer position
    position: {
      x: 0,
      y: 0
    },
    // layer rotation
    rotation: 0,
    // visible state
    visible: true,
    // mix blend mode
    blend: "normal",
    // opacity
    opacity: 100,
    // background style
    background: {
      type: "transparent",
      data: {
        color: {
          color: "#FFFFFF",
          opacity: 100
        },
        gradient: {
          type: "linear",
          colors: [
            { color: "#FF0000", opacity: 100 },
            { color: "#880000", opacity: 100 }
          ],
          angle: 0
        },
        texture: {
          id: "none",
          repeat: "no-repeat",
          position: {
            type: "center",
            x: 0,
            y: 0
          },
          size: {
            type: "contain",
            x: 100,
            y: 100
          }
        }
      }
    },
    // text style
    text: {
      content: "",
      align: "center",
      size: 40,
      family: "none",
      color: "#000000",
      opacity: 100,
      shadow: {
        type: "none",
        color: "#000000",
        opacity: 100,
        offset: { x: 0, y: 0 },
        radius: 8
      }
    },
    // border style
    border: {
      type: "none",
      color: "#FF0000",
      opacity: 100,
      size: 1
    },
    // border radius style
    radius: {
      type: "all",
      sides: {
        all: 0,
        each: [0, 0, 0, 0]
      }
    },
    // shadow style
    shadow: {
      type: "none",
      color: "#000000",
      opacity: 100,
      offset: { x: 0, y: 0 },
      radius: 25,
      spread: 0
    },
    // filters
    filters: {
      blur: 0,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      hue: 0,
      invert: 0,
      saturation: 100,
      sepia: 0
    },
    // given options
    ...options
  }
  // set default options
  if (layer.mode === "text" && layer.text.content === "") {
    // sample text content
    layer.text.content = "Sample Text"
  } else if (layer.mode === "object") {
    layer.background.type = "color"
    layer.background.data.color.color = "#FFFFFF"
  }
  // push to layers by index
  app.layers = [
    ...app.layers.slice(0, targetIndex),
    layer,
    ...app.layers.slice(targetIndex)
  ]
  // set as current layer
  if (app.currentLayer === null) { app.currentLayer = targetIndex }
  // switch to move tool
  app.workspace.tool = "move"
  app.workspace.hand = false
  // update saved status
  app.saved = false
  app.appendHistory()
  // return target index
  return targetIndex
}

const moveLayer = (index, offset) => {
  // app instance
  const app = common.getApp("moveLayer", { index, offset })
  // return if target already in edge
  if (offset < 0 && index === 0) { return }
  if (offset > 0 && index === app.layers.length - 1) { return }
  // return if no offset
  if (!offset) { return }
  // slice array parts
  const topItems = offset > 0
    ? app.layers.slice(0, index)
    : app.layers.slice(0, index + offset)
  const targetItem = app.layers[index]
  const middleItems = offset > 0
    ? app.layers.slice(index + 1, topItems.length + offset + 1)
    : app.layers.slice(index + offset, index)
  const bottomItems = offset > 0
    ? app.layers.slice(topItems.length + offset + 1)
    : app.layers.slice(index + 1)
  // rearrange layers array
  app.layers = offset > 0
    ? [...topItems, ...middleItems, targetItem, ...bottomItems]
    : [...topItems, targetItem, ...middleItems, ...bottomItems]
  // select target layer
  app.currentLayer = index + offset
  // update saved status
  app.saved = false
  app.appendHistory()
}

const moveCurrentLayerUp = () => {
  // move up
  moveLayer(window.$app.currentLayer, -1)
}

const moveCurrentLayerDown = () => {
  // move down
  moveLayer(window.$app.currentLayer, 1)
}

const moveCurrentLayerToTop = () => {
  // app instance
  const app = window.$app
  // move to top
  moveLayer(app.currentLayer, app.currentLayer * -1)
}

const moveCurrentLayerToBottom = () => {
  // app instance
  const app = window.$app
  // move to bottom
  moveLayer(app.currentLayer, (app.layers.length - 1) - app.currentLayer)
}

const duplicateLayer = (data, index = null) => {
  // app instance
  const app = common.getApp("duplicateLayer", { data, index })
  // clone layer data
  const layer = common.clone(data)
  // update source name
  layer.sourceName = layer.name.startsWith(layer.sourceName)
    ? layer.sourceName || layer.name : layer.name
  // update uuid
  layer.id = crypto.randomUUID() + "-" + Date.now()
  // next possible name number
  const targetNumber = findNextPossibleNumber(app.layers, (item, i) => (
    item.name === `${layer.sourceName} (${i + 1})`
  ))
  // update name
  layer.name = `${layer.sourceName} (${targetNumber})`
  // push to layers
  app.layers.push(layer)
  // get target index
  const targetIndex = index !== null
    ? index : app.currentLayer !== null
      ? app.currentLayer : 2 + app.layers.length * -1
  // move layer to target position
  moveLayer(app.layers.length - 1, targetIndex - app.layers.length + 1)
  // update saved status
  app.saved = false
  app.appendHistory()
}

const applyLayerStyle = (data, index) => {
  // app instance
  const app = common.getApp("applyLayerStyle", { data, index })
  // get layer
  const layer = app.layers[index]
  // update layer data
  layer.background = common.clone(data.background)
  layer.blend = common.clone(data.blend)
  layer.border = common.clone(data.border)
  layer.filters = common.clone(data.filters)
  layer.opacity = common.clone(data.opacity)
  layer.radius = common.clone(data.radius)
  layer.shadow = common.clone(data.shadow)
  // update saved status
  app.saved = false
  app.appendHistory()
}

const deleteLayer = index => {
  // app instance
  const app = common.getApp("deleteLayer", { index })
  // return if invalid index
  if (index === null) { return }
  // filter and remove layer by index
  app.layers = app.layers.filter((_item, i) => (
    i !== index
  ))
  // update current layer index
  app.currentLayer = app.layers[index]
    ? index : app.layers.length > 0
      ? app.layers.length - 1 : null
  // update saved status
  app.saved = false
  app.appendHistory()
}

const deleteCurrentLayer = () => {
  // delete current layer
  deleteLayer(common.getApp().currentLayer)
}

window.addEventListener("click", event => {
  // reset current layer when click on container
  if (event.target.classList.contains("layers")) {
    window.$app.currentLayer = null
  }
})

export const layers = {
  createLayer,
  moveLayer,
  moveCurrentLayerUp,
  moveCurrentLayerDown,
  moveCurrentLayerToTop,
  moveCurrentLayerToBottom,
  duplicateLayer,
  applyLayerStyle,
  deleteLayer,
  deleteCurrentLayer
}
