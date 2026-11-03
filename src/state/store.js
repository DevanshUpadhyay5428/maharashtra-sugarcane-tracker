/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — CENTRALIZED REACTIVE STORE
 * File: src/state/store.js
 * Interconnects:
 *   - Landing & Authentication Portal
 *   - Farmer Portal (Trips, Plots, Bid Comparison & Awarding)
 *   - Logistics & Transport Portal (Trip Queue, Fare Bidding, Weather Sync)
 *   - Sugar Mill Portal (Weighbridge & Lab FRP Pricing, Annual Mass Balance)
 * ============================================================================
 */

window.AppStore = (function () {
  const STORAGE_KEY = 'maha_cane_tracker_state_v1';
  const listeners = [];

  // Default Demo Users for 1-Click Role Switching & Authentication
  const DEMO_USERS = {
    farmer: {
      userId: 'MH-FRM-1042',
      role: 'farmer',
      name: 'Rajendra Dattatray Patil',
      phone: '+91 98224 51902',
      district: 'Kolhapur',
      taluka: 'Karveer',
      plotId: 'PLOT-KOP-KARVEER',
      plotAddress: 'Gat No. 142/B, Panchganga River Bank, Karveer, Kolhapur',
      plotLat: 16.6912,
      plotLng: 74.2448,
      cultivableAreaHa: 4.5,
      caneVariety: 'Co 86032'
    },
    logistics: {
      userId: 'MH-TRN-2088',
      role: 'logistics',
      name: 'Sahyadri Agro-Freight & Cane Carriers',
      operatorName: 'Vikramjit Shinde',
      phone: '+91 94230 77814',
      district: 'Sangli',
      permitNo: 'MH-WEST-CANE-8841',
      vehicleRegNo: 'MH-09-CV-4821',
      vehicleType: 'Heavy Cane Truck (25 MT)',
      maxPayloadMt: 25.0,
      rating: 4.9
    },
    mill: {
      userId: 'MH-MILL-3001',
      role: 'mill',
      name: 'Shree Datta SSK Ltd., Shirol (Kolhapur)',
      operatorName: 'Er. Pratapsinh Deshmukh (Chief Chemist & GM)',
      phone: '+91 2322 236551',
      district: 'Kolhapur',
      iemLicense: 'IEM-MH-COOP-1969-042',
      zone: 'Kolhapur Zone',
      millId: 'MILL-KOP-01',
      capacityTcd: 9000,
      distilleryKlpd: 120,
      baseFrpPerMt: 3400
    }
  };

  // Initial Pre-Seeded Farmer Transport Trips & Transporter Bids
  function createInitialState() {
    const m1 = window.MahaData.calculateRouteMetrics(16.6912, 74.2448, 16.7325, 74.6042);
    const m2 = window.MahaData.calculateRouteMetrics(17.0489, 74.2614, 17.0642, 74.2981);
    const m3 = window.MahaData.calculateRouteMetrics(18.1654, 74.5762, 18.1518, 74.5029);
    const m4 = window.MahaData.calculateRouteMetrics(17.3941, 74.1018, 17.3284, 74.1856);
    const m5 = window.MahaData.calculateRouteMetrics(17.8615, 75.2912, 18.0321, 75.3114);

    return {
      currentUser: null, // Locked until user authenticates via Auth Portal
      activeRoute: 'landing', // 'landing' | 'auth' | 'farmer' | 'logistics' | 'mill'
      selectedTripIdForMap: 'TRIP-MH-901',
      selectedLogisticsTripId: 'TRIP-MH-901',
      trips: [
        {
          tripId: 'TRIP-MH-901',
          farmerId: 'MH-FRM-1042',
          farmerName: 'Rajendra Dattatray Patil',
          plotId: 'PLOT-KOP-KARVEER',
          plotAddress: 'Gat No. 142/B, Panchganga Bank, Karveer, Kolhapur',
          district: 'Kolhapur',
          plotLat: 16.6912,
          plotLng: 74.2448,
          targetMillId: 'MILL-KOP-01',
          targetMillName: 'Shree Datta SSK Ltd., Shirol (Kolhapur)',
          millLat: 16.7325,
          millLng: 74.6042,
          caneVariety: 'Co 86032',
          cropType: 'Adsali (18-Month High Sucrose)',
          quantityMt: 48.0,
          quantityQuintals: 480.0,
          harvestDate: '2026-10-16',
          harvestWindow: '06:00 AM – 10:00 AM (Fresh Morning Cut)',
          distanceKm: m1.roadKm,
          transitMins: m1.transitMins,
          formattedTransit: m1.formattedTime,
          highwayCorridor: 'NH-166 / SH-192 Panchganga Corridor',
          status: 'open',
          awardedBidId: null,
          awardedFareInr: null,
          gatePassCode: null,
          bids: [
            {
              bidId: 'BID-701',
              transporterId: 'MH-TRN-2088',
              transporterName: 'Sahyadri Agro-Freight & Cane Carriers',
              vehicleType: '2x Heavy Cane Trucks (25 MT each)',
              vehicleRegNo: 'MH-09-CV-4821',
              proposedFareInr: 25920,
              ratePerMtInr: 540,
              etaPickupHrs: 2.5,
              rating: 4.9,
              notes: 'Mechanical grab loader included; GPS-tracked direct to Shirol Gate #2.',
              status: 'pending'
            },
            {
              bidId: 'BID-702',
              transporterId: 'MH-TRN-2094',
              transporterName: 'Panchganga Kisan Tractor Logistics',
              vehicleType: '3x Tractor Double-Trolley (16 MT each)',
              vehicleRegNo: 'MH-09-BX-1190',
              proposedFareInr: 27840,
              ratePerMtInr: 580,
              etaPickupHrs: 1.5,
              rating: 4.7,
              notes: 'High-flotation tires safe for river-bank black soil plots.',
              status: 'pending'
            },
            {
              bidId: 'BID-703',
              transporterId: 'MH-TRN-2105',
              transporterName: 'Mahalaxmi Bulk Cane Movers',
              vehicleType: 'Multi-Axle Cane Carrier + 16T Trolley',
              vehicleRegNo: 'MH-10-CR-7732',
              proposedFareInr: 24960,
              ratePerMtInr: 520,
              etaPickupHrs: 4.0,
              rating: 4.6,
              notes: 'Lowest per-ton rate; requires firm headland road access.',
              status: 'pending'
            }
          ]
        },
        {
          tripId: 'TRIP-MH-902',
          farmerId: 'MH-FRM-1042',
          farmerName: 'Rajendra Dattatray Patil',
          plotId: 'PLOT-SAN-WALWA',
          plotAddress: 'Gat No. 88/A, Krishna Canal, Walwa, Sangli',
          district: 'Sangli',
          plotLat: 17.0489,
          plotLng: 74.2614,
          targetMillId: 'MILL-SAN-02',
          targetMillName: 'Rajarambapu Patil SSK Ltd., Sakharale (Sangli)',
          millLat: 17.0642,
          millLng: 74.2981,
          caneVariety: 'CoM 0265 (Phule 265)',
          cropType: 'Pre-Seasonal (15-Month)',
          quantityMt: 32.0,
          quantityQuintals: 320.0,
          harvestDate: '2026-10-17',
          harvestWindow: '07:00 AM – 11:00 AM',
          distanceKm: m2.roadKm,
          transitMins: m2.transitMins,
          formattedTransit: m2.formattedTime,
          highwayCorridor: 'NH-48 Islampur-Sakharale Link',
          status: 'awarded',
          awardedBidId: 'BID-704',
          awardedFareInr: 10240,
          gatePassCode: 'GP-MH-902-SAK',
          bids: [
            {
              bidId: 'BID-704',
              transporterId: 'MH-TRN-2088',
              transporterName: 'Sahyadri Agro-Freight & Cane Carriers',
              vehicleType: '2x Tractor Double-Trolley (16 MT each)',
              vehicleRegNo: 'MH-10-AN-9045',
              proposedFareInr: 10240,
              ratePerMtInr: 320,
              etaPickupHrs: 1.0,
              rating: 4.9,
              notes: 'Priority token slot confirmed at Sakharale Yard.',
              status: 'accepted'
            }
          ]
        },
        {
          tripId: 'TRIP-MH-903',
          farmerId: 'MH-FRM-1089',
          farmerName: 'Sureshchandra Pawar',
          plotId: 'PLOT-PUN-BARAMATI',
          plotAddress: 'Gat No. 319, Nira Left Canal, Malegaon Bk, Baramati, Pune',
          district: 'Pune',
          plotLat: 18.1654,
          plotLng: 74.5762,
          targetMillId: 'MILL-PUN-03',
          targetMillName: 'The Malegaon SSK Ltd., Baramati (Pune)',
          millLat: 18.1518,
          millLng: 74.5029,
          caneVariety: 'Co 86032',
          cropType: 'Suru (12-Month Plant Cane)',
          quantityMt: 25.0,
          quantityQuintals: 250.0,
          harvestDate: '2026-10-16',
          harvestWindow: '05:30 AM – 09:00 AM',
          distanceKm: m3.roadKm,
          transitMins: m3.transitMins,
          formattedTransit: m3.formattedTime,
          highwayCorridor: 'SH-61 Baramati-Nira Road',
          status: 'open',
          awardedBidId: null,
          awardedFareInr: null,
          gatePassCode: null,
          bids: [
            {
              bidId: 'BID-705',
              transporterId: 'MH-TRN-2112',
              transporterName: 'Nira Valley Cane Transporters',
              vehicleType: 'Heavy Cane Truck (25 MT)',
              vehicleRegNo: 'MH-42-T-3318',
              proposedFareInr: 8750,
              ratePerMtInr: 350,
              etaPickupHrs: 2.0,
              rating: 4.8,
              notes: 'Direct mill gate unloading with zero transshipment.',
              status: 'pending'
            }
          ]
        },
        {
          tripId: 'TRIP-MH-904',
          farmerId: 'MH-FRM-1104',
          farmerName: 'Anandrao Chavan',
          plotId: 'PLOT-SAT-KARAD',
          plotAddress: 'Gat No. 204, Koyna River Belt, Umbraj, Karad, Satara',
          district: 'Satara',
          plotLat: 17.3941,
          plotLng: 74.1018,
          targetMillId: 'MILL-SAT-04',
          targetMillName: 'Sahyadri SSK Ltd., Yeshwantnagar, Karad (Satara)',
          millLat: 17.3284,
          millLng: 74.1856,
          caneVariety: 'Co 86032',
          cropType: 'Ratoon (First Ratoon)',
          quantityMt: 40.0,
          quantityQuintals: 400.0,
          harvestDate: '2026-10-17',
          harvestWindow: '06:30 AM – 10:30 AM',
          distanceKm: m4.roadKm,
          transitMins: m4.transitMins,
          formattedTransit: m4.formattedTime,
          highwayCorridor: 'NH-48 Umbraj-Karad Corridor',
          status: 'open',
          awardedBidId: null,
          awardedFareInr: null,
          gatePassCode: null,
          bids: []
        },
        {
          tripId: 'TRIP-MH-905',
          farmerId: 'MH-FRM-1152',
          farmerName: 'Balasaheb Deshmukh',
          plotId: 'PLOT-SOL-PANDHARPUR',
          plotAddress: 'Gat No. 512, Bhima Basin, Karkamb, Pandharpur, Solapur',
          district: 'Solapur',
          plotLat: 17.8615,
          plotLng: 75.2912,
          targetMillId: 'MILL-SOL-05',
          targetMillName: 'Vithalrao Shinde SSK Ltd., Pimpalner, Madha (Solapur)',
          millLat: 18.0321,
          millLng: 75.3114,
          caneVariety: 'CoM 0265 (Phule 265)',
          cropType: 'Adsali (18-Month)',
          quantityMt: 60.0,
          quantityQuintals: 600.0,
          harvestDate: '2026-10-16',
          harvestWindow: '05:00 AM – 08:30 AM (Heatwave Priority)',
          distanceKm: m5.roadKm,
          transitMins: m5.transitMins,
          formattedTransit: m5.formattedTime,
          highwayCorridor: 'NH-65 / SH-77 Bhima-Madha Link',
          status: 'open',
          awardedBidId: null,
          awardedFareInr: null,
          gatePassCode: null,
          bids: [
            {
              bidId: 'BID-706',
              transporterId: 'MH-TRN-2088',
              transporterName: 'Sahyadri Agro-Freight & Cane Carriers',
              vehicleType: '2x Multi-Axle Cane Carriers (30 MT each)',
              vehicleRegNo: 'MH-13-CU-6610',
              proposedFareInr: 28800,
              ratePerMtInr: 480,
              etaPickupHrs: 3.0,
              rating: 4.9,
              notes: 'Tarpaulin-covered transit to prevent moisture evaporation in 34°C Solapur heat.',
              status: 'pending'
            }
          ]
        }
      ],

      // Pre-seeded Weighbridge & Lab Quality Batches at the Sugar Mill
      weighbridgeBatches: [
        {
          batchId: 'WB-2026-8801',
          tripId: 'TRIP-MH-902',
          farmerName: 'Rajendra Dattatray Patil',
          caneVariety: 'CoM 0265 (Phule 265)',
          grossWeightMt: 41.80,
          tareWeightMt: 9.80,
          rawCaneMt: 32.00,
          trashDeductionPct: 2.20,
          netPayableMt: 31.296,
          polPct: 14.20,
          brixPct: 20.60,
          purityPct: 88.92,
          estimatedRecoveryPct: 11.85,
          reducingSugarsPct: 0.38,
          dextranPpm: 140,
          baseFrpPerMt: 3400,
          recoveryPremiumPerMt: 531.20,
          qualityAdjPerMt: 45.00,
          finalRatePerMt: 3976.20,
          totalPayableInr: 124439.15,
          timestamp: '2026-10-15 09:42 AM'
        },
        {
          batchId: 'WB-2026-8802',
          tripId: 'TRIP-MH-903',
          farmerName: 'Sureshchandra Pawar',
          caneVariety: 'Co 86032',
          grossWeightMt: 33.40,
          tareWeightMt: 8.40,
          rawCaneMt: 25.00,
          trashDeductionPct: 1.80,
          netPayableMt: 24.550,
          polPct: 14.65,
          brixPct: 21.00,
          purityPct: 89.76,
          estimatedRecoveryPct: 12.28,
          reducingSugarsPct: 0.31,
          dextranPpm: 110,
          baseFrpPerMt: 3400,
          recoveryPremiumPerMt: 673.96,
          qualityAdjPerMt: 60.00,
          finalRatePerMt: 4133.96,
          totalPayableInr: 101488.72,
          timestamp: '2026-10-15 11:15 AM'
        },
        {
          batchId: 'WB-2026-8803',
          tripId: 'MANUAL-GATE-09',
          farmerName: 'Madhavrao Jadhav (Shirol)',
          caneVariety: 'Co 86032',
          grossWeightMt: 24.50,
          tareWeightMt: 6.10,
          rawCaneMt: 18.40,
          trashDeductionPct: 3.50,
          netPayableMt: 17.756,
          polPct: 13.10,
          brixPct: 19.90,
          purityPct: 85.85,
          estimatedRecoveryPct: 10.68,
          reducingSugarsPct: 0.72,
          dextranPpm: 390,
          baseFrpPerMt: 3400,
          recoveryPremiumPerMt: 142.76,
          qualityAdjPerMt: -35.00,
          finalRatePerMt: 3507.76,
          totalPayableInr: 62283.79,
          timestamp: '2026-10-15 12:30 PM'
        }
      ],

      // Sugar Mill Mass Balance & Yearly Production Analytics Ledger (2018–2026)
      // Units:
      //   caneCrushedMt: Metric Tonnes (MT)
      //   sugarMt: Metric Tonnes (MT)
      //   ethanolKl: Kiloliters (KL)
      //   bagasseMt: Metric Tonnes (MT)
      //   molassesMt: Metric Tonnes (MT)
      massBalanceLedger: [
        { year: 2018, caneCrushedMt: 1120000, sugarMt: 126500, ethanolKl: 14200, bagasseMt: 324800, molassesMt: 49200 },
        { year: 2019, caneCrushedMt: 890000,  sugarMt: 98800,  ethanolKl: 16800, bagasseMt: 258100, molassesMt: 39600 },
        { year: 2020, caneCrushedMt: 1185000, sugarMt: 131500, ethanolKl: 24500, bagasseMt: 343650, molassesMt: 52100 },
        { year: 2021, caneCrushedMt: 1340000, sugarMt: 146000, ethanolKl: 31200, bagasseMt: 388600, molassesMt: 58900 },
        { year: 2022, caneCrushedMt: 1490000, sugarMt: 158200, ethanolKl: 38400, bagasseMt: 432100, molassesMt: 64800 },
        { year: 2023, caneCrushedMt: 1260000, sugarMt: 141100, ethanolKl: 22900, bagasseMt: 365400, molassesMt: 54200 },
        { year: 2024, caneCrushedMt: 1045000, sugarMt: 115900, ethanolKl: 27600, bagasseMt: 303050, molassesMt: 45900 },
        { year: 2025, caneCrushedMt: 1295000, sugarMt: 143800, ethanolKl: 35800, bagasseMt: 375550, molassesMt: 56400 },
        { year: 2026, caneCrushedMt: 1365000, sugarMt: 151500, ethanolKl: 41200, bagasseMt: 395850, molassesMt: 59500 }
      ]
    };
  }

  let state = createInitialState();

  // Load persisted state safely
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips) && Array.isArray(parsed.massBalanceLedger)) {
        state = Object.assign(createInitialState(), parsed);
      }
    }
  } catch (err) {
    // Ignore sandbox localStorage restrictions
  }

  // --------------------------------------------------------------------------
  // JAVA BACKEND REST INTEGRATION CLIENT (Pure Java OpenJDK 25 Backend Bridge)
  // --------------------------------------------------------------------------
  const JAVA_API = {
    connected: false,
    backendInfo: null,
    init: async function () {
      if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
        try {
          const res = await fetch('/api/info');
          if (res.ok) {
            JAVA_API.backendInfo = await res.json();
            JAVA_API.connected = true;
            console.log('☕ [Java 25 Backend] Connected successfully:', JAVA_API.backendInfo);
            await JAVA_API.syncFromBackend();
          }
        } catch (e) {
          console.log('ℹ️ Running in standalone mode (Java server offline or direct file access)');
        }
      }
    },
    syncFromBackend: async function () {
      if (!JAVA_API.connected) return;
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const remote = await res.json();
          if (remote.trips && Array.isArray(remote.trips) && remote.trips.length > 0) {
            state.trips = remote.trips;
          }
          if (remote.weighbridgeBatches && Array.isArray(remote.weighbridgeBatches)) {
            state.weighbridgeBatches = remote.weighbridgeBatches;
          }
          if (remote.massBalanceLedger && Array.isArray(remote.massBalanceLedger)) {
            state.massBalanceLedger = remote.massBalanceLedger;
          }
          if (remote.currentUser) {
            state.currentUser = remote.currentUser;
          }
          notify();
        }
      } catch (err) {
        console.warn('Backend sync warning:', err);
      }
    },
    post: async function (url, payload) {
      if (!JAVA_API.connected) return null;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Java REST API dispatch warning (' + url + '):', err);
      }
      return null;
    }
  };

  if (typeof window !== 'undefined') {
    setTimeout(function () {
      JAVA_API.init();
    }, 150);
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Ignore sandbox localStorage restrictions
    }
  }

  function notify() {
    saveState();
    listeners.forEach(function (fn) {
      try {
        fn(state);
      } catch (e) {
        console.error('Store listener error:', e);
      }
    });
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }

  function getState() {
    return state;
  }

  // Authentication & Session Management
  function loginWithRole(roleKey, customUserData) {
    const baseUser = DEMO_USERS[roleKey] || DEMO_USERS.farmer;
    state.currentUser = Object.assign({}, baseUser, customUserData || {}, { role: roleKey });
    state.activeRoute = roleKey;
    notify();

    // Async sync to Java Backend
    JAVA_API.post('/api/auth/login', {
      role: roleKey,
      name: state.currentUser.name,
      phone: state.currentUser.phone,
      district: state.currentUser.district
    });

    return state.currentUser;
  }

  function logout() {
    state.currentUser = null;
    state.activeRoute = 'landing';
    notify();
    JAVA_API.post('/api/auth/logout', {});
  }

  function setRoute(route) {
    state.activeRoute = route;
    notify();
  }

  // Farmer Portal Actions
  function addTransportTrip(tripInput) {
    const mill = window.MahaData.SUGAR_MILLS.find(function (m) {
      return m.millId === tripInput.targetMillId;
    }) || window.MahaData.SUGAR_MILLS[0];

    const plotLat = parseFloat(tripInput.plotLat) || 16.6912;
    const plotLng = parseFloat(tripInput.plotLng) || 74.2448;
    const metrics = window.MahaData.calculateRouteMetrics(plotLat, plotLng, mill.lat, mill.lng);
    const qtyMt = parseFloat(tripInput.quantityMt) || 25.0;

    const newTrip = {
      tripId: 'TRIP-MH-' + (900 + state.trips.length + 1),
      farmerId: state.currentUser ? state.currentUser.userId : 'MH-FRM-1042',
      farmerName: state.currentUser ? state.currentUser.name : 'Rajendra Dattatray Patil',
      plotId: tripInput.plotId || 'PLOT-KOP-KARVEER',
      plotAddress: tripInput.plotAddress || 'Gat No. 142/B, Karveer, Kolhapur',
      district: tripInput.district || 'Kolhapur',
      plotLat: plotLat,
      plotLng: plotLng,
      targetMillId: mill.millId,
      targetMillName: mill.name,
      millLat: mill.lat,
      millLng: mill.lng,
      caneVariety: tripInput.caneVariety || 'Co 86032',
      cropType: tripInput.cropType || 'Adsali (18-Month High Sucrose)',
      quantityMt: Number(qtyMt.toFixed(2)),
      quantityQuintals: Number((qtyMt * 10).toFixed(1)),
      harvestDate: tripInput.harvestDate || '2026-10-18',
      harvestWindow: tripInput.harvestWindow || '06:00 AM – 10:00 AM (Fresh Morning Cut)',
      distanceKm: metrics.roadKm,
      transitMins: metrics.transitMins,
      formattedTransit: metrics.formattedTime,
      highwayCorridor: mill.corridor,
      status: 'open',
      awardedBidId: null,
      awardedFareInr: null,
      gatePassCode: null,
      bids: [
        // Auto-seed an initial algorithmic marketplace bid so farmer can compare immediately
        {
          bidId: 'BID-' + Math.floor(1000 + Math.random() * 9000),
          transporterId: 'MH-TRN-AUTO1',
          transporterName: 'Deccan Cane Express Co-op Fleet',
          vehicleType: qtyMt > 25 ? '2x Heavy Cane Trucks (25 MT)' : 'Heavy Cane Truck (25 MT)',
          vehicleRegNo: 'MH-09-EF-5512',
          proposedFareInr: Math.round(qtyMt * metrics.suggestedRatePerMt),
          ratePerMtInr: metrics.suggestedRatePerMt,
          etaPickupHrs: 2.0,
          rating: 4.8,
          notes: 'Automated regional rate benchmark bid; ready for dispatch upon confirmation.',
          status: 'pending'
        }
      ]
    };

    state.trips.unshift(newTrip);
    state.selectedTripIdForMap = newTrip.tripId;
    state.selectedLogisticsTripId = newTrip.tripId;
    notify();

    // Sync trip to Java backend
    JAVA_API.post('/api/trips', newTrip);

    return newTrip;
  }

  function selectFarmerTripForMap(tripId) {
    state.selectedTripIdForMap = tripId;
    notify();
  }

  function awardTripBid(tripId, bidId) {
    const trip = state.trips.find(function (t) {
      return t.tripId === tripId;
    });
    if (!trip) return null;

    let winningBid = null;
    trip.bids.forEach(function (b) {
      if (b.bidId === bidId) {
        b.status = 'accepted';
        winningBid = b;
      } else {
        b.status = 'rejected';
      }
    });

    if (winningBid) {
      trip.status = 'awarded';
      trip.awardedBidId = winningBid.bidId;
      trip.awardedFareInr = winningBid.proposedFareInr;
      trip.gatePassCode = 'GP-' + trip.tripId + '-' + Math.floor(100 + Math.random() * 899);
      notify();

      // Sync awarded bid to Java backend
      JAVA_API.post('/api/trips/award', { tripId: tripId, bidId: bidId });
    }
    return winningBid;
  }

  // Logistics Portal Actions
  function selectLogisticsTrip(tripId) {
    state.selectedLogisticsTripId = tripId;
    notify();
  }

  function submitTransporterBid(tripId, bidData) {
    const trip = state.trips.find(function (t) {
      return t.tripId === tripId;
    });
    if (!trip) return null;

    const totalFare = Math.round(parseFloat(bidData.proposedFareInr) || 15000);
    const ratePerMt = Number((totalFare / trip.quantityMt).toFixed(2));

    const newBid = {
      bidId: 'BID-' + Math.floor(1000 + Math.random() * 9000),
      transporterId: state.currentUser ? state.currentUser.userId : 'MH-TRN-2088',
      transporterName: bidData.transporterName || (state.currentUser ? state.currentUser.name : 'Sahyadri Agro-Freight & Cane Carriers'),
      vehicleType: bidData.vehicleType || 'Heavy Cane Truck (25 MT)',
      vehicleRegNo: bidData.vehicleRegNo || 'MH-09-CV-4821',
      proposedFareInr: totalFare,
      ratePerMtInr: ratePerMt,
      etaPickupHrs: parseFloat(bidData.etaPickupHrs) || 2.0,
      rating: 4.9,
      notes: bidData.notes || 'Priority cane carrier with mechanical loader & GPS telemetry.',
      status: 'pending'
    };

    trip.bids.unshift(newBid);
    notify();

    // Sync bid to Java backend
    JAVA_API.post('/api/bids', Object.assign({ tripId: tripId }, newBid));

    return newBid;
  }

  // Sugar Mill Portal — Batch Pricing Calculator & Weighbridge Logger
  function calculateBatchPricing(params) {
    const grossMt = Math.max(0, parseFloat(params.grossWeightMt) || 0);
    const tareMt = Math.max(0, parseFloat(params.tareWeightMt) || 0);
    const rawCaneMt = Math.max(0, Number((grossMt - tareMt).toFixed(3)));
    const trashPct = Math.min(25, Math.max(0, parseFloat(params.trashDeductionPct) || 0));
    const trashDeductionMt = Number(((rawCaneMt * trashPct) / 100).toFixed(3));
    const netPayableMt = Math.max(0, Number((rawCaneMt - trashDeductionMt).toFixed(3)));

    const polPct = Math.max(5, Math.min(20, parseFloat(params.polPct) || 13.8));
    const brixPct = Math.max(polPct + 0.5, Math.min(26, parseFloat(params.brixPct) || 20.2));
    const purityPct = Number(((polPct / brixPct) * 100).toFixed(2));

    // Standard VSI / Maharashtra Sugar Commissionerate Commercial Cane Sugar (Recovery %) Formula:
    // Recovery % = (Pol% - 0.4 * (Brix% - Pol%)) * 0.74
    const estRecoveryPct = Math.max(
      7.5,
      Number(((polPct - 0.4 * (brixPct - polPct)) * 0.74).toFixed(2))
    );

    const reducingSugarsPct = Math.max(0.1, parseFloat(params.reducingSugarsPct) || 0.42);
    const dextranPpm = Math.max(20, parseFloat(params.dextranPpm) || 160);
    const baseFrpPerMt = Math.max(2500, parseFloat(params.baseFrpPerMt) || 3400);

    // Official FRP Recovery Premium: Base FRP ₹3,400/MT at 10.25% recovery.
    // Every +0.1% above 10.25% earns +₹33.20/MT (or proportionate deduction down to 9.5% floor)
    const recoveryDiff = estRecoveryPct - 10.25;
    const recoveryPremiumPerMt = Number((recoveryDiff * 10 * 33.2).toFixed(2));

    // Quality Adjustment based on Reducing Sugars & Dextran levels (freshness bonus vs staleness penalty)
    let qualityAdjPerMt = 0;
    if (dextranPpm <= 150 && reducingSugarsPct <= 0.40) {
      qualityAdjPerMt = 50.0; // Fresh cut-to-crush (<12h) sucrose preservation bonus
    } else if (dextranPpm > 300 || reducingSugarsPct > 0.65) {
      const excessDextran = Math.max(0, dextranPpm - 250);
      qualityAdjPerMt = -Math.min(180, Math.round(excessDextran * 0.25 + (reducingSugarsPct - 0.5) * 60));
    }

    const finalRatePerMt = Math.max(2910, Number((baseFrpPerMt + recoveryPremiumPerMt + qualityAdjPerMt).toFixed(2)));
    const totalPayableInr = Number((netPayableMt * finalRatePerMt).toFixed(2));

    return {
      grossWeightMt: grossMt,
      tareWeightMt: tareMt,
      rawCaneMt: rawCaneMt,
      trashDeductionPct: trashPct,
      trashDeductionMt: trashDeductionMt,
      netPayableMt: netPayableMt,
      netPayableQuintals: Number((netPayableMt * 10).toFixed(2)),
      polPct: polPct,
      brixPct: brixPct,
      purityPct: purityPct,
      estimatedRecoveryPct: estRecoveryPct,
      reducingSugarsPct: reducingSugarsPct,
      dextranPpm: dextranPpm,
      baseFrpPerMt: baseFrpPerMt,
      recoveryPremiumPerMt: recoveryPremiumPerMt,
      qualityAdjPerMt: qualityAdjPerMt,
      finalRatePerMt: finalRatePerMt,
      totalPayableInr: totalPayableInr
    };
  }

  function logWeighbridgeBatch(batchInput) {
    const calc = calculateBatchPricing(batchInput);
    const newBatch = Object.assign({}, calc, {
      batchId: 'WB-2026-' + (8800 + state.weighbridgeBatches.length + 1),
      tripId: batchInput.tripId || 'MANUAL-GATE',
      farmerName: batchInput.farmerName || 'Rajendra Dattatray Patil',
      caneVariety: batchInput.caneVariety || 'Co 86032',
      timestamp: '2026-10-15 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // If linked to an existing trip, mark trip as delivered/settled
    if (batchInput.tripId) {
      const linkedTrip = state.trips.find(function (t) {
        return t.tripId === batchInput.tripId;
      });
      if (linkedTrip) {
        linkedTrip.status = 'settled';
      }
    }

    state.weighbridgeBatches.unshift(newBatch);
    notify();

    // Sync weighbridge batch to Java backend
    JAVA_API.post('/api/weighbridge/log', newBatch);

    return newBatch;
  }

  // Sugar Mill Portal — Annual Mass Balance & Production Analytics Ledger
  function upsertMassBalanceYear(entry) {
    const yr = parseInt(entry.year, 10);
    if (isNaN(yr) || yr < 2000 || yr > 2040) return null;

    const record = {
      year: yr,
      caneCrushedMt: Math.max(0, parseFloat(entry.caneCrushedMt) || 0),
      sugarMt: Math.max(0, parseFloat(entry.sugarMt) || 0),
      ethanolKl: Math.max(0, parseFloat(entry.ethanolKl) || 0),
      bagasseMt: Math.max(0, parseFloat(entry.bagasseMt) || 0),
      molassesMt: Math.max(0, parseFloat(entry.molassesMt) || 0)
    };

    const existingIdx = state.massBalanceLedger.findIndex(function (r) {
      return r.year === yr;
    });

    if (existingIdx > -1) {
      state.massBalanceLedger[existingIdx] = record;
    } else {
      state.massBalanceLedger.push(record);
    }

    // Keep sorted chronologically by Year (X-axis)
    state.massBalanceLedger.sort(function (a, b) {
      return a.year - b.year;
    });

    notify();

    // Sync mass balance record to Java backend
    JAVA_API.post('/api/massbalance/upsert', record);

    return record;
  }

  function deleteMassBalanceYear(year) {
    const yr = parseInt(year, 10);
    if (state.massBalanceLedger.length <= 2) return false;
    state.massBalanceLedger = state.massBalanceLedger.filter(function (r) {
      return r.year !== yr;
    });
    notify();

    // Sync mass balance delete to Java backend
    JAVA_API.post('/api/massbalance/delete', { year: yr });

    return true;
  }

  function resetDemoState() {
    state = createInitialState();
    saveState();
    notify();
    JAVA_API.post('/api/reset', {});
  }

  return {
    DEMO_USERS: DEMO_USERS,
    getState: getState,
    subscribe: subscribe,
    loginWithRole: loginWithRole,
    logout: logout,
    setRoute: setRoute,
    addTransportTrip: addTransportTrip,
    selectFarmerTripForMap: selectFarmerTripForMap,
    awardTripBid: awardTripBid,
    selectLogisticsTrip: selectLogisticsTrip,
    submitTransporterBid: submitTransporterBid,
    calculateBatchPricing: calculateBatchPricing,
    logWeighbridgeBatch: logWeighbridgeBatch,
    upsertMassBalanceYear: upsertMassBalanceYear,
    deleteMassBalanceYear: deleteMassBalanceYear,
    resetDemoState: resetDemoState,
    isJavaConnected: function () { return JAVA_API.connected; },
    getJavaInfo: function () { return JAVA_API.backendInfo; }
  };
})();
