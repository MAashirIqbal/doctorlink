import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Embedded OpenStreetMap iframe + browser geolocation for distance/ETA.
// No API key required.

const haversineKm = (a, b) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

const ClinicMap = ({ doctor }) => {
    const [userLoc, setUserLoc] = useState(null);
    const [geoState, setGeoState] = useState('idle'); // idle | loading | error

    if (!doctor || doctor.latitude == null || doctor.longitude == null) {
        return (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                <MapPin size={20} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Clinic location not yet mapped</p>
                {doctor?.location && (
                    <p className="text-[11px] font-bold text-gray-400 mt-1">{doctor.location}</p>
                )}
            </div>
        );
    }

    const lat = doctor.latitude;
    const lon = doctor.longitude;

    const requestLocation = () => {
        if (!('geolocation' in navigator)) {
            setGeoState('error');
            return;
        }
        setGeoState('loading');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                setGeoState('idle');
            },
            () => setGeoState('error'),
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
        );
    };

    useEffect(() => {
        // Auto-request once on mount; user can still trigger manually if denied.
        requestLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const distanceKm = userLoc ? haversineKm(userLoc, { lat, lon }) : null;
    const etaMinutes = distanceKm != null ? Math.round((distanceKm / 28) * 60) : null; // ~28 km/h average urban traffic

    // OSM embed: bbox slightly around the marker so the marker is visible
    const delta = 0.02;
    const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join('%2C');
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

    const directionsUrl = userLoc
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${lat},${lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    return (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="aspect-[16/9] w-full bg-gray-100 relative">
                <iframe
                    title="Clinic location"
                    src={mapSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <MapPin size={14} className="text-primary-700 flex-shrink-0" />
                        <span className="truncate">{doctor.location}</span>
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-gray-500">
                        {geoState === 'loading' && (
                            <span className="inline-flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" /> Locating you...</span>
                        )}
                        {geoState === 'error' && (
                            <button onClick={requestLocation} className="text-primary-700 underline">Allow location for ETA</button>
                        )}
                        {distanceKm != null && (
                            <span>{distanceKm.toFixed(1)} km away · ~{etaMinutes} min by car</span>
                        )}
                    </div>
                </div>
                <a href={directionsUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-black transition-all flex-shrink-0">
                    <Navigation size={13} />
                    Directions
                </a>
            </div>
        </div>
    );
};

export default ClinicMap;
