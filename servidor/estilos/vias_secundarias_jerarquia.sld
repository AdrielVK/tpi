<?xml version="1.0" encoding="UTF-8"?>
<!--
  Vias secundarias / senderos (SIG IGN 250).
  Misma logica de jerarquia (mas a menos importante, mas oscuro a mas claro)
  pero en otra familia de color: marron/ocre (convencion cartografica para
  huellas y senderos; OSM Carto usa #996600 para "track").
    1. Huella, Rodera .............. 1.0x  (marron oscuro)
    2. Senda, Camino de Herradura .. 0.8x  (marron medio)
    3. Picada, Contrafuego ......... 0.6x  (marron claro, linea discontinua)

  Ancho segun la escala de visualizacion (SLD estandar, 4 tramos):
    < 1:500.000              -> 100%
    1:500.000 - 1:1.000.000  -> ~88%
    1:1.000.000 - 1:2.000.000-> ~75%
    >= 1:2.000.000           -> piso constante
-->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>vias_secundarias</Name>
    <UserStyle>
      <Name>vias_secundarias_jerarquia</Name>
      <Title>Vias secundarias jerarquizadas</Title>
      <Abstract>Huellas y senderos en gama marron, con espesor y tono decrecientes y ancho adaptado a la escala.</Abstract>
      <FeatureTypeStyle>
        <Rule>
          <Name>picada_cercano</Name>
          <Title>3. Picada / contrafuego (0.6x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Picada, Contrafuego</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8a6a3a</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#d3a86a</CssParameter>
              <CssParameter name="stroke-width">1.2</CssParameter>
              <CssParameter name="stroke-dasharray">6 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>picada_medio</Name>
          <Title>3. Picada / contrafuego (0.6x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Picada, Contrafuego</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8a6a3a</CssParameter>
              <CssParameter name="stroke-width">1.6</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#d3a86a</CssParameter>
              <CssParameter name="stroke-width">1.1</CssParameter>
              <CssParameter name="stroke-dasharray">6 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>picada_medio_lejos</Name>
          <Title>3. Picada / contrafuego (0.6x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Picada, Contrafuego</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8a6a3a</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#d3a86a</CssParameter>
              <CssParameter name="stroke-width">0.9</CssParameter>
              <CssParameter name="stroke-dasharray">6 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>picada_lejos</Name>
          <Title>3. Picada / contrafuego (0.6x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Picada, Contrafuego</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8a6a3a</CssParameter>
              <CssParameter name="stroke-width">1.2</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#d3a86a</CssParameter>
              <CssParameter name="stroke-width">0.7</CssParameter>
              <CssParameter name="stroke-dasharray">6 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>senda_cercano</Name>
          <Title>2. Senda / camino de herradura (0.8x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Senda, Camino de Herradura</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#6d4a1c</CssParameter>
              <CssParameter name="stroke-width">2.3</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b07b33</CssParameter>
              <CssParameter name="stroke-width">1.6</CssParameter>
              <CssParameter name="stroke-dasharray">10 5</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>senda_medio</Name>
          <Title>2. Senda / camino de herradura (0.8x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Senda, Camino de Herradura</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#6d4a1c</CssParameter>
              <CssParameter name="stroke-width">2.1</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b07b33</CssParameter>
              <CssParameter name="stroke-width">1.4</CssParameter>
              <CssParameter name="stroke-dasharray">10 5</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>senda_medio_lejos</Name>
          <Title>2. Senda / camino de herradura (0.8x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Senda, Camino de Herradura</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#6d4a1c</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b07b33</CssParameter>
              <CssParameter name="stroke-width">1.2</CssParameter>
              <CssParameter name="stroke-dasharray">10 5</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>senda_lejos</Name>
          <Title>2. Senda / camino de herradura (0.8x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Senda, Camino de Herradura</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#6d4a1c</CssParameter>
              <CssParameter name="stroke-width">1.4</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b07b33</CssParameter>
              <CssParameter name="stroke-width">0.9</CssParameter>
              <CssParameter name="stroke-dasharray">10 5</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>huella_cercano</Name>
          <Title>1. Huella / rodera (1x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Huella, Rodera</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#4a2c0a</CssParameter>
              <CssParameter name="stroke-width">2.8</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8d5a1e</CssParameter>
              <CssParameter name="stroke-width">2.0</CssParameter>
              <CssParameter name="stroke-dasharray">12 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>huella_medio</Name>
          <Title>1. Huella / rodera (1x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Huella, Rodera</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#4a2c0a</CssParameter>
              <CssParameter name="stroke-width">2.5</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8d5a1e</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-dasharray">12 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>huella_medio_lejos</Name>
          <Title>1. Huella / rodera (1x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Huella, Rodera</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#4a2c0a</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8d5a1e</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-dasharray">12 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>huella_lejos</Name>
          <Title>1. Huella / rodera (1x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>tipo</ogc:PropertyName>
              <ogc:Literal>Huella, Rodera</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#4a2c0a</CssParameter>
              <CssParameter name="stroke-width">1.7</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8d5a1e</CssParameter>
              <CssParameter name="stroke-width">1.1</CssParameter>
              <CssParameter name="stroke-dasharray">12 4</CssParameter>
              <CssParameter name="stroke-linecap">butt</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
