import { describe, expect, it } from 'vitest';
import {
  buildGetFeatureUrl,
  buildInsertXml,
  escapeXml,
  parseTransactionSummary,
} from './wfs.js';

const base = { baseUrl: 'http://localhost:8081/geoserver', workspace: 'sig' };

describe('buildGetFeatureUrl', () => {
  it('arma una consulta por rectangulo como BBOX CQL (axis order lat,lon)', () => {
    const url = buildGetFeatureUrl({
      ...base,
      layer: 'red_vial',
      mode: 'bbox',
      extent4326: [-61, -28, -60, -27],
    });
    const params = new URL(url).searchParams;
    expect(params.get('service')).toBe('WFS');
    expect(params.get('version')).toBe('1.1.0');
    expect(params.get('request')).toBe('GetFeature');
    expect(params.get('typeName')).toBe('sig:red_vial');
    expect(params.get('srsName')).toBe('EPSG:4326');
    expect(params.get('outputFormat')).toBe('application/json');
    expect(params.get('CQL_FILTER')).toBe('BBOX(geom,-28,-61,-27,-60)');
    expect(params.get('bbox')).toBeNull();
  });

  it('arma una consulta por punto con un BBOX de tolerancia', () => {
    const url = buildGetFeatureUrl({
      ...base,
      layer: 'localidades',
      mode: 'point',
      point4326: [-58.98, -27.45],
      toleranceDegrees: 0.01,
      maxFeatures: 20,
    });
    const params = new URL(url).searchParams;
    expect(params.get('CQL_FILTER')).toBe('BBOX(geom,-27.46,-58.99,-27.44,-58.97)');
    expect(params.get('maxFeatures')).toBe('20');
  });

  it('combina el subfiltro de clases con el area', () => {
    const url = buildGetFeatureUrl({
      ...base,
      layer: 'red_vial',
      mode: 'bbox',
      extent4326: [-61, -28, -60, -27],
      cqlFilter: "administra='Nacional'",
    });
    expect(new URL(url).searchParams.get('CQL_FILTER')).toBe(
      "BBOX(geom,-28,-61,-27,-60) AND (administra='Nacional')",
    );
  });

  it('omite el subfiltro cuando vale 1=1 e incluye 1=0', () => {
    const all = buildGetFeatureUrl({
      ...base,
      layer: 'red_vial',
      mode: 'bbox',
      extent4326: [-61, -28, -60, -27],
      cqlFilter: '1=1',
    });
    expect(new URL(all).searchParams.get('CQL_FILTER')).toBe('BBOX(geom,-28,-61,-27,-60)');

    const none = buildGetFeatureUrl({
      ...base,
      layer: 'red_vial',
      mode: 'bbox',
      extent4326: [-61, -28, -60, -27],
      cqlFilter: '1=0',
    });
    expect(new URL(none).searchParams.get('CQL_FILTER')).toBe('BBOX(geom,-28,-61,-27,-60) AND (1=0)');
  });
});

describe('escapeXml', () => {
  it('escapa caracteres peligrosos', () => {
    expect(escapeXml('A & B <x> "y"')).toBe('A &amp; B &lt;x&gt; &quot;y&quot;');
  });
});

describe('buildInsertXml', () => {
  it('genera un Transaction insert para observaciones con geometria 4326', () => {
    const xml = buildInsertXml({
      ...base,
      namespace: 'http://sig.local',
      layer: 'observaciones',
      properties: { nombre: 'Puente <1>', descripcion: 'nota & detalle', categoria: 'puente' },
      lon: -58.98,
      lat: -27.45,
    });
    expect(xml).toContain('<wfs:Transaction');
    expect(xml).toContain('xmlns:sig="http://sig.local"');
    expect(xml).toContain('<wfs:Insert>');
    expect(xml).toContain('<sig:observaciones>');
    expect(xml).toContain('<sig:nombre>Puente &lt;1&gt;</sig:nombre>');
    expect(xml).toContain('<sig:descripcion>nota &amp; detalle</sig:descripcion>');
    expect(xml).toContain('<gml:Point srsName="EPSG:4326"><gml:pos>-58.98 -27.45</gml:pos></gml:Point>');
  });

  it('omite propiedades vacias', () => {
    const xml = buildInsertXml({
      ...base,
      namespace: 'http://sig.local',
      layer: 'observaciones',
      properties: { nombre: 'Solo nombre', descripcion: '   ', categoria: '' },
      lon: 0,
      lat: 0,
    });
    expect(xml).toContain('<sig:nombre>Solo nombre</sig:nombre>');
    expect(xml).not.toContain('<sig:descripcion>');
    expect(xml).not.toContain('<sig:categoria>');
  });
});

describe('parseTransactionSummary', () => {
  it('extrae los totales del TransactionResponse', () => {
    const xml =
      '<wfs:TransactionResponse><wfs:TransactionSummary>' +
      '<wfs:totalInserted>1</wfs:totalInserted>' +
      '<wfs:totalUpdated>0</wfs:totalUpdated>' +
      '<wfs:totalDeleted>0</wfs:totalDeleted>' +
      '</wfs:TransactionSummary></wfs:TransactionResponse>';
    expect(parseTransactionSummary(xml)).toEqual({ inserted: 1, updated: 0, deleted: 0 });
  });

  it('devuelve null si no hay resumen', () => {
    expect(parseTransactionSummary('<html>error</html>')).toBeNull();
  });
});
