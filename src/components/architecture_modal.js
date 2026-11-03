/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — ARCHITECTURE & SCHEMA MODAL
 * File: src/components/architecture_modal.js
 * Allows interactive inspection of the modular multi-file project layout,
 * interconnections, and PostgreSQL relational database schema.
 * ============================================================================
 */

window.ArchitectureModal = (function () {
  let activeTab = 'files'; // 'files' | 'schema' | 'routing'

  const PROJECT_FILES = [
    {
      path: 'index.html',
      role: 'Application Shell & Module Loader',
      connectsTo: 'Loads Tailwind CSS, Chart.js, src/styles/main.css, and all 10 interconnected JS modules in dependency order.'
    },
    {
      path: 'src/styles/main.css',
      role: 'Global Design System & Table/Map Styling',
      connectsTo: 'Provides sticky analytical table headers, extreme-year row gradients, and SVG corridor route animations.'
    },
    {
      path: 'src/db/schema.sql',
      role: 'PostgreSQL Relational Database Schema',
      connectsTo: 'Defines 11 normalized tables covering RBAC users, plots, trips, bids, weighbridge FRP batches, mass balance, and macro climate/production.'
    },
    {
      path: 'src/data/historical_data.js',
      role: 'Macro Climate & Maharashtra GIS Dataset (window.MahaData)',
      connectsTo: 'Supplies ENSO (2015–2026), Rainfall (2012–2026), Sugar & Ethanol (12-13 to 25-26), Sugar Mill GPS coordinates, and Haversine road calculator.'
    },
    {
      path: 'src/state/store.js',
      role: 'Centralized Reactive Pub/Sub Store (window.AppStore)',
      connectsTo: 'Synchronizes state across Landing, Auth, Farmer, Logistics, and Sugar Mill portals in real time.'
    },
    {
      path: 'src/router/router.js',
      role: 'Role-Based Router & Session Guard (window.AppRouter)',
      connectsTo: 'Enforces dynamic role-based redirection upon login and locks authenticated users into their authorized portal.'
    },
    {
      path: 'src/components/map_engine.js',
      role: 'Interactive Maharashtra GIS Corridor Map (window.MapEngine)',
      connectsTo: 'Used by both Farmer Portal and Logistics Portal to render Plot-to-Mill highway routes, distance (km), and ETA.'
    },
    {
      path: 'src/components/landing_portal.js',
      role: 'Parent Landing Portal (window.LandingPortal)',
      connectsTo: 'Renders the 4 interactive analytical tables (ENSO, Rainfall, Sugar, Ethanol) and the exclusive top-right unified Auth icon.'
    },
    {
      path: 'src/components/auth_portal.js',
      role: 'Role Selection & Authentication Portal (window.AuthPortal)',
      connectsTo: 'Handles Farmer, Logistics, and Sugar Mill login/registration and triggers AppRouter redirection.'
    },
    {
      path: 'src/components/farmer_portal.js',
      role: 'Farmer Operational Portal (window.FarmerPortal)',
      connectsTo: 'Registers cane plots/harvest trips into AppStore, renders MapEngine route, and awards transporter bids.'
    },
    {
      path: 'src/components/logistics_portal.js',
      role: 'Logistics & Transport Portal (window.LogisticsPortal)',
      connectsTo: 'Reads farmer trip queue from AppStore, submits live freight bids, and renders 4-day pickup plot weather forecasts.'
    },
    {
      path: 'src/components/mill_portal.js',
      role: 'Sugar Mill Portal (window.MillPortal)',
      connectsTo: 'Computes Weighbridge + Lab Quality (Pol%, Brix%, Dextran, Trash) FRP payouts and renders 5 real-time Chart.js mass balance graphs.'
    },
    {
      path: 'src/app.js',
      role: 'Main Application Controller & Shared Header/Toast UI (window.AppUI)',
      connectsTo: 'Subscribes to AppStore and orchestrates view mounting and role-switching.'
    }
  ];

  function open(tab) {
    if (tab) activeTab = tab;
    const modalEl = document.getElementById('architecture-modal-backdrop');
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    renderContent();
  }

  function close() {
    const modalEl = document.getElementById('architecture-modal-backdrop');
    if (modalEl) modalEl.classList.add('hidden');
  }

  function setTab(tab) {
    activeTab = tab;
    renderContent();
  }

  function renderContent() {
    const bodyEl = document.getElementById('architecture-modal-body');
    if (!bodyEl) return;

    if (activeTab === 'files') {
      const rows = PROJECT_FILES.map(function (f) {
        return (
          '<tr class="border-b border-slate-200 hover:bg-slate-50 text-xs">' +
          '  <td class="py-2.5 px-3 font-mono-num font-bold text-emerald-800 whitespace-nowrap">' + f.path + '</td>' +
          '  <td class="py-2.5 px-3 font-semibold text-slate-900">' + f.role + '</td>' +
          '  <td class="py-2.5 px-3 text-slate-600">' + f.connectsTo + '</td>' +
          '</tr>'
        );
      }).join('');

      bodyEl.innerHTML =
        '<div class="space-y-4">' +
        '  <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">' +
        '    <strong>Modular Multi-File Architecture:</strong> Each component of the Maharashtra Sugarcane Supply Chain Tracker is architected as a dedicated file under <code>src/</code> and interconnected via <code>window.MahaData</code>, <code>window.AppStore</code>, and <code>window.AppRouter</code>.' +
        '  </div>' +
        '  <div class="overflow-x-auto border border-slate-200 rounded-xl">' +
        '    <table class="w-full text-left border-collapse">' +
        '      <thead>' +
        '        <tr class="bg-slate-100 border-b border-slate-200 text-xs font-bold uppercase text-slate-700">' +
        '          <th class="py-2.5 px-3">File Path</th>' +
        '          <th class="py-2.5 px-3">Component Responsibility</th>' +
        '          <th class="py-2.5 px-3">Interconnection &amp; Data Flow</th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' + rows + '</tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>';
      return;
    }

    if (activeTab === 'schema') {
      bodyEl.innerHTML =
        '<div class="space-y-3 text-xs">' +
        '  <div class="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono-num overflow-x-auto leading-relaxed">' +
        '    <div class="text-emerald-400 font-bold mb-1">-- Core Operational &amp; Analytical Tables (src/db/schema.sql)</div>' +
        '    <div>1. <strong>users</strong> (user_id PK, role ENUM[\'farmer\',\'logistics\',\'mill\'], full_name, phone, district)</div>' +
        '    <div>2. <strong>farmer_profiles</strong> (farmer_id FK, kisan_reg_no, taluka, default_lat, default_lng, cultivable_area_ha)</div>' +
        '    <div>3. <strong>transporter_profiles</strong> (transporter_id FK, agency_name, permit_license_no, vehicle_reg_no, max_payload_mt)</div>' +
        '    <div>4. <strong>mill_profiles</strong> (mill_id FK, mill_name, iem_license_no, commissionerate_zone, capacity_tcd, base_frp_per_mt)</div>' +
        '    <div>5. <strong>transport_trips</strong> (trip_id PK, farmer_id FK, plot_lat/lng, target_mill_id, quantity_mt, distance_km, status)</div>' +
        '    <div>6. <strong>transporter_bids</strong> (bid_id PK, trip_id FK, transporter_id, proposed_fare_inr, rate_per_mt_inr, eta_pickup_hrs)</div>' +
        '    <div>7. <strong>weighbridge_batches</strong> (batch_id PK, trip_id FK, gross_mt, tare_mt, trash_pct, pol_pct, brix_pct, dextran_ppm, total_payable_inr)</div>' +
        '    <div>8. <strong>mill_annual_mass_balance</strong> (record_year PK, cane_crushed_mt, sugar_produced_mt, ethanol_produced_kl, bagasse_mt, molasses_mt)</div>' +
        '    <div>9. <strong>macro_enso_anomalies</strong> | 10. <strong>macro_maharashtra_rainfall</strong> | 11. <strong>macro_sugar_trends</strong> | 12. <strong>macro_ethanol_trends</strong></div>' +
        '  </div>' +
        '</div>';
      return;
    }

    if (activeTab === 'java') {
      bodyEl.innerHTML =
        '<div class="space-y-4 text-xs">' +
        '  <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">' +
        '    <span class="text-2xl">☕</span>' +
        '    <div>' +
        '      <div class="font-bold text-sm text-amber-900">Pure Java Enterprise Architecture (OpenJDK 25 Compatible)</div>' +
        '      <p class="text-amber-800 text-xs mt-0.5">The application core business logic, geospatial routing, FRP statutory pricing formulas, and thread-safe data persistence are implemented in pure Java without external framework dependencies.</p>' +
        '    </div>' +
        '  </div>' +
        '  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
        '    <div class="p-3 rounded-xl border border-slate-200 bg-white">' +
        '      <div class="font-bold text-slate-900 mb-1 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 1. Domain Models (com.mahacane.model)</div>' +
        '      <ul class="text-slate-600 space-y-1 list-disc pl-4 font-mono-num text-[11px]">' +
        '        <li><code>User.java</code> — Farmer, Transporter, Mill Chemist entities</li>' +
        '        <li><code>Trip.java</code> — Cane dispatch requests &amp; GPS coordinates</li>' +
        '        <li><code>Bid.java</code> — Transporter fleet bidding &amp; per-MT quotes</li>' +
        '        <li><code>WeighbridgeBatch.java</code> — Quality lab tests &amp; FRP settlements</li>' +
        '        <li><code>MassBalanceRecord.java</code> — Sugar, Ethanol, Bagasse yields</li>' +
        '        <li><code>SugarMill.java</code> — Cooperative &amp; private mill directory</li>' +
        '        <li><code>EnsoRecord.java</code> &amp; <code>RainfallRecord.java</code> — Agro-climate</li>' +
        '        <li><code>RouteMetrics.java</code> — Haversine distances &amp; corridors</li>' +
        '      </ul>' +
        '    </div>' +
        '    <div class="p-3 rounded-xl border border-slate-200 bg-white">' +
        '      <div class="font-bold text-slate-900 mb-1 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 2. Business Services (com.mahacane.service)</div>' +
        '      <ul class="text-slate-600 space-y-1 list-disc pl-4 text-[11px]">' +
        '        <li><code>FrpCalculatorService.java</code> — VSI CCS Recovery &amp; FRP formula</li>' +
        '        <li><code>RouteService.java</code> — Haversine great-circle &amp; road corridor ETA</li>' +
        '        <li><code>TripService.java</code> — Trip creation, bid matching, gate pass codes</li>' +
        '        <li><code>MillService.java</code> — Weighbridge logging &amp; mass balance CRUD</li>' +
        '        <li><code>AuthService.java</code> — RBAC session management &amp; role switching</li>' +
        '        <li><code>ClimateService.java</code> — ENSO &amp; monsoon rainfall datasets</li>' +
        '      </ul>' +
        '    </div>' +
        '  </div>' +
        '  <div class="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono-num text-[11px] overflow-x-auto leading-relaxed">' +
        '    <div class="text-amber-400 font-bold mb-1">// Built-in Java HTTP Server REST Endpoints (port 8080)</div>' +
        '    <div>GET  /api/info               → Java VM runtime stats &amp; active controllers</div>' +
        '    <div>GET  /api/state              → Returns full synchronized application state</div>' +
        '    <div>POST /api/auth/login         → RBAC authentication &amp; role session token</div>' +
        '    <div>GET  /api/trips, POST /trips → Retrieves or creates cane harvest dispatch trips</div>' +
        '    <div>POST /api/trips/award        → Awards logistics bids &amp; generates Gate Pass</div>' +
        '    <div>POST /api/bids               → Submits carrier bids with vehicle specs</div>' +
        '    <div>POST /api/frp/calculate      → Executes VSI Recovery &amp; FRP price calculations</div>' +
        '    <div>POST /api/weighbridge/log    → Records weighbridge gross/tare batch to ledger</div>' +
        '    <div>POST /api/massbalance/upsert → Updates annual factory production ledger</div>' +
        '    <div>POST /api/route/calculate    → Computes GPS Haversine corridor distance &amp; ETA</div>' +
        '  </div>' +
        '</div>';
      return;
    }

    bodyEl.innerHTML =
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">' +
      '  <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">' +
      '    <div class="font-bold text-emerald-950 text-sm mb-1">1. Farmer → Logistics Sync</div>' +
      '    <p class="text-slate-600 leading-relaxed">When a farmer registers a cane plot &amp; harvest trip in <code>farmer_portal.js</code>, <code>AppStore.addTransportTrip()</code> computes Haversine road distance and pushes the trip immediately into the Logistics Request Queue.</p>' +
      '  </div>' +
      '  <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/50">' +
      '    <div class="font-bold text-amber-950 text-sm mb-1">2. Logistics → Farmer Bidding</div>' +
      '    <p class="text-slate-600 leading-relaxed">When a carrier submits a fare quote in <code>logistics_portal.js</code> after checking the 4-day plot weather forecast, <code>AppStore.submitTransporterBid()</code> updates the Farmer Bidding Dashboard where the farmer can award the contract.</p>' +
      '  </div>' +
      '  <div class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">' +
      '    <div class="font-bold text-indigo-950 text-sm mb-1">3. Mill Weighbridge &amp; 5-Graph Ledger</div>' +
      '    <p class="text-slate-600 leading-relaxed"><code>mill_portal.js</code> loads incoming trips onto the weighbridge, computes net FRP payouts from Pol%, Brix%, Dextran, and Trash%, and renders 5 independent Chart.js production graphs.</p>' +
      '  </div>' +
      '</div>';
  }

  return {
    open: open,
    close: close,
    setTab: setTab,
    renderContent: renderContent
  };
})();
