import { common } from "../../scripts/common.js"
import { layers } from "./layers.js"

const acceptTypes = [
  {
    type: "image",
    extensions: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"]
  },
  {
    type: "font",
    extensions: ["woff", "woff2", "ttf", "otf", "eot"]
  }
]

const extensions = acceptTypes.map(item => item.extensions.join(",."))

const blobs = []

const getBlobById = id => blobs[id]
const setBlobById = (id, blob) => blobs[id] = blob

const importAssets = () => {
  // app instance
  const app = common.getApp("importAssets")
  // create input element
  const input = document.createElement("input")
  // input options
  input.type = "file"
  input.multiple = true
  input.accept = `.${extensions.join(",.")}`
  // input listener
  input.addEventListener("input", () => {
    // for each file
    for (let i = 0; i < input.files.length; i++) {
      // current file
      const file = input.files[i]
      // file extension
      const extension = file.name.split(".").pop()
      // find extension category
      const category = acceptTypes.find(item => (
        item.extensions.includes(extension)
      ))
      // continue if category not found
      if (!category) { continue }
      // create random id
      const randomId = `asset-${crypto.randomUUID()}-${Date.now()}`
      // generate blob url
      const blobUrl = URL.createObjectURL(file)
      // set on blobs array
      blobs[randomId] = file
      // push each file to assets with blob url
      app.assets.unshift({
        id: randomId,
        name: input.files[i].name,
        type: category.type,
        blob: blobUrl
      })
      // check for font type
      if (category.type === "font") {
        // create style element
        const element = document.createElement("style")
        // set font face rule
        element.innerHTML = `
          @font-face {
            font-family: "${randomId}";
            src: url(${blobUrl});
          }
        `
        // append element ot head
        document.head.appendChild(element)
      }
    }
    // update saved status
    app.saved = false
    app.appendHistory()
  })
  // trigger input
  input.click()
}

const saveAssetAsFile = async (index = null) => {
  try {
    // app instance
    const app = common.getApp("saveAssetAsFile")
    // find asset from index
    const asset = app.assets[index !== null ? index : app.currentAsset]
    // return if invalid asset
    if (!asset) { return }
    // get asset blob
    const blob = app.getBlobById(asset.id)
    // show save file window
    const handles = await window.showSaveFilePicker({
      suggestedName: asset.name
    })
    // create writeable stream
    const stream = await handles.createWritable()
    // write on file
    await stream.write(blob)
    // close file
    await stream.close()
    return true
  } catch (err) {
    return false
  }
}

const deleteCurrentAsset = () => {
  // app instance
  const app = common.getApp("deleteCurrentAsset")
  // find asset from index
  const asset = app.assets[app.currentAsset]
  // return if invalid asset
  if (!asset) { return }
  // revoke asset blob url
  URL.revokeObjectURL(asset.blob)
  // filter asset from array
  app.assets = app.assets.filter(item => item.id !== asset.id)
  // reset current asset
  app.currentAsset = null
  // update saved status
  app.saved = false
  app.appendHistory()
}

const assignAssetToLayer = (assetIndex, layerIndex) => {
  // app instance
  const app = common.getApp("assignAssetToLayer")
  // get asset from index
  const asset = app.assets[assetIndex]
  // return if invalid asset
  if (!asset) { return }
  // get current layer
  const layer = app.layers[layerIndex]
  // return if invalid layer
  if (!layer) { return }
  // check asset type
  if (asset.type === "image") {
    // update layer texture options
    layer.background.type = "texture"
    layer.background.data.texture.id = asset.id
  } else if (asset.type === "font") {
    // update layer font family options
    layer.text.family = asset.id
  }
  // select current layer
  app.currentLayer = layerIndex
  // update saved status
  app.saved = false
  app.appendHistory()
  // return objects
  return { layer, asset }
}

const createLayerWithAsset = assetIndex => {
  // app instance
  const app = common.getApp("createLayerWithAsset")
  // create layer and get index
  const index = layers.createLayer()
  // assign asset to layer
  const { layer, asset } = assignAssetToLayer(assetIndex, index)
  // set default options by asset type
  if (asset.type === "font") {
    // text layer
    layer.mode = "text"
    layer.text.content = "Sample Text"
  } else {
    // object layer
    layer.mode = "object"
  }
  // reset current asset
  app.currentAsset = null
  // switch to move tool
  app.workspace.tool = "move"
  app.workspace.hand = false
  // update saved status
  app.saved = false
  app.appendHistory()
}

window.addEventListener("click", event => {
  // reset current asset when click on container
  if (event.target.classList.contains("assets")) {
    common.getApp().currentAsset = null
  }
})

export const assets = {
  getBlobById,
  setBlobById,
  importAssets,
  saveAssetAsFile,
  deleteCurrentAsset,
  assignAssetToLayer,
  createLayerWithAsset
}
