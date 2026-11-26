<?xml version="1.0" encoding="UTF-8"?>
<!--
  Red vial jerarquizada (SIG IGN 250) para GeoServer.
  Jerarquia por administra x tipo, 5 niveles de mas a menos importante:
    1. Ruta nacional / internacional .... 2.0x  (rojo profundo)
    2. Ruta provincial pavimentada ...... 1.5x  (naranja)
    3. Ruta provincial de tierra ........ 1.0x  (ambar)
    4. Calle/camino local pavimentado ... 1.0x  (arena)
    5. Calle/camino local sin pavimentar  0.8x  (crema)
  La capa no distingue urbano/rural: "Vecinal" es la red local (calles y caminos).
  Paleta: rampa calida rojo->naranja->amarillo->crema (criterio OSM Carto, ver README).
  Cada nivel lleva casing (halo) para que los tonos claros sigan siendo legibles.
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
      <Abstract>Cinco niveles de importancia con espesor y tonalidad decrecientes.</Abstract>
      <FeatureTypeStyle>

        <!-- Nivel 5: local sin pavimentar (se dibuja primero, queda debajo) -->
        <Rule>
          <Name>nivel5_local_sin_pavimentar</Name>
          <Title>5. Calle/camino local sin pavimentar (0.8x)</Title>
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

        <!-- Nivel 4: local pavimentado -->
        <Rule>
          <Name>nivel4_local_pavimentado</Name>
          <Title>4. Calle/camino local pavimentado (1x)</Title>
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

        <!-- Nivel 3: provincial de tierra / camino alternativo -->
        <Rule>
          <Name>nivel3_provincial_tierra</Name>
          <Title>3. Ruta provincial de tierra / camino alternativo (1x)</Title>
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

        <!-- Nivel 2: provincial pavimentada -->
        <Rule>
          <Name>nivel2_provincial_pavimentada</Name>
          <Title>2. Ruta provincial pavimentada (1.5x)</Title>
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

        <!-- Nivel 1: nacional / internacional (se dibuja ultimo, queda arriba) -->
        <Rule>
          <Name>nivel1_nacional</Name>
          <Title>1. Ruta nacional / internacional (2x)</Title>
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

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
