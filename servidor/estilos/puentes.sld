<?xml version="1.0" encoding="UTF-8"?>
<!-- Puentes: simbolo puntual cuadrado blanco con borde oscuro. -->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>puente_red_vial_puntos</Name>
    <UserStyle>
      <Name>puente_red_vial_puntos</Name>
      <Title>Puentes de la red vial</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>puente</Name>
          <Title>Puente</Title>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>square</WellKnownName>
                <Fill><CssParameter name="fill">#ffffff</CssParameter></Fill>
                <Stroke>
                  <CssParameter name="stroke">#333333</CssParameter>
                  <CssParameter name="stroke-width">1.4</CssParameter>
                </Stroke>
              </Mark>
              <Size>7</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
