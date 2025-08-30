export type Car = {
  id: string
  make: string
  model: string
  year: number
}

export function carLabel(c: Car): string {
  return `${c.year} ${c.make} ${c.model}`
}

