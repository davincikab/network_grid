mapboxgl.accessToken = 'pk.eyJ1IjoiaW50ZWdyYWxldW13ZWx0aGVpbHVuZyIsImEiOiJja282aHcwcnIwYmxlMnZwYjNmOW9ocHBrIn0.t8V5_xRlR16tKMWq5hXyPw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/integraleumweltheilung/ckohq9myq3mb917mka4gwjjgj',
    center: [2.4313527, 33.6855357],
    zoom: 3
});

map.addControl(new mapboxgl.NavigationControl({visualizePitch:false}));

var isEditMode = false;
var network250 = [
    {id:'', radius:250, coordinate:[2.4313527, 33.6855357]},
];

var network80 = [
    {id:'', radius:80, coordinate:[-42.2212446, 41.40573587]},
    // {id:'', radius:250, coordinate:[33.6855357,2.4313527]}
];

// create circles
let features = [];
let featuresPoints = [];
network250.forEach(entry => {
    let circle = turf.circle(entry.coordinate, entry.radius, {properties:entry});
    features.push(circle);

    let point = turf.point(entry.coordinate);
    featuresPoints.push(point);
});

var networkGrid250 = turf.featureCollection(features);
var networkGrid250Points = turf.featureCollection(featuresPoints);

let features80 = [];
let features80Points = [];
network80.forEach(entry => {
    let circle = turf.circle(entry.coordinate, entry.radius, {properties:entry});
    features80.push(circle);

    let point = turf.point(entry.coordinate);
    features80Points.push(point);
});
          
var networkGrid80 = turf.featureCollection(features80);
var networkGrid80Points = turf.featureCollection(features80Points);

// Hexgrid
var bbox = [-131.0, -45, 164.0, 79.0212];   
var cellSide = 250;
var options = {units: 'kilometers'};

var hexgrid = turf.hexGrid(bbox, cellSide, options);


var centroids = hexgrid.features.map(feature => turf.centroid(feature));

let gridFeatures = centroids.map(center =>  {
    let circle = turf.circle(center, 250, {properties:{}});
    return circle;
});

var theoreticalGrid =turf.featureCollection(gridFeatures);
// console.log(centroids);

// measure tool layers
var distanceContainer = document.getElementById('distance');
 
// GeoJSON object to hold our measurement features
var geojson = {
    'type': 'FeatureCollection',
    'features': []
};
 
// Used to draw a line between points
var linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

var startPoint = [];
var finishPoint = [];
var isLineCreated = false;

