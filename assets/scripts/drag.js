import { assets } from "../layouts/listings/assets.js"
import { layers } from "../layouts/listings/layers.js"

const getDragType = (source, target) => {
  if (source === "layer" && target === "layer") {
    return "move-layer"
  } else if (source === "image" && target === "layer") {
    return "assign-asset"
  } else if (source === "font" && target === "layer") {
    return "assign-asset"
  } else if (source === "image" && target === "workspace") {
    return "create-by-asset"
  } else if (source === "font" && target === "workspace") {
    return "create-by-asset"
  }
}

// drag data
const data = { from: null, to: null }

// drag start event listener
window.addEventListener("drag", event => {
  // store source element
  data.from = event.target
})

window.addEventListener("dragover", event => {
  // return if no source element
  if (!data.from) { return }
  // app instance
  const app = window.$app
  // set target element
  data.to = event.target.hasAttribute("data-type")
    ? event.target
    : event.target.parentElement.hasAttribute("data-type")
      ? event.target.parentElement : null
  // check for target element
  if (data.to) {
    // get source and target types
    const sourceType = data.from.getAttribute("data-type")
    const targetType = data.to.getAttribute("data-type")
    // find drag type
    const dragType = getDragType(sourceType, targetType)
    // check drag type availability
    if (dragType) {
      // get target id
      app.drag.target = data.to.getAttribute("data-id")
    } else {
      // reset drop element
      app.drag.target = null
    }
  } else {
    // reset drop element
    app.drag.target = null
  }
})

window.addEventListener("dragend", () => {
  // app instance
  const app = window.$app
  // reset drop element
  app.drag.target = null
  // return if source or target not available
  if (!data.from || !data.to) { return }
  // get source data
  const sourceIndex = parseInt(data.from.getAttribute("data-index"))
  const sourceType = data.from.getAttribute("data-type")
  // get target data
  const targetIndex = parseInt(data.to.getAttribute("data-index"))
  const targetType = data.to.getAttribute("data-type")
  // find drag type
  const dragType = getDragType(sourceType, targetType)
  // return if not drag type found
  if (!dragType) { return }
  // check for element types
  if (dragType === "move-layer") {
    // move layers
    layers.moveLayer(sourceIndex, targetIndex - sourceIndex)
  } else if (dragType === "assign-asset") {
    // set asset to layer
    assets.assignAssetToLayer(sourceIndex, targetIndex)
  } else if (dragType === "create-by-asset") {
    // create layer with asset
    assets.createLayerWithAsset(sourceIndex)
  }
})
