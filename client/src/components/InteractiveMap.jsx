import React, { useState, useRef, useEffect } from 'react';
import { Phone, MapPin, Landmark, User, AlertTriangle, Plus, Minus, Target } from 'lucide-react';

const MAP_BOUNDS = {
  minLat: 12.85,
  maxLat: 13.05,
  minLng: 77.48,
  maxLng: 77.68,
  rangeLat: 13.05 - 12.85,
  rangeLng: 77.68 - 77.48
};

const getCoordsPercent = (lat, lng) => {
  const x = ((lng - MAP_BOUNDS.minLng) / MAP_BOUNDS.rangeLng) * 100;
  const y = (1 - (lat - MAP_BOUNDS.minLat) / MAP_BOUNDS.rangeLat) * 100;
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
};

export default function InteractiveMap({ userLat, userLng, radius, donors, bloodBanks, onSelectSource }) {
  const containerRef = useRef(null);
  const [hoveredPin, setHoveredPin] = useState(null);

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const centerCoords = getCoordsPercent(userLat, userLng);
  const radiusPercent = (radius / 22) * 100;

  // Recenter whenever user coordinates center updates
  useEffect(() => {
    handleRecenter();
  }, [userLat, userLng]);

  // Zoom actions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(6, prev + 0.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const nextZoom = Math.max(1, prev - 0.5);
      if (nextZoom === 1) {
        setPanOffset({ x: 0, y: 0 }); // Reset offsets if zoomed out all the way
      }
      return nextZoom;
    });
  };

  const handleRecenter = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag Panning Event Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only drag on left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Convert pixel movement to SVG percentage space, scaling with current zoom level
    const svgDx = -(dx / rect.width) * (100 / zoom);
    const svgDy = -(dy / rect.height) * (100 / zoom);

    setPanOffset(prev => ({
      x: prev.x + svgDx,
      y: prev.y + svgDy
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate dynamic Viewbox coordinates centered on user location + pan offsets
  const viewBoxWidth = 100 / zoom;
  const viewBoxHeight = 100 / zoom;
  const viewBoxX = centerCoords.x - viewBoxWidth / 2 + panOffset.x;
  const viewBoxY = centerCoords.y - viewBoxHeight / 2 + panOffset.y;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[300px] md:h-[350px] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md select-none transition-colors ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Soft Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(226,232,240,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(226,232,240,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Map Labels Header overlay */}
      <div className="absolute top-3 left-3 z-15 flex flex-wrap gap-2 text-[10px] md:text-[11px] font-semibold">
        <div className="px-2.5 py-1 bg-white/90 dark:bg-[#111625]/90 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>My Coordinate Beacon</span>
        </div>
        <div className="px-2.5 py-1 bg-white/90 dark:bg-[#111625]/90 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
          <Landmark className="w-3 h-3 text-red-500 fill-red-500/10" />
          <span>Banks ({bloodBanks.length})</span>
        </div>
        <div className="px-2.5 py-1 bg-white/90 dark:bg-[#111625]/90 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
          <User className="w-3 h-3 text-emerald-600" />
          <span>Donors ({donors.length})</span>
        </div>
      </div>

      {/* Floating coordinates indicator */}
      <div className="absolute top-3 right-3 z-10 text-[9px] text-slate-400 dark:text-slate-500 font-mono hidden sm:block">
        ZOOM: {zoom.toFixed(1)}x | PAN: [{panOffset.x.toFixed(1)}, {panOffset.y.toFixed(1)}]
      </div>

      {/* Floating Premium Map Controls (Zoom In/Out + Recenter) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        
        {/* Zoom In button */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="w-8 h-8 rounded-lg bg-white/90 dark:bg-[#111625]/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out button */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="w-8 h-8 rounded-lg bg-white/90 dark:bg-[#111625]/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-md backdrop-blur-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Recenter button */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleRecenter(); }}
          className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-650 text-white flex items-center justify-center shadow-md shadow-red-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Recenter Map"
        >
          <Target className="w-4 h-4" />
        </button>

      </div>

      {/* SVG Canvas Map */}
      <svg 
        className="w-full h-full relative" 
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
      >
        
        {/* Soft geofence perimeter circle */}
        <circle 
          cx={centerCoords.x} 
          cy={centerCoords.y} 
          r={radiusPercent} 
          className="fill-red-500/[0.015] stroke-red-500/20 stroke-[0.3]"
          vectorEffect="non-scaling-stroke"
        />

        {/* User Beacon indicator */}
        <g>
          <circle 
            cx={centerCoords.x} 
            cy={centerCoords.y} 
            r="1.8" 
            className="fill-blue-500/10 stroke-blue-500 stroke-[0.2] animate-pulse"
            vectorEffect="non-scaling-stroke"
          />
          <circle 
            cx={centerCoords.x} 
            cy={centerCoords.y} 
            r="0.8" 
            className="fill-blue-500 stroke-white stroke-[0.15]"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* Plotted Blood Banks */}
        {bloodBanks.map((bank) => {
          const coords = getCoordsPercent(bank.latitude, bank.longitude);
          const isHovered = hoveredPin && hoveredPin.id === bank.id && hoveredPin.type === 'bloodbank';
          const isLowStock = bank.availableBags < 5;

          return (
            <g key={bank.id} className="cursor-pointer" 
               onMouseEnter={() => setHoveredPin({ ...bank, type: 'bloodbank' })}
               onMouseLeave={() => setHoveredPin(null)}
               onClick={(e) => { e.stopPropagation(); onSelectSource && onSelectSource(bank); }}>
              
              {isHovered && (
                <circle 
                  cx={coords.x} 
                  cy={coords.y} 
                  r="2.2" 
                  className="fill-none stroke-red-400 stroke-[0.25]"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              
              <circle 
                cx={coords.x} 
                cy={coords.y} 
                r={isHovered ? "1.4" : "0.9"} 
                className={`${isLowStock ? 'fill-amber-500' : 'fill-red-500'} stroke-white stroke-[0.15] transition-all`}
                vectorEffect="non-scaling-stroke"
              />
              
              <path 
                d={`M ${coords.x - 0.25} ${coords.y} L ${coords.x + 0.25} ${coords.y} M ${coords.x} ${coords.y - 0.25} L ${coords.x} ${coords.y + 0.25}`}
                className="stroke-white stroke-[0.12]"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

        {/* Plotted Available Donors */}
        {donors.map((donor) => {
          const coords = getCoordsPercent(donor.latitude, donor.longitude);
          const isHovered = hoveredPin && hoveredPin.id === donor.id && hoveredPin.type === 'donor';

          return (
            <g key={donor.id} className="cursor-pointer"
               onMouseEnter={() => setHoveredPin({ ...donor, type: 'donor' })}
               onMouseLeave={() => setHoveredPin(null)}
               onClick={(e) => { e.stopPropagation(); onSelectSource && onSelectSource(donor); }}>
              
              {isHovered && (
                <circle 
                  cx={coords.x} 
                  cy={coords.y} 
                  r="2.0" 
                  className="fill-none stroke-emerald-350 stroke-[0.2]"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              
              <circle 
                cx={coords.x} 
                cy={coords.y} 
                r={isHovered ? "1.2" : "0.8"} 
                className="fill-emerald-500 stroke-white stroke-[0.12] transition-all"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

      </svg>

      {/* Light Hover Tooltip Overlay */}
      {hoveredPin && (
        <div 
          className="absolute bottom-3 left-3 right-3 md:left-3 md:right-auto md:w-72 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-lg z-30 animate-in fade-in duration-100 text-left font-sans"
          onMouseDown={(e) => e.stopPropagation()} // Stop dragging from tooltip click
        >
          <div className="flex justify-between items-start gap-1">
            <div>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase mb-1 ${
                hoveredPin.type === 'bloodbank' ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
              }`}>
                {hoveredPin.type === 'bloodbank' ? 'Blood Bank' : 'Voluntary Donor'}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{hoveredPin.name}</h4>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300 font-bold">
              {hoveredPin.bloodGroup || hoveredPin.availableBags + ' bags'}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            {hoveredPin.type === 'bloodbank' ? (
              <p className="line-clamp-1">📍 {hoveredPin.address}</p>
            ) : (
              <p className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Available Immediately
              </p>
            )}
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-[10px] pt-1">
              <span>Distance: <b className="text-slate-600 dark:text-slate-300 font-mono">{hoveredPin.distance} km</b></span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                <Phone className="w-2.5 h-2.5 text-red-500" /> {hoveredPin.phone || hoveredPin.contactNumber}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
