import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  '[data-modal-autofocus]',
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
  )
}

export function useModalFocus<T extends HTMLElement>(active: boolean, focusKey?: unknown) {
  const dialogRef = useRef<T>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    return () => {
      const returnTarget = returnFocusRef.current
      returnFocusRef.current = null
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true })
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    const dialog = dialogRef.current
    if (!dialog) return

    const elements = focusableElements(dialog)
    const preferredTarget = dialog.querySelector<HTMLElement>('[data-modal-autofocus]')
    const initialTarget = preferredTarget ?? elements[0] ?? dialog
    initialTarget.focus({ preventScroll: true })

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const currentElements = focusableElements(dialog)
      if (currentElements.length === 0) {
        event.preventDefault()
        dialog.focus({ preventScroll: true })
        return
      }

      const first = currentElements[0]
      const last = currentElements[currentElements.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', trapFocus)
    return () => dialog.removeEventListener('keydown', trapFocus)
  }, [active, focusKey])

  return dialogRef
}
