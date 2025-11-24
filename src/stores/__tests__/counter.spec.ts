import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('Counter Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  it('initializes with count of 0', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
  })

  it('computes doubleCount correctly', () => {
    const store = useCounterStore()
    expect(store.doubleCount).toBe(0)

    store.count = 5
    expect(store.doubleCount).toBe(10)
  })

  it('increments count when increment is called', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)

    store.increment()
    expect(store.count).toBe(1)

    store.increment()
    expect(store.count).toBe(2)
  })
})
