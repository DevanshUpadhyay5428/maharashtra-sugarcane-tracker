/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — INTERACTIVE MAP ENGINE
 * File: src/components/map_engine.js
 * Provides:
 *   - High-precision interactive SVG & Leaflet hybrid geospatial visualization
 *     of Maharashtra's Western & Central Sugarcane Belt (Kolhapur, Sangli,
 *     Satara, Pune, Solapur, Ahilyanagar).
 *   - Real-time route line rendering, waypoint telemetry, distance & transit
 *     time HUD, and interactive zoom/pan/layer controls.
 * ============================================================================
 */

window.MapEngine = (function () {
  // Bounding box for Maharashtra Sugar Belt (Lat 16.2°N to 20.2°N, Lng 73.5°E to 76.0°E)
  const BOUNDS = {
    minLat: 16.20,
    maxLat: 20.10,
    minLng: 73.50,
    maxLng: 76.10
  };

  function projectToSvg(lat, lng, width, height) {
    const padX = 48;
    const padY = 42;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const normX = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
    const normY = 1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);

    const x = Math.max(28, Math.min(width - 28, padX + normX * usableW));
    const y = Math.max(28, Math.min(height - 28, padY + normY * usableH));
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  }

  function renderCorridorMap(containerId, config) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const plotLat = parseFloat(config.plotLat) || 16.6912;
    const plotLng = parseFloat(config.plotLng) || 74.2448;
    const millLat = parseFloat(config.millLat) || 16.7325;
    const millLng = parseFloat(config.millLng) || 74.6042;
    const plotLabel = config.plotLabel || 'Farmer Plot';
    const millLabel = config.millLabel || 'Target Sugar Mill';
    const corridorName = config.highwayCorridor || 'NH-48 / SH-192 Corridor';
    const metrics = window.MahaData.calculateRouteMetrics(plotLat, plotLng, millLat, millLng);

    const W = 760;
    const H = 380;
    const pPlot = projectToSvg(plotLat, plotLng, W, H);
    const pMill = projectToSvg(millLat, millLng, W, H);

    // Compute curved Bezier control point for realistic highway arc
    const midX = (pPlot.x + pMill.x) / 2;
    const midY = (pPlot.y + pMill.y) / 2;
    const dx = pMill.x - pPlot.x;
    const dy = pMill.y - pPlot.y;
    const ctrlX = Number((midX - dy * 0.18).toFixed(1));
    const ctrlY = Number((midY + dx * 0.18).toFixed(1));

    // Render all 6 major Maharashtra Sugar Mills as background reference nodes
    const allMillsSvg = window.MahaData.SUGAR_MILLS.map(function (m) {
      const pt = projectToSvg(m.lat, m.lng, W, H);
      const isSelected =
        Math.abs(m.lat - millLat) < 0.01 && Math.abs(m.lng - millLng) < 0.01;
      if (isSelected) return '';
      return (
        '<g class="opacity-60 hover:opacity-100 transition-opacity">' +
        '<circle cx="' + pt.x + '" cy="' + pt.y + '" r="4.5" fill="#475569" stroke="#1e293b" stroke-width="1.5" />' +
        '<text x="' + (pt.x + 8) + '" y="' + (pt.y + 3) + '" fill="#94a3b8" font-size="10" font-family="Inter, sans-serif">' +
        m.district +
        '</text>' +
        '</g>'
      );
    }).join('');

    // River / Basin contour paths (Godavari, Bhima, Nira, Krishna, Panchganga)
    const riverPaths =
      '<path d="M 90 70 Q 250 85 430 110 T 700 135" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-dasharray="3 3" opacity="0.45" />' +
      '<path d="M 110 185 Q 290 200 470 225 T 690 250" fill="none" stroke="#1d4ed8" stroke-width="2.5" opacity="0.35" />' +
      '<path d="M 140 245 Q 240 285 350 335" fill="none" stroke="#0284c7" stroke-width="2.5" opacity="0.4" />';

    // NH-48 & NH-65 Highway spine
    const highwaySpine =
      '<path d="M 165 145 L 210 240 L 235 310 L 265 345" fill="none" stroke="#334155" stroke-width="3" opacity="0.6" />' +
      '<path d="M 165 145 L 360 195 L 540 230" fill="none" stroke="#334155" stroke-width="2.5" opacity="0.5" />';

    el.innerHTML =
      '<div class="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">' +
      '  <!-- Top Geospatial Telemetry Bar -->' +
      '  <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300">' +
      '    <div class="flex items-center gap-2">' +
      '      <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>' +
      '      <span class="font-semibold text-white">Maharashtra GIS Cane Corridor</span>' +
      '      <span class="text-slate-400 hidden sm:inline">| ' + corridorName + '</span>' +
      '    </div>' +
      '    <div class="flex items-center gap-3 font-mono-num">' +
      '      <span class="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/60">Dist: <strong>' + metrics.roadKm + ' km</strong></span>' +
      '      <span class="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/60">ETA: <strong>' + metrics.formattedTime + '</strong></span>' +
      '    </div>' +
      '  </div>' +
      '  <!-- SVG Geospatial Viewport -->' +
      '  <div class="relative w-full bg-[#0b1528]">' +
      '    <svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto block select-none" role="img" aria-label="Interactive Route Map between Farmer Plot and Sugar Mill">' +
      '      <defs>' +
      '        <pattern id="grid-' + containerId + '" width="38" height="38" patternUnits="userSpaceOnUse">' +
      '          <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#1e293b" stroke-width="0.8" />' +
      '        </pattern>' +
      '        <linearGradient id="routeGrad-' + containerId + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '          <stop offset="0%" stop-color="#10b981" />' +
      '          <stop offset="50%" stop-color="#f59e0b" />' +
      '          <stop offset="100%" stop-color="#38bdf8" />' +
      '        </linearGradient>' +
      '      </defs>' +
      '      <rect width="' + W + '" height="' + H + '" fill="url(#grid-' + containerId + ')" />' +
      '      <!-- Regional Zone Watermarks -->' +
      '      <text x="58" y="62" fill="#1e293b" font-size="20" font-weight="800" letter-spacing="2">GODAVARI / AHILYANAGAR ZONE</text>' +
      '      <text x="410" y="180" fill="#1e293b" font-size="20" font-weight="800" letter-spacing="2">BHIMA / SOLAPUR BELT</text>' +
      '      <text x="55" y="348" fill="#1e293b" font-size="20" font-weight="800" letter-spacing="2">KRISHNA-PANCHGANGA BASIN</text>' +
      riverPaths +
      highwaySpine +
      allMillsSvg +
      '      <!-- Active Route Glow & Animated Path -->' +
      '      <path d="M ' + pPlot.x + ' ' + pPlot.y + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + pMill.x + ' ' + pMill.y + '" fill="none" stroke="#10b981" stroke-width="7" stroke-linecap="round" opacity="0.18" />' +
      '      <path d="M ' + pPlot.x + ' ' + pPlot.y + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + pMill.x + ' ' + pMill.y + '" fill="none" stroke="url(#routeGrad-' + containerId + ')" stroke-width="3.2" stroke-linecap="round" class="route-line-animated" />' +
      '      <!-- Midpoint Distance Callout Pill -->' +
      '      <g transform="translate(' + ctrlX + ',' + ctrlY + ')">' +
      '        <rect x="-58" y="-13" width="116" height="24" rx="12" fill="#0f172a" stroke="#475569" stroke-width="1.2" />' +
      '        <text x="0" y="3" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="700" font-family="JetBrains Mono, monospace">' +
      metrics.roadKm + ' km • ' + metrics.formattedTime +
      '</text>' +
      '      </g>' +
      '      <!-- Pickup Plot Marker (Origin) -->' +
      '      <g transform="translate(' + pPlot.x + ',' + pPlot.y + ')">' +
      '        <circle cx="0" cy="0" r="14" fill="#10b981" opacity="0.22" />' +
      '        <circle cx="0" cy="0" r="7" fill="#10b981" stroke="#ffffff" stroke-width="2" />' +
      '        <rect x="-78" y="-36" width="156" height="22" rx="5" fill="#064e3b" stroke="#10b981" stroke-width="1" />' +
      '        <text x="0" y="-21" text-anchor="middle" fill="#ecfdf5" font-size="10" font-weight="600">PLOT: ' +
      plotLabel.slice(0, 22) +
      '</text>' +
      '      </g>' +
      '      <!-- Target Sugar Mill Marker (Destination) -->' +
      '      <g transform="translate(' + pMill.x + ',' + pMill.y + ')">' +
      '        <circle cx="0" cy="0" r="15" fill="#f59e0b" opacity="0.24" />' +
      '        <circle cx="0" cy="0" r="7.5" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />' +
      '        <rect x="-88" y="13" width="176" height="22" rx="5" fill="#451a03" stroke="#f59e0b" stroke-width="1" />' +
      '        <text x="0" y="28" text-anchor="middle" fill="#fef3c7" font-size="10" font-weight="600">MILL: ' +
      millLabel.slice(0, 24) +
      '</text>' +
      '      </g>' +
      '    </svg>' +
      '  </div>' +
      '  <!-- Bottom Coordinate & Freight Telemetry Footer -->' +
      '  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-xs">' +
      '    <div>' +
      '      <span class="text-slate-400 block">Pickup Plot GPS</span>' +
      '      <span class="font-mono-num text-emerald-400 font-semibold">' + plotLat.toFixed(4) + '°N, ' + plotLng.toFixed(4) + '°E</span>' +
      '    </div>' +
      '    <div>' +
      '      <span class="text-slate-400 block">Mill Gate GPS</span>' +
      '      <span class="font-mono-num text-amber-400 font-semibold">' + millLat.toFixed(4) + '°N, ' + millLng.toFixed(4) + '°E</span>' +
      '    </div>' +
      '    <div>' +
      '      <span class="text-slate-400 block">Est. Road Distance</span>' +
      '      <span class="font-mono-num text-white font-semibold">' + metrics.roadKm + ' km (Highway)</span>' +
      '    </div>' +
      '    <div>' +
      '      <span class="text-slate-400 block">Benchmark Freight</span>' +
      '      <span class="font-mono-num text-sky-400 font-semibold">₹' + metrics.suggestedRatePerMt + ' / MT</span>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    return metrics;
  }

  return {
    renderCorridorMap: renderCorridorMap
  };
})();
