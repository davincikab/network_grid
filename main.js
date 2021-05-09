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
network250.forEach(entry => {
    let circle = turf.circle(entry.coordinate, entry.radius, {properties:entry});
    features.push(circle);
});

var networkGrid250 = turf.featureCollection(features);

let features80 = [];
network80.forEach(entry => {
    let circle = turf.circle(entry.coordinate, entry.radius, {properties:entry});
    features80.push(circle);
});

var networkGrid80 = turf.featureCollection(features80);


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

map.on('load', function () {
    map.addSource("network-grid-250", {
        type: 'geojson',
        'data':networkGrid250
    });

    map.addLayer({
        id:"network-grid-250",
        source:"network-grid-250",
        type:"fill",
        paint:{
            'fill-color':'#26fbca',
            'fill-opacity':0.55
        }
    });

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
            'fill-opacity':0.55
        }
    });

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
            'circle-color': '#000'
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
            'line-color': '#000',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });

    // click function
    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });
        
        if(!isEditMode) return;

        // Remove the linestring from the group
        // So we can redraw it based on the points collection
        if (geojson.features.length > 1) geojson.features.pop();
         
        // Clear the Distance container to populate it with a new value
        distanceContainer.innerHTML = '';
         
        // If a feature was clicked, remove it from the map
        if (features.length) {
            var id = features[0].properties.id;
            geojson.features = geojson.features.filter(function (point) {
                return point.properties.id !== id;
            });
        } else {
            var point = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                    'id': String(new Date().getTime())
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
         
            geojson.features.push(linestring);
            
            // Populate the distanceContainer with total distance
            var value = document.createElement('pre');
            value.textContent =
            'Total distance: ' +
            turf.length(linestring).toLocaleString() +
            'km';
            distanceContainer.appendChild(value);
        }
         
        map.getSource('geojson').setData(geojson);
    });

    map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['measure-points']
        });
    
        // UI indicator for clicking/hovering a point on the map
        if(isEditMode) {
            map.getCanvas().style.cursor = features.length
            ? 'pointer'
            : 'crosshair';
        }
    }); 
});


// layer names
var layers = {
    '250 Km':'network-grid-250',
    '80 Km':'network-grid-80'
};

class LayerControl {
    constructor(layers) {
        this.layers = layers;
    }

    toggleLayer(layerId, checked) {
        console.log("toggling layer");
        console.log(layerId);

        var visibility = checked ? 'visible' : 'none';
        this._map.getLayer(layerId) ? this._map.setLayoutProperty(layerId, 'visibility', visibility) : false;
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
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';

        let button = document.createElement("button");
        button.className = "btn-circle"
        button.innerHTML = "<img src='data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhbCIgZGF0YS1pY29uPSJydWxlciIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLXJ1bGVyIGZhLXctMjAiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjQwIDUxMiI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTYzNS43IDE2NS44TDU1Ni4xIDI3LjlDNTUwLjIgMTcuNyA1MzkuNSAxMiA1MjguNSAxMmMtNS40IDAtMTAuOSAxLjQtMTUuOSA0LjNMMTUuOSAzMDIuOEMuNyAzMTEuNS00LjUgMzMxIDQuMyAzNDYuMkw4My45IDQ4NGM1LjkgMTAuMiAxNi42IDE1LjkgMjcuNiAxNS45IDUuNCAwIDEwLjktMS40IDE1LjktNC4zTDYyNCAyMDkuMWMxNS4zLTguNiAyMC41LTI4LjEgMTEuNy00My4zek0xMTEuNSA0NjguMkwzMS45IDMzMC4zbDY5LTM5LjggNDMuOCA3NS44YzIuMiAzLjggNy4xIDUuMSAxMC45IDIuOWwxMy44LThjMy44LTIuMiA1LjEtNy4xIDIuOS0xMC45bC00My44LTc1LjggNTUuMi0zMS44IDI3LjkgNDguMmMyLjIgMy44IDcuMSA1LjEgMTAuOSAyLjlsMTMuOC04YzMuOC0yLjIgNS4xLTcuMSAyLjktMTAuOWwtMjcuOS00OC4yIDU1LjItMzEuOCA0My44IDc1LjhjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlMMjk0IDE3OS4xbDU1LjItMzEuOCAyNy45IDQ4LjJjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlsLTI3LjktNDguMkw0MzIgOTkuNWw0My44IDc1LjhjMi4yIDMuOCA3LjEgNS4xIDEwLjkgMi45bDEzLjgtOGMzLjgtMi4yIDUuMS03LjEgMi45LTEwLjlsLTQzLjgtNzUuOCA2OS0zOS44IDc5LjYgMTM3LjgtNDk2LjcgMjg2Ljd6Ij48L3BhdGg+PC9zdmc+' width='24px'/>"

        button.onclick = function(e) {
            let target = e.target;
            target = target.toString().includes("img") ? target.parentNode : target;

            isEditMode = !isEditMode;
            if(isEditMode) {
                button.classList.add("active") 
            } else {
                button.classList.remove("active");

                geojson.features = [];
                map.getSource('geojson').setData(geojson);

                map.getCanvas().style.cursor = "pointer";
            } 
        }

        this._container.append(button);
        return this._container;
    }
         
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
} 

var measureTool = new MeasureControl();
map.addControl(measureTool, 'bottom-right');