define(["openlayers"], function(OpenLayers) {

    var sphericalMercator = new OpenLayers.Projection("EPSG:900913");

    return function() {
        return new OpenLayers.Map({
            div: "map",
            theme: null,
            projection: sphericalMercator,
            units: "m",
            numZoomLevels: 20,
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            controls: [
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.TouchNavigation({
                    dragPanOptions: {
                        interval: 100,
                        enableKinetic: true
                    }
                })
            ],
            center: new OpenLayers.LonLat(16061635, -4405394),
            zoom: 17
        });
    };

});
  
