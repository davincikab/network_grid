mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/daudi97/ckofd47m12w4d17oddfvd0vr5',
    center: [2.4313527, 33.6855357],
    zoom: 3
});
 
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

    // add

});

// 
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