map.on('load', function () {
    map.addSource("grid", {
        type:"geojson",
        data:geojson
    });

    map.addLayer({
        id:'grid',
        source:'grid',
        type:"line",
        paint:{
            'line-color':'#fff',
            'line-opacity':0.5
        }
    })

    map.addSource("network-grid-250", {
        type: 'geojson',
        data:{"type":"featureCollection", "features":[]}
    });

    map.addLayer({
        id:"network-grid-250",
        source:"network-grid-250",
        type:"fill",
        paint:{
            'fill-color':'white',
            'fill-opacity':0.25
        }
    });

    // fetch("data/postcode_500.geojson")
    // .then(res => res.json())
    // .then(data => {
    //     // create the circle
    //     let circles = data.features.map(feature => {
    //         let circle = turf.circle(feature, 250, {properties:features.properties});

    //         return circle;
    //     });
    //     let networkGrid250 = turf.featureCollection(circles);
    //     console.log(networkGrid250)

    //     // update the source
    //     map.getSource("network-grid-250").setData(networkGrid250);
    // })
    // .catch(err => console.error)

    map.addSource("network-points", {
        type:"geojson",
        data:{"type":"featureCollection", "features":[]}
    });

    map.addLayer({
        id:"network-grid-250-point",
        source:"network-points",
        type:"circle",
        paint: {
            'circle-radius': 3,
            'circle-color': 'yellow',
            'circle-opacity':0.9
        },
    });

    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSQdKplFEG-mJcfrWEGMUhToB4JkuQMS3RnHNiSIHwlnRzLyAuqJX7Xt5XqT7b35cVDUoFwKADNicNQ/pub?output=csv")
    .then(data => {
        console.log("25km Points");
        console.log(data);
        // update dot 
        let point250Km = createGeoJson(data);
        map.getSource('network-points').setData(point250Km);

        // create circle
        let circle250km = createCircles(point250Km, 250);
        map.getSource("network-grid-250").setData(circle250km);
    })
    .catch(err => console.error);


    // 80 KM
    map.addSource("network-grid-80", {
        type: 'geojson',
        'data':networkGrid80
    });

    map.addLayer({
        id:"network-grid-80",
        source:"network-grid-80",
        type:"fill",
        paint:{
            'fill-color':'#26fbca',
            'fill-opacity':0.25
        }
    });

    map.addSource("network-points-80", {
        type:"geojson",
        data:{"type":"featureCollection", "features":[]}
    });

    map.addLayer({
        id: 'network-grid-80-point',
        type: 'circle',
        source: 'network-points-80',
        paint: {
            'circle-radius': 2,
            'circle-color': 'lightblue',
            'circle-opacity':0.9
        }
    });

    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vT2Iqkm1KQlfoR8XIyqHy6ri_rx29p7bi0-4EDMLDBQFmCv0_rNBEr-EA2WHS_iylxhKlLWbmp3sFOq/pub?output=csv")
    .then(data => {
        console.log(data);
        // update dot 
        let point160Km = createGeoJson(data);
        map.getSource('network-points-80').setData(point160Km);

        // create circle
        let circle160km = createCircles(point160Km, 80);
        map.getSource("network-grid-80").setData(circle160km);
    })
    .catch(err => console.error);

    // fetch("data/postcode_160.geojson")
    // .then(res => res.json())
    // .then(data => {
    //     // create the circle
    //     let circles = data.features.map(feature => {
    //         let circle = turf.circle(feature, 80, {properties:features.properties});

    //         return circle;
    //     });
    //     let networkGrid80 = turf.featureCollection(circles);
    //     console.log(networkGrid80)

    //     // update the source
    //     map.getSource("network-grid-80").setData(networkGrid80);
    // })
    // .catch(err => console.error)

    // add points
    map.addSource('geojson', {
        'type': 'geojson',
        'data': geojson
    });
         
    // Add styles to the map
    map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 5,
            'circle-color': '#fff'
        },
        filter: ['in', '$type', 'Point']
    });

    map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#fff',
            'line-dasharray':[3,2],
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });

    // click function
    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });

        if(isLineCreated) {
            startPoint = finishPoint = [];
            isLineCreated = false;

            geojson.features = [];
            distanceContainer.innerHTML = "";
            map.getSource("geojson").setData(geojson);
        }
        
        if(!isEditMode) return;

        if(startPoint.length != 0 ) {
            finishPoint = [e.lngLat.lng, e.lngLat.lat];
            isLineCreated = true;
        }

        if(startPoint.length == 0) {
            startPoint = [e.lngLat.lng, e.lngLat.lat];
        }

        updateLineFeature();
    });

    
    map.on('mousemove', function (e) {
        // console.log(e);

        var features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });

        if(isEditMode) {
            // update the linestring feature
            map.getCanvas().style.cursor = features.length
            ? 'pointer'
            : 'crosshair';
        }

        // UI indicator for clicking/hovering a point on the map
        if(isEditMode && startPoint.length > 0) {
            setTimeout(function(timer) {

                if(!isLineCreated) {
                    finishPoint = [e.lngLat.lng, e.lngLat.lat];
                    linestring.geometry.coordinates = [startPoint, finishPoint];

                    geojson.features = geojson.features.filter(feature => feature.geometry.type !="LineString");

                    geojson.features.push(linestring);
                    map.getSource('geojson').setData(geojson);

                    updateLength(linestring);
                }
            }, 150);

            
        }
    }); 

    // fetch grid points
    fetch("grid_centers.geojson")
    .then(res => res.json())
    .then(centroids => {
        console.log(centroids);

        // create the circle grids
        let gridFeatures = centroids.features.map(center =>  {
            let circle = turf.circle(center, 250, {properties:{}});
            return circle;
        });
        
        theoreticalGrid = turf.featureCollection(gridFeatures);
        console.log(theoreticalGrid);
        // update the
        map.getSource("grid").setData(theoreticalGrid);

        // download the data
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theoreticalGrid));
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "grid.json");
        // dlAnchorElem.click();


    })
    .catch(error => {
        console.error(error);
    })
});

function updateLineFeature() {      
    // restore the geojson layer  
    geojson.features = [];

    // If a feature was clicked, remove it from the map
    if(startPoint[0]) {
        var point = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': startPoint
            }
        };
            
        geojson.features.push(point);
    }

    if(finishPoint[0]) {
        var point = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': finishPoint
            }
        };
            
        geojson.features.push(point);
    }
         
    if (geojson.features.length > 1) {
        linestring.geometry.coordinates = geojson.features.map(
            function (point) {
                return point.geometry.coordinates;
            }
        );
         
        geojson.features.push(linestring)

        // Populate the distanceContainer with total distance
        updateLength(linestring);
    }
         
    map.getSource('geojson').setData(geojson);
}

function updateLength(linestring) {
    distanceContainer.innerHTML = "";
    var value = document.createElement('pre');
    value.textContent = 'Total distance: ' +
    turf.length(linestring).toLocaleString() +
    'km';

    distanceContainer.appendChild(value);
}

// layer names
var layers = {
    'Grid':'grid',
    'SHA 500km':'network-grid-250',
    'Mini-SHA 160km':'network-grid-80'
};

class LayerControl {
    constructor(layers) {
        this.layers = layers;
    }

