<?xml version="1.0" encoding="UTF-8"?>
<!-- Marcas y senales: circulo marron con borde blanco. -->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>marcas_y_senales</Name>
    <UserStyle>
      <Name>marcas_y_senales</Name>
      <Title>Marcas y senales</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>marca</Name>
          <Title>Marca / senal</Title>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill><CssParameter name="fill">#7a4b12</CssParameter></Fill>
                <Stroke>
                  <CssParameter name="stroke">#ffffff</CssParameter>
                  <CssParameter name="stroke-width">1.2</CssParameter>
                </Stroke>
              </Mark>
              <Size>6</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
