mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/daudi97/ckofd47m12w4d17oddfvd0vr5',
    center: [2.4313527, 33.6855357],
    zoom: 3
});
 
var network = [
    {id:'', radius:250, coordinate:[2.4313527, 33.6855357]},
    {id:'', radius:80, coordinate:[-42.2212446, 41.40573587]},
    // {id:'', radius:250, coordinate:[33.6855357,2.4313527]}
];


// create circles
let features = [];
network.forEach(entry => {
    let circle = turf.circle(entry.coordinate, entry.radius, {properties:entry});
    features.push(circle);
});

var networkGrid = turf.featureCollection(features);

map.on('load', function () {
    map.addSource("network", {
        type: 'geojson',
        'data':networkGrid
    });

    map.addLayer({
        id:"network-grid",
        source:"network",
        type:"fill",
        paint:{
            'fill-color':'#26fbca',
            'fill-opacity':0.55
        }
    });

});