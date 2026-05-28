import React, { useState, useRef, useEffect } from 'react';
import { Phone, MapPin, Landmark, User, AlertTriangle, Plus, Minus, Target } from 'lucide-react';

export default function InteractiveMap({ userLat, userLng, radius, donors, bloodBanks, onSelectSource }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [gpsTracking, setGpsTracking] = useState(false);

  // 1. Dynamic CDN loader for Leaflet assets (React 19 friendly & Offline robust)
  useEffect(() => {
    const loadLeafletAssets = async () => {
      if (window.L) {
        setLeafletLoaded(true);
        return;
      }

      // Add CSS to head
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add JS to head
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.L) {
            setLeafletLoaded(true);
            clearInterval(interval);
          }
        }, 100);
      }
    };
    loadLeafletAssets();
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;

    // Create Leaflet Map bound to div
    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 12,
      zoomControl: false, // Custom buttons are used
      attributionControl: false
    });

    // Add Premium CartoDB Dark Matter tile layers
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // 3. Render and Update Map Markers, Radius Circle, and Center Location
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Pan map to new center coords smoothly
    map.setView([userLat, userLng], map.getZoom());

    // Update User Coordinate Beacon marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      const userIcon = L.divIcon({
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                <div class="absolute w-6 h-6 rounded-full bg-blue-500/25 border border-blue-500/50 animate-ping"></div>
                <div class="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
               </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
      userMarkerRef.current.bindPopup(`<div class="font-sans text-xs font-bold text-slate-800">My Coordinate Beacon</div>`);
    }

    // Update Search Perimeter Circle (convert radius from km to meters)
    if (circleRef.current) {
      circleRef.current.setLatLng([userLat, userLng]);
      circleRef.current.setRadius(radius * 1000);
    } else {
      circleRef.current = L.circle([userLat, userLng], {
        radius: radius * 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.02,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
    }

    // Clear previous markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Plot hospital repositories (Sky-blue shields)
    bloodBanks.forEach(bank => {
      const bankIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-xl bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all">
                <svg class="w-4.5 h-4.5 text-white fill-white" viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8l8 4v8.4l-8 4-8-4V8.8l8-4z"/></svg>
               </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([bank.latitude, bank.longitude], { icon: bankIcon })
        .addTo(map)
        .on('click', () => onSelectSource && onSelectSource({ ...bank, type: 'bloodbank' }));
      
      marker.bindPopup(`
        <div class="font-sans text-xs text-left p-1 text-slate-800">
          <h4 class="font-bold border-b border-slate-100 pb-1 text-red-500">${bank.name}</h4>
          <p class="mt-1 font-mono text-[9px] text-slate-500">${bank.address}</p>
          <div class="mt-2 flex justify-between font-mono font-bold text-[9px]">
            <span>Stock: ${bank.availableBags || 0} Units</span>
            <span>Distance: ${bank.distance} km</span>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Plot voluntary donors (Glowing Crimson Hearts)
    donors.forEach(donor => {
      const donorIcon = L.divIcon({
        html: `<div class="w-7 h-7 rounded-xl bg-red-650 border-2 border-white text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all animate-pulse">
                <svg class="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([donor.latitude, donor.longitude], { icon: donorIcon })
        .addTo(map)
        .on('click', () => onSelectSource && onSelectSource({ ...donor, type: 'donor' }));

      marker.bindPopup(`
        <div class="font-sans text-xs text-left p-1 text-slate-800">
          <h4 class="font-bold border-b border-slate-100 pb-1 text-emerald-600">${donor.name}</h4>
          <span class="block mt-1 font-bold text-red-500">Group: ${donor.bloodGroup}</span>
          <div class="mt-2 flex justify-between font-mono font-bold text-[9px]">
            <span>Age: ${donor.age} Years</span>
            <span>Distance: ${donor.distance} km</span>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });

  }, [leafletLoaded, userLat, userLng, radius, donors, bloodBanks]);

  // 4. Live Geolocation Watch Tracker Loop
  const toggleLiveGpsTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    if (gpsTracking) {
      setGpsTracking(false);
      return;
    }

    setGpsTracking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 13);
        }
      },
      (err) => {
        setGpsTracking(false);
        alert("Failed to track live location. Check permissions.");
      }
    );
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([userLat, userLng], 12);
    }
  };

  return (
    <div 
      className="relative w-full h-[320px] md:h-[380px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl select-none"
    >
      {/* Map Element container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 bg-[#090D16]"
      />

      {!leafletLoaded && (
        <div className="absolute inset-0 bg-[#090D16] flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-mono z-10">
          <div className="w-5 h-5 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
          Syncing Live Leaflet Grid Map...
        </div>
      )}

      {/* Custom HUD Overlays */}
      <div className="absolute top-3 left-3 z-15 flex flex-wrap gap-2 text-[10px] font-semibold pointer-events-none">
        <div className="px-2.5 py-1 bg-[#111625]/90 border border-slate-800 rounded-lg text-slate-350 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>My Beacon</span>
        </div>
        <div className="px-2.5 py-1 bg-[#111625]/90 border border-slate-800 rounded-lg text-slate-350 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>Donors ({donors.length})</span>
        </div>
        <div className="px-2.5 py-1 bg-[#111625]/90 border border-slate-800 rounded-lg text-slate-350 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Banks ({bloodBanks.length})</span>
        </div>
      </div>

      {/* Floating Premium Map Controls (Zoom In/Out + Recenter + Live Trace) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        
        {/* Live GPS Track Toggle button */}
        <button 
          type="button"
          onClick={toggleLiveGpsTracking}
          className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            gpsTracking 
              ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse' 
              : 'bg-[#111625]/90 border-slate-850 text-slate-300'
          }`}
          title="Trace My Location Live"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Zoom In button */}
        <button 
          type="button"
          onClick={handleZoomIn}
          className="w-8.5 h-8.5 rounded-lg bg-[#111625]/90 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center justify-center shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out button */}
        <button 
          type="button"
          onClick={handleZoomOut}
          className="w-8.5 h-8.5 rounded-lg bg-[#111625]/90 hover:bg-slate-800 border border-slate-850 text-slate-300 flex items-center justify-center shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter button */}
        <button 
          type="button"
          onClick={handleRecenter}
          className="w-8.5 h-8.5 rounded-lg bg-red-650 hover:bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
          title="Recenter Map"
        >
          <Target className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
