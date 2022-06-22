export function deg2rad(degrees) {
  return degrees * Math.PI / 180
}

export function rad2deg(radians) {
  return radians * 180 / Math.PI
}

export function trueVhCalc() {
  window.requestAnimationFrame(() => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)
    document.documentElement.style.setProperty("--vhh", `${vh}`)
   })
  }

  function goTrueVhCalc(i, height0) {
    if (window.innerHeight !== height0 || i >= 120) {
    trueVhCalc()
    } else {
      window.requestAnimationFrame(() => {
        goTrueVhCalc(i + 1, height0);
      })
    }
  }
  trueVhCalc()

  let trueVhCalcTick;
    window.addEventListener("orientationchange", () => {
    goTrueVhCalc(0, window.innerHeight)
  })

  window.addEventListener("resize", () => {
  window.cancelAnimationFrame(trueVhCalcTick)
  trueVhCalcTick = window.requestAnimationFrame(trueVhCalc)
})

export function clamp(num, min, max) {
  Math.min(Math.max(num, min), max)
}