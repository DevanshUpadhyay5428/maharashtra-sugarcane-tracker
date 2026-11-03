/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — FARMER PORTAL
 * File: src/components/farmer_portal.js
 * Features:
 *   1. Plot & Crop Registration (Maharashtra GPS coordinates, MT/Quintal sync,
 *      target sugar mill selection, harvest scheduling to minimize post-harvest delay)
 *   2. Interactive Map Integration (embedded GIS view of farmer plot -> mill,
 *      real-time travel distance & transit time calculation)
 *   3. Transporter Bidding & Selection Dashboard (compare quotes, sort by fare/ETA,
 *      and award transport contract with Digital Gate Pass generation)
 * ============================================================================
 */

window.FarmerPortal = (function () {
  let bidSortBy = 'fare_asc'; // 'fare_asc' | 'eta_asc' | 'rating_desc'

  function handlePresetPlotChange(plotId) {
    const plot = window.MahaData.PLOT_LOCATIONS.find(function (p) {
      return p.id === plotId;
    });
    if (!plot) return;
    const addrEl = document.getElementById('farmer-plot-address');
    const latEl = document.getElementById('farmer-plot-lat');
    const lngEl = document.getElementById('farmer-plot-lng');
    const distEl = document.getElementById('farmer-plot-district');
    if (addrEl) addrEl.value = plot.label;
    if (latEl) latEl.value = plot.lat;
    if (lngEl) lngEl.value = plot.lng;
    if (distEl) distEl.value = plot.district;
    updateLivePreviewRoute();
  }

  function syncWeightUnits(sourceUnit) {
    const mtEl = document.getElementById('farmer-qty-mt');
    const qtlEl = document.getElementById('farmer-qty-qtl');
    if (!mtEl || !qtlEl) return;
    if (sourceUnit === 'mt') {
      const mt = parseFloat(mtEl.value) || 0;
      qtlEl.value = (mt * 10).toFixed(1);
    } else {
      const qtl = parseFloat(qtlEl.value) || 0;
      mtEl.value = (qtl / 10).toFixed(2);
    }
    updateLivePreviewRoute();
  }

  function updateLivePreviewRoute() {
    const latEl = document.getElementById('farmer-plot-lat');
    const lngEl = document.getElementById('farmer-plot-lng');
    const millEl = document.getElementById('farmer-target-mill');
    const qtyEl = document.getElementById('farmer-qty-mt');
    const addrEl = document.getElementById('farmer-plot-address');

    if (!latEl || !lngEl || !millEl) return;
    const plotLat = parseFloat(latEl.value) || 16.6912;
    const plotLng = parseFloat(lngEl.value) || 74.2448;
    const mill = window.MahaData.SUGAR_MILLS.find(function (m) {
      return m.millId === millEl.value;
    }) || window.MahaData.SUGAR_MILLS[0];
    const qtyMt = parseFloat(qtyEl ? qtyEl.value : 40) || 40;

    const metrics = window.MapEngine.renderCorridorMap('farmer-interactive-map', {
      plotLat: plotLat,
      plotLng: plotLng,
      millLat: mill.lat,
      millLng: mill.lng,
      plotLabel: addrEl ? addrEl.value.split(',')[0] : 'Farmer Plot',
      millLabel: mill.shortName,
      highwayCorridor: mill.corridor
    });

    const summaryEl = document.getElementById('farmer-live-calc-strip');
    if (summaryEl && metrics) {
      const estTotalFreight = Math.round(qtyMt * metrics.suggestedRatePerMt);
      summaryEl.innerHTML =
        '<div class="grid grid-cols-3 gap-2 text-center">' +
        '  <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200">' +
        '    <span class="text-[11px] text-emerald-800 block">Road Distance</span>' +
        '    <span class="text-sm font-bold font-mono-num text-emerald-950">' + metrics.roadKm + ' km</span>' +
        '  </div>' +
        '  <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">' +
        '    <span class="text-[11px] text-amber-800 block">Transit Time</span>' +
        '    <span class="text-sm font-bold font-mono-num text-amber-950">' + metrics.formattedTime + '</span>' +
        '  </div>' +
        '  <div class="p-2 rounded-lg bg-sky-50 border border-sky-200">' +
        '    <span class="text-[11px] text-sky-800 block">Est. Fair Freight</span>' +
        '    <span class="text-sm font-bold font-mono-num text-sky-950">₹' + estTotalFreight.toLocaleString('en-IN') + '</span>' +
        '  </div>' +
        '</div>';
    }
  }

  function handleRegisterTripSubmit(event) {
    if (event) event.preventDefault();
    const plotId = document.getElementById('farmer-plot-preset').value;
    const plotAddress = document.getElementById('farmer-plot-address').value;
    const district = document.getElementById('farmer-plot-district').value;
    const plotLat = document.getElementById('farmer-plot-lat').value;
    const plotLng = document.getElementById('farmer-plot-lng').value;
    const quantityMt = document.getElementById('farmer-qty-mt').value;
    const caneVariety = document.getElementById('farmer-cane-variety').value;
    const cropType = document.getElementById('farmer-crop-type').value;
    const targetMillId = document.getElementById('farmer-target-mill').value;
    const harvestDate = document.getElementById('farmer-harvest-date').value;
    const harvestWindow = document.getElementById('farmer-harvest-window').value;

    const newTrip = window.AppStore.addTransportTrip({
      plotId: plotId,
      plotAddress: plotAddress,
      district: district,
      plotLat: plotLat,
      plotLng: plotLng,
      quantityMt: quantityMt,
      caneVariety: caneVariety,
      cropType: cropType,
      targetMillId: targetMillId,
      harvestDate: harvestDate,
      harvestWindow: harvestWindow
    });

    if (window.AppUI) {
      window.AppUI.showToast(
        'Harvest Trip Listed (' + newTrip.tripId + ')',
        newTrip.quantityMt + ' MT (' + newTrip.quantityQuintals + ' Qtl) broadcast to Maharashtra Logistics Marketplace.',
        'emerald'
      );
    }
  }

  function handleSelectTrip(tripId) {
    window.AppStore.selectFarmerTripForMap(tripId);
  }

  function setBidSort(sortKey) {
    bidSortBy = sortKey;
    const container = document.getElementById('app-root');
    if (container) render(container);
  }

  function handleAwardBid(tripId, bidId) {
    const winningBid = window.AppStore.awardTripBid(tripId, bidId);
    if (winningBid && window.AppUI) {
      window.AppUI.showToast(
        'Transport Contract Awarded!',
        winningBid.transporterName + ' confirmed at ₹' + winningBid.proposedFareInr.toLocaleString('en-IN') + '. Gate Pass generated.',
        'emerald'
      );
    }
  }

  function render(container) {
    const state = window.AppStore.getState();
    const user = state.currentUser || window.AppStore.DEMO_USERS.farmer;
    const trips = state.trips;
    const selectedTrip =
      trips.find(function (t) {
        return t.tripId === state.selectedTripIdForMap;
      }) || trips[0];

    const presetOptionsHtml = window.MahaData.PLOT_LOCATIONS.map(function (p) {
      return '<option value="' + p.id + '">' + p.label + '</option>';
    }).join('');

    const millOptionsHtml = window.MahaData.SUGAR_MILLS.map(function (m) {
      return (
        '<option value="' + m.millId + '">' +
        m.name + ' • ' + m.capacityTcd + ' TCD (FRP ₹' + m.baseFrpPerMt + '/MT)' +
        '</option>'
      );
    }).join('');

    // Build Trip Selector Tabs for Map & Bidding Dashboard
    const tripCardsHtml = trips.map(function (t) {
      const isSelected = selectedTrip && t.tripId === selectedTrip.tripId;
      const badgeCls =
        t.status === 'awarded'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : t.status === 'settled'
          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
          : 'bg-amber-100 text-amber-800 border-amber-300';

      return (
        '<button type="button" onclick="window.FarmerPortal.handleSelectTrip(\'' + t.tripId + '\')" class="text-left p-3.5 rounded-xl border transition-all ' +
        (isSelected
          ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300') +
        '">' +
        '  <div class="flex items-center justify-between gap-2 mb-1">' +
        '    <span class="font-mono-num text-xs font-bold text-slate-900">' + t.tripId + ' • ' + t.district + '</span>' +
        '    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ' + badgeCls + '">' + t.status + '</span>' +
        '  </div>' +
        '  <div class="text-xs font-semibold text-slate-800 truncate">' + t.targetMillName + '</div>' +
        '  <div class="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono-num">' +
        '    <span><strong>' + t.quantityMt + ' MT</strong> (' + t.quantityQuintals + ' Qtl)</span>' +
        '    <span>' + t.distanceKm + ' km • ' + t.bids.length + ' Bid(s)</span>' +
        '  </div>' +
        '</button>'
      );
    }).join('');

    // Sort bids for selected trip
    const sortedBids = selectedTrip ? selectedTrip.bids.slice() : [];
    if (bidSortBy === 'fare_asc') {
      sortedBids.sort(function (a, b) { return a.proposedFareInr - b.proposedFareInr; });
    } else if (bidSortBy === 'eta_asc') {
      sortedBids.sort(function (a, b) { return a.etaPickupHrs - b.etaPickupHrs; });
    } else if (bidSortBy === 'rating_desc') {
      sortedBids.sort(function (a, b) { return b.rating - a.rating; });
    }

    const lowestFare = sortedBids.length > 0
      ? Math.min.apply(null, sortedBids.map(function (b) { return b.proposedFareInr; }))
      : 0;

    const bidsHtml = sortedBids.map(function (b) {
      const isLowest = b.proposedFareInr === lowestFare && sortedBids.length > 1;
      const isAccepted = b.status === 'accepted';
      return (
        '<div class="p-4 rounded-xl border transition-all ' +
        (isAccepted
          ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
          : 'bg-white border-slate-200 hover:border-slate-300') +
        '">' +
        '  <div class="flex flex-wrap items-start justify-between gap-3">' +
        '    <div>' +
        '      <div class="flex flex-wrap items-center gap-2">' +
        '        <h4 class="text-sm font-bold text-slate-900">' + b.transporterName + '</h4>' +
        (isLowest ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Best Value Quote</span>' : '') +
        (isAccepted ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">Awarded Provider</span>' : '') +
        '      </div>' +
        '      <p class="text-xs text-slate-600 mt-1">' +
        '        <span class="font-medium text-slate-800">' + b.vehicleType + '</span> • Reg: <span class="font-mono-num">' + b.vehicleRegNo + '</span> •Pickup ETA: <strong class="text-amber-700 font-mono-num">' + b.etaPickupHrs + ' hrs</strong> • Rating: <strong class="text-emerald-700">★ ' + b.rating.toFixed(1) + '</strong>' +
        '      </p>' +
        '      <p class="text-xs text-slate-500 mt-1 italic">"' + b.notes + '"</p>' +
        '    </div>' +
        '    <div class="text-right flex flex-col items-end justify-between">' +
        '      <div class="font-mono-num text-lg font-extrabold text-slate-900">₹' + b.proposedFareInr.toLocaleString('en-IN') + '</div>' +
        '      <div class="font-mono-num text-xs text-slate-500">₹' + b.ratePerMtInr + ' / MT (₹' + (b.ratePerMtInr / 10).toFixed(1) + ' / Qtl)</div>' +
        (selectedTrip.status === 'open'
          ? '<button type="button" onclick="window.FarmerPortal.handleAwardBid(\'' + selectedTrip.tripId + '\', \'' + b.bidId + '\')" class="mt-2.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition">Accept Quote &amp; Book Fleet</button>'
          : isAccepted
          ? '<span class="mt-2 inline-flex items-center gap-1 text-xs font-mono-num font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">Gate Pass: ' + (selectedTrip.gatePassCode || 'GP-CONFIRMED') + '</span>'
          : '<span class="mt-2 text-xs text-slate-400">Trip Awarded</span>') +
        '    </div>' +
        '  </div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<div class="min-h-screen bg-slate-100 flex flex-col">' +
      window.AppUI.renderPortalHeader('farmer', user) +
      '  <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">' +
      '    <!-- Top Section: Plot & Crop Registration Form + Interactive Route Map -->' +
      '    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">' +
      '      <!-- Left 5 Cols: Plot & Crop Registration Form -->' +
      '      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '        <div class="px-5 py-4 bg-gradient-to-r from-emerald-950 to-emerald-800 text-white">' +
      '          <span class="text-[11px] font-mono-num uppercase tracking-wider text-emerald-300 font-bold">1. Plot &amp; Crop Registration</span>' +
      '          <h2 class="text-base sm:text-lg font-bold mt-0.5">Register Cane Plot &amp; Schedule Harvest</h2>' +
      '          <p class="text-xs text-emerald-100/90 mt-0.5">Minimize cut-to-crush sucrose inversion by locking GPS coordinates and harvest slot</p>' +
      '        </div>' +
      '        <form onsubmit="window.FarmerPortal.handleRegisterTripSubmit(event)" class="p-5 space-y-3.5 text-xs sm:text-sm">' +
      '          <div>' +
      '            <label class="block text-xs font-semibold text-slate-700 mb-1">Select Registered Maharashtra Plot Cluster (or Edit GPS Below)</label>' +
      '            <select id="farmer-plot-preset" onchange="window.FarmerPortal.handlePresetPlotChange(this.value)" class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">' +
      presetOptionsHtml +
      '            </select>' +
      '          </div>' +
      '          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
      '            <div class="sm:col-span-2">' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Plot Survey / Gat Address *</label>' +
      '              <input type="text" id="farmer-plot-address" value="Karveer Taluka, Kolhapur (Gat No. 142/B, Panchganga Bank)" oninput="window.FarmerPortal.updateLivePreviewRoute()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">District *</label>' +
      '              <input type="text" id="farmer-plot-district" value="Kolhapur" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 gap-3">' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Plot Latitude (°N) *</label>' +
      '              <input type="number" step="0.0001" id="farmer-plot-lat" value="16.6912" oninput="window.FarmerPortal.updateLivePreviewRoute()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Plot Longitude (°E) *</label>' +
      '              <input type="number" step="0.0001" id="farmer-plot-lng" value="74.2448" oninput="window.FarmerPortal.updateLivePreviewRoute()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Quantity (Metric Tonnes) *</label>' +
      '              <input type="number" step="0.5" min="5" max="500" id="farmer-qty-mt" value="45" oninput="window.FarmerPortal.syncWeightUnits(\'mt\')" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Quantity (Quintals, 1 MT=10 Qtl)</label>' +
      '              <input type="number" step="5" min="50" max="5000" id="farmer-qty-qtl" value="450.0" oninput="window.FarmerPortal.syncWeightUnits(\'qtl\')" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num text-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 gap-3">' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Sugarcane Variety</label>' +
      '              <select id="farmer-cane-variety" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">' +
      '                <option value="Co 86032">Co 86032 (High Pol%)</option>' +
      '                <option value="CoM 0265 (Phule 265)">CoM 0265 (Phule 265)</option>' +
      '                <option value="Co 94012">Co 94012 (Early Rich)</option>' +
      '                <option value="CoC 671">CoC 671 (High Sucrose)</option>' +
      '              </select>' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Planting Season Type</label>' +
      '              <select id="farmer-crop-type" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">' +
      '                <option value="Adsali (18-Month High Sucrose)">Adsali (18-Month)</option>' +
      '                <option value="Pre-Seasonal (15-Month)">Pre-Seasonal (15-Month)</option>' +
      '                <option value="Suru (12-Month)">Suru (12-Month)</option>' +
      '                <option value="Ratoon (1st Ratoon)">Ratoon Crop</option>' +
      '              </select>' +
      '            </div>' +
      '          </div>' +
      '          <div>' +
      '            <label class="block text-xs font-semibold text-slate-700 mb-1">Destination Sugar Mill (Maharashtra) *</label>' +
      '            <select id="farmer-target-mill" onchange="window.FarmerPortal.updateLivePreviewRoute()" class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none">' +
      millOptionsHtml +
      '            </select>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 gap-3">' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Scheduled Harvest Date *</label>' +
      '              <input type="date" id="farmer-harvest-date" value="2026-10-18" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Cut-to-Crush Window *</label>' +
      '              <select id="farmer-harvest-window" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none">' +
      '                <option value="05:30 AM – 09:30 AM (Fresh Morning Cut)">05:30 AM – 09:30 AM (&lt;8h Mill Gate)</option>' +
      '                <option value="07:00 AM – 11:00 AM (Standard Morning)">07:00 AM – 11:00 AM (&lt;12h Mill Gate)</option>' +
      '                <option value="04:00 PM – 07:30 PM (Evening Loading)">04:00 PM – 07:30 PM (Night Transit)</option>' +
      '              </select>' +
      '            </div>' +
      '          </div>' +
      '          <div id="farmer-live-calc-strip" class="pt-1"></div>' +
      '          <button type="submit" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-sm transition flex items-center justify-center gap-2">' +
      '            <span>Register Harvest &amp; Broadcast to Transporters</span>' +
      '            <span>→</span>' +
      '          </button>' +
      '        </form>' +
      '      </div>' +
      '      <!-- Right 7 Cols: Interactive Map Integration & Active Trip Selector -->' +
      '      <div class="lg:col-span-7 flex flex-col gap-6">' +
      '        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex-1 flex flex-col justify-between">' +
      '          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">' +
      '            <div>' +
      '              <span class="text-[11px] font-mono-num uppercase tracking-wider text-emerald-700 font-bold">2. Interactive Map Integration</span>' +
      '              <h3 class="text-base sm:text-lg font-bold text-slate-900">Plot-to-Mill Geospatial Corridor &amp; Real-Time Transit Telemetry</h3>' +
      '            </div>' +
      '            <span class="px-2.5 py-1 rounded-full text-xs font-mono-num font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Cut-to-Crush Target: &lt; 12 hrs</span>' +
      '          </div>' +
      '          <div id="farmer-interactive-map" class="w-full"></div>' +
      '          <!-- Farmer Listed Trips Selector Strip -->' +
      '          <div class="mt-4 pt-4 border-t border-slate-200">' +
      '            <div class="flex items-center justify-between mb-2">' +
      '              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Your Registered Harvest Trips (Click to Inspect Route &amp; Bids)</span>' +
      '              <span class="text-xs text-slate-500 font-mono-num">' + trips.length + ' Active Trips</span>' +
      '            </div>' +
      '            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">' +
      tripCardsHtml +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <!-- Bottom Section: Transporter Bidding & Selection Dashboard -->' +
      '    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '      <div class="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">' +
      '        <div>' +
      '          <span class="text-[11px] font-mono-num uppercase tracking-wider text-amber-300 font-bold">3. Transporter Bidding &amp; Selection Dashboard</span>' +
      '          <h3 class="text-base sm:text-lg font-bold mt-0.5">Submitted Transport Bids for ' +
      (selectedTrip ? selectedTrip.tripId + ' (' + selectedTrip.plotAddress.split(',')[0] + ' → ' + selectedTrip.targetMillName + ')' : 'Selected Trip') +
      '</h3>' +
      '        </div>' +
      '        <div class="flex flex-wrap items-center gap-1.5 text-xs">' +
      '          <span class="text-slate-400 mr-1">Sort Quotes:</span>' +
      '          <button type="button" onclick="window.FarmerPortal.setBidSort(\'fare_asc\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (bidSortBy === 'fare_asc' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Lowest Fare ↑</button>' +
      '          <button type="button" onclick="window.FarmerPortal.setBidSort(\'eta_asc\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (bidSortBy === 'eta_asc' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Fastest ETA ↑</button>' +
      '          <button type="button" onclick="window.FarmerPortal.setBidSort(\'rating_desc\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (bidSortBy === 'rating_desc' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Top Rated ↓</button>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p-5">' +
      (sortedBids.length > 0
        ? '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' + bidsHtml + '</div>'
        : '<div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">' +
          'No bids received yet for ' + (selectedTrip ? selectedTrip.tripId : 'this trip') + '. Switch to the <strong>Logistics &amp; Transport Portal</strong> to submit a live transporter bid!' +
          '</div>') +
      '      </div>' +
      '    </div>' +
      '  </main>' +
      '</div>';

    // Render interactive map for selected trip or form preview
    if (selectedTrip) {
      window.MapEngine.renderCorridorMap('farmer-interactive-map', {
        plotLat: selectedTrip.plotLat,
        plotLng: selectedTrip.plotLng,
        millLat: selectedTrip.millLat,
        millLng: selectedTrip.millLng,
        plotLabel: selectedTrip.plotAddress.split(',')[0],
        millLabel: selectedTrip.targetMillName.split(',')[0],
        highwayCorridor: selectedTrip.highwayCorridor
      });
    }
    updateLivePreviewRoute();
  }

  return {
    render: render,
    handlePresetPlotChange: handlePresetPlotChange,
    syncWeightUnits: syncWeightUnits,
    updateLivePreviewRoute: updateLivePreviewRoute,
    handleRegisterTripSubmit: handleRegisterTripSubmit,
    handleSelectTrip: handleSelectTrip,
    setBidSort: setBidSort,
    handleAwardBid: handleAwardBid
  };
})();
