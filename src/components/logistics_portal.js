/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — LOGISTICS & TRANSPORT PORTAL
 * File: src/components/logistics_portal.js
 * Features:
 *   1. Trip Marketplace & Request Queue (browse farmer requests, filter, select)
 *   2. Interactive Map View (pickup plot, highway corridor, drop-off sugar mill)
 *   3. Dynamic Fare Bidding (synced Total Fare ₹ & Rate ₹/MT with instant submit)
 *   4. Weather Integration & 4-Day Field Condition Forecasting at Pickup Location
 * ============================================================================
 */

window.LogisticsPortal = (function () {
  let queueFilter = 'all'; // 'all' | 'open' | 'awarded'

  function setQueueFilter(filterVal) {
    queueFilter = filterVal;
    const container = document.getElementById('app-root');
    if (container) render(container);
  }

  function selectTrip(tripId) {
    window.AppStore.selectLogisticsTrip(tripId);
  }

  function syncBidRate(sourceField, quantityMt) {
    const totalEl = document.getElementById('logistics-bid-total');
    const rateEl = document.getElementById('logistics-bid-rate');
    if (!totalEl || !rateEl || !quantityMt) return;
    if (sourceField === 'rate') {
      const rate = parseFloat(rateEl.value) || 0;
      totalEl.value = Math.round(rate * quantityMt);
    } else {
      const total = parseFloat(totalEl.value) || 0;
      rateEl.value = (total / quantityMt).toFixed(0);
    }
  }

  function handleBidSubmit(event, tripId) {
    if (event) event.preventDefault();
    const totalEl = document.getElementById('logistics-bid-total');
    const etaEl = document.getElementById('logistics-bid-eta');
    const vehTypeEl = document.getElementById('logistics-bid-vehtype');
    const vehRegEl = document.getElementById('logistics-bid-vehreg');
    const notesEl = document.getElementById('logistics-bid-notes');

    const newBid = window.AppStore.submitTransporterBid(tripId, {
      proposedFareInr: totalEl ? totalEl.value : 18000,
      etaPickupHrs: etaEl ? etaEl.value : 2.0,
      vehicleType: vehTypeEl ? vehTypeEl.value : 'Heavy Cane Truck (25 MT)',
      vehicleRegNo: vehRegEl ? vehRegEl.value : 'MH-09-CV-4821',
      notes: notesEl ? notesEl.value : 'Direct highway dispatch; mechanical loader ready.'
    });

    if (newBid && window.AppUI) {
      window.AppUI.showToast(
        'Fare Quote Submitted (' + newBid.bidId + ')',
        'Quoted ₹' + newBid.proposedFareInr.toLocaleString('en-IN') + ' (₹' + newBid.ratePerMtInr + '/MT) for ' + tripId + '. Synced to Farmer Portal.',
        'emerald'
      );
    }
  }

  function renderWeatherIcon(iconType) {
    if (iconType === 'rain-heavy') {
      return (
        '<svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zm5 4l-1 2m5-2l-1 2m5-2l-1 2" />' +
        '</svg>'
      );
    }
    if (iconType === 'rain-light') {
      return (
        '<svg class="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zm6 4v2m4-2v2" />' +
        '</svg>'
      );
    }
    if (iconType === 'sun-cloud') {
      return (
        '<svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        '  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />' +
        '</svg>'
      );
    }
    return (
      '<svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
      '  <circle cx="12" cy="12" r="5" />' +
      '  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M6.05 6.05L4.636 4.636m12.728 0l-1.414 1.414M6.05 17.95l-1.414 1.414" />' +
      '</svg>'
    );
  }

  function render(container) {
    const state = window.AppStore.getState();
    const user = state.currentUser || window.AppStore.DEMO_USERS.logistics;

    const filteredTrips = state.trips.filter(function (t) {
      if (queueFilter === 'open') return t.status === 'open';
      if (queueFilter === 'awarded') return t.status !== 'open';
      return true;
    });

    const selectedTrip =
      state.trips.find(function (t) {
        return t.tripId === state.selectedLogisticsTripId;
      }) || state.trips[0];

    // Match pickup plot weather profile
    const plotProfile =
      window.MahaData.PLOT_LOCATIONS.find(function (p) {
        return p.id === (selectedTrip && selectedTrip.plotId) || p.district === (selectedTrip && selectedTrip.district);
      }) || window.MahaData.PLOT_LOCATIONS[0];

    const weather = plotProfile.weather;
    const metrics = selectedTrip
      ? window.MahaData.calculateRouteMetrics(
          selectedTrip.plotLat,
          selectedTrip.plotLng,
          selectedTrip.millLat,
          selectedTrip.millLng
        )
      : { roadKm: 28.4, formattedTime: '1h 18m', suggestedRatePerMt: 480 };

    const suggestedTotalFare = selectedTrip ? Math.round(selectedTrip.quantityMt * metrics.suggestedRatePerMt) : 19200;

    // Build Trip Marketplace Queue List
    const queueHtml = filteredTrips.map(function (t) {
      const isSelected = selectedTrip && t.tripId === selectedTrip.tripId;
      const statusBadge =
        t.status === 'open'
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Open for Bids</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">' + t.status + '</span>';

      return (
        '<div onclick="window.LogisticsPortal.selectTrip(\'' + t.tripId + '\')" class="cursor-pointer p-4 rounded-xl border transition-all ' +
        (isSelected
          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300') +
        '">' +
        '  <div class="flex items-center justify-between gap-2 mb-1">' +
        '    <span class="font-mono-num text-xs font-bold text-slate-900">' + t.tripId + ' • ' + t.district + ' District</span>' +
        statusBadge +
        '  </div>' +
        '  <div class="text-sm font-bold text-slate-900">' + t.farmerName + ' — <span class="text-emerald-700 font-mono-num">' + t.quantityMt + ' MT (' + t.quantityQuintals + ' Qtl)</span></div>' +
        '  <div class="text-xs text-slate-600 mt-1 space-y-0.5">' +
        '    <div><strong class="text-slate-800">Pickup Plot:</strong> ' + t.plotAddress + '</div>' +
        '    <div><strong class="text-slate-800">Drop-off Mill:</strong> ' + t.targetMillName + '</div>' +
        '  </div>' +
        '  <div class="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-200/70 text-[11px] font-mono-num text-slate-600">' +
        '    <span>Dist: <strong>' + t.distanceKm + ' km</strong> (' + t.formattedTransit + ')</span>' +
        '    <span>Harvest: <strong>' + t.harvestDate + '</strong></span>' +
        '    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">' + t.bids.length + ' Quote(s)</span>' +
        '  </div>' +
        '</div>'
      );
    }).join('');

    // Build 4-Day Forecast Cards
    const forecastHtml = weather.forecast.map(function (f) {
      const isRainy = f.rainMm >= 5.0;
      return (
        '<div class="p-3 rounded-xl border ' +
        (isRainy ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200') +
        ' flex flex-col justify-between">' +
        '  <div class="flex items-center justify-between">' +
        '    <span class="text-xs font-bold text-slate-800">' + f.day + '</span>' +
        renderWeatherIcon(f.icon) +
        '  </div>' +
        '  <div class="mt-2 flex items-baseline justify-between font-mono-num">' +
        '    <span class="text-base font-extrabold text-slate-900">' + f.highC + '°C <span class="text-xs font-normal text-slate-500">/ ' + f.lowC + '°C</span></span>' +
        '    <span class="text-xs font-semibold ' + (isRainy ? 'text-rose-700' : 'text-sky-700') + '">' + f.rainMm.toFixed(1) + ' mm</span>' +
        '  </div>' +
        '  <div class="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">' +
        '    <span class="text-slate-500">Soil:</span>' +
        '    <span class="font-semibold ' + (isRainy ? 'text-rose-700' : 'text-emerald-700') + '">' + f.fieldState + '</span>' +
        '  </div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<div class="min-h-screen bg-slate-100 flex flex-col">' +
      window.AppUI.renderPortalHeader('logistics', user) +
      '  <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">' +
      '    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">' +
      '      <!-- Left 5 Cols: Trip Marketplace & Request Queue -->' +
      '      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">' +
      '        <div class="px-5 py-4 bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white">' +
      '          <div class="flex flex-wrap items-center justify-between gap-2">' +
      '            <div>' +
      '              <span class="text-[11px] font-mono-num uppercase tracking-wider text-amber-300 font-bold">1. Trip Marketplace &amp; Request Queue</span>' +
      '              <h2 class="text-base sm:text-lg font-bold mt-0.5">Farmer Sugarcane Haulage Requests</h2>' +
      '            </div>' +
      '            <div class="flex items-center gap-1 text-xs">' +
      '              <button type="button" onclick="window.LogisticsPortal.setQueueFilter(\'all\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (queueFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">All (' + state.trips.length + ')</button>' +
      '              <button type="button" onclick="window.LogisticsPortal.setQueueFilter(\'open\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (queueFilter === 'open' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Open</button>' +
      '              <button type="button" onclick="window.LogisticsPortal.setQueueFilter(\'awarded\')" class="px-2.5 py-1 rounded-lg font-medium transition ' + (queueFilter === 'awarded' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Awarded</button>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '        <div class="p-4 space-y-3 overflow-y-auto table-scroll max-h-[680px]">' +
      queueHtml +
      '        </div>' +
      '      </div>' +
      '      <!-- Right 7 Cols: Interactive Route Map + Dynamic Fare Bidding + Pickup Weather Forecast -->' +
      '      <div class="lg:col-span-7 space-y-6">' +
      '        <!-- Interactive Route Map for Selected Trip -->' +
      '        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">' +
      '          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">' +
      '            <div>' +
      '              <span class="text-[11px] font-mono-num uppercase tracking-wider text-amber-700 font-bold">Selected Journey Route Telemetry • ' + (selectedTrip ? selectedTrip.tripId : '') + '</span>' +
      '              <h3 class="text-base sm:text-lg font-bold text-slate-900">' +
      (selectedTrip ? selectedTrip.plotAddress.split(',')[0] + ' → ' + selectedTrip.targetMillName : 'Route Corridor') +
      '</h3>' +
      '            </div>' +
      '            <span class="px-2.5 py-1 rounded-full text-xs font-mono-num font-bold bg-amber-50 text-amber-900 border border-amber-200">' +
      (selectedTrip ? selectedTrip.quantityMt + ' MT (' + selectedTrip.caneVariety + ')' : '') +
      '</span>' +
      '          </div>' +
      '          <div id="logistics-interactive-map" class="w-full"></div>' +
      '        </div>' +
      '        <!-- 2. Dynamic Fare Bidding Form -->' +
      '        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '          <div class="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">' +
      '            <div>' +
      '              <span class="text-[11px] font-mono-num uppercase tracking-wider text-emerald-400 font-bold">2. Dynamic Fare Bidding Engine</span>' +
      '              <h3 class="text-sm sm:text-base font-bold">Submit Transporter Freight Quote for ' + (selectedTrip ? selectedTrip.tripId : '') + '</h3>' +
      '            </div>' +
      '            <span class="text-xs font-mono-num text-slate-300">Suggested Benchmark: <strong class="text-emerald-400">₹' + metrics.suggestedRatePerMt + '/MT (₹' + suggestedTotalFare.toLocaleString('en-IN') + ')</strong></span>' +
      '          </div>' +
      '          <form onsubmit="window.LogisticsPortal.handleBidSubmit(event, \'' + (selectedTrip ? selectedTrip.tripId : 'TRIP-MH-901') + '\')" class="p-5 space-y-4 text-xs sm:text-sm">' +
      '            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Proposed Rate per Ton (₹/MT) *</label>' +
      '                <input type="number" step="5" min="150" max="2500" id="logistics-bid-rate" value="' + metrics.suggestedRatePerMt + '" oninput="window.LogisticsPortal.syncBidRate(\'rate\', ' + (selectedTrip ? selectedTrip.quantityMt : 40) + ')" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-num font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none" />' +
      '              </div>' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Proposed Total Journey Fare (₹) *</label>' +
      '                <input type="number" step="50" min="1000" max="500000" id="logistics-bid-total" value="' + suggestedTotalFare + '" oninput="window.LogisticsPortal.syncBidRate(\'total\', ' + (selectedTrip ? selectedTrip.quantityMt : 40) + ')" required class="w-full px-3 py-2 rounded-lg border border-emerald-400 bg-emerald-50/50 font-mono-num font-extrabold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '              </div>' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Pickup Staging ETA (Hours) *</label>' +
      '                <input type="number" step="0.5" min="0.5" max="24" id="logistics-bid-eta" value="2.0" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-num focus:ring-2 focus:ring-amber-500 focus:outline-none" />' +
      '              </div>' +
      '            </div>' +
      '            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Assigned Fleet Type</label>' +
      '                <select id="logistics-bid-vehtype" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">' +
      '                  <option value="2x Heavy Cane Trucks (25 MT each)">2x Heavy Cane Trucks (25 MT)</option>' +
      '                  <option value="3x Tractor Double-Trolley (16 MT)">3x Tractor Double-Trolley (Soft Soil)</option>' +
      '                  <option value="Multi-Axle Cane Carrier (35 MT)">Multi-Axle Bulk Carrier (35 MT)</option>' +
      '                </select>' +
      '              </div>' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Lead Vehicle Reg No.</label>' +
      '                <input type="text" id="logistics-bid-vehreg" value="' + (user.vehicleRegNo || 'MH-09-CV-4821') + '" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono-num focus:ring-2 focus:ring-amber-500 focus:outline-none" />' +
      '              </div>' +
      '              <div>' +
      '                <label class="block text-xs font-semibold text-slate-700 mb-1">Carrier Dispatch Notes</label>' +
      '                <input type="text" id="logistics-bid-notes" value="Mechanical grab loader + GPS tracking direct to Mill Gate." class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none" />' +
      '              </div>' +
      '            </div>' +
      '            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">' +
      '              <span class="text-xs text-slate-500">Quote automatically syncs to <strong>' + (selectedTrip ? selectedTrip.farmerName : 'Farmer') + '\'s Bidding Dashboard</strong>.</span>' +
      '              <button type="submit" class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition shadow-sm">Submit Competitive Bid for ' + (selectedTrip ? selectedTrip.tripId : '') + ' →</button>' +
      '            </div>' +
      '          </form>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <!-- 3. Weather Integration & 4-Day Field Trafficability Forecast Widget -->' +
      '    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '      <div class="px-5 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-3">' +
      '        <div>' +
      '          <span class="text-[11px] font-mono-num uppercase tracking-wider text-sky-300 font-bold">3. Pickup Plot Weather Integration &amp; 4-Day Field Forecast</span>' +
      '          <h3 class="text-base sm:text-lg font-bold mt-0.5">Agro-Meteorological &amp; Black-Soil Trafficability Telemetry — ' + plotProfile.district + ' (' + plotProfile.soilType + ')</h3>' +
      '        </div>' +
      '        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">' + weather.soilStatus + '</span>' +
      '      </div>' +
      '      <div class="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">' +
      '        <!-- Current Pickup Conditions Card (4 cols) -->' +
      '        <div class="lg:col-span-4 p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between space-y-3">' +
      '          <div class="flex items-start justify-between">' +
      '            <div>' +
      '              <span class="text-xs text-sky-300 font-semibold uppercase">Current Pickup Weather</span>' +
      '              <div class="text-3xl font-extrabold font-mono-num mt-0.5">' + weather.currentTempC + '°C</div>' +
      '              <div class="text-xs text-slate-300 mt-0.5">' + weather.condition + '</div>' +
      '            </div>' +
      '            <div class="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono-num text-amber-300 border border-slate-700">' +
      '              Rain Prob: <strong>' + weather.rainProbPct + '%</strong>' +
      '            </div>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">' +
      '            <div><span class="text-slate-400">Humidity:</span> <strong class="font-mono-num">' + weather.humidityPct + '%</strong></div>' +
      '            <div><span class="text-slate-400">Wind Speed:</span> <strong class="font-mono-num">' + weather.windKmh + ' km/h</strong></div>' +
      '          </div>' +
      '          <div class="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-amber-200 leading-relaxed">' +
      '            <strong>Dispatch Advisory:</strong> ' + weather.advisory +
      '          </div>' +
      '        </div>' +
      '        <!-- 4-Day Forecast Grid (8 cols) -->' +
      '        <div class="lg:col-span-8">' +
      '          <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">4-Day Pickup Plot Forecast (Plan Around Heavy Rain &amp; Muddy Vertisol Conditions)</div>' +
      '          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
      forecastHtml +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </main>' +
      '</div>';

    if (selectedTrip) {
      window.MapEngine.renderCorridorMap('logistics-interactive-map', {
        plotLat: selectedTrip.plotLat,
        plotLng: selectedTrip.plotLng,
        millLat: selectedTrip.millLat,
        millLng: selectedTrip.millLng,
        plotLabel: selectedTrip.plotAddress.split(',')[0],
        millLabel: selectedTrip.targetMillName.split(',')[0],
        highwayCorridor: selectedTrip.highwayCorridor
      });
    }
  }

  return {
    render: render,
    setQueueFilter: setQueueFilter,
    selectTrip: selectTrip,
    syncBidRate: syncBidRate,
    handleBidSubmit: handleBidSubmit
  };
})();
