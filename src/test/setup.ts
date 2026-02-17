import "@testing-library/jest-dom"
import { expect, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import "../i18n"

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock IntersectionObserver (needed for some components)
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return []
    }
    unobserve() {}
} as any

// Mock ResizeObserver (needed for some components)
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
} as any

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock as any

// Radix UI (Select/Popover) relies on Pointer Events APIs that JSDOM doesn't fully implement.
// Provide minimal pointer-capture polyfills to avoid unhandled exceptions in tests.
if (!('hasPointerCapture' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
        configurable: true,
        value: () => false,
    })
}
if (!('setPointerCapture' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
        configurable: true,
        value: () => {},
    })
}
if (!('releasePointerCapture' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'releasePointerCapture', {
        configurable: true,
        value: () => {},
    })
}

if (!('scrollIntoView' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        value: () => {},
    })
}
