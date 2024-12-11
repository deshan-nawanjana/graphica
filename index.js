import { preload } from "./assets/scripts/preload.js"

const resources = await preload({
  scripts: [
    "scripts/common",
    "scripts/drag",
    "scripts/keyboard",
    "scripts/file",
    "scripts/history",
    "scripts/style"
  ],
  layouts: [
    "layouts/header/menu",
    "layouts/tools/cursor",
    "layouts/tools/zoom:js",
    "layouts/listings/assets:js",
    "layouts/listings/layers:js",
    "layouts/options/general",
    "layouts/options/background",
    "layouts/options/text",
    "layouts/options/border",
    "layouts/options/shadow",
    "layouts/options/filters",
    "layouts/overlay/context:js",
    "layouts/overlay/canvas:js",
    "layouts/overlay/export:js",
    "layouts/workspace:js"
  ],
  artwork: "templates/default.graphica"
})

window.$app = new Vue({
  el: "#app",
  data: {
    // ready state
    ready: false,
    // file saved state
    saved: true,
    // canvas data
    canvas: {
      width: 800,
      height: 600
    },
    // assets array
    assets: [],
    // layers array
    layers: [],
    // current selected asset
    currentAsset: null,
    // current selected layer
    currentLayer: null,
    // workspace data
    workspace: {
      // current tool
      tool: "hand",
      // quick hand mode
      hand: false,
      // cursor down state
      down: false,
      // cursor drag state
      drag: false,
      // zoom level
      zoom: 100,
      // pan position
      pan: { x: 0, y: 0 },
      // cursor position
      cursor: null
    },
    // context data
    context: {
      // context menu type
      type: null,
      // context screen position
      position: { x: 0, y: 0 },
      // context menu items
      items: null
    },
    // drag and drop data
    drag: {
      // drop target id
      target: null
    },
    // clipboard data
    clipboard: {
      type: null,
      data: null
    },
    // popups data
    popups: {
      canvas: {
        open: "none",
        width: 0,
        height: 0
      },
      export: {
        open: "none",
        busy: false,
        width: 0,
        height: 0
      }
    },
    // history data
    history: {
      data: [],
      index: -1
    }
  },
  computed: {
    // current layer data
    layer() { return this.layers[this.currentLayer] }
  },
  methods: {
    // layouts
    ...resources.scripts,
    ...resources.layouts,
    // method to add gradient color
    addGradientColor() {
      this.layer.background.data.gradient.colors.push({
        color: "#FF0000", opacity: 100
      })
    },
    // method to delete gradient color
    deleteGradientColor(index) {
      const gradient = this.layer.background.data.gradient
      gradient.colors = gradient.colors.filter((_item, i) => (
        i !== index
      ))
    },
    // method to move gradient color
    moveGradientColor(index, direction) {
      const gradient = this.layer.background.data.gradient
      // gte target index
      const targetIndex = index + direction
      // get target and source colors
      const target = gradient.colors[targetIndex]
      const source = gradient.colors[index]
      // update layers
      gradient.colors[index] = target
      gradient.colors[targetIndex] = source
      // reassign colors array
      gradient.colors = [...gradient.colors]
    }
  },
  mounted() {
    setTimeout(async () => {
      await this.loadFile(resources.artwork)
      this.ready = true
    }, 100)
  }
})
