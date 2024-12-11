const clone = data => JSON.parse(JSON.stringify(data))

const getApp = () => {
  // return app instance
  return window.$app
}

const enterFullscreen = () => {
  // return if already in fullscreen
  if (document.fullscreenElement) { return }
  // enter full screen
  document.body.requestFullscreen()
}

const exitFullscreen = () => {
  // return if no fullscreen element
  if (!document.fullscreenElement) { return }
  // exit fullscreen
  document.exitFullscreen()
}

const switchFullscreen = () => {
  document.fullscreenElement
    ? exitFullscreen() : enterFullscreen()
}

const about = () => {
  window.open("https://github.com/deshan-nawanjana")
}

const github = () => {
  window.open("https://github.com/deshan-nawanjana/graphica")
}

export const common = {
  clone,
  getApp,
  enterFullscreen,
  exitFullscreen,
  switchFullscreen,
  about,
  github
}
