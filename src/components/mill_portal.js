/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — SUGAR MILL PORTAL
 * File: src/components/mill_portal.js
 * Features:
 *   1. Gate Reception & Batch Pricing Engine:
 *      - Weighbridge data entry (Gross weight vs Tare weight -> Net weight)
 *      - Quality assessment lab logging (Pol %, Brix %, Reducing Sugars & Dextran,
 *        Trash Deductions %)
 *      - Automated Batch Pricing Calculator (FRP + Recovery Premium + Quality Adj)
 *   2. Mass Balance & Yearly Production Analytics Dashboard:
 *      - Input & Output Ledger Page (Annual Cane Crushed MT alongside yearly
 *        Sugar MT, Ethanol KL, Bagasse MT, and Molasses MT)
 *      - Dynamic Multi-Graph Analytics: 5 dedicated, independent Chart.js graphs
 *        (X-axis = Year, Y-axis = Total Amount in MT / KL) with instant inline re-render
 * ============================================================================
 */

window.MillPortal = (function () {
  let chartInstances = {};

  function destroyCharts() {
    Object.keys(chartInstances).forEach(function (k) {
      if (chartInstances[k] && typeof chartInstances[k].destroy === 'function') {
        try {
          chartInstances[k].destroy();
        } catch (e) {}
      }
    });
    chartInstances = {};
  }

  function loadTripIntoWeighbridge(tripId) {
    const state = window.AppStore.getState();
    const trip = state.trips.find(function (t) {
      return t.tripId === tripId;
    });
    if (!trip) return;

    const farmerEl = document.getElementById('wb-farmer-name');
    const varietyEl = document.getElementById('wb-cane-variety');
    const grossEl = document.getElementById('wb-gross-mt');
    const tareEl = document.getElementById('wb-tare-mt');
    const tripIdEl = document.getElementById('wb-trip-id');

    const tareMt = 9.5;
    const grossMt = Number((trip.quantityMt + tareMt).toFixed(2));

    if (tripIdEl) tripIdEl.value = trip.tripId;
    if (farmerEl) farmerEl.value = trip.farmerName;
    if (varietyEl) varietyEl.value = trip.caneVariety;
    if (grossEl) grossEl.value = grossMt;
    if (tareEl) tareEl.value = tareMt;

    recalculateLivePricing();
    if (window.AppUI) {
      window.AppUI.showToast(
        'Loaded Trip ' + trip.tripId + ' onto Weighbridge',
        trip.farmerName + ' (' + trip.quantityMt + ' MT ' + trip.caneVariety + ') staged for lab quality & FRP pricing.',
        'indigo'
      );
    }
  }

  function readWeighbridgeFormParams() {
    function val(id, fallback) {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    }
    return {
      tripId: val('wb-trip-id', 'TRIP-MH-901'),
      farmerName: val('wb-farmer-name', 'Rajendra Dattatray Patil'),
      caneVariety: val('wb-cane-variety', 'Co 86032'),
      grossWeightMt: val('wb-gross-mt', 57.5),
      tareWeightMt: val('wb-tare-mt', 9.5),
      trashDeductionPct: val('wb-trash-pct', 2.0),
      polPct: val('wb-pol-pct', 14.35),
      brixPct: val('wb-brix-pct', 20.80),
      reducingSugarsPct: val('wb-reducing-pct', 0.36),
      dextranPpm: val('wb-dextran-ppm', 135),
      baseFrpPerMt: val('wb-base-frp', 3400)
    };
  }

  function recalculateLivePricing() {
    const params = readWeighbridgeFormParams();
    const calc = window.AppStore.calculateBatchPricing(params);
    const previewEl = document.getElementById('wb-live-pricing-card');
    if (!previewEl) return;

    const premSign = calc.recoveryPremiumPerMt >= 0 ? '+' : '';
    const qualSign = calc.qualityAdjPerMt >= 0 ? '+' : '';

    previewEl.innerHTML =
      '<div class="p-5 rounded-xl bg-slate-900 text-white border border-slate-700 space-y-4">' +
      '  <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">' +
      '    <div>' +
      '      <span class="text-[11px] font-mono-num uppercase text-indigo-300 font-bold">Automated Batch Pricing Calculator (FRP Engine)</span>' +
      '      <h4 class="text-base font-bold text-white">Live Farmer Cane Payment Advice (Patti)</h4>' +
      '    </div>' +
      '    <span class="px-2.5 py-1 rounded-full text-xs font-mono-num font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">Recovery: ' + calc.estimatedRecoveryPct.toFixed(2) + '% | Purity: ' + calc.purityPct.toFixed(1) + '%</span>' +
      '  </div>' +
      '  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">' +
      '    <div class="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">' +
      '      <span class="text-slate-400 block">Raw Cane (Gross - Tare)</span>' +
      '      <span class="font-mono-num text-sm font-bold text-white">' + calc.rawCaneMt.toFixed(3) + ' MT</span>' +
      '    </div>' +
      '    <div class="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">' +
      '      <span class="text-slate-400 block">Trash Deduction (' + calc.trashDeductionPct + '%)</span>' +
      '      <span class="font-mono-num text-sm font-bold text-rose-400">-' + calc.trashDeductionMt.toFixed(3) + ' MT</span>' +
      '    </div>' +
      '    <div class="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700/70">' +
      '      <span class="text-emerald-300 block">Net Payable Weight</span>' +
      '      <span class="font-mono-num text-sm font-extrabold text-emerald-300">' + calc.netPayableMt.toFixed(3) + ' MT (' + calc.netPayableQuintals.toFixed(1) + ' Qtl)</span>' +
      '    </div>' +
      '    <div class="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700">' +
      '      <span class="text-slate-400 block">Effective Rate / MT</span>' +
      '      <span class="font-mono-num text-sm font-bold text-amber-300">₹' + calc.finalRatePerMt.toLocaleString('en-IN', { minimumFractionDigits: 2 }) + '</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-300 font-mono-num">' +
      '    <div>Base FRP (10.25%): <strong class="text-white">₹' + calc.baseFrpPerMt.toFixed(2) + '/MT</strong></div>' +
      '    <div>Recovery Premium: <strong class="' + (calc.recoveryPremiumPerMt >= 0 ? 'text-emerald-400' : 'text-rose-400') + '">' + premSign + '₹' + calc.recoveryPremiumPerMt.toFixed(2) + '/MT</strong></div>' +
      '    <div>Dextran/Freshness Adj: <strong class="' + (calc.qualityAdjPerMt >= 0 ? 'text-emerald-400' : 'text-rose-400') + '">' + qualSign + '₹' + calc.qualityAdjPerMt.toFixed(2) + '/MT</strong></div>' +
      '  </div>' +
      '  <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">' +
      '    <div>' +
      '      <span class="text-xs text-slate-400 block">Final Payable Amount to Farmer</span>' +
      '      <span class="text-2xl font-extrabold font-mono-num text-emerald-400">₹' + calc.totalPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</span>' +
      '    </div>' +
      '    <button type="submit" class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md">Approve &amp; Log Weighbridge Batch →</button>' +
      '  </div>' +
      '</div>';
  }

  function handleWeighbridgeSubmit(event) {
    if (event) event.preventDefault();
    const params = readWeighbridgeFormParams();
    const logged = window.AppStore.logWeighbridgeBatch(params);
    if (logged && window.AppUI) {
      window.AppUI.showToast(
        'Batch Logged (' + logged.batchId + ')',
        'Payable ₹' + logged.totalPayableInr.toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' approved for ' + logged.farmerName + ' (' + logged.netPayableMt + ' MT net).',
        'emerald'
      );
    }
  }

  // Mass Balance Auto-Estimator & Inline Editor
  function autoEstimateOutputsFromCane() {
    const caneEl = document.getElementById('mb-input-cane');
    if (!caneEl) return;
    const caneMt = parseFloat(caneEl.value) || 1200000;
    const sugarEl = document.getElementById('mb-input-sugar');
    const ethanolEl = document.getElementById('mb-input-ethanol');
    const bagasseEl = document.getElementById('mb-input-bagasse');
    const molassesEl = document.getElementById('mb-input-molasses');

    // Standard Maharashtra Co-op Mill Mass Balance Ratios:
    // ~11.1% Sugar, ~29.0% Bagasse, ~4.35% Molasses, ~29.5 L Ethanol per MT cane (under B-heavy/syrup mix)
    if (sugarEl) sugarEl.value = Math.round(caneMt * 0.111);
    if (ethanolEl) ethanolEl.value = Math.round(caneMt * 0.0295);
    if (bagasseEl) bagasseEl.value = Math.round(caneMt * 0.29);
    if (molassesEl) molassesEl.value = Math.round(caneMt * 0.0435);
  }

  function populateMassBalanceFormForYear(year) {
    const state = window.AppStore.getState();
    const row = state.massBalanceLedger.find(function (r) {
      return r.year === parseInt(year, 10);
    });
    if (!row) return;

    const yrEl = document.getElementById('mb-input-year');
    const caneEl = document.getElementById('mb-input-cane');
    const sugarEl = document.getElementById('mb-input-sugar');
    const ethanolEl = document.getElementById('mb-input-ethanol');
    const bagasseEl = document.getElementById('mb-input-bagasse');
    const molassesEl = document.getElementById('mb-input-molasses');

    if (yrEl) yrEl.value = row.year;
    if (caneEl) caneEl.value = row.caneCrushedMt;
    if (sugarEl) sugarEl.value = row.sugarMt;
    if (ethanolEl) ethanolEl.value = row.ethanolKl;
    if (bagasseEl) bagasseEl.value = row.bagasseMt;
    if (molassesEl) molassesEl.value = row.molassesMt;

    if (window.AppUI) {
      window.AppUI.showToast(
        'Loaded Year ' + row.year + ' into Inline Editor',
        'Modify any input or output figure and click "Save & Re-Render 5 Graphs".',
        'indigo'
      );
    }
  }

  function handleMassBalanceSubmit(event) {
    if (event) event.preventDefault();
    const year = document.getElementById('mb-input-year').value;
    const caneCrushedMt = document.getElementById('mb-input-cane').value;
    const sugarMt = document.getElementById('mb-input-sugar').value;
    const ethanolKl = document.getElementById('mb-input-ethanol').value;
    const bagasseMt = document.getElementById('mb-input-bagasse').value;
    const molassesMt = document.getElementById('mb-input-molasses').value;

    const saved = window.AppStore.upsertMassBalanceYear({
      year: year,
      caneCrushedMt: caneCrushedMt,
      sugarMt: sugarMt,
      ethanolKl: ethanolKl,
      bagasseMt: bagasseMt,
      molassesMt: molassesMt
    });

    if (saved && window.AppUI) {
      window.AppUI.showToast(
        'Mass Balance Ledger Updated (Year ' + saved.year + ')',
        'All 5 dedicated input & output analytics graphs re-rendered in real time.',
        'emerald'
      );
    }
  }

  function handleDeleteYear(year) {
    const ok = window.AppStore.deleteMassBalanceYear(year);
    if (ok && window.AppUI) {
      window.AppUI.showToast('Year ' + year + ' Removed', 'Charts updated.', 'amber');
    }
  }

  // Render the 5 Independent Dedicated Graphs (X-axis = Year, Y-axis = Total Amount)
  function renderFiveIndependentGraphs() {
    destroyCharts();
    if (typeof window.Chart === 'undefined') return;

    const ledger = window.AppStore.getState().massBalanceLedger;
    const years = ledger.map(function (r) { return String(r.year); });

    const graphConfigs = [
      {
        canvasId: 'mill-chart-cane',
        title: 'Raw Input: Total Sugarcane Crushed (MT)',
        unitLabel: 'Metric Tonnes (MT)',
        data: ledger.map(function (r) { return r.caneCrushedMt; }),
        borderColor: '#059669',
        bgColor: 'rgba(16, 185, 129, 0.18)',
        type: 'bar'
      },
      {
        canvasId: 'mill-chart-sugar',
        title: 'Output 1: White Crystal Sugar Produced (MT)',
        unitLabel: 'Metric Tonnes (MT)',
        data: ledger.map(function (r) { return r.sugarMt; }),
        borderColor: '#2563eb',
        bgColor: 'rgba(59, 130, 246, 0.16)',
        type: 'line'
      },
      {
        canvasId: 'mill-chart-ethanol',
        title: 'Output 2: Fuel Ethanol Distilled (KL)',
        unitLabel: 'Kiloliters (KL)',
        data: ledger.map(function (r) { return r.ethanolKl; }),
        borderColor: '#d97706',
        bgColor: 'rgba(245, 158, 11, 0.20)',
        type: 'bar'
      },
      {
        canvasId: 'mill-chart-bagasse',
        title: 'Output 3: Bagasse Cogen Biomass (MT)',
        unitLabel: 'Metric Tonnes (MT)',
        data: ledger.map(function (r) { return r.bagasseMt; }),
        borderColor: '#0d9488',
        bgColor: 'rgba(20, 184, 166, 0.16)',
        type: 'line'
      },
      {
        canvasId: 'mill-chart-molasses',
        title: 'Output 4: B-Heavy / C-Heavy Molasses (MT)',
        unitLabel: 'Metric Tonnes (MT)',
        data: ledger.map(function (r) { return r.molassesMt; }),
        borderColor: '#7c3aed',
        bgColor: 'rgba(124, 58, 237, 0.16)',
        type: 'line'
      }
    ];

    graphConfigs.forEach(function (cfg) {
      const canvas = document.getElementById(cfg.canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      chartInstances[cfg.canvasId] = new window.Chart(ctx, {
        type: cfg.type,
        data: {
          labels: years,
          datasets: [
            {
              label: cfg.title,
              data: cfg.data,
              borderColor: cfg.borderColor,
              backgroundColor: cfg.bgColor,
              borderWidth: 2.5,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderRadius: cfg.type === 'bar' ? 6 : 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return Number(context.parsed.y).toLocaleString('en-IN') + ' ' + cfg.unitLabel;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year',
                color: '#475569',
                font: { size: 11, weight: 'bold' }
              },
              grid: { display: false }
            },
            y: {
              title: {
                display: true,
                text: cfg.unitLabel,
                color: '#475569',
                font: { size: 11, weight: 'bold' }
              },
              ticks: {
                callback: function (value) {
                  if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
                  if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                  return value;
                }
              }
            }
          }
        }
      });
    });
  }

  function render(container) {
    const state = window.AppStore.getState();
    const user = state.currentUser || window.AppStore.DEMO_USERS.mill;
    const batches = state.weighbridgeBatches;
    const ledger = state.massBalanceLedger;

    // Quick trip loader pills for Weighbridge
    const incomingTripPills = state.trips.slice(0, 4).map(function (t) {
      return (
        '<button type="button" onclick="window.MillPortal.loadTripIntoWeighbridge(\'' + t.tripId + '\')" class="px-2.5 py-1 rounded-lg text-xs font-mono-num bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-300 transition">' +
        t.tripId + ': ' + t.farmerName.split(' ')[0] + ' (' + t.quantityMt + ' MT)' +
        '</button>'
      );
    }).join('');

    // Recent Weighbridge Batches Table Rows
    const batchRowsHtml = batches.map(function (b) {
      return (
        '<tr class="border-b border-slate-200/80 hover:bg-slate-50 text-xs">' +
        '  <td class="py-2.5 px-3 font-mono-num font-bold text-slate-900">' + b.batchId + '<div class="text-[10px] text-slate-500 font-normal">' + b.timestamp + '</div></td>' +
        '  <td class="py-2.5 px-3 font-semibold text-slate-800">' + b.farmerName + '<div class="text-[10px] text-emerald-700 font-normal">' + b.caneVariety + ' (' + b.tripId + ')</div></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num">' + b.grossWeightMt.toFixed(2) + ' / ' + b.tareWeightMt.toFixed(2) + ' MT</td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-800">' + b.netPayableMt.toFixed(3) + ' MT<div class="text-[10px] text-slate-500 font-normal">-' + b.trashDeductionPct + '% Trash</div></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num">Pol: ' + b.polPct.toFixed(2) + '%<div class="text-[10px] text-slate-500">Brix: ' + b.brixPct.toFixed(2) + '% | Rec: <strong>' + b.estimatedRecoveryPct.toFixed(2) + '%</strong></div></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num">RS: ' + b.reducingSugarsPct.toFixed(2) + '%<div class="text-[10px] text-slate-500">Dextran: ' + b.dextranPpm + ' ppm</div></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-semibold text-slate-900">₹' + b.finalRatePerMt.toFixed(2) + '/MT</td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-extrabold text-emerald-700">₹' + b.totalPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>' +
        '</tr>'
      );
    }).join('');

    // Mass Balance Ledger Rows
    const ledgerRowsHtml = ledger.map(function (r) {
      const sugarYieldPct = r.caneCrushedMt > 0 ? ((r.sugarMt / r.caneCrushedMt) * 100).toFixed(2) : '0.00';
      const bagasseYieldPct = r.caneCrushedMt > 0 ? ((r.bagasseMt / r.caneCrushedMt) * 100).toFixed(1) : '0.0';
      return (
        '<tr class="border-b border-slate-200/80 hover:bg-indigo-50/40 transition-colors text-xs sm:text-sm">' +
        '  <td class="py-2.5 px-3 font-mono-num font-bold text-slate-900">' + r.year + '</td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-bold text-emerald-800">' + r.caneCrushedMt.toLocaleString('en-IN') + ' MT</td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-semibold text-blue-800">' + r.sugarMt.toLocaleString('en-IN') + ' MT <span class="text-[11px] text-slate-500">(' + sugarYieldPct + '%)</span></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-semibold text-amber-800">' + r.ethanolKl.toLocaleString('en-IN') + ' KL</td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-semibold text-teal-800">' + r.bagasseMt.toLocaleString('en-IN') + ' MT <span class="text-[11px] text-slate-500">(' + bagasseYieldPct + '%)</span></td>' +
        '  <td class="py-2.5 px-3 text-right font-mono-num font-semibold text-purple-800">' + r.molassesMt.toLocaleString('en-IN') + ' MT</td>' +
        '  <td class="py-2.5 px-3 text-right whitespace-nowrap">' +
        '    <button type="button" onclick="window.MillPortal.populateMassBalanceFormForYear(' + r.year + ')" class="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 mr-1">Edit Year</button>' +
        '    <button type="button" onclick="window.MillPortal.handleDeleteYear(' + r.year + ')" class="px-2 py-1 rounded text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200">×</button>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');

    container.innerHTML =
      '<div class="min-h-screen bg-slate-100 flex flex-col">' +
      window.AppUI.renderPortalHeader('mill', user) +
      '  <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">' +
      '    <!-- ================================================================== -->' +
      '    <!-- MODULE 1: GATE RECEPTION, WEIGHBRIDGE & LAB FRP BATCH PRICING      -->' +
      '    <!-- ================================================================== -->' +
      '    <section class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '      <div class="px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-3">' +
      '        <div>' +
      '          <span class="text-[11px] font-mono-num uppercase tracking-wider text-indigo-300 font-bold">1. Gate Reception &amp; Batch Pricing Engine</span>' +
      '          <h2 class="text-base sm:text-lg font-bold mt-0.5">Weighbridge Telemetry, Quality Lab Logging &amp; Automated FRP Calculator</h2>' +
      '        </div>' +
      '        <div class="flex items-center gap-2 text-xs font-mono-num">' +
      '          <span class="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700">Statutory Base FRP: ₹3,400/MT (@ 10.25% Rec)</span>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p-5 space-y-5">' +
      '        <!-- Quick Load Incoming Trip Bar -->' +
      '        <div class="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">' +
      '          <span class="text-xs font-bold text-slate-600 uppercase">Quick-Load Incoming Gate Trip:</span>' +
      incomingTripPills +
      '        </div>' +
      '        <form onsubmit="window.MillPortal.handleWeighbridgeSubmit(event)" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">' +
      '          <!-- Left 7 Cols: Weighbridge + Lab Quality Inputs -->' +
      '          <div class="lg:col-span-7 space-y-4">' +
      '            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">' +
      '              <div class="text-xs font-bold uppercase tracking-wider text-slate-700">A. Weighbridge Gross vs. Tare Entry</div>' +
      '              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Trip / Gate Pass ID</label>' +
      '                  <input type="text" id="wb-trip-id" value="TRIP-MH-901" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Farmer Name *</label>' +
      '                  <input type="text" id="wb-farmer-name" value="Rajendra Dattatray Patil" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Cane Variety</label>' +
      '                  <input type="text" id="wb-cane-variety" value="Co 86032" class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white" />' +
      '                </div>' +
      '              </div>' +
      '              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Gross Weight (MT) *</label>' +
      '                  <input type="number" step="0.05" min="5" max="150" id="wb-gross-mt" value="57.50" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num font-bold text-slate-900 bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Empty Vehicle Tare (MT) *</label>' +
      '                  <input type="number" step="0.05" min="1" max="50" id="wb-tare-mt" value="9.50" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num font-bold text-slate-900 bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Trash Deduction (%) *</label>' +
      '                  <input type="number" step="0.1" min="0" max="15" id="wb-trash-pct" value="2.0" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-rose-300 font-mono-num font-semibold text-rose-800 bg-white" />' +
      '                </div>' +
      '              </div>' +
      '            </div>' +
      '            <div class="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">' +
      '              <div class="text-xs font-bold uppercase tracking-wider text-indigo-950">B. Quality Assessment Lab Logging Interface (Core Sampler &amp; Polarimeter)</div>' +
      '              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Pol % (Sucrose) *</label>' +
      '                  <input type="number" step="0.05" min="8" max="18" id="wb-pol-pct" value="14.35" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-indigo-300 font-mono-num font-bold text-indigo-950 bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Brix % (Solids) *</label>' +
      '                  <input type="number" step="0.05" min="12" max="25" id="wb-brix-pct" value="20.80" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-indigo-300 font-mono-num font-bold text-indigo-950 bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Reducing Sugars %</label>' +
      '                  <input type="number" step="0.02" min="0.1" max="3.0" id="wb-reducing-pct" value="0.36" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num bg-white" />' +
      '                </div>' +
      '                <div>' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Dextran (ppm)</label>' +
      '                  <input type="number" step="5" min="20" max="1200" id="wb-dextran-ppm" value="135" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num bg-white" />' +
      '                </div>' +
      '                <div class="col-span-2 sm:col-span-1">' +
      '                  <label class="block text-xs font-semibold text-slate-700 mb-1">Base FRP (₹/MT)</label>' +
      '                  <input type="number" step="25" min="2800" max="5000" id="wb-base-frp" value="3400" oninput="window.MillPortal.recalculateLivePricing()" required class="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 font-mono-num bg-white" />' +
      '                </div>' +
      '              </div>' +
      '            </div>' +
      '          </div>' +
      '          <!-- Right 5 Cols: Automated Batch Pricing Calculator Output -->' +
      '          <div class="lg:col-span-5" id="wb-live-pricing-card"></div>' +
      '        </form>' +
      '        <!-- Recent Weighbridge & Lab Batches Ledger -->' +
      '        <div class="pt-2">' +
      '          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Approved Weighbridge &amp; Lab Quality Settlement Batches</h3>' +
      '          <div class="overflow-x-auto table-scroll border border-slate-200 rounded-xl">' +
      '            <table class="w-full text-left border-collapse">' +
      '              <thead>' +
      '                <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">' +
      '                  <th class="py-2.5 px-3">Batch ID</th>' +
      '                  <th class="py-2.5 px-3">Farmer &amp; Variety</th>' +
      '                  <th class="py-2.5 px-3 text-right">Gross / Tare</th>' +
      '                  <th class="py-2.5 px-3 text-right">Net Cane Weight</th>' +
      '                  <th class="py-2.5 px-3 text-right">Pol% / Brix% / Rec%</th>' +
      '                  <th class="py-2.5 px-3 text-right">RS% &amp; Dextran</th>' +
      '                  <th class="py-2.5 px-3 text-right">Final Rate</th>' +
      '                  <th class="py-2.5 px-3 text-right">Net Payable (₹)</th>' +
      '                </tr>' +
      '              </thead>' +
      '              <tbody>' +
      batchRowsHtml +
      '              </tbody>' +
      '            </table>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </section>' +
      '    <!-- ================================================================== -->' +
      '    <!-- MODULE 2: MASS BALANCE & YEARLY PRODUCTION ANALYTICS DASHBOARD     -->' +
      '    <!-- ================================================================== -->' +
      '    <section class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">' +
      '      <div class="px-5 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">' +
      '        <div>' +
      '          <span class="text-[11px] font-mono-num uppercase tracking-wider text-emerald-300 font-bold">2. Mass Balance &amp; Yearly Production Analytics Dashboard</span>' +
      '          <h2 class="text-base sm:text-lg font-bold mt-0.5">Annual Raw Sugarcane Input vs. Multi-Product Output Ledger &amp; 5 Independent Analytics Graphs</h2>' +
      '        </div>' +
      '        <span class="text-xs text-slate-300 font-mono-num">X-Axis: Year | Y-Axis: Total Amount (MT / KL)</span>' +
      '      </div>' +
      '      <div class="p-5 space-y-6">' +
      '        <!-- Inline Real-Time Data-Entry Form -->' +
      '        <form onsubmit="window.MillPortal.handleMassBalanceSubmit(event)" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">' +
      '          <div class="flex flex-wrap items-center justify-between gap-2">' +
      '            <div>' +
      '              <span class="text-xs font-bold uppercase tracking-wider text-slate-800">Inline Yearly Mass Balance Data Entry (Add New Year or Update Existing Year)</span>' +
      '              <p class="text-xs text-slate-500">Submitting immediately updates the ledger table and re-renders all 5 dedicated product graphs below.</p>' +
      '            </div>' +
      '            <button type="button" onclick="window.MillPortal.autoEstimateOutputsFromCane()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition">Auto-Calculate Standard Yield Outputs from Cane Input</button>' +
      '          </div>' +
      '          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-slate-700 mb-1">Year (X-Axis) *</label>' +
      '              <input type="number" min="2010" max="2035" id="mb-input-year" value="2027" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono-num font-bold text-slate-900 bg-white" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-emerald-800 mb-1">Cane Crushed (MT) *</label>' +
      '              <input type="number" step="1000" min="0" id="mb-input-cane" value="1420000" required class="w-full px-3 py-2 text-sm rounded-lg border border-emerald-400 font-mono-num font-bold text-emerald-950 bg-white" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-blue-800 mb-1">Sugar Output (MT) *</label>' +
      '              <input type="number" step="500" min="0" id="mb-input-sugar" value="157600" required class="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 font-mono-num font-semibold text-blue-950 bg-white" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-amber-800 mb-1">Ethanol Output (KL) *</label>' +
      '              <input type="number" step="200" min="0" id="mb-input-ethanol" value="43500" required class="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 font-mono-num font-semibold text-amber-950 bg-white" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-teal-800 mb-1">Bagasse Output (MT) *</label>' +
      '              <input type="number" step="1000" min="0" id="mb-input-bagasse" value="411800" required class="w-full px-3 py-2 text-sm rounded-lg border border-teal-300 font-mono-num font-semibold text-teal-950 bg-white" />' +
      '            </div>' +
      '            <div>' +
      '              <label class="block text-xs font-semibold text-purple-800 mb-1">Molasses Output (MT) *</label>' +
      '              <input type="number" step="500" min="0" id="mb-input-molasses" value="61700" required class="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 font-mono-num font-semibold text-purple-950 bg-white" />' +
      '            </div>' +
      '          </div>' +
      '          <div class="flex justify-end pt-1">' +
      '            <button type="submit" class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition">Save Year Entry &amp; Re-Render All 5 Analytics Graphs →</button>' +
      '          </div>' +
      '        </form>' +
      '        <!-- 5 Dedicated Independent Graphs (1 Raw Input + 4 Outputs) -->' +
      '        <div>' +
      '          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Dynamic Multi-Graph Analytics (5 Independent Product &amp; Feedstock Charts)</h3>' +
      '          <!-- Top Full-Width Raw Input Graph -->' +
      '          <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 mb-4">' +
      '            <div class="flex items-center justify-between mb-2">' +
      '              <h4 class="text-sm font-bold text-emerald-950">Graph 1 (Raw Input): Annual Total Sugarcane Crushed (Metric Tonnes)</h4>' +
      '              <span class="text-xs font-mono-num px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Y-Axis: Metric Tonnes (MT)</span>' +
      '            </div>' +
      '            <div class="relative h-64 w-full"><canvas id="mill-chart-cane"></canvas></div>' +
      '          </div>' +
      '          <!-- 2x2 Grid of Individual Output Product Graphs -->' +
      '          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
      '            <div class="p-4 rounded-xl border border-slate-200 bg-white">' +
      '              <div class="flex items-center justify-between mb-2">' +
      '                <h4 class="text-sm font-bold text-blue-950">Graph 2 (Output): Annual Sugar Production (MT)</h4>' +
      '                <span class="text-xs font-mono-num px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold">Metric Tonnes</span>' +
      '              </div>' +
      '              <div class="relative h-60 w-full"><canvas id="mill-chart-sugar"></canvas></div>' +
      '            </div>' +
      '            <div class="p-4 rounded-xl border border-slate-200 bg-white">' +
      '              <div class="flex items-center justify-between mb-2">' +
      '                <h4 class="text-sm font-bold text-amber-950">Graph 3 (Output): Annual Ethanol Production (KL)</h4>' +
      '                <span class="text-xs font-mono-num px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">Kiloliters (KL)</span>' +
      '              </div>' +
      '              <div class="relative h-60 w-full"><canvas id="mill-chart-ethanol"></canvas></div>' +
      '            </div>' +
      '            <div class="p-4 rounded-xl border border-slate-200 bg-white">' +
      '              <div class="flex items-center justify-between mb-2">' +
      '                <h4 class="text-sm font-bold text-teal-950">Graph 4 (Output): Annual Bagasse Output (MT)</h4>' +
      '                <span class="text-xs font-mono-num px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold">Metric Tonnes</span>' +
      '              </div>' +
      '              <div class="relative h-60 w-full"><canvas id="mill-chart-bagasse"></canvas></div>' +
      '            </div>' +
      '            <div class="p-4 rounded-xl border border-slate-200 bg-white">' +
      '              <div class="flex items-center justify-between mb-2">' +
      '                <h4 class="text-sm font-bold text-purple-950">Graph 5 (Output): Annual Molasses Output (MT)</h4>' +
      '                <span class="text-xs font-mono-num px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold">Metric Tonnes</span>' +
      '              </div>' +
      '              <div class="relative h-60 w-full"><canvas id="mill-chart-molasses"></canvas></div>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '        <!-- Input & Output Mass Balance Ledger Table -->' +
      '        <div>' +
      '          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Annual Input &amp; Output Mass Balance Ledger (Click "Edit Year" to Load Any Row into Editor)</h3>' +
      '          <div class="overflow-x-auto table-scroll border border-slate-200 rounded-xl">' +
      '            <table class="w-full text-left border-collapse">' +
      '              <thead>' +
      '                <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-600">' +
      '                  <th class="py-3 px-3">Year</th>' +
      '                  <th class="py-3 px-3 text-right">Raw Sugarcane Crushed (MT)</th>' +
      '                  <th class="py-3 px-3 text-right">Sugar Output (MT &amp; %)</th>' +
      '                  <th class="py-3 px-3 text-right">Ethanol Output (KL)</th>' +
      '                  <th class="py-3 px-3 text-right">Bagasse Output (MT &amp; %)</th>' +
      '                  <th class="py-3 px-3 text-right">Molasses Output (MT)</th>' +
      '                  <th class="py-3 px-3 text-right">Actions</th>' +
      '                </tr>' +
      '              </thead>' +
      '              <tbody>' +
      ledgerRowsHtml +
      '              </tbody>' +
      '            </table>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </section>' +
      '  </main>' +
      '</div>';

    recalculateLivePricing();
    setTimeout(renderFiveIndependentGraphs, 30);
  }

  return {
    render: render,
    loadTripIntoWeighbridge: loadTripIntoWeighbridge,
    recalculateLivePricing: recalculateLivePricing,
    handleWeighbridgeSubmit: handleWeighbridgeSubmit,
    autoEstimateOutputsFromCane: autoEstimateOutputsFromCane,
    populateMassBalanceFormForYear: populateMassBalanceFormForYear,
    handleMassBalanceSubmit: handleMassBalanceSubmit,
    handleDeleteYear: handleDeleteYear
  };
})();
