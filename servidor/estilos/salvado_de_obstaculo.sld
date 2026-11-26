<?xml version="1.0" encoding="UTF-8"?>
<!-- Salvado de obstaculo: triangulo marron oscuro con borde blanco. -->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>salvado_de_obstaculo</Name>
    <UserStyle>
      <Name>salvado_de_obstaculo</Name>
      <Title>Salvado de obstaculo</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>salvado</Name>
          <Title>Salvado de obstaculo</Title>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>triangle</WellKnownName>
                <Fill><CssParameter name="fill">#5b3a1a</CssParameter></Fill>
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
