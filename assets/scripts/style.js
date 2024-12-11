const toSizesArray = input => (
  `${Array.isArray(input) ? input.join("px ") : input}px`
)

const toHexColor = input => (
  `${input.color}${parseInt(255 * input.opacity / 100)
    .toString(16)
    .padStart(2, "0")}`
)

const toHexColorsArray = input => (
  [...input].reverse().map(item => toHexColor(item)).join(", ")
)

const styleLayer = (index, target) => {
  // app instance
  const app = window.$app
  // get canvas
  const canvas = app.canvas
  // assets array
  const assets = app.assets
  // layers array
  const layers = app.layers
  // current layer data
  const data = layers[index]
  // target flags
  const isToOuter = target === "outer"
  const isToInner = target === "inner"
  const isToPreview = target === "preview"
  // layer mode flags
  const isSurface = data.mode === "surface"
  const isObject = data.mode === "object"
  const isText = data.mode === "text"
  /** style object @type {CSSStyleDeclaration} */
  const style = { zIndex: layers.length - index }
  // blend mode
  style.mixBlendMode = isToPreview || isToInner ? "normal" : data.blend
  // return only index by layer mode
  if (isToOuter && isObject) { return style }
  if (isToInner && isSurface) { return style }
  // visibility
  style.display = data.visible || isToPreview ? "flex" : "none"
  // opacity
  style.opacity = data.opacity / 100
  // filter
  if (isToOuter || isToInner && isObject) {
    style.filter = `
      blur(${data.filters.blur}px)
      brightness(${data.filters.brightness}%)
      contrast(${data.filters.contrast}%)
      grayscale(${data.filters.grayscale}%)
      hue-rotate(${data.filters.hue}deg)
      saturate(${data.filters.saturation}%)
      invert(${data.filters.invert}%)
    `
  }
  // background
  if (isSurface || isObject) {
    if (data.background.type === "color") {
      // solid background
      style.backgroundColor = toHexColor(data.background.data.color)
    } else if (data.background.type === "gradient") {
      // gradient background
      const gradient = data.background.data.gradient
      style.backgroundImage = `${gradient.type}-gradient(
        ${gradient.type === "linear" ? `${gradient.angle}deg, ` : ""}
        ${toHexColorsArray(gradient.colors)}
      )`
    } else if (data.background.type === "texture") {
      // texture background
      const texture = data.background.data.texture
      const asset = assets.find(item => item.id === texture.id)
      // check texture id
      if (texture.id !== "none" && asset) {
        style.backgroundImage = `
          url(${asset.blob})
        `
        if (!isToPreview) {
          style.backgroundPosition = texture.position.type !== "custom"
            ? texture.position.type
            : `${texture.position.x}px ${texture.position.y}px`
          style.backgroundSize = texture.size.type === "custom"
            ? `${texture.size.x}px ${texture.size.y}px`
            : texture.size.type === "stretch"
              ? "100% 100%"
              : texture.size.type
          style.backgroundRepeat = texture.repeat
        }
      } else {
        // reset texture id
        texture.id = "none"
      }
    }
  }
  // data objects
  const dimensions = data.dimensions
  const border = data.border
  const radius = data.radius
  const shadow = data.shadow
  const text = data.text
  // set text style
  if (isText) {
    // font family
    const font = assets.find(item => item.id === text.family)
    // check font asset
    if (font) {
      // set font family
      style.fontFamily = font ? font.id : "Ubuntu"
    } else {
      // reset font
      text.family = "none"
    }
    if (!isToPreview) {
      // font size
      style.fontSize = `${text.size}px`
      // text color
      style.color = `${toHexColor(text)}`
      // font size
      style.textAlign = text.align
      // text shadow
      if (text.shadow.type !== "none") {
        style.textShadow = `
          ${text.shadow.offset.x}px
          ${text.shadow.offset.y}px
          ${text.shadow.radius}px
          ${toHexColor(text.shadow)}
        `
      }
    }
  }
  // return only above style for preview
  if (isToPreview) { return style }
  // layer position and rotation
  if (isObject && !isText || !isToInner && isText) {
    style.transform = `
      translateX(${data.position.x}px)
      translateY(${data.position.y}px)
      rotate(${data.rotation}deg)
    `
  }
  // object dimensions
  if (isObject) {
    style.width = `${dimensions.width}px`
    style.height = `${dimensions.height}px`
  } else if (isSurface || isText) {
    style.width = `${canvas.width}px`
    style.height = `${canvas.height}px`
  }
  // set box styles
  if (isObject) {
    // border
    if (border.type !== "none") {
      style.border = `
        ${border.size}px
        ${border.type}
        ${toHexColor(border)}
      `
    }
    // radius
    if (radius.type !== "none") {
      style.borderRadius = radius.type === "full"
        ? "100% 100%"
        : toSizesArray(
          radius.type === "all"
            ? radius.sides.all
            : radius.sides.each
        )
    }
    // box shadow
    if (shadow.type !== "none") {
      style.boxShadow = `
        ${shadow.type === "inset" ? "inset" : ""}
        ${shadow.offset.x}px
        ${shadow.offset.y}px
        ${shadow.radius}px
        ${shadow.spread}px
        ${toHexColor(shadow)}
      `
    }
  }
  // return style object
  return style
}

