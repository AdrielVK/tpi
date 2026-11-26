<?xml version="1.0" encoding="UTF-8"?>
<!--
  Red vial jerarquizada (SIG IGN 250) para GeoServer.
  Jerarquia por administra x tipo, 5 niveles de mas a menos importante:
    1. Ruta nacional / internacional .... 2.0x  (rojo profundo)
    2. Ruta provincial pavimentada ...... 1.5x  (naranja)
    3. Ruta provincial de tierra ........ 1.0x  (ambar)
    4. Calle/camino local pavimentado ... 1.0x  (arena)
    5. Calle/camino local sin pavimentar  0.8x  (crema)

  Ancho segun la escala de visualizacion (SLD estandar, 4 tramos):
    < 1:500.000              -> 100%
    1:500.000 - 1:1.000.000  -> ~88%
    1:1.000.000 - 1:2.000.000-> ~75%
    >= 1:2.000.000           -> piso constante (para evitar el "bulto" a nivel pais)
  El tramo >= 1:2.000.000 no se reduce mas: el trazo queda constante y legible.
  La capa no distingue urbano/rural: "Vecinal" es la red local (calles y caminos).
  Paleta: rampa calida rojo->naranja->amarillo->crema (criterio OSM Carto).
-->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>red_vial</Name>
    <UserStyle>
      <Name>red_vial_jerarquia</Name>
      <Title>Red vial jerarquizada</Title>
      <Abstract>Cinco niveles de importancia con espesor y tonalidad decrecientes y ancho adaptado a la escala.</Abstract>
      <FeatureTypeStyle>
        <Rule>
          <Name>nivel5_local_sin_pavimentar_cercano</Name>
          <Title>5. Calle/camino local sin pavimentar (0.8x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#9a9384</CssParameter>
              <CssParameter name="stroke-width">2.4</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#fbf2d8</CssParameter>
              <CssParameter name="stroke-width">1.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel5_local_sin_pavimentar_medio</Name>
          <Title>5. Calle/camino local sin pavimentar (0.8x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#9a9384</CssParameter>
              <CssParameter name="stroke-width">2.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#fbf2d8</CssParameter>
              <CssParameter name="stroke-width">1.4</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel5_local_sin_pavimentar_medio_lejos</Name>
          <Title>5. Calle/camino local sin pavimentar (0.8x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#9a9384</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#fbf2d8</CssParameter>
              <CssParameter name="stroke-width">1.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel5_local_sin_pavimentar_lejos</Name>
          <Title>5. Calle/camino local sin pavimentar (0.8x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#9a9384</CssParameter>
              <CssParameter name="stroke-width">1.3</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#fbf2d8</CssParameter>
              <CssParameter name="stroke-width">0.8</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel4_local_pavimentado_cercano</Name>
          <Title>4. Calle/camino local pavimentado (1x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8f8260</CssParameter>
              <CssParameter name="stroke-width">2.9</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f6dea6</CssParameter>
              <CssParameter name="stroke-width">2.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel4_local_pavimentado_medio</Name>
          <Title>4. Calle/camino local pavimentado (1x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8f8260</CssParameter>
              <CssParameter name="stroke-width">2.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f6dea6</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel4_local_pavimentado_medio_lejos</Name>
          <Title>4. Calle/camino local pavimentado (1x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8f8260</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f6dea6</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel4_local_pavimentado_lejos</Name>
          <Title>4. Calle/camino local pavimentado (1x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Vecinal</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#8f8260</CssParameter>
              <CssParameter name="stroke-width">1.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f6dea6</CssParameter>
              <CssParameter name="stroke-width">1.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel3_provincial_tierra_cercano</Name>
          <Title>3. Ruta provincial de tierra / camino alternativo (1x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#92701f</CssParameter>
              <CssParameter name="stroke-width">2.9</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f0b95f</CssParameter>
              <CssParameter name="stroke-width">2.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel3_provincial_tierra_medio</Name>
          <Title>3. Ruta provincial de tierra / camino alternativo (1x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#92701f</CssParameter>
              <CssParameter name="stroke-width">2.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f0b95f</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel3_provincial_tierra_medio_lejos</Name>
          <Title>3. Ruta provincial de tierra / camino alternativo (1x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#92701f</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f0b95f</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel3_provincial_tierra_lejos</Name>
          <Title>3. Ruta provincial de tierra / camino alternativo (1x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:Not>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                  <ogc:PropertyName>tipo</ogc:PropertyName>
                  <ogc:Literal>*Pavimentado*</ogc:Literal>
                </ogc:PropertyIsLike>
              </ogc:Not>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#92701f</CssParameter>
              <CssParameter name="stroke-width">1.7</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#f0b95f</CssParameter>
              <CssParameter name="stroke-width">1.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel2_provincial_pavimentada_cercano</Name>
          <Title>2. Ruta provincial pavimentada (1.5x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#7d420c</CssParameter>
              <CssParameter name="stroke-width">4.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#e07b27</CssParameter>
              <CssParameter name="stroke-width">3.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel2_provincial_pavimentada_medio</Name>
          <Title>2. Ruta provincial pavimentada (1.5x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#7d420c</CssParameter>
              <CssParameter name="stroke-width">3.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#e07b27</CssParameter>
              <CssParameter name="stroke-width">2.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel2_provincial_pavimentada_medio_lejos</Name>
          <Title>2. Ruta provincial pavimentada (1.5x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#7d420c</CssParameter>
              <CssParameter name="stroke-width">3.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#e07b27</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel2_provincial_pavimentada_lejos</Name>
          <Title>2. Ruta provincial pavimentada (1.5x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Provincial</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="!">
                <ogc:PropertyName>tipo</ogc:PropertyName>
                <ogc:Literal>*Pavimentado*</ogc:Literal>
              </ogc:PropertyIsLike>
            </ogc:And>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#7d420c</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#e07b27</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel1_nacional_cercano</Name>
          <Title>1. Ruta nacional / internacional (2x)</Title>
          <MaxScaleDenominator>500000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:Or>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Nacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Internacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:Or>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#5c0f0a</CssParameter>
              <CssParameter name="stroke-width">5.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b3261e</CssParameter>
              <CssParameter name="stroke-width">4.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel1_nacional_medio</Name>
          <Title>1. Ruta nacional / internacional (2x)</Title>
          <MinScaleDenominator>500000</MinScaleDenominator>
          <MaxScaleDenominator>1000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:Or>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Nacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Internacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:Or>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#5c0f0a</CssParameter>
              <CssParameter name="stroke-width">4.7</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b3261e</CssParameter>
              <CssParameter name="stroke-width">3.6</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel1_nacional_medio_lejos</Name>
          <Title>1. Ruta nacional / internacional (2x)</Title>
          <MinScaleDenominator>1000000</MinScaleDenominator>
          <MaxScaleDenominator>2000000</MaxScaleDenominator>
          <ogc:Filter>
            <ogc:Or>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Nacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Internacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:Or>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#5c0f0a</CssParameter>
              <CssParameter name="stroke-width">4.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b3261e</CssParameter>
              <CssParameter name="stroke-width">3.1</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
        <Rule>
          <Name>nivel1_nacional_lejos</Name>
          <Title>1. Ruta nacional / internacional (2x)</Title>
          <MinScaleDenominator>2000000</MinScaleDenominator>
          <ogc:Filter>
            <ogc:Or>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Nacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>administra</ogc:PropertyName>
                <ogc:Literal>Internacional</ogc:Literal>
              </ogc:PropertyIsEqualTo>
            </ogc:Or>
          </ogc:Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#5c0f0a</CssParameter>
              <CssParameter name="stroke-width">3.0</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#b3261e</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
