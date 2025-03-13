// Initialize variables for the polyline and markers
var polyline_measure = null;
var markers_measure = [];
var distanceMarkers = [];

// Function to add markers and line on map click
function addMarkerMeasure(latlng) {
    var marker_measure = L.marker(latlng, {
        icon: L.divIcon({ className: 'my-div-icon' }) // Custom marker style if needed
    }).addTo(map);
    markers_measure.push(marker_measure);

    // Add or extend the polyline
    if (markers_measure.length > 1) {
        if (polyline_measure) {
            polyline_measure.addLatLng(latlng);
        } else {
            polyline_measure = L.polyline([markers_measure[markers_measure.length - 2].getLatLng(), latlng], { color: 'red' }).addTo(map);
        }
    }

    // Update the ruler line to show distances
    updateRulerLine();
}

// Update the ruler line with distance markers
function updateRulerLine() {
    if (polyline_measure) {
        const latlngs = polyline_measure.getLatLngs();
        const totalDistance = calculateTotalDistance(latlngs);
        updateDistanceMarkers(latlngs, totalDistance);
    }
}

// Calculate total distance of the polyline
function calculateTotalDistance(latlngs) {
    let totalDistance = 0;
    for (let i = 1; i < latlngs.length; i++) {
        totalDistance += latlngs[i - 1].distanceTo(latlngs[i]);
    }
    return totalDistance;
}

// Function to place distance markers along the line
function updateDistanceMarkers(latlngs, totalDistance) {
    // Remove existing distance markers
    distanceMarkers.forEach(marker => map.removeLayer(marker));
    distanceMarkers = [];

    let accumulatedDistance = 0; // Total accumulated distance from start

    for (let i = 1; i < latlngs.length; i++) {
        const segmentDistance = latlngs[i - 1].distanceTo(latlngs[i]);
        let distanceLeftInSegment = segmentDistance;

        while (distanceLeftInSegment >= 100) {
            accumulatedDistance += 100;
            distanceLeftInSegment -= 100;
            const fraction = (segmentDistance - distanceLeftInSegment) / segmentDistance;
            const point = intermediatePoint(latlngs[i - 1], latlngs[i], fraction);

            if (accumulatedDistance % 500 === 0) {
                // Every 500 meters, add a major marker with label
                const marker = L.marker(point, {
                    icon: L.divIcon({ className: 'distance-marker', html: `${accumulatedDistance.toFixed(0)} m` })
                }).addTo(map);
                distanceMarkers.push(marker);
            } else {
                // Every 100 meters, add a minor marker without label
                const minorMarker = L.circleMarker(point, {
                    radius: 2,
                    fillColor: '#000000',
                    color: '#000000',
                    weight: 1,
                    fillOpacity: 0.8
                }).addTo(map);
                distanceMarkers.push(minorMarker);
            }
        }
        // Reset accumulated distance for the next segment calculation
        if (distanceLeftInSegment > 0 && i === latlngs.length - 1) {
            // This ensures that any remaining distance at the end of the last segment does not get added twice
            accumulatedDistance -= 100;
        }
    }
}

// Calculate an intermediate point on a segment
function intermediatePoint(start, end, fraction) {
    const lat = start.lat + (end.lat - start.lat) * fraction;
    const lng = start.lng + (end.lng - start.lng) * fraction;
    return L.latLng(lat, lng);
}

// Reset the measuring tool
function resetMeasurement() {
    // Clear all layers related to measurement
    if (polyline_measure) map.removeLayer(polyline_measure);
    markers_measure.forEach(marker => map.removeLayer(marker));
    distanceMarkers.forEach(marker => map.removeLayer(marker));
    markers_measure = [];
    distanceMarkers = [];
    polyline_measure = null;
}

// Attach the event listener for adding markers on right-click
map.on('contextmenu', function (e) {
    e.originalEvent.preventDefault(); // Prevent the default context menu
    addMarkerMeasure(e.latlng);
});

// Optionally, a button to clear measurements
L.easyButton('fa-eraser', function (btn, map) {
    resetMeasurement();
}, 'Clear Measurements').addTo(map);