const styleWorkspace = () => {
  // app instance
  const app = window.$app
  // check hand tool
  if (app.workspace.tool === "hand" || app.workspace.hand) {
    // hand tool
    return ({ cursor: app.workspace.down ? "grabbing" : "grab" })
  } else if (!app.workspace.hand) {
    // move tool
    if (app.workspace.tool === "move") {
      return ({ cursor: "default" })
    }
  }
}

const styleWorkspaceGrid = () => {
  // app instance
  const app = window.$app
  // return style object
  return ({
    transform: `
      scale(${app.workspace.zoom / 100})
      translateX(${app.workspace.pan.x}px)
      translateY(${app.workspace.pan.y}px)
    `
  })
}

const styleCanvas = () => {
  // app instance
  const app = window.$app
  // return style object
  return ({
    width: `${app.canvas.width}px`,
    height: `${app.canvas.height}px`
  })
}

const styleTransform = () => {
  // app instance
  const app = window.$app
  // return style object
  return ({
    width: `${app.canvas.width}px`,
    height: `${app.canvas.height}px`
  })
}

const styleTransformBound = () => {
  // app instance
  const app = window.$app
  // current layer
  const layer = app.layer
  // hide transform when no current layer or not in move tool
  if (!layer || app.workspace.tool !== "move" || app.workspace.hand) {
    return ({ display: "none" })
  }
  // return style object by layer mode
  if (layer.mode === "surface") {
    return ({
      width: `${app.canvas.width}px`,
      height: `${app.canvas.height}px`
    })
  } else if (layer.mode === "object") {
    return ({
      width: `${layer.dimensions.width}px`,
      height: `${layer.dimensions.height}px`,
      transform: `
        translateX(${layer.position.x}px)
        translateY(${layer.position.y}px)
        rotate(${layer.rotation}deg)
      `
    })
  } else if (layer.mode === "text") {
    return ({
      fontSize: `${layer.text.size}px`,
      textAlign: `${layer.text.align}px`,
      fontFamily: layer.text.family !== "none"
        ? layer.text.family
        : "Ubuntu",
      transform: `
        translateX(${layer.position.x}px)
        translateY(${layer.position.y}px)
        rotate(${layer.rotation}deg)
      `
    })
  }
}

const styleContext = () => {
  // app instance
  const app = window.$app
  // return style object
  return ({
    left: `${app.context.position.x}px`,
    top: `${app.context.position.y}px`
  })
}

const styleAsset = data => {
  if (data.type === "image") {
    return ({
      backgroundImage: `url(${data.blob})`
    })
  } else if (data.type === "font") {
    return ({
      fontFamily: data.id
    })
  }
}

export const style = {
  styleLayer,
  styleAsset,
  styleWorkspace,
  styleWorkspaceGrid,
  styleCanvas,
  styleTransform,
  styleTransformBound,
  styleContext
}
