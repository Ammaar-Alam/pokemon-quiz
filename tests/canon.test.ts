import { describe, it, expect } from 'vitest'
import { canon } from '@/lib/canon'

describe('canon', () => {
  it('removes punctuation and diacritics', () => {
    expect(canon("Mr. Mime")).toBe('mrmime')
    expect(canon("Farfetch’d")).toBe('farfetchd')
    expect(canon('Ho-Oh')).toBe('hooh')
  })
  it('maps gender symbols', () => {
    expect(canon('Nidoran♀')).toBe('nidoranf')
    expect(canon('Nidoran♂')).toBe('nidoranm')
  })
})

