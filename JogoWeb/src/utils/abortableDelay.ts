export function abortableDelay(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(signal.reason)
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, milliseconds)

    function handleAbort() {
      window.clearTimeout(timer)
      reject(signal.reason)
    }

    signal.addEventListener('abort', handleAbort, { once: true })
  })
}
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function abortController(controller: AbortController | null): void {
  controller?.abort(new DOMException('Execução cancelada.', 'AbortError'))
}
