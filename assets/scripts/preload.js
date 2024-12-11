// preload elements
const splash = document.querySelector(".splash")
const splashText = document.querySelector(".splash-loading")

const printLoader = async text => (
  new Promise(resolve => {
    // set preload text on element
    splashText.innerHTML = text.replace(/\//g, "  🢒  ")
    // resolve with delay
    setTimeout(resolve, 80)
  })
)

const concatModules = data => (
  // concat all object values
  Object.values(data).reduce((object, current) => ({
    ...object, ...current
  }), {})
)

export const preload = input => {
  // return promise
  return new Promise(async resolve => {
    // scripts object
    const scripts = {}
    // for each script
    for (let i = 0; i < input.scripts.length; i++) {
      // current script
      const script = input.scripts[i]
      // print loading text
      await printLoader(script)
      // import and assign to script object
      Object.assign(scripts, await import(`../${script}.js`))
    }
    // layouts object
    const layouts = {}
    // for each layout
    for (let i = 0; i < input.layouts.length; i++) {
      // current layout
      const layout = input.layouts[i]
      // get layout path
      const path = layout.split(":")[0]
      // print loading text
      await printLoader(path)
      // load template
      const template = await fetch(`./assets/${path}.html`)
        .then(resp => resp.text())
      // find layout target
      const target = document.querySelector(`[data-path="${path}"]`)
      // replace target element
      target.outerHTML = template
      // check for script
      if (layout.includes(":js")) {
        // import and assign to layouts object
        Object.assign(layouts, await import(`../${path}.js`))
      }
    }
    // load default artwork
    await printLoader("templates/default")
    const artwork = await fetch(`./assets/${input.artwork}`)
      .then(resp => resp.blob())
    // remove splash screen
    splash.setAttribute("data-loaded", "")
    // resolve scripts and layouts
    resolve({
      scripts: concatModules(scripts),
      layouts: concatModules(layouts),
      artwork: artwork
    })
  })
}
