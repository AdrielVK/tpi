import { describe, expect, it } from 'vitest';
import { combineCql } from './filters.js';

const classes = [
  { id: 'a', cql: "x='1'" },
  { id: 'b', cql: "x='2'" },
  { id: 'c', cql: "x='3'" },
];

describe('combineCql', () => {
  it('devuelve 1=1 cuando todas las clases estan activas', () => {
    expect(combineCql(classes, ['a', 'b', 'c'])).toBe('1=1');
  });

  it('devuelve 1=0 cuando no hay ninguna clase activa', () => {
    expect(combineCql(classes, [])).toBe('1=0');
  });

  it('combina las clases activas con OR, entre parentesis y en orden', () => {
    expect(combineCql(classes, ['c', 'a'])).toBe("(x='1') OR (x='3')");
  });

  it('ignora ids desconocidos', () => {
    expect(combineCql(classes, ['a', 'zzz'])).toBe("(x='1')");
  });
});
