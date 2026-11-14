/** Safari's toolbar and keyboard can change the visible height without a layout resize. */
export function useVisibleViewport() {
  const height = ref<number>()
  let frame = 0
  function measure() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const viewport = window.visualViewport
      height.value = Math.round(
        viewport && viewport.scale === 1 ? viewport.height : window.innerHeight,
      )
    })
  }
  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', measure)
    window.visualViewport?.removeEventListener('resize', measure)
  })
  return height
}
