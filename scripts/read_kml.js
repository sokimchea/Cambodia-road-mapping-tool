// Ensure the map variable is globally accessible
var map = map || L.map('map'); // Only create a new map if it doesn't already exist

// Set up the map if it doesn't have layers yet (assuming map initialization including setting view and tile layer is done in app.js)
if (!map.hasLayer(L.TileLayer)) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);
}

// Handle file input change
document.getElementById('file-input').addEventListener('change', function(e) {
    var files = e.target.files;
    if (files.length) {
        Array.from(files).forEach(file => {
            var reader = new FileReader();

            reader.onload = function(e) {
                var text = reader.result; // This is the text content of the file
                var customLayer = L.geoJson(null, {
                    style: function(feature) {
                        return { color: '#f00' }; // Color of the polyline
                    }
                });

                // Use omnivore to parse the KML data from the text
                var runLayer = omnivore.kml.parse(text, null, customLayer)
                    .on('ready', function() {
                        map.fitBounds(runLayer.getBounds()); // Fit map to KML bounds
                    })
                    .addTo(map);
            };

            // Read the file as text
            reader.readAsText(file);
        });
    }
});