import '@testing-library/jest-dom/vitest'

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
})
