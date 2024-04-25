import { getUrl } from '@/helper'

test('getUrl', () => {
  expect(getUrl('https://example.com')).toBe('https://example.com');
  expect(getUrl('1234')).toBe('http://localhost:1234');
  expect(getUrl('http://localhost:3000')).toBe('http://localhost:3000');
})
