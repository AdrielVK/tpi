<?xml version="1.0" encoding="UTF-8"?>
<!-- Senalizaciones: rombo azul con borde blanco. -->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>senalizaciones</Name>
    <UserStyle>
      <Name>senalizaciones</Name>
      <Title>Senalizaciones</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>senalizacion</Name>
          <Title>Senalizacion</Title>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>diamond</WellKnownName>
                <Fill><CssParameter name="fill">#1f4e79</CssParameter></Fill>
                <Stroke>
                  <CssParameter name="stroke">#ffffff</CssParameter>
                  <CssParameter name="stroke-width">1.2</CssParameter>
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
