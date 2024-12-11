import { common } from "./common.js"
import { zoom } from "../layouts/tools/zoom.js"

const data = { handle: null }

const types = [
  {
    description: "Graphica Files",
    accept: {
      "application/x-graphica": [".graphica"]
    }
  }
]

const openFile = async () => {
  try {
    // confirm close
    if (!confirmClose()) { return false }
    // show open file window
    const handles = await window.showOpenFilePicker({
      types: types,
      excludeAcceptAllOption: true
    })
    // store file handle
    data.handle = handles[0]
    // get file blob
    const blob = await data.handle.getFile()
    // load file from blob
    await loadFile(blob)
    // return true as success
    return true
  } catch (err) {
    // return false as error
    return false
  }
}

const saveFile = async (saveAs = false) => {
  try {
    // app instance
    const app = common.getApp("saveFile")
    // create file
    const blob = await makeFile()
    // show save file window if no handler
    if (!data.handle || saveAs) {
      data.handle = await window.showSaveFilePicker({
        types: types,
        suggestedName: "MyDesign.graphica",
        excludeAcceptAllOption: true
      })
    }
    // create writeable stream
    const stream = await data.handle.createWritable()
    // write on file
    await stream.write(blob)
    // close file
    await stream.close()
    // update saved flag
    app.saved = true
    // return true as success
    return true
  } catch (err) {
    // return false as error
    return false
  }
}

const makeFile = () => {
  // return promise
  return new Promise(resolve => {
    // app instance
    const app = common.getApp()
    // create compress object
    const object = new JSZip()
    // include json files
    object.file("canvas.json", JSON.stringify(app.canvas))
    object.file("assets.json", JSON.stringify(app.assets))
    object.file("layers.json", JSON.stringify(app.layers))
    // create assets folder
    const folder = object.folder("assets")
    // for each asset
    for (let i = 0; i < app.assets.length; i++) {
      // current asset
      const asset = app.assets[i]
      // add asset to folder
      folder.file(asset.id, app.getBlobById(asset.id))
    }
    // generate compressed blob
    object.generateAsync({ type: "blob" }).then(blob => {
      // resolve blob
      resolve(new Blob([blob], { type: "application/x-graphica" }))
    }).catch(() => {
      // resolve null on error
      resolve(null)
    })
  })
}

const loadFile = async blob => {
  // app instance
  const app = common.getApp("loadFile")
  // get compress object
  const object = await JSZip.loadAsync(blob)
  // get files
  const files = object.files
  // read json objects
  const canvas = JSON.parse(await files['canvas.json'].async("text"))
  const assets = JSON.parse(await files['assets.json'].async("text"))
  const layers = JSON.parse(await files['layers.json'].async("text"))
  // for each asset
  for (let i = 0; i < assets.length; i++) {
    // current asset
    const asset = assets[i]
    // get file from folder
    const file = await files[`assets/${asset.id}`].async("blob")
    // replace blob url
    asset.blob = URL.createObjectURL(file)
    // store in blobs
    app.setBlobById(asset.id, file)
    // check for font type
    if (asset.type === "font") {
      // create style element
      const element = document.createElement("style")
      // set font face rule
      element.innerHTML = `
        @font-face {
          font-family: "${asset.id}";
          src: url(${asset.blob});
        }
      `
      // append element ot head
      document.head.appendChild(element)
    }
  }
  // parse into app data
  app.canvas = canvas
  app.assets = assets
  app.layers = layers
  // reset asset and layer index
  app.currentAsset = null
  app.currentLayer = layers.length > 0 ? 0 : null
  // zoom to fitting size
  zoom.zoomToFittingSize()
  // update saved flag
  app.saved = true
  app.appendHistory()
}

const closeFile = () => {
  // app instance
  const app = common.getApp("closeFile")
  // confirm close
  if (!confirmClose()) { return }
  // reset file handle
  data.handle = null
  // reset current items
  app.currentAsset = null
  app.currentLayer = null
  // reset document data
  app.canvas = { width: 800, height: 600 }
  app.assets = []
  app.layers = []
  // zoom to fitting size
  zoom.zoomToFittingSize()
  // update saved flag
  app.saved = true
  app.clearHistory()
}

const confirmClose = () => {
  // app instance
  const app = common.getApp("loadFile")
  // allow if already saved
  if (app.saved) { return true }
  // return confirmation
  return confirm("Are you sure to discard unsaved changes?")
}

export const file = {
  openFile,
  saveFile,
  makeFile,
  loadFile,
  closeFile
}