    toggleLayer(layerId, checked) {
        console.log("toggling layer");
        console.log(layerId);

        var visibility = checked ? 'visible' : 'none';
        if(this._map.getLayer(layerId)) {
            this._map.setLayoutProperty(layerId, 'visibility', visibility);
            let pointId = layerId + "-point";

            if(this._map.getLayer(pointId)) {
                this._map.setLayoutProperty(pointId, 'visibility', visibility);
            }
        }
    }

    onAdd(map) {
        this._map = map;

        this._container = document.createElement("div");
        this._container.className = 'mapboxgl-ctrl layer-control';

        Object.keys(this.layers).forEach(key => {
            let layer = this.layers[key];

            let layerDiv = document.createElement("div");

            let layerCheckbox = document.createElement("input");
            layerCheckbox.type = "checkbox";
            layerCheckbox.className = "layer-element";
            layerCheckbox.value = layer;
            layerCheckbox.setAttribute("checked", true);
            // layerCheckbox.id = layer;

            layerDiv.append(layerCheckbox);
            layerDiv.innerHTML += "<label>"+ key +"</label>"

            this._container.append(layerDiv);
        });

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

var layerControl = new LayerControl(layers);
map.addControl(layerControl, 'top-right');


var layerCheckboxes = document.querySelectorAll(".layer-element");
layerCheckboxes.forEach(layerCheckbox => {
    layerCheckbox.onchange = function(e) {
        let { value, checked } = e.target;
        layerControl.toggleLayer(value, checked);
    }
});

// measure tool
class MeasureControl {
    constructor(map) {
        this._map = map;
    }
    onAdd(map) {
        console.log(this._map);
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';

        let button = document.createElement("button");
        button.className = "btn-circle"
        button.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhbCIgZGF0YS1pY29uPSJydWxlciIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLXJ1bGVyIGZhLXctMjAiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjQwIDUxMiI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTYzNS43IDE2NS44TDU1Ni4xIDI3LjlDNTUwLjIgMTcuNyA1MzkuNSAxMiA1MjguNSAxMmMtNS40IDAtMTAuOSAxLjQtMTUuOSA0LjNMMTUuOSAzMDIuOEMuNyAzMTEuNS00LjUgMzMxIDQuMyAzNDYuMkw4My45IDQ4NGM1LjkgMTAuMiAxNi42IDE1LjkgMjcuNiAxNS45IDUuNCAwIDEwLjktMS40IDE1LjktNC4zTDYyNCAyMDkuMWMxNS4zLTguNiAyMC41LTI4LjEgMTEuNy00My4zek0xMTEuNSA0NjguMkwzMS45IDMzMC4zbDY5LTM5LjggNDMuOCA3NS44YzIuMiAzLjggNy4xIDUuMSAxMC45IDIuOWwxMy44LThjMy44LTIuMiA1LjEtNy4xIDIuOS0xMC45bC00My44LTc1LjggNTUuMi0zMS44IDI3LjkgNDguMmMyLjIgMy44IDcuMSA1LjEgMTAuOSAyLjlsMTMuOC04YzMuOC0yLjIgNS4xLTcuMSAyLjktMTAuOWwtMjcuOS00OC4yIDU1LjItMzEuOCA0My44IDc1LjhjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlMMjk0IDE3OS4xbDU1LjItMzEuOCAyNy45IDQ4LjJjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlsLTI3LjktNDguMkw0MzIgOTkuNWw0My44IDc1LjhjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlsLTQzLjgtNzUuOCA2OS0zOS44IDc5LjYgMTM3LjgtNDk2LjcgMjg2Ljd6Ij48L3BhdGg+PC9zdmc+' width='24px'/>"

        button.onclick = (e) => {
            let target = e.target;
            target = target.toString().includes("img") ? target.parentNode : target;

            isEditMode = !isEditMode;
            if(isEditMode) {
                button.classList.add("active") 
            } else {
                button.classList.remove("active");

                geojson.features = [];
                this._map.getSource('geojson').setData(geojson);

                this._map.getCanvas().style.cursor = "pointer";
            } 
        }

        this._container.append(button);
        return this._container;
    }

    addTo(elementId, map) {
        this._map = map;

        console.log(map);
        let element = document.getElementById(elementId);
        element.append(this.onAdd(map));
    }
         
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
} 

var measureTool = new MeasureControl(map);
measureTool.addTo("measure-tool", map);

// google sheets parse function
function createGeoJson(data) {
    var features = data.map(entry => {
        return turf.point([
            parseFloat(entry.x),
            parseFloat(entry.y)
        ], 
        {...entry}
        );
    });

    return turf.featureCollection(features);
}

function createCircles(data, radius) {
    let circles = data.features.map(feature => {
        let circle = turf.circle(feature, radius, {properties:features.properties});

        return circle;
    });

    return turf.featureCollection(circles);
}