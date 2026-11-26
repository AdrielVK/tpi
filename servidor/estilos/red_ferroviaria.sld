<?xml version="1.0" encoding="UTF-8"?>
<!-- Ferrocarril: simbolo convencional (linea oscura con trazos blancos), no jerarquia de color. -->
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <Name>red_ferroviaria</Name>
    <UserStyle>
      <Name>red_ferroviaria_convencional</Name>
      <Title>Red ferroviaria</Title>
      <Abstract>Simbolo convencional de ferrocarril: linea gris oscura con trazos blancos.</Abstract>
      <FeatureTypeStyle>
        <Rule>
          <Name>ferrocarril</Name>
          <Title>Ferrocarril</Title>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#3f3f3f</CssParameter>
              <CssParameter name="stroke-width">2.8</CssParameter>
              <CssParameter name="stroke-linejoin">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffff</CssParameter>
              <CssParameter name="stroke-width">1.3</CssParameter>
              <CssParameter name="stroke-dasharray">7 7</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
