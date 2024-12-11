import { common } from "../../scripts/common.js"

const openExportPopup = () => {
  // app instance
  const app = common.getApp("openExportPopup")
  // return if canvas popup opened
  if (app.popups.canvas.open === true) { return }
  // set dimensions from canvas
  app.popups.export.width = app.canvas.width
  app.popups.export.height = app.canvas.height
  // set resize popup
  app.popups.export.open = true
}

const inputExportPopup = event => {
  // app instance
  const app = common.getApp("openExportPopup")
  // get original dimensions
  const originalWidth = app.canvas.width
  const originalHeight = app.canvas.height
  // get parent element key and value
  const key = event.target.parentElement.getAttribute("data-key")
  const value = parseInt(event.target.value)
  const ratio = originalHeight / originalWidth
  // check target key
  if (key === "width") {
    // calculate height by original ratio
    app.popups.export.height = parseInt(value * ratio)
  } else if (key === "height") {
    // calculate width by original ratio
    app.popups.export.width = parseInt(value * (1 / ratio))
  }
}

const closeExportPopup = () => {
  // app instance
  const app = common.getApp("closeExportPopup")
  // set close state
  app.popups.export.open = false

}

const exportAsImage = async () => {
  // app instance
  const app = common.getApp("exportAsImage")
  try {
    // set busy flag
    app.popups.export.busy = true
    // get canvas element
    const element = document.querySelector(".workspace-canvas")
    // get date string
    const date = new Date().toISOString().split("T")[0]
    const time = Date.now().toString().substring(6)
    // get pixel ratio
    const ratio = app.popups.export.width / app.canvas.width
    // create image blob
    const blob = await htmlToImage.toBlob(element, {
      pixelRatio: ratio
    })
    // show save file window
    const handles = await window.showSaveFilePicker({
      suggestedName: `MyDesign-${date}-${time}.png`
    })
    // create writeable stream
    const stream = await handles.createWritable()
    // write on file
    await stream.write(blob)
    // close file
    await stream.close()
    // reset busy flag
    app.popups.export.busy = false
    return true
  } catch (err) {
    // reset busy flag
    app.popups.export.busy = false
    return false
  }
}

export const exportImage = {
  openExportPopup,
  closeExportPopup,
  inputExportPopup,
  exportAsImage
}
