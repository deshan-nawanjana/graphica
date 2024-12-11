import { common } from "../../scripts/common.js"
import { assets } from "../listings/assets.js"
import { layers } from "../listings/layers.js"
import { zoom } from "../tools/zoom.js"
import { file } from "../../scripts/file.js"

const onContextOpen = event => {
  // app instance
  const app = common.getApp()
  // prevent default event
  event.preventDefault()
  // close context if already opened
  if (app.context.items) { return onContextClose() }
  // return if target has no context rule
  if (event.target.hasAttribute("data-no-context")) { return }
  // get target and class name
  const target = event.target.hasAttribute("data-type")
    ? event.target
    : event.target.parentElement.hasAttribute("data-type")
      ? event.target.parentElement : null
  // return if no target
  if (!target) { return }
  // get target type and index
  const targetType = target.getAttribute("data-type")
  const targetIndex = parseInt(target.getAttribute("data-index"))
  // set context type
  app.context.type = targetType
  // switch context position by target
  if (target.classList.contains("ctx-trigger")) {
    // get target bound
    const bound = target.getBoundingClientRect()
    // store context position
    app.context.position.x = bound.left
    app.context.position.y = bound.bottom
  } else {
    // store context position
    app.context.position.x = event.clientX
    app.context.position.y = event.clientY
  }
  // get app data
  const layersArray = app.layers
  const currentLayer = app.currentLayer
  const clipboard = app.clipboard
  const history = app.history
  // switch by context type
  if (targetType === "assets-container") {
    // show assets container options
    app.context.items = [
      {
        label: "Import Assets",
        shortcut: "Ctrl+I",
        event: assets.importAssets
      }
    ]
  } else if (targetType === "image" || targetType === "font") {
    // select asset
    app.currentAsset = parseInt(targetIndex)
    // show asset options
    app.context.items = [
      {
        label: "Assign to Current Layer",
        event: () => assets.assignAssetToLayer(targetIndex, currentLayer),
        disabled: currentLayer === null
      },
      {
        label: "Save as File",
        event: () => assets.saveAssetAsFile()
      },
      {
        type: "separator"
      },
      {
        label: "Delete Asset",
        shortcut: "Delete",
        event: () => assets.deleteCurrentAsset()
      }
    ]
  } else if (targetType === "create-layer") {
    // show create layer menu options
    app.context.items = [
      {
        label: "Create Text Layer",
        event: () => layers.createLayer(null, { mode: "text" })
      },
      {
        label: "Create Object Layer",
        event: () => layers.createLayer(null, { mode: "object" })
      },
      {
        label: "Create Surface Layer",
        event: () => layers.createLayer(null, { mode: "surface" })
      }
    ]
  } else if (targetType === "layers-container") {
    // show layers container options
    app.context.items = [
      {
        label: "Create Text Layer",
        event: () => layers.createLayer(null, { mode: "text" })
      },
      {
        label: "Create Object Layer",
        event: () => layers.createLayer(null, { mode: "object" })
      },
      {
        label: "Create Surface Layer",
        event: () => layers.createLayer(null, { mode: "surface" })
      },
      {
        type: "separator"
      },
      {
        label: "Paste Layer",
        shortcut: "Ctrl+V",
        event: () => layers.duplicateLayer(clipboard.data, currentLayer),
        disabled: !clipboard.data || clipboard.type !== "layer"
      }
    ]
  } else if (targetType === "layer") {
    // select layer
    app.currentLayer = parseInt(targetIndex)
    // show layer options
    app.context.items = [
      {
        label: "Duplicate Layer",
        shortcut: "Ctrl+J",
        event: () => layers.duplicateLayer(app.layer)
      },
      {
        label: "Copy Layer",
        shortcut: "Ctrl+C",
        event: () => {
          clipboard.data = common.clone(app.layer)
          clipboard.type = "layer"
        }
      },
      {
        label: "Paste Layer",
        shortcut: "Ctrl+V",
        event: () => layers.duplicateLayer(clipboard.data, targetIndex),
        disabled: !clipboard.data || clipboard.type !== "layer"
      },
      {
        type: "separator"
      },
      {
        label: "Copy Layer Style",
        shortcut: "Ctrl+Shift+C",
        event: () => {
          clipboard.data = common.clone(app.layer)
          clipboard.type = "style"
        }
      },
      {
        label: "Paste Layer Style",
        shortcut: "Ctrl+Shift+V",
        event: () => layers.applyLayerStyle(clipboard.data, targetIndex),
        disabled: !clipboard.data || clipboard.type !== "style"
      },
      {
        type: "separator"
      },
      {
        label: "Move Layer Up",
        shortcut: "PageUp",
        event: layers.moveCurrentLayerUp,
        disabled: targetIndex === 0
      },
      {
        label: "Move Layer Down",
        shortcut: "PageDown",
        event: layers.moveCurrentLayerDown,
        disabled: targetIndex === layersArray.length - 1
      },
      {
        label: "Move to Top",
        shortcut: "Home",
        event: layers.moveCurrentLayerToTop,
        disabled: targetIndex === 0
      },
      {
        label: "Move to Bottom",
        shortcut: "End",
        event: layers.moveCurrentLayerToBottom,
        disabled: targetIndex === layersArray.length - 1
      },
      {
        type: "separator"
      },
      {
        label: "Delete Layer",
        shortcut: "Delete",
        event: layers.deleteCurrentLayer
      }
    ]
  } else if (targetType === "file-menu") {
    // show file menu options
    app.context.items = [
      {
        label: "Open...",
        shortcut: "Ctrl+O",
        event: () => file.openFile()
      },
      {
        label: "Save",
        shortcut: "Ctrl+S",
        event: () => file.saveFile()
      },
      {
        label: "Save As...",
        shortcut: "Ctrl+Shift+S",
        event: () => file.saveFile(true)
      },
      {
        label: "Close File",
        event: () => file.closeFile()
      },
      {
        type: "separator"
      },
      {
        label: "Export as Image...",
        shortcut: "Ctrl+E",
        event: () => app.openExportPopup()
      },
      {
        type: "separator"
      },
      {
        label: "Import Assets...",
        shortcut: "Ctrl+I",
        event: () => assets.importAssets()
      }
    ]
  } else if (targetType === "edit-menu") {
    // show edit menu options
    app.context.items = [
      {
        label: "Undo",
        shortcut: "Ctrl+Z",
        event: () => app.applyHistory(-1),
        disabled: history.index <= 0
      },
      {
        label: "Redo",
        shortcut: "Ctrl+Y",
        event: () => app.applyHistory(1),
        disabled: history.index >= history.data.length - 1
      },
      {
        type: "separator"
      },
      {
        label: "Canvas Size",
        shortcut: "Ctrl+Alt+C",
        event: () => app.openCanvasPopup()
      }
    ]
  } else if (targetType === "view-menu") {
    // show view menu options
    app.context.items = [
      {
        label: "Enter Fullscreen",
        shortcut: "F11",
        event: common.enterFullscreen,
        hidden: document.fullscreenElement
      },
      {
        label: "Exit Fullscreen",
        shortcut: "F11",
        event: common.exitFullscreen,
        hidden: !document.fullscreenElement
      },
      {
        type: "separator"
      },
      {
        label: "Fit to Screen",
        shortcut: "Ctrl+0",
        event: zoom.zoomToFittingSize
      },
      {
        label: "Actual Size",
        shortcut: "Ctrl+Alt+0",
        event: zoom.zoomToActualSize
      }
    ]
  } else if (targetType === "help-menu") {
    // show help menu options
    app.context.items = [
      {
        label: "About Graphica",
        shortcut: "F1",
        event: common.about
      },
      {
        label: "Open GitHub",
        shortcut: "F2",
        event: common.github
      }
    ]
  }
}

const onContextClose = () => {
  // app instance
  const app = common.getApp()
  // reset context items
  app.context.items = null
  // reset context type
  app.context.type = null
}

window.addEventListener("mousedown", event => {
  // return if mousedown inside context
  if (event.target.className.includes("context")) { return }
  // close context
  onContextClose()
})

window.addEventListener("click", event => {
  // return if click on context item
  if (event.target.className !== "context-item") { return }
  // close context
  onContextClose()
})

export const context = { onContextOpen, onContextClose }
