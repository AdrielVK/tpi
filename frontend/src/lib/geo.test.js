import { describe, expect, it } from 'vitest';
import { formatDistance, formatScale, scaleDenominator, summarizeProperties } from './geo.js';

describe('formatDistance', () => {
  it('formatea metros sin decimales por debajo de 1 km', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(950)).toBe('950 m');
  });

  it('formatea kilometros con dos decimales desde 1 km', () => {
    expect(formatDistance(1000)).toBe('1.00 km');
    expect(formatDistance(1534.4)).toBe('1.53 km');
    expect(formatDistance(12345)).toBe('12.35 km');
  });
});

describe('formatScale', () => {
  it('formatea la escala con separador de miles', () => {
    expect(formatScale(10000)).toBe('1:10.000');
    expect(formatScale(3779527.559)).toBe('1:3.779.528');
  });
});

describe('scaleDenominator', () => {
  it('convierte resolucion (m/px) y dpi a denominador de escala', () => {
    // 1 px = 0.0254 / 96 m en pantalla
    expect(scaleDenominator(1000, 96)).toBeCloseTo(3779527.559, 2);
    expect(scaleDenominator(0, 96)).toBe(0);
  });
});

describe('summarizeProperties', () => {
  it('descarta la geometria y los valores vacios', () => {
    const out = summarizeProperties({
      geometry: { type: 'Point' },
      nombre: 'Ruta 11',
      tipo: '',
      nro_ruta: null,
      gid: 7,
    });
    expect(out).toEqual([
      { key: 'nombre', value: 'Ruta 11' },
      { key: 'gid', value: '7' },
    ]);
  });

  it('limita la cantidad de campos', () => {
    const props = { geometry: null, a: 1, b: 2, c: 3 };
    expect(summarizeProperties(props, 2)).toHaveLength(2);
  });
});
