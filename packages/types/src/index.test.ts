import { describe, expect, it } from 'vitest'
import { carLabel, type Car } from './index'

describe('carLabel', () => {
  it('formats label correctly', () => {
    const car: Car = { id: '1', make: 'Toyota', model: 'Corolla', year: 2020 }
    expect(carLabel(car)).toBe('2020 Toyota Corolla')
  })
})

