import { parse } from 'node-html-parser'
import { extractPageTitle } from './check';

test('extractPageTitle - null head', () => {
  expect(extractPageTitle(null)).toBeUndefined();
})

test('extractPageTitle - no title element', () => {
  const head = parse('<meta charset="utf-8">');
  expect(extractPageTitle(head)).toBeUndefined();
})

test('extractPageTitle - empty title', () => {
  const head = parse('<title></title>');
  expect(extractPageTitle(head)).toBeUndefined();
})

test('extractPageTitle - whitespace only title', () => {
  const head = parse('<title>   \n  </title>');
  expect(extractPageTitle(head)).toBeUndefined();
})

test('extractPageTitle - regular title', () => {
  const head = parse('<title>My Page</title>');
  expect(extractPageTitle(head)).toBe('My Page');
})

test('extractPageTitle - trims whitespace', () => {
  const head = parse('<title>  Padded Title  </title>');
  expect(extractPageTitle(head)).toBe('Padded Title');
})

test('extractPageTitle - picks first title when multiple', () => {
  const head = parse('<title>First</title><title>Second</title>');
  expect(extractPageTitle(head)).toBe('First');
})
