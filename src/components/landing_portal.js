/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — PARENT LANDING PORTAL (GRAPHS)
 * File: src/components/landing_portal.js
 * Features:
 *   - Unified top-right Profile/Auth icon (exclusive entry point to Auth flow)
 *   - Macro Climate & Production Analytical Dashboard rendered as 5 interactive
 *     Chart.js graphs covering the landing page:
 *     1. Graph 1: Pacific Climate Anomalies (ENSO) & Weather Correlation (2015-2026)
 *     2. Graph 2: Historical Annual Rainfall in Maharashtra (2012-2026)
 *     3. Graph 3: Historical Sugar Production Trends (12-13 to 25-26)
 *     4. Graph 4: Historical Ethanol Production Trends (12-13 to 25-26)
 *     5. Graph 5 (Featured Full-Width): Maharashtra Annual Sugarcane Harvest vs.
 *        Mill Crushing (2012–2026) — Combined Bar & Line / Grouped Bar Chart with
 *        85.0 MMT baseline, surplus/deficit color-coding, on-canvas peak & trough
 *        annotations, and toggleable companion data table.
 * ============================================================================
 */

window.LandingPortal = (function () {
  let ensoFilter = 'all'; // 'all' | 'elnino' | 'lanina' | 'neutral'
  let rainfallFilter = 'all'; // 'all' | 'Deficient' | 'Normal' | 'Excess'
  let sugarSort = 'chronological'; // 'chronological' | 'desc' | 'asc'
  let ethanolSort = 'chronological'; // 'chronological' | 'desc' | 'asc'
  let harvestCrushFilter = 'all'; // 'all' | 'surplus' | 'deficit'
  let harvestCrushChartMode = 'combo'; // 'combo' (Combined Bar & Line) | 'grouped' (Grouped Bar Chart)
  let showHarvestCrushTable = false; // Toggle companion table below Graph 5

  let ensoChartType = 'bar'; // 'bar' | 'line'
  let rainfallChartType = 'bar'; // 'bar' | 'line'
  let sugarChartType = 'line'; // 'line' | 'bar'
  let ethanolChartType = 'bar'; // 'bar' | 'line'
  let searchQuery = '';

  let landingCharts = {};

  // Active detail banner state for each of the 5 graphs
  let selectedDetails = {
    enso: null,
    rainfall: null,
    sugar: null,
    ethanol: null,
    harvestCrush: null
  };

  function destroyLandingCharts() {
    Object.keys(landingCharts).forEach(function (key) {
      if (landingCharts[key] && typeof landingCharts[key].destroy === 'function') {
        try {
          landingCharts[key].destroy();
        } catch (e) {}
      }
    });
    landingCharts = {};
  }

  function setEnsoFilter(val) {
    ensoFilter = val;
    renderGraphsOnly();
  }

  function setRainfallFilter(val) {
    rainfallFilter = val;
    renderGraphsOnly();
  }

  function setSugarSort(val) {
    sugarSort = val;
    renderGraphsOnly();
  }

  function setEthanolSort(val) {
    ethanolSort = val;
    renderGraphsOnly();
  }

  function setHarvestCrushFilter(val) {
    harvestCrushFilter = val;
    renderGraphsOnly();
  }

  function setHarvestCrushMode(mode) {
    harvestCrushChartMode = mode;
    renderGraphsOnly();
  }

  function toggleHarvestCrushTable() {
    showHarvestCrushTable = !showHarvestCrushTable;
    renderGraphsOnly();
  }

  function toggleChartType(graphKey, typeVal) {
    if (graphKey === 'enso') ensoChartType = typeVal;
    if (graphKey === 'rainfall') rainfallChartType = typeVal;
    if (graphKey === 'sugar') sugarChartType = typeVal;
    if (graphKey === 'ethanol') ethanolChartType = typeVal;
    renderGraphsOnly();
  }

  function setSearchQuery(val) {
    searchQuery = (val || '').trim().toLowerCase();
    renderGraphsOnly();
  }

  function formatSignedPct(val) {
    const sign = val > 0 ? '+' : '';
    return sign + val.toFixed(2) + '%';
  }

  function getFilteredEnsoRows() {
    return window.MahaData.ENSO_DATA.filter(function (r) {
      if (ensoFilter === 'elnino' && r.oniPeak < 0.5) return false;
      if (ensoFilter === 'lanina' && r.oniPeak > -0.5) return false;
      if (ensoFilter === 'neutral' && Math.abs(r.oniPeak) >= 0.5) return false;
      if (searchQuery) {
        const hay = (r.year + ' ' + r.statusBadge + ' ' + r.intensityCategory + ' ' + r.regionalCorrelation).toLowerCase();
        if (hay.indexOf(searchQuery) === -1) return false;
      }
      return true;
    });
  }

  function getFilteredRainfallRows() {
    return window.MahaData.RAINFALL_DATA.filter(function (r) {
      if (rainfallFilter !== 'all' && r.category !== rainfallFilter) return false;
      if (searchQuery) {
        const hay = (r.year + ' ' + r.rainfallMm + ' ' + r.category + ' ' + r.patternNote).toLowerCase();
        if (hay.indexOf(searchQuery) === -1) return false;
      }
      return true;
    });
  }

  function getFilteredSugarRows() {
    const rows = window.MahaData.SUGAR_DATA.slice().filter(function (r) {
      if (!searchQuery) return true;
      const hay = (r.season + ' ' + r.prodLmt + ' ' + r.cycleTag + ' ' + r.notes).toLowerCase();
      return hay.indexOf(searchQuery) !== -1;
    });
    if (sugarSort === 'desc') {
      rows.sort(function (a, b) { return b.prodLmt - a.prodLmt; });
    } else if (sugarSort === 'asc') {
      rows.sort(function (a, b) { return a.prodLmt - b.prodLmt; });
    }
    return rows;
  }

  function getFilteredEthanolRows() {
    const rows = window.MahaData.ETHANOL_DATA.slice().filter(function (r) {
      if (!searchQuery) return true;
      const hay = (r.season + ' ' + r.prodCrL + ' ' + r.policyTag + ' ' + r.notes).toLowerCase();
      return hay.indexOf(searchQuery) !== -1;
    });
    if (ethanolSort === 'desc') {
      rows.sort(function (a, b) { return b.prodCrL - a.prodCrL; });
    } else if (ethanolSort === 'asc') {
      rows.sort(function (a, b) { return a.prodCrL - b.prodCrL; });
    }
    return rows;
  }

  function getFilteredHarvestCrushRows() {
    return window.MahaData.HARVEST_CRUSH_DATA.filter(function (r) {
      if (harvestCrushFilter === 'surplus' && !r.isSurplus) return false;
      if (harvestCrushFilter === 'deficit' && r.isSurplus) return false;
      if (searchQuery) {
        const hay = (r.season + ' ' + r.harvestedMmt + ' ' + r.crushedMmt + ' ' + r.eventLabel + ' ' + r.notes).toLowerCase();
        if (hay.indexOf(searchQuery) === -1) return false;
      }
      return true;
    });
  }

  // --------------------------------------------------------------------------
  // GRAPH CARD 1: Pacific Climate Anomalies (ENSO) & Weather Correlation
  // --------------------------------------------------------------------------
  function buildGraph1CardHtml() {
    const rows = getFilteredEnsoRows();
    const activeRow = selectedDetails.enso || rows[rows.length - 1] || window.MahaData.ENSO_DATA[11];
    const sign = activeRow.oniPeak > 0 ? '+' : '';

    return (
      '<div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">' +
      '  <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white">' +
      '    <div class="flex flex-wrap items-start justify-between gap-3">' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">Graph 01 • Macro Climate (ENSO)</span>' +
      '          <span class="text-xs text-slate-300 font-mono-num">2015 – 2026 (12-Year Series)</span>' +
      '        </div>' +
      '        <h2 class="text-base sm:text-lg font-bold mt-1 text-white">Pacific Climate Anomalies (ENSO) &amp; Weather Correlation</h2>' +
      '        <p class="text-xs text-slate-300 mt-0.5">Baseline Thresholds: <strong class="text-orange-300">≥ +0.5°C El Niño</strong> | <strong class="text-sky-300">≤ -0.5°C La Niña</strong> | Click or hover any bar/point for regional correlation</p>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-1.5">' +
      '        <button type="button" onclick="window.LandingPortal.setEnsoFilter(\'all\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ensoFilter === 'all' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">All (12)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setEnsoFilter(\'elnino\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ensoFilter === 'elnino' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">El Niño (8)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setEnsoFilter(\'lanina\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ensoFilter === 'lanina' ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">La Niña (1)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setEnsoFilter(\'neutral\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ensoFilter === 'neutral' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Neutral (3)</button>' +
      '        <button type="button" onclick="window.LandingPortal.toggleChartType(\'enso\', \'' + (ensoChartType === 'bar' ? 'line' : 'bar') + '\')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-600 transition">' + (ensoChartType === 'bar' ? 'Line View' : 'Bar View') + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">' +
      '    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">' +
      '      <div class="flex flex-wrap items-center gap-3">' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-rose-600"></span>Super El Niño (≥+2.0°C)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-orange-500"></span>El Niño (+0.5°C to +1.9°C)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-slate-400"></span>Neutral (±0.4°C)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>La Niña (≤-0.5°C)</span>' +
      '      </div>' +
      '      <span class="font-mono-num text-slate-400">Click bar to inspect year</span>' +
      '    </div>' +
      '    <div class="relative h-72 w-full">' +
      '      <canvas id="landing-chart-enso"></canvas>' +
      '    </div>' +
      '    <div id="enso-detail-strip" class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">' +
      '      <div class="flex flex-wrap items-center justify-between gap-2 mb-1">' +
      '        <span class="font-mono-num font-bold text-slate-900">Selected Year: ' + activeRow.year + ' • ONI Peak: ' + sign + activeRow.oniPeak.toFixed(1) + '°C</span>' +
      '        <div class="flex items-center gap-1.5">' +
      '          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">' + activeRow.statusBadge + '</span>' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800">Intensity: ' + activeRow.intensityCategory + '</span>' +
      '        </div>' +
      '      </div>' +
      '      <p class="text-slate-600 leading-relaxed">' + activeRow.regionalCorrelation + '</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">' +
      '    <span><strong>Analytical Synthesis:</strong> Super El Niño peaks in <strong>2015 (+2.6°C)</strong> and <strong>2023 (+2.0°C)</strong> triggered 1-year lagged cane crushing contractions in 16-17 and 24-25.</span>' +
      '    <span class="font-mono-num text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">2026 Active: +1.4°C (Moderate El Niño)</span>' +
      '  </div>' +
      '</div>'
    );
  }

  // --------------------------------------------------------------------------
  // GRAPH CARD 2: Historical Annual Rainfall in Maharashtra (2012-2026)
  // --------------------------------------------------------------------------
  function buildGraph2CardHtml() {
    const rows = getFilteredRainfallRows();
    const activeRow = selectedDetails.rainfall || rows[rows.length - 1] || window.MahaData.RAINFALL_DATA[14];

    return (
      '<div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">' +
      '  <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white">' +
      '    <div class="flex flex-wrap items-start justify-between gap-3">' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">Graph 02 • Hydro-Meteorology</span>' +
      '          <span class="text-xs text-slate-300 font-mono-num">2012 – 2026 (State Baseline = 1,152.7 mm)</span>' +
      '        </div>' +
      '        <h2 class="text-base sm:text-lg font-bold mt-1 text-white">Historical Annual Rainfall in Maharashtra</h2>' +
      '        <p class="text-xs text-slate-300 mt-0.5">IMD Classification: <strong class="text-rose-300">Deficient (&lt; -19%)</strong> | <strong class="text-sky-300">Normal (-19% to +19%)</strong> | <strong class="text-emerald-300">Excess (&gt; +19%)</strong></p>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-1.5">' +
      '        <button type="button" onclick="window.LandingPortal.setRainfallFilter(\'all\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (rainfallFilter === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">All (15)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setRainfallFilter(\'Deficient\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (rainfallFilter === 'Deficient' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Deficient (2)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setRainfallFilter(\'Normal\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (rainfallFilter === 'Normal' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Normal (11)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setRainfallFilter(\'Excess\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (rainfallFilter === 'Excess' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Excess (2)</button>' +
      '        <button type="button" onclick="window.LandingPortal.toggleChartType(\'rainfall\', \'' + (rainfallChartType === 'bar' ? 'line' : 'bar') + '\')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-sky-300 border border-slate-600 transition">' + (rainfallChartType === 'bar' ? 'Line View' : 'Bar View') + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">' +
      '    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">' +
      '      <div class="flex flex-wrap items-center gap-3">' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>Excess (&gt;+19%)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-sky-500"></span>Normal (±19%)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-rose-600"></span>Deficient (&lt;-19%)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-3 h-0.5 bg-amber-600"></span>Baseline (1,152.7 mm)</span>' +
      '      </div>' +
      '      <span class="font-mono-num text-slate-400">Click bar to inspect year</span>' +
      '    </div>' +
      '    <div class="relative h-72 w-full">' +
      '      <canvas id="landing-chart-rainfall"></canvas>' +
      '    </div>' +
      '    <div id="rainfall-detail-strip" class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">' +
      '      <div class="flex flex-wrap items-center justify-between gap-2 mb-1">' +
      '        <span class="font-mono-num font-bold text-slate-900">Selected Year: ' + activeRow.year + ' • Rainfall: ' + activeRow.rainfallMm.toLocaleString('en-IN', { minimumFractionDigits: 1 }) + ' mm (' + formatSignedPct(activeRow.pctDeviation) + ' vs Baseline)</span>' +
      '        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ' +
      (activeRow.category === 'Deficient'
        ? 'bg-rose-100 text-rose-800 border border-rose-300'
        : activeRow.category === 'Excess'
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        : 'bg-sky-100 text-sky-800 border border-sky-300') +
      '">' + activeRow.category + '</span>' +
      '      </div>' +
      '      <p class="text-slate-600 leading-relaxed">' + activeRow.patternNote + '</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">' +
      '    <span><strong>Extremes &amp; Multi-Year Pattern:</strong> Driest Full Year: <strong>2015 (875.7 mm, -24.03%)</strong> | Wettest: <strong>2019 (1,555.8 mm, +34.97%)</strong> | <strong>2019–2022</strong> 4-yr surplus streak.</span>' +
      '    <span class="font-mono-num text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200">2026 YTD: 845.0 mm (-26.69%)</span>' +
      '  </div>' +
      '</div>'
    );
  }

  // --------------------------------------------------------------------------
  // GRAPH CARD 3: Historical Sugar Production Trends (12-13 to 25-26)
  // --------------------------------------------------------------------------
  function buildGraph3CardHtml() {
    const rows = getFilteredSugarRows();
    const activeRow = selectedDetails.sugar || rows[rows.length - 1] || window.MahaData.SUGAR_DATA[13];

    return (
      '<div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">' +
      '  <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white">' +
      '    <div class="flex flex-wrap items-start justify-between gap-3">' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">Graph 03 • Crystal Sugar Output</span>' +
      '          <span class="text-xs text-slate-300 font-mono-num">12-13 to 25-26 (State Baseline = 90.0 LMT)</span>' +
      '        </div>' +
      '        <h2 class="text-base sm:text-lg font-bold mt-1 text-white">Historical Sugar Production Trends (Maharashtra)</h2>' +
      '        <p class="text-xs text-slate-300 mt-0.5">Tracks cyclical crushing peaks, post-El Niño drought troughs, and net sucrose retention after B-heavy/syrup diversion</p>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-1.5">' +
      '        <button type="button" onclick="window.LandingPortal.setSugarSort(\'chronological\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (sugarSort === 'chronological' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">By Season</button>' +
      '        <button type="button" onclick="window.LandingPortal.setSugarSort(\'desc\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (sugarSort === 'desc' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Peak Output ↓</button>' +
      '        <button type="button" onclick="window.LandingPortal.setSugarSort(\'asc\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (sugarSort === 'asc' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Deficit Years ↑</button>' +
      '        <button type="button" onclick="window.LandingPortal.toggleChartType(\'sugar\', \'' + (sugarChartType === 'line' ? 'bar' : 'line') + '\')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-slate-600 transition">' + (sugarChartType === 'line' ? 'Bar View' : 'Area View') + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">' +
      '    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">' +
      '      <div class="flex flex-wrap items-center gap-3">' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>Above Baseline (≥90 LMT)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span>Drought / Flood Trough (&lt;90 LMT)</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-3 h-0.5 bg-amber-600"></span>Baseline (90.0 LMT)</span>' +
      '      </div>' +
      '      <span class="font-mono-num text-slate-400">Click point to inspect season</span>' +
      '    </div>' +
      '    <div class="relative h-72 w-full">' +
      '      <canvas id="landing-chart-sugar"></canvas>' +
      '    </div>' +
      '    <div id="sugar-detail-strip" class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">' +
      '      <div class="flex flex-wrap items-center justify-between gap-2 mb-1">' +
      '        <span class="font-mono-num font-bold text-slate-900">Season: ' + activeRow.season + ' • Output: ' + activeRow.prodLmt.toFixed(2) + ' LMT (' + formatSignedPct(activeRow.pctDeviation) + ' vs 90.0 LMT Baseline)</span>' +
      '        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ' +
      (activeRow.pctDeviation >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300') +
      '">' + activeRow.cycleTag + '</span>' +
      '      </div>' +
      '      <p class="text-slate-600 leading-relaxed">' + activeRow.notes + '</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">' +
      '    <span><strong>Cyclical Extremes:</strong> Record Peak: <strong>21-22 (137.28 LMT, +52.53%)</strong> | Drought Trough: <strong>16-17 (42.00 LMT, -53.33%)</strong> | Flood/Drought: <strong>19-20 (61.68 LMT)</strong>.</span>' +
      '    <span class="font-mono-num text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">25-26: 99.20 LMT (+10.22%)</span>' +
      '  </div>' +
      '</div>'
    );
  }

  // --------------------------------------------------------------------------
  // GRAPH CARD 4: Historical Ethanol Production Trends (12-13 to 25-26)
  // --------------------------------------------------------------------------
  function buildGraph4CardHtml() {
    const rows = getFilteredEthanolRows();
    const activeRow = selectedDetails.ethanol || rows[rows.length - 1] || window.MahaData.ETHANOL_DATA[13];

    return (
      '<div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">' +
      '  <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 text-white">' +
      '    <div class="flex flex-wrap items-start justify-between gap-3">' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">Graph 04 • Biofuel &amp; EBP Policy</span>' +
      '          <span class="text-xs text-slate-300 font-mono-num">12-13 to 25-26 (State Baseline = 120.0 Cr Litres)</span>' +
      '        </div>' +
      '        <h2 class="text-base sm:text-lg font-bold mt-1 text-white">Historical Ethanol Production Trends (Maharashtra)</h2>' +
      '        <p class="text-xs text-slate-300 mt-0.5">Examines how National Ethanol Blending Programme (EBP) subvention &amp; juice/B-heavy diversion transformed net capacity</p>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-1.5">' +
      '        <button type="button" onclick="window.LandingPortal.setEthanolSort(\'chronological\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ethanolSort === 'chronological' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">By Season</button>' +
      '        <button type="button" onclick="window.LandingPortal.setEthanolSort(\'desc\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ethanolSort === 'desc' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Highest Output ↓</button>' +
      '        <button type="button" onclick="window.LandingPortal.setEthanolSort(\'asc\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (ethanolSort === 'asc' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Pre-EBP Era ↑</button>' +
      '        <button type="button" onclick="window.LandingPortal.toggleChartType(\'ethanol\', \'' + (ethanolChartType === 'bar' ? 'line' : 'bar') + '\')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-600 transition">' + (ethanolChartType === 'bar' ? 'Line View' : 'Bar View') + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">' +
      '    <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-500">' +
      '      <div class="flex flex-wrap items-center gap-3">' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span>Surpassed 120 Cr L Baseline</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>EBP Expansion / Syrup Curbs</span>' +
      '        <span class="inline-flex items-center gap-1"><span class="w-3 h-0.5 bg-emerald-600"></span>Baseline (120.0 Cr L)</span>' +
      '      </div>' +
      '      <span class="font-mono-num text-slate-400">Click bar to inspect season</span>' +
      '    </div>' +
      '    <div class="relative h-72 w-full">' +
      '      <canvas id="landing-chart-ethanol"></canvas>' +
      '    </div>' +
      '    <div id="ethanol-detail-strip" class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">' +
      '      <div class="flex flex-wrap items-center justify-between gap-2 mb-1">' +
      '        <span class="font-mono-num font-bold text-slate-900">Season: ' + activeRow.season + ' • Output: ' + activeRow.prodCrL.toFixed(1) + ' Cr Litres (' + formatSignedPct(activeRow.pctDeviation) + ' vs 120.0 Cr L Baseline)</span>' +
      '        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">' + activeRow.policyTag + '</span>' +
      '      </div>' +
      '      <p class="text-slate-600 leading-relaxed">' + activeRow.notes + '</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">' +
      '    <span><strong>Policy Inflection Points:</strong> <strong>18-19 (48.5 Cr L)</strong> EBP Subvention Launch → <strong>22-23 (142.5 Cr L)</strong> Surge → <strong>23-24 (81.4 Cr L)</strong> Syrup Curbs → <strong>25-26 (145.0 Cr L)</strong> Peak.</span>' +
      '    <span class="font-mono-num text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">30x Growth (12-13 to 25-26)</span>' +
      '  </div>' +
      '</div>'
    );
  }

  // --------------------------------------------------------------------------
  // GRAPH CARD 5 (FULL-WIDTH FEATURED): Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012–2026)
  // --------------------------------------------------------------------------
  function buildGraph5CardHtml() {
    const rows = getFilteredHarvestCrushRows();
    const activeRow =
      selectedDetails.harvestCrush ||
      rows.find(function (r) { return r.season === '2021–22'; }) ||
      rows[rows.length - 1] ||
      window.MahaData.HARVEST_CRUSH_DATA[9];

    let companionTableHtml = '';
    if (showHarvestCrushTable) {
      const trs = rows.map(function (r) {
        const rowHighlight =
          r.highlight === 'peak'
            ? 'row-highlight-record'
            : r.highlight === 'trough' || r.highlight === 'flood'
            ? 'row-highlight-deficit'
            : '';
        const statusBadge = r.isSurplus
          ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">Surplus (&gt; 85 MMT)</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Deficit (&lt; 85 MMT)</span>';

        return (
          '<tr class="border-b border-slate-200/80 hover:bg-slate-50 text-xs ' + rowHighlight + '">' +
          '  <td class="py-2.5 px-3 font-mono-num font-bold text-slate-900 whitespace-nowrap">' + r.season + '</td>' +
          '  <td class="py-2.5 px-3 text-right font-mono-num font-bold ' + (r.isSurplus ? 'text-teal-800' : 'text-rose-700') + '">' + r.harvestedMmt.toFixed(2) + ' MMT <span class="text-[10px] font-normal text-slate-500">(' + formatSignedPct(r.harvestDevPct) + ')</span></td>' +
          '  <td class="py-2.5 px-3 text-right font-mono-num font-bold text-indigo-900">' + r.crushedMmt.toFixed(2) + ' MMT <span class="text-[10px] font-normal text-slate-500">(' + formatSignedPct(r.crushDevPct) + ')</span></td>' +
          '  <td class="py-2.5 px-3 whitespace-nowrap">' + statusBadge + '</td>' +
          '  <td class="py-2.5 px-3 text-slate-700">' +
          '    <strong class="text-slate-900">' + r.eventLabel + ':</strong> ' + r.notes +
          '  </td>' +
          '</tr>'
        );
      }).join('');

      companionTableHtml =
        '<div class="mt-4 border border-slate-200 rounded-xl overflow-hidden">' +
        '  <div class="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">' +
        '    <span>Companion Dataset Table: Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012–13 to 2025–26)</span>' +
        '    <span class="font-mono-num text-slate-500">Baseline = 85.0 MMT</span>' +
        '  </div>' +
        '  <div class="overflow-x-auto table-scroll max-h-[340px]">' +
        '    <table class="w-full text-left border-collapse analytical-table">' +
        '      <thead>' +
        '        <tr class="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">' +
        '          <th class="py-2.5 px-3">Sugar Season</th>' +
        '          <th class="py-2.5 px-3 text-right">Total Harvested (Farm Gate MMT)</th>' +
        '          <th class="py-2.5 px-3 text-right">Total Crushed by Mills (MMT)</th>' +
        '          <th class="py-2.5 px-3">Baseline Status (85 MMT)</th>' +
        '          <th class="py-2.5 px-3">Cycle Highlight &amp; Notes</th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' + trs + '</tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>';
    }

    return (
      '<div class="xl:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">' +
      '  <div class="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white">' +
      '    <div class="flex flex-wrap items-start justify-between gap-3">' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">Graph 05 • Farm Gate Harvest vs. Mill Crushing</span>' +
      '          <span class="text-xs text-slate-300 font-mono-num">2012–13 to 2025–26 (Long-Term Baseline = 85.0 MMT)</span>' +
      '        </div>' +
      '        <h2 class="text-base sm:text-xl font-extrabold mt-1 text-white">Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012–2026)</h2>' +
      '        <p class="text-xs text-slate-300 mt-0.5">Combined Bar &amp; Line visualization comparing Farm Gate Harvest (MMT) against Sugar Mill Crushing (MMT) across a 0–140 MMT scale</p>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-1.5">' +
      '        <button type="button" onclick="window.LandingPortal.setHarvestCrushFilter(\'all\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (harvestCrushFilter === 'all' ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">All Seasons (14)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setHarvestCrushFilter(\'surplus\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (harvestCrushFilter === 'surplus' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Surplus &gt; 85 MMT (7)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setHarvestCrushFilter(\'deficit\')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition ' + (harvestCrushFilter === 'deficit' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700') + '">Deficit &lt; 85 MMT (7)</button>' +
      '        <button type="button" onclick="window.LandingPortal.setHarvestCrushMode(\'' + (harvestCrushChartMode === 'combo' ? 'grouped' : 'combo') + '\')" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-teal-300 border border-slate-600 transition">' + (harvestCrushChartMode === 'combo' ? 'Switch to Grouped Bars' : 'Switch to Bar + Line') + '</button>' +
      '        <button type="button" onclick="window.LandingPortal.toggleHarvestCrushTable()" class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition">' + (showHarvestCrushTable ? 'Hide Data Table' : 'Show Data Table') + '</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <!-- Explicit Visual Legend, Highlight Callout Pills & High-Resolution Chart Viewport -->' +
      '  <div class="p-4 sm:p-6 bg-white flex-1 flex flex-col justify-between">' +
      '    <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 text-xs">' +
      '      <div class="flex flex-wrap items-center gap-4">' +
      '        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700"><span class="w-3.5 h-3.5 rounded-xs bg-teal-600 inline-block"></span>Series 1 (Bars): Surplus Harvest (&gt; 85 MMT)</span>' +
      '        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700"><span class="w-3.5 h-3.5 rounded-xs bg-amber-500 inline-block"></span>Series 1 (Bars): Deficit Harvest (&lt; 85 MMT)</span>' +
      '        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700"><span class="w-3.5 h-1 bg-indigo-700 inline-block rounded-full"></span>Series 2 (Line/Bars): Mill Crushed (MMT)</span>' +
      '        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700"><span class="w-4 h-0.5 border-t-2 border-dashed border-slate-700 inline-block"></span>Baseline (85.0 MMT)</span>' +
      '      </div>' +
      '      <div class="flex flex-wrap items-center gap-2 font-mono-num text-[11px]">' +
      '        <span class="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold">2016–17 Drought Trough: 52.26 / 37.31 MMT</span>' +
      '        <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">2021–22 Record Peak: 123.97 / 132.03 MMT</span>' +
      '      </div>' +
      '    </div>' +
      '    <!-- High-Resolution Fixed-Height Chart Container -->' +
      '    <div class="relative h-80 sm:h-96 w-full">' +
      '      <canvas id="landing-chart-harvest-crush"></canvas>' +
      '    </div>' +
      '    <!-- Interactive Selected Season Telemetry Banner -->' +
      '    <div id="harvest-crush-detail-strip" class="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">' +
      '      <div class="flex flex-wrap items-center justify-between gap-2 mb-1">' +
      '        <span class="font-mono-num font-bold text-slate-900">Selected Season: ' + activeRow.season + ' • Farm Gate Harvest: ' + activeRow.harvestedMmt.toFixed(2) + ' MMT (' + formatSignedPct(activeRow.harvestDevPct) + ') | Mill Crushed: ' + activeRow.crushedMmt.toFixed(2) + ' MMT (' + formatSignedPct(activeRow.crushDevPct) + ')</span>' +
      '        <div class="flex items-center gap-1.5">' +
      '          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ' + (activeRow.isSurplus ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-amber-100 text-amber-900 border border-amber-300') + '">' + activeRow.status + '</span>' +
      '          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-900">' + activeRow.eventLabel + '</span>' +
      '        </div>' +
      '      </div>' +
      '      <p class="text-slate-600 leading-relaxed">' + activeRow.notes + '</p>' +
      '    </div>' +
      companionTableHtml +
      '  </div>' +
      '  <div class="p-3.5 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">' +
      '    <span><strong>Key Highlights:</strong> Lowest Drought Trough: <strong>2016–17 (52.26 MMT Harvested / 37.31 MMT Crushed)</strong> | All-Time Bumper Peak: <strong>2021–22 (123.97 MMT Harvested / 132.03 MMT Crushed)</strong>.</span>' +
      '    <span class="font-mono-num text-teal-900 bg-teal-100/80 px-2 py-0.5 rounded border border-teal-200">2025–26: 104.50 MMT Harvested / 99.50 MMT Crushed</span>' +
      '  </div>' +
      '</div>'
    );
  }

  // --------------------------------------------------------------------------
  // CHART.JS INITIALIZATION FOR ALL 5 MACRO ANALYTICAL GRAPHS
  // --------------------------------------------------------------------------
  function mountLandingCharts() {
    destroyLandingCharts();
    if (typeof window.Chart === 'undefined') return;

    // 1. ENSO Chart (#landing-chart-enso)
    const ensoRows = getFilteredEnsoRows();
    const ensoCanvas = document.getElementById('landing-chart-enso');
    if (ensoCanvas && ensoRows.length > 0) {
      const ensoColors = ensoRows.map(function (r) {
        if (r.oniPeak >= 2.0) return '#e11d48';
        if (r.oniPeak >= 0.5) return '#f97316';
        if (r.oniPeak <= -0.5) return '#0284c7';
        return '#64748b';
      });

      landingCharts.enso = new window.Chart(ensoCanvas.getContext('2d'), {
        type: ensoChartType,
        data: {
          labels: ensoRows.map(function (r) { return String(r.year); }),
          datasets: [
            {
              label: 'ONI Peak (°C)',
              data: ensoRows.map(function (r) { return r.oniPeak; }),
              backgroundColor: ensoChartType === 'bar' ? ensoColors : 'rgba(249, 115, 22, 0.16)',
              borderColor: ensoChartType === 'bar' ? ensoColors : '#ea580c',
              pointBackgroundColor: ensoColors,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 2,
              borderRadius: ensoChartType === 'bar' ? 6 : 0,
              fill: ensoChartType === 'line',
              tension: 0.3
            },
            {
              label: 'El Niño Threshold (+0.5°C)',
              type: 'line',
              data: ensoRows.map(function () { return 0.5; }),
              borderColor: 'rgba(234, 88, 12, 0.65)',
              borderWidth: 1.5,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'La Niña Threshold (-0.5°C)',
              type: 'line',
              data: ensoRows.map(function () { return -0.5; }),
              borderColor: 'rgba(2, 132, 199, 0.65)',
              borderWidth: 1.5,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (evt, elements) {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              selectedDetails.enso = ensoRows[idx];
              renderGraphsOnly();
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const row = ensoRows[items[0].dataIndex];
                  return 'Year ' + row.year + ' — ' + row.statusBadge + ' (' + row.intensityCategory + ')';
                },
                label: function (ctx) {
                  if (ctx.datasetIndex !== 0) return ctx.dataset.label;
                  const row = ensoRows[ctx.dataIndex];
                  const sign = row.oniPeak > 0 ? '+' : '';
                  return 'ONI Peak: ' + sign + row.oniPeak.toFixed(1) + '°C';
                },
                afterBody: function (items) {
                  const row = ensoRows[items[0].dataIndex];
                  return [row.regionalCorrelation];
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Year (2015–2026)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              grid: { display: false }
            },
            y: {
              title: { display: true, text: 'ONI Peak Anomaly (°C)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              suggestedMin: -1.2,
              suggestedMax: 3.0,
              ticks: {
                callback: function (v) { return (v > 0 ? '+' : '') + Number(v).toFixed(1) + '°C'; }
              }
            }
          }
        }
      });
    }

    // 2. Rainfall Chart (#landing-chart-rainfall)
    const rainRows = getFilteredRainfallRows();
    const rainCanvas = document.getElementById('landing-chart-rainfall');
    if (rainCanvas && rainRows.length > 0) {
      const rainColors = rainRows.map(function (r) {
        if (r.category === 'Deficient') return '#e11d48';
        if (r.category === 'Excess') return '#059669';
        return '#0284c7';
      });

      landingCharts.rainfall = new window.Chart(rainCanvas.getContext('2d'), {
        type: rainfallChartType,
        data: {
          labels: rainRows.map(function (r) { return r.year; }),
          datasets: [
            {
              label: 'Total Rainfall (mm)',
              data: rainRows.map(function (r) { return r.rainfallMm; }),
              backgroundColor: rainfallChartType === 'bar' ? rainColors : 'rgba(2, 132, 199, 0.16)',
              borderColor: rainfallChartType === 'bar' ? rainColors : '#0284c7',
              pointBackgroundColor: rainColors,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 2,
              borderRadius: rainfallChartType === 'bar' ? 5 : 0,
              fill: rainfallChartType === 'line',
              tension: 0.3
            },
            {
              label: 'State Baseline (1,152.7 mm)',
              type: 'line',
              data: rainRows.map(function () { return window.MahaData.RAINFALL_BASELINE_MM; }),
              borderColor: '#d97706',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (evt, elements) {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              selectedDetails.rainfall = rainRows[idx];
              renderGraphsOnly();
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const row = rainRows[items[0].dataIndex];
                  return 'Year ' + row.year + ' — ' + row.category;
                },
                label: function (ctx) {
                  if (ctx.datasetIndex !== 0) return 'State Baseline: 1,152.7 mm';
                  const row = rainRows[ctx.dataIndex];
                  return 'Rainfall: ' + row.rainfallMm.toFixed(1) + ' mm (' + formatSignedPct(row.pctDeviation) + ')';
                },
                afterBody: function (items) {
                  const row = rainRows[items[0].dataIndex];
                  return [row.patternNote];
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Year (2012–2026 YTD)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              grid: { display: false }
            },
            y: {
              title: { display: true, text: 'Annual Rainfall (mm)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              suggestedMin: 600,
              suggestedMax: 1650
            }
          }
        }
      });
    }

    // 3. Sugar Production Trends Chart (#landing-chart-sugar)
    const sugarRows = getFilteredSugarRows();
    const sugarCanvas = document.getElementById('landing-chart-sugar');
    if (sugarCanvas && sugarRows.length > 0) {
      const sugarColors = sugarRows.map(function (r) {
        if (r.highlight === 'record') return '#047857';
        if (r.pctDeviation < 0) return '#e11d48';
        return '#10b981';
      });

      landingCharts.sugar = new window.Chart(sugarCanvas.getContext('2d'), {
        type: sugarChartType,
        data: {
          labels: sugarRows.map(function (r) { return r.season; }),
          datasets: [
            {
              label: 'Sugar Production (LMT)',
              data: sugarRows.map(function (r) { return r.prodLmt; }),
              backgroundColor: sugarChartType === 'bar' ? sugarColors : 'rgba(16, 185, 129, 0.18)',
              borderColor: sugarChartType === 'bar' ? sugarColors : '#059669',
              pointBackgroundColor: sugarColors,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 2.5,
              borderRadius: sugarChartType === 'bar' ? 5 : 0,
              fill: sugarChartType === 'line',
              tension: 0.3
            },
            {
              label: 'State Baseline (90.0 LMT)',
              type: 'line',
              data: sugarRows.map(function () { return window.MahaData.SUGAR_BASELINE_LMT; }),
              borderColor: '#d97706',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (evt, elements) {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              selectedDetails.sugar = sugarRows[idx];
              renderGraphsOnly();
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const row = sugarRows[items[0].dataIndex];
                  return 'Season ' + row.season + ' — ' + row.cycleTag;
                },
                label: function (ctx) {
                  if (ctx.datasetIndex !== 0) return 'State Baseline: 90.0 LMT';
                  const row = sugarRows[ctx.dataIndex];
                  return 'Production: ' + row.prodLmt.toFixed(2) + ' LMT (' + formatSignedPct(row.pctDeviation) + ')';
                },
                afterBody: function (items) {
                  const row = sugarRows[items[0].dataIndex];
                  return [row.notes];
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Crushing Season (12-13 to 25-26)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              grid: { display: false }
            },
            y: {
              title: { display: true, text: 'Production (LMT)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              suggestedMin: 30,
              suggestedMax: 150
            }
          }
        }
      });
    }

    // 4. Ethanol Production Trends Chart (#landing-chart-ethanol)
    const ethRows = getFilteredEthanolRows();
    const ethCanvas = document.getElementById('landing-chart-ethanol');
    if (ethCanvas && ethRows.length > 0) {
      const ethColors = ethRows.map(function (r) {
        if (r.prodCrL >= 120.0) return '#4f46e5';
        if (r.season === '23-24') return '#e11d48';
        if (r.season === '18-19') return '#d97706';
        return '#f59e0b';
      });

      landingCharts.ethanol = new window.Chart(ethCanvas.getContext('2d'), {
        type: ethanolChartType,
        data: {
          labels: ethRows.map(function (r) { return r.season; }),
          datasets: [
            {
              label: 'Ethanol Production (Cr Litres)',
              data: ethRows.map(function (r) { return r.prodCrL; }),
              backgroundColor: ethanolChartType === 'bar' ? ethColors : 'rgba(79, 70, 229, 0.18)',
              borderColor: ethanolChartType === 'bar' ? ethColors : '#4f46e5',
              pointBackgroundColor: ethColors,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 2.5,
              borderRadius: ethanolChartType === 'bar' ? 5 : 0,
              fill: ethanolChartType === 'line',
              tension: 0.3
            },
            {
              label: 'State Baseline (120.0 Cr Litres)',
              type: 'line',
              data: ethRows.map(function () { return window.MahaData.ETHANOL_BASELINE_CR_L; }),
              borderColor: '#059669',
              borderWidth: 2,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (evt, elements) {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              selectedDetails.ethanol = ethRows[idx];
              renderGraphsOnly();
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const row = ethRows[items[0].dataIndex];
                  return 'Season ' + row.season + ' — ' + row.policyTag;
                },
                label: function (ctx) {
                  if (ctx.datasetIndex !== 0) return 'State Baseline: 120.0 Cr Litres';
                  const row = ethRows[ctx.dataIndex];
                  return 'Production: ' + row.prodCrL.toFixed(1) + ' Cr L (' + formatSignedPct(row.pctDeviation) + ')';
                },
                afterBody: function (items) {
                  const row = ethRows[items[0].dataIndex];
                  return [row.notes];
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Season (12-13 to 25-26)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              grid: { display: false }
            },
            y: {
              title: { display: true, text: 'Production (Cr Litres)', font: { size: 11, weight: 'bold' }, color: '#475569' },
              suggestedMin: 0,
              suggestedMax: 160
            }
          }
        }
      });
    }

    // 5. Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012–2026) (#landing-chart-harvest-crush)
    const hcRows = getFilteredHarvestCrushRows();
    const hcCanvas = document.getElementById('landing-chart-harvest-crush');
    if (hcCanvas && hcRows.length > 0) {
      // Color-code surplus years (> 85 MMT) in green/teal and deficit years (< 85 MMT) in amber/red
      const harvestBarColors = hcRows.map(function (r) {
        if (r.highlight === 'peak') return 'rgba(4, 120, 87, 0.90)'; // Deep Emerald for 2021-22 peak
        if (r.highlight === 'trough') return 'rgba(225, 29, 72, 0.90)'; // Deep Red/Rose for 2016-17 severe drought trough
        if (r.highlight === 'flood') return 'rgba(217, 119, 6, 0.88)'; // Amber/Orange for 2019-20 flood impact
        return r.isSurplus ? 'rgba(13, 148, 136, 0.82)' : 'rgba(245, 158, 11, 0.82)'; // Teal vs Amber
      });

      const harvestBorderColors = hcRows.map(function (r) {
        if (r.highlight === 'peak') return '#064e3b';
        if (r.highlight === 'trough') return '#9f1239';
        return r.isSurplus ? '#0f766e' : '#b45309';
      });

      const crushPointColors = hcRows.map(function (r) {
        if (r.crushedMmt >= 85.0) return '#1d4ed8';
        return '#be123c';
      });

      // Custom plugin to draw on-canvas callout labels for 2016–17 Drought Trough & 2021–22 Record Peak
      const highlightAnnotationPlugin = {
        id: 'harvestCrushAnnotations',
        afterDatasetsDraw: function (chart) {
          const ctx = chart.ctx;
          const meta0 = chart.getDatasetMeta(0);
          const meta1 = chart.getDatasetMeta(1);
          if (!meta0 || !meta0.data) return;

          ctx.save();
          ctx.font = 'bold 10.5px Inter, sans-serif';
          ctx.textAlign = 'center';

          hcRows.forEach(function (r, idx) {
            const barEl = meta0.data[idx];
            const crushEl = meta1 && meta1.data ? meta1.data[idx] : null;
            if (!barEl) return;

            if (r.season === '2016–17') {
              const targetY = Math.min(barEl.y, crushEl ? crushEl.y : barEl.y) - 12;
              const text = 'Drought Trough: 52.26 / 37.31 MMT';
              const w = ctx.measureText(text).width + 12;
              const x = Math.max(w / 2 + 45, Math.min(chart.width - w / 2 - 10, barEl.x));
              ctx.fillStyle = '#fff1f2';
              ctx.strokeStyle = '#e11d48';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.roundRect(x - w / 2, targetY - 16, w, 20, 4);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#9f1239';
              ctx.fillText(text, x, targetY - 2);
            } else if (r.season === '2021–22') {
              const topY = Math.min(barEl.y, crushEl ? crushEl.y : barEl.y);
              const targetY = Math.max(22, topY - 8);
              const text = 'Record Peak: 123.97 / 132.03 MMT';
              const w = ctx.measureText(text).width + 12;
              const x = Math.max(w / 2 + 45, Math.min(chart.width - w / 2 - 10, barEl.x));
              ctx.fillStyle = '#ecfdf5';
              ctx.strokeStyle = '#059669';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.roundRect(x - w / 2, targetY - 16, w, 20, 4);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#065f46';
              ctx.fillText(text, x, targetY - 2);
            }
          });
          ctx.restore();
        }
      };

      landingCharts.harvestCrush = new window.Chart(hcCanvas.getContext('2d'), {
        type: 'bar',
        plugins: [highlightAnnotationPlugin],
        data: {
          labels: hcRows.map(function (r) { return r.season; }),
          datasets: [
            {
              type: 'bar',
              label: 'Total Sugarcane Harvested / Produced (Farm Gate MMT)',
              data: hcRows.map(function (r) { return r.harvestedMmt; }),
              backgroundColor: harvestBarColors,
              borderColor: harvestBorderColors,
              borderWidth: 1.5,
              borderRadius: 5,
              order: 2
            },
            {
              type: harvestCrushChartMode === 'combo' ? 'line' : 'bar',
              label: 'Sugarcane Crushed by Sugar Mills (MMT)',
              data: hcRows.map(function (r) { return r.crushedMmt; }),
              backgroundColor:
                harvestCrushChartMode === 'combo'
                  ? 'rgba(30, 58, 138, 0.12)'
                  : 'rgba(59, 130, 246, 0.78)',
              borderColor: '#1e3a8a',
              pointBackgroundColor: crushPointColors,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1.5,
              pointRadius: 5.5,
              pointHoverRadius: 8,
              borderWidth: harvestCrushChartMode === 'combo' ? 3 : 1.5,
              borderRadius: harvestCrushChartMode === 'grouped' ? 5 : 0,
              tension: 0.28,
              fill: false,
              order: 1
            },
            {
              type: 'line',
              label: 'State Long-Term Average Baseline (85.0 MMT)',
              data: hcRows.map(function () { return window.MahaData.HARVEST_CRUSH_BASELINE_MMT; }),
              borderColor: '#334155',
              borderWidth: 2,
              borderDash: [6, 5],
              pointRadius: 0,
              fill: false,
              order: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: function (evt, elements) {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              selectedDetails.harvestCrush = hcRows[idx];
              renderGraphsOnly();
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012–2026)',
              color: '#0f172a',
              font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
              padding: { top: 4, bottom: 10 }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                font: { size: 11, weight: '600', family: 'Inter, sans-serif' },
                color: '#334155'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function (items) {
                  const row = hcRows[items[0].dataIndex];
                  return 'Sugar Season ' + row.season + ' — ' + row.status + ' (' + row.eventLabel + ')';
                },
                afterBody: function (items) {
                  const row = hcRows[items[0].dataIndex];
                  return [
                    'Harvest Deviation vs 85 MMT: ' + formatSignedPct(row.harvestDevPct),
                    'Crushing Deviation vs 85 MMT: ' + formatSignedPct(row.crushDevPct),
                    row.notes
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Sugar Season / Year (2012–13 to 2025–26)',
                font: { size: 11.5, weight: 'bold' },
                color: '#334155'
              },
              grid: {
                display: true,
                color: 'rgba(226, 232, 240, 0.7)'
              }
            },
            y: {
              min: 0,
              max: 140,
              title: {
                display: true,
                text: 'Sugarcane Volume in Million Metric Tonnes (MMT)',
                font: { size: 11.5, weight: 'bold' },
                color: '#334155'
              },
              grid: {
                display: true,
                color: 'rgba(203, 213, 225, 0.65)'
              },
              ticks: {
                stepSize: 20,
                callback: function (v) { return v + ' MMT'; }
              }
            }
          }
        }
      });
    }
  }

  function renderGraphsOnly() {
    const gridContainer = document.getElementById('landing-analytical-tables-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML =
      buildGraph5CardHtml() +
      buildGraph1CardHtml() +
      buildGraph2CardHtml() +
      buildGraph3CardHtml() +
      buildGraph4CardHtml();
    setTimeout(mountLandingCharts, 20);
  }

  function render(container) {
    const state = window.AppStore.getState();
    const user = state.currentUser;

    container.innerHTML =
      '<div class="min-h-screen flex flex-col bg-slate-100">' +
      '  <!-- TOP HEADER BAR: Unified Auth Icon Located Exclusively at Top-Right Corner -->' +
      '  <header class="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800 shadow-md">' +
      '    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">' +
      '      <!-- Brand Identity (Left) -->' +
      '      <div class="flex items-center gap-3">' +
      '        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner border border-emerald-400/30">' +
      '          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
      '            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m0-18c-3.5 2.5-6 6-6 10.5 0 3 2.5 5.5 6 5.5s6-2.5 6-5.5C18 9 15.5 5.5 12 3z" />' +
      '          </svg>' +
      '        </div>' +
      '        <div>' +
      '          <div class="flex items-center gap-2">' +
      '            <span class="font-extrabold tracking-tight text-base sm:text-lg text-white">MahaCaneGrid</span>' +
      '            <span class="hidden md:inline-block px-2 py-0.5 text-[11px] font-mono-num font-semibold rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">MAHARASHTRA REGION</span>' +
      '          </div>' +
      '          <p class="text-[11px] text-slate-400 hidden sm:block">State Sugarcane Supply Chain, Macro-Climate &amp; Biofuel Intelligence Portal</p>' +
      '        </div>' +
      '      </div>' +
      '      <!-- EXCLUSIVE TOP-RIGHT UNIFIED PROFILE / AUTHENTICATION ICON -->' +
      '      <div class="flex items-center gap-2.5">' +
      '        <button type="button" onclick="window.ArchitectureModal.open(); window.ArchitectureModal.setTab(\'java\');" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hidden md:inline-flex items-center gap-1.5 transition">' +
      '          <span>☕</span><span>Java 25 Engine</span>' +
      '        </button>' +
      '        <button type="button" id="top-right-unified-auth-btn" onclick="window.AppRouter.navigate(\'auth\')" title="' + (user ? 'Logged in as ' + user.name + ' — Click to Manage Session or Switch Role' : 'Portal Login & Role Authentication (Farmer / Logistics / Sugar Mill)') + '" aria-label="Unified Profile and Authentication Portal Entry" class="group relative flex items-center gap-2.5 pl-3 pr-3.5 py-2 rounded-full bg-slate-900 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500/80 transition-all shadow-sm">' +
      '          <span class="relative flex h-2.5 w-2.5">' +
      '            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ' + (user ? 'bg-emerald-400' : 'bg-amber-400') + ' opacity-75"></span>' +
      '            <span class="relative inline-flex rounded-full h-2.5 w-2.5 ' + (user ? 'bg-emerald-500' : 'bg-amber-500') + '"></span>' +
      '          </span>' +
      '          <span class="text-xs font-semibold text-slate-200 group-hover:text-white hidden sm:inline">' +
      (user ? user.name.split(' ')[0] + ' (' + user.role.toUpperCase() + ')' : 'Portal Login / Auth') +
      '          </span>' +
      '          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">' +
      '            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">' +
      '              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />' +
      '            </svg>' +
      '          </div>' +
      '        </button>' +
      '      </div>' +
      '    </div>' +
      '  </header>' +
      '  <!-- COMPACT MACRO CONTEXT BAR & INTERACTIVE SEARCH -->' +
      '  <section class="bg-white border-b border-slate-200 shadow-xs">' +
      '    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">' +
      '      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">' +
      '        <div>' +
      '          <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Maharashtra Sugarcane Ecosystem: Interactive Harvest, Crushing, Climate &amp; Biofuel Graphs (2012–2026)</h1>' +
      '          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">Explore interactive visual graphs for Sugarcane Harvest vs. Mill Crushing (MMT), Pacific ENSO teleconnections, state monsoon deviations, crystal sugar cycles, and EBP ethanol diversion. Click the <strong>top-right profile icon</strong> to authenticate into operational portals.</p>' +
      '        </div>' +
      '        <div class="flex flex-wrap items-center gap-2.5">' +
      '          <div class="relative w-full sm:w-64">' +
      '            <input type="text" id="landing-global-search" oninput="window.LandingPortal.setSearchQuery(this.value)" placeholder="Filter graphs by year, drought, EBP..." class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50" />' +
      '            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
      '              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />' +
      '            </svg>' +
      '          </div>' +
      '          <button type="button" onclick="window.ArchitectureModal.open()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition">' +
      '            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
      '              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />' +
      '            </svg>' +
      '            <span>DB Schema &amp; Project Files</span>' +
      '          </button>' +
      '        </div>' +
      '      </div>' +
      '      <!-- 5-Pillar Baseline Reference KPI Strip -->' +
      '      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3.5 pt-3.5 border-t border-slate-100">' +
      '        <div class="px-3 py-2 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">' +
      '          <div>' +
      '            <span class="text-[10px] font-semibold uppercase tracking-wider text-teal-900 block">Cane Harvest / Crush Baseline</span>' +
      '            <span class="text-xs sm:text-sm font-bold text-slate-900 font-mono-num">85.0 MMT <span class="text-[11px] font-normal text-teal-700">(25-26: 104.5/99.5)</span></span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">' +
      '          <div>' +
      '            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-900 block">ENSO Status (2026)</span>' +
      '            <span class="text-xs sm:text-sm font-bold text-slate-900 font-mono-num">+1.4°C ONI <span class="text-[11px] font-normal text-amber-800">(El Niño)</span></span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">' +
      '          <div>' +
      '            <span class="text-[10px] font-semibold uppercase tracking-wider text-sky-900 block">Rainfall Baseline</span>' +
      '            <span class="text-xs sm:text-sm font-bold text-slate-900 font-mono-num">1,152.7 mm <span class="text-[11px] font-normal text-rose-700">(YTD: 845)</span></span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">' +
      '          <div>' +
      '            <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-900 block">Sugar Baseline</span>' +
      '            <span class="text-xs sm:text-sm font-bold text-slate-900 font-mono-num">90.0 LMT <span class="text-[11px] font-normal text-emerald-700">(25-26: 99.2)</span></span>' +
      '          </div>' +
      '        </div>' +
      '        <div class="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between col-span-2 sm:col-span-1">' +
      '          <div>' +
      '            <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-900 block">Ethanol Baseline</span>' +
      '            <span class="text-xs sm:text-sm font-bold text-slate-900 font-mono-num">120.0 Cr L <span class="text-[11px] font-normal text-indigo-700">(25-26: 145.0)</span></span>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </section>' +
      '  <!-- PRIMARY LANDING CONTENT: 5 INTERACTIVE ANALYTICAL GRAPHS -->' +
      '  <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">' +
      '    <div id="landing-analytical-tables-grid" class="grid grid-cols-1 xl:grid-cols-2 gap-6">' +
      buildGraph5CardHtml() +
      buildGraph1CardHtml() +
      buildGraph2CardHtml() +
      buildGraph3CardHtml() +
      buildGraph4CardHtml() +
      '    </div>' +
      '  </main>' +
      '  <!-- FOOTER WITH ROLE ARCHITECTURE OVERVIEW -->' +
      '  <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 py-5 px-4 sm:px-6 text-xs">' +
      '    <div class="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">' +
      '      <div>' +
      '        <span class="text-white font-semibold">Maharashtra Sugarcane Supply Chain Tracker</span> — Multi-Role Integrated Architecture (Farmer • Logistics • Sugar Mill)' +
      '      </div>' +
      '      <div class="flex items-center gap-3">' +
      '        <button type="button" onclick="window.ArchitectureModal.open()" class="text-emerald-400 hover:text-emerald-300 underline font-medium">Inspect Interconnected Modules &amp; SQL Schema</button>' +
      '        <span>•</span>' +
      '        <button type="button" onclick="window.AppRouter.navigate(\'auth\')" class="text-amber-400 hover:text-amber-300 font-semibold">Open Authentication Portal →</button>' +
      '      </div>' +
      '    </div>' +
      '  </footer>' +
      '</div>';

    setTimeout(mountLandingCharts, 30);
  }

  return {
    render: render,
    setEnsoFilter: setEnsoFilter,
    setRainfallFilter: setRainfallFilter,
    setSugarSort: setSugarSort,
    setEthanolSort: setEthanolSort,
    setHarvestCrushFilter: setHarvestCrushFilter,
    setHarvestCrushMode: setHarvestCrushMode,
    toggleHarvestCrushTable: toggleHarvestCrushTable,
    toggleChartType: toggleChartType,
    setSearchQuery: setSearchQuery
  };
})();
