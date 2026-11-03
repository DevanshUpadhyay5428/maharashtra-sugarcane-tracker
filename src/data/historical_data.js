/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — HISTORICAL & REGIONAL DATA
 * File: src/data/historical_data.js
 * Contains:
 *   1. Graph/Table 1: Pacific Climate Anomalies (ENSO) & Weather Correlation (2015-2026)
 *   2. Graph/Table 2: Historical Annual Rainfall in Maharashtra (2012-2026)
 *   3. Graph/Table 3: Historical Sugar Production Trends (12-13 to 25-26)
 *   4. Graph/Table 4: Historical Ethanol Production Trends (12-13 to 25-26)
 *   5. Graph/Table 5: Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012-13 to 2025-26)
 *   6. Authentic Maharashtra Sugar Mills, Plot Locations & Weather Forecasts
 * ============================================================================
 */

window.MahaData = (function () {
  // --------------------------------------------------------------------------
  // DATASET 1: Pacific Climate Anomalies (ENSO) & Weather Correlation (2015-2026)
  // Baseline References: >= +0.5°C El Niño | <= -0.5°C La Niña
  // Intensity: Neutral (-0.4 to +0.4), Weak (0.5-0.9), Moderate (1.0-1.4),
  //            Strong (1.5-1.9), Very Strong (>= 2.0)
  // --------------------------------------------------------------------------
  const ENSO_BASELINE_RULES = {
    elNinoThreshold: 0.5,
    laNinaThreshold: -0.5,
    categories: [
      { label: 'Neutral', range: '-0.4°C to +0.4°C' },
      { label: 'Weak', range: '±0.5°C to ±0.9°C' },
      { label: 'Moderate', range: '±1.0°C to ±1.4°C' },
      { label: 'Strong', range: '±1.5°C to ±1.9°C' },
      { label: 'Very Strong', range: '≥ ±2.0°C' }
    ]
  };

  function classifyEnsoIntensity(oni) {
    const abs = Math.abs(oni);
    if (abs >= 2.0) return 'Very Strong';
    if (abs >= 1.5) return 'Strong';
    if (abs >= 1.0) return 'Moderate';
    if (abs >= 0.5) return 'Weak';
    return 'Neutral';
  }

  const ENSO_RAW = [
    {
      year: 2015,
      oniPeak: 2.6,
      statusBadge: 'Super El Niño',
      phaseType: 'el-nino-super',
      regionalCorrelation: 'Severe southwest monsoon failure (-24.0% state rainfall deficit); acute reservoir depletion in Marathwada & Solapur triggered massive 2016-17 cane acreage collapse.'
    },
    {
      year: 2016,
      oniPeak: 2.5,
      statusBadge: 'El Niño',
      phaseType: 'el-nino',
      regionalCorrelation: 'Lingering Q1-Q2 thermal stress & soil moisture deficit from decaying 2015-16 event; subsequent monsoon recovery (+10.4% rain) revived late Suru planting.'
    },
    {
      year: 2017,
      oniPeak: 0.4,
      statusBadge: 'Neutral',
      phaseType: 'neutral',
      regionalCorrelation: 'Stable ENSO-neutral phase (-2.0% rainfall deviation); balanced moisture distribution supported vigorous ratoon & Adsali sucrose accumulation.'
    },
    {
      year: 2018,
      oniPeak: 1.1,
      statusBadge: 'El Niño',
      phaseType: 'el-nino',
      regionalCorrelation: 'Early monsoon withdrawal (-13.2% annual rainfall) & October heat anomaly in Ahmadnagar, Beed, and Solapur reduced fresh planting for the 2019-20 cycle.'
    },
    {
      year: 2019,
      oniPeak: 1.0,
      statusBadge: 'El Niño',
      phaseType: 'el-nino',
      regionalCorrelation: 'Biphasic anomaly: delayed June onset followed by extreme August cloudbursts & flooding in Krishna-Panchganga basin (+35.0% state excess rain) alongside eastern drought.'
    },
    {
      year: 2020,
      oniPeak: 0.7,
      statusBadge: 'El Niño',
      phaseType: 'el-nino',
      regionalCorrelation: 'Weak Pacific warming overridden by favorable Indian Ocean Dipole; +11.4% above-normal rainfall replenished Ujjani, Koyna & Jayakwadi dams.'
    },
    {
      year: 2021,
      oniPeak: -0.3,
      statusBadge: 'Neutral',
      phaseType: 'neutral',
      regionalCorrelation: 'Cool-neutral Pacific conditions (+16.3% excess-leaning monsoon); optimal diurnal temperature range boosted cane stalk elongation across Western Maharashtra.'
    },
    {
      year: 2022,
      oniPeak: -0.9,
      statusBadge: 'La Niña',
      phaseType: 'la-nina',
      regionalCorrelation: 'Active La Niña walker circulation sustained a 4th consecutive wet monsoon (+17.8% deviation), fueling all-time high state cane availability.'
    },
    {
      year: 2023,
      oniPeak: 2.0,
      statusBadge: 'Super El Niño',
      phaseType: 'el-nino-super',
      regionalCorrelation: 'Prolonged August break-monsoon dry spell (-16.9% annual deficit) and elevated heatwave frequency reduced stalk weight & 2024-25 harvestable tonnage.'
    },
    {
      year: 2024,
      oniPeak: 1.8,
      statusBadge: 'El Niño',
      phaseType: 'el-nino',
      regionalCorrelation: 'Intense pre-monsoon heatwaves (42°C+ in interior districts) transitioned to strong late-monsoon recharge (+13.9% rainfall), aiding 2025-26 cane recovery.'
    },
    {
      year: 2025,
      oniPeak: 0.0,
      statusBadge: 'Neutral',
      phaseType: 'neutral',
      regionalCorrelation: 'Equilibrium Pacific phase (+6.2% normal rainfall); steady reservoir levels and minimal unseasonal hail/rain disruptions during peak crushing.'
    },
    {
      year: 2026,
      oniPeak: 1.4,
      statusBadge: 'El Niño Active',
      phaseType: 'el-nino-active',
      regionalCorrelation: 'Active Moderate El Niño (+1.4°C ONI) driving YTD monsoonal deficit (-26.7% at 845.0 mm); requires tight cut-to-crush scheduling to prevent moisture & dextran loss.'
    }
  ];

  const ENSO_DATA = ENSO_RAW.map(function (item) {
    return {
      year: item.year,
      oniPeak: item.oniPeak,
      statusBadge: item.statusBadge,
      phaseType: item.phaseType,
      intensityCategory: classifyEnsoIntensity(item.oniPeak),
      regionalCorrelation: item.regionalCorrelation
    };
  });

  // --------------------------------------------------------------------------
  // DATASET 2: Historical Annual Rainfall in Maharashtra (2012-2026)
  // State Baseline = 1,152.7 mm
  // Category: Deficient (< -19%), Normal (-19% to +19%), Excess (> +19%)
  // --------------------------------------------------------------------------
  const RAINFALL_BASELINE_MM = 1152.7;

  const RAINFALL_RAW = [
    { year: '2012', rainfallMm: 992.4, patternNote: 'Sub-normal interior monsoon; early stress in Solapur & Marathwada' },
    { year: '2013', rainfallMm: 1409.8, patternNote: 'Strong Excess (+22.3%); recharged major irrigation command areas' },
    { year: '2014', rainfallMm: 1001.6, patternNote: 'Late onset & dry spells across central cane belt' },
    { year: '2015', rainfallMm: 875.7, patternNote: 'Driest Full Year (-24.0%): Super El Niño drought across Maharashtra', highlight: 'driest' },
    { year: '2016', rainfallMm: 1272.8, patternNote: 'Post-drought recovery rains; normal spatial distribution' },
    { year: '2017', rainfallMm: 1129.6, patternNote: 'Near-baseline monsoon (-2.0%); stable dam storage' },
    { year: '2018', rainfallMm: 1000.8, patternNote: 'Early September withdrawal; moisture deficit in rainfed zones' },
    { year: '2019', rainfallMm: 1555.8, patternNote: 'Wettest Year (+35.0%): Extreme Krishna-Panchganga floods; start of 4-yr wet cycle', highlight: 'wettest' },
    { year: '2020', rainfallMm: 1284.5, patternNote: 'Multi-Year Wet Spell (Yr 2): Full reservoir levels statewide' },
    { year: '2021', rainfallMm: 1341.0, patternNote: 'Multi-Year Wet Spell (Yr 3): High soil moisture boosted Adsali acreage' },
    { year: '2022', rainfallMm: 1358.2, patternNote: 'Multi-Year Wet Spell (Yr 4): Sustained surplus under La Niña influence' },
    { year: '2023', rainfallMm: 958.4, patternNote: 'El Niño dip (-16.9%); borderline deficient in Marathwada & Sangli east' },
    { year: '2024', rainfallMm: 1312.6, patternNote: 'Strong rebound (+13.9%); late September replenishment' },
    { year: '2025', rainfallMm: 1224.0, patternNote: 'Balanced Normal monsoon (+6.2%); optimal harvesting conditions' },
    { year: '2026 YTD', rainfallMm: 845.0, patternNote: 'Active YTD Deficit (-26.7%): El Niño suppression; irrigation priority alert', highlight: 'ytd-dry' }
  ];

  const RAINFALL_DATA = RAINFALL_RAW.map(function (row) {
    const dev = ((row.rainfallMm - RAINFALL_BASELINE_MM) / RAINFALL_BASELINE_MM) * 100;
    let category = 'Normal';
    if (dev < -19.0) {
      category = 'Deficient';
    } else if (dev > 19.0) {
      category = 'Excess';
    }
    return {
      year: row.year,
      rainfallMm: row.rainfallMm,
      pctDeviation: Number(dev.toFixed(2)),
      category: category,
      patternNote: row.patternNote,
      highlight: row.highlight || null
    };
  });

  // --------------------------------------------------------------------------
  // DATASET 3: Historical Sugar Production Trends (12-13 to 25-26)
  // State Baseline = 90.0 LMT (Lakh Metric Tonnes)
  // --------------------------------------------------------------------------
  const SUGAR_BASELINE_LMT = 90.0;

  const SUGAR_RAW = [
    { season: '12-13', prodLmt: 79.95, cycleTag: 'Moderate Deficit', notes: 'Below-baseline output following 2012 dry monsoon bias (-13.9% rain) in central zones.' },
    { season: '13-14', prodLmt: 77.16, cycleTag: 'Transitional Dip', notes: 'Lagged planting recovery; localized hailstorms moderated mid-season crushing.' },
    { season: '14-15', prodLmt: 105.14, cycleTag: 'Cyclical Peak', notes: 'Strong expansion (+16.8%) propelled by 2013 excess monsoon (+22.3%) and higher recovery.' },
    { season: '15-16', prodLmt: 84.11, cycleTag: 'Early Contraction', notes: 'Onset of 2015 Super El Niño water stress shortened crushing days in Marathwada.' },
    { season: '16-17', prodLmt: 42.00, cycleTag: 'Severe Drought Trough', notes: 'Severe Drought: Acute cane scarcity post-2015 rainfall collapse; 53.3% below state baseline.', highlight: 'deficit' },
    { season: '17-18', prodLmt: 107.21, cycleTag: 'Cyclical Peak', notes: 'V-shaped rebound (+155% YoY) driven by 2016-17 normal rains and fresh Co 86032 planting.' },
    { season: '18-19', prodLmt: 107.19, cycleTag: 'Sustained Peak', notes: 'High sucrose recovery (11.26%) across Kolhapur-Karad belt maintained 107+ LMT plateau.' },
    { season: '19-20', prodLmt: 61.68, cycleTag: 'Flood/Drought Deficit', notes: 'Flood/Drought: Dual shock of 2018 dry planting lag and Aug 2019 Krishna basin inundation.', highlight: 'deficit' },
    { season: '20-21', prodLmt: 106.40, cycleTag: 'Recovery Surge', notes: 'Full irrigation reservoirs from 2019-20 rains restored crushing above 106 LMT.' },
    { season: '21-22', prodLmt: 137.28, cycleTag: 'All-Time Record Peak', notes: 'Record: 4-year wet cycle produced historic 137.28 LMT (+52.5% vs baseline) & extended season.', highlight: 'record' },
    { season: '22-23', prodLmt: 105.30, cycleTag: 'Diversion-Adjusted High', notes: 'Strong gross cane crush (~1,053 LMT) with ~18 LMT sugar equivalent diverted to ethanol.' },
    { season: '23-24', prodLmt: 110.20, cycleTag: 'Resilient Output', notes: 'Dec 2023 central curbs on syrup/B-heavy diversion channeled higher sucrose back into crystal sugar.' },
    { season: '24-25', prodLmt: 81.00, cycleTag: 'El Niño Lag Dip', notes: 'Cyclical contraction (-10.0% vs baseline) reflecting 2023 Super El Niño rainfall deficit.' },
    { season: '25-26', prodLmt: 99.20, cycleTag: 'Rebound Cycle', notes: 'Healthy recovery (+10.2% vs baseline) backed by 2024-25 normal monsoons & balanced diversion.' }
  ];

  const SUGAR_DATA = SUGAR_RAW.map(function (row) {
    const dev = ((row.prodLmt - SUGAR_BASELINE_LMT) / SUGAR_BASELINE_LMT) * 100;
    return {
      season: row.season,
      prodLmt: row.prodLmt,
      pctDeviation: Number(dev.toFixed(2)),
      cycleTag: row.cycleTag,
      notes: row.notes,
      highlight: row.highlight || null
    };
  });

  // --------------------------------------------------------------------------
  // DATASET 4: Historical Ethanol Production Trends (12-13 to 25-26)
  // Baseline = 120.0 Cr Litres
  // --------------------------------------------------------------------------
  const ETHANOL_BASELINE_CR_L = 120.0;

  const ETHANOL_RAW = [
    { season: '12-13', prodCrL: 4.8, policyTag: 'C-Heavy Only', notes: 'Pre-reform era; ethanol restricted to residual C-heavy molasses (~1.5% OMC blending).' },
    { season: '13-14', prodCrL: 7.2, policyTag: 'Tender Pricing', notes: 'Gradual OMC off-take improvement; limited standalone distillery capacity in cooperatives.' },
    { season: '14-15', prodCrL: 12.5, policyTag: 'Fixed Depot Price', notes: 'Introduction of fixed delivered price mechanism encouraged seasonal molasses distillation.' },
    { season: '15-16', prodCrL: 18.0, policyTag: 'Excise Duty Waiver', notes: 'Temporary central excise waiver lifted supply before drought curtailed molasses stocks.' },
    { season: '16-17', prodCrL: 9.5, policyTag: 'Drought Feedstock Crunch', notes: 'Severe 16-17 cane drought (42 LMT sugar) starved attached distilleries of molasses.' },
    { season: '17-18', prodCrL: 28.0, policyTag: 'Biofuel Policy 2018', notes: 'National Policy on Biofuels (May 2018) unlocked B-heavy molasses & direct cane juice pathways.' },
    { season: '18-19', prodCrL: 48.5, policyTag: 'EBP Subvention Launch', notes: 'EBP Subvention Launch: DFPD interest subvention scheme catalyzed massive distillery expansion.', highlight: 'policy' },
    { season: '19-20', prodCrL: 56.0, policyTag: 'Differential Feedstock Pricing', notes: 'Remunerative B-heavy & syrup procurement prices buffered revenue despite lower cane crush.' },
    { season: '20-21', prodCrL: 100.4, policyTag: 'Juice Diversion Scale-Up', notes: 'Direct sugarcane juice/syrup distillation scaled rapidly; state crossed 100 Cr L milestone.' },
    { season: '21-22', prodCrL: 134.0, policyTag: 'E10 Milestone Achieved', notes: 'Surpassed 120 Cr L state baseline (+11.7%); helped India achieve 10% EBP target 5 months early.' },
    { season: '22-23', prodCrL: 142.5, policyTag: 'Aggressive Syrup Diversion', notes: 'Peak B-heavy & cane juice diversion absorbed surplus sucrose and stabilized mill liquidity.' },
    { season: '23-24', prodCrL: 81.4, policyTag: 'Syrup Curbs Imposed', notes: 'Syrup curbs: Dec 2023 DFPD cap on juice/syrup & B-heavy diversion cut output by 42.9% YoY.', highlight: 'deficit' },
    { season: '24-25', prodCrL: 115.0, policyTag: 'Calibrated Quota Lifting', notes: 'Removal of feedstock caps for 2024-25 restored B-heavy & syrup allocation near baseline (-4.2%).' },
    { season: '25-26', prodCrL: 145.0, policyTag: 'E20 National Mandate Peak', notes: 'All-time record 145.0 Cr L (+20.8% vs baseline) driven by unrestricted juice diversion & E20 blending.', highlight: 'record' }
  ];

  const ETHANOL_DATA = ETHANOL_RAW.map(function (row) {
    const dev = ((row.prodCrL - ETHANOL_BASELINE_CR_L) / ETHANOL_BASELINE_CR_L) * 100;
    return {
      season: row.season,
      prodCrL: row.prodCrL,
      pctDeviation: Number(dev.toFixed(2)),
      policyTag: row.policyTag,
      notes: row.notes,
      highlight: row.highlight || null
    };
  });

  // --------------------------------------------------------------------------
  // DATASET 5: Maharashtra Annual Sugarcane Harvest vs. Mill Crushing (2012-13 to 2025-26)
  // State Long-Term Average Baseline = 85.0 MMT (Million Metric Tonnes)
  // Surplus Years (> 85.0 MMT) vs Deficit Years (< 85.0 MMT)
  // --------------------------------------------------------------------------
  const HARVEST_CRUSH_BASELINE_MMT = 85.0;

  const HARVEST_CRUSH_RAW = [
    { season: '2012–13', harvestedMmt: 69.65, crushedMmt: 70.16, eventLabel: 'Deficit Cycle', notes: 'Sub-baseline farm harvest (69.65 MMT) & mill crush (70.16 MMT) following 2012 dry monsoon.' },
    { season: '2013–14', harvestedMmt: 76.90, crushedMmt: 77.60, eventLabel: 'Gradual Recovery', notes: 'Improved cane availability across Western Maharashtra; 9.0% below long-term 85 MMT baseline.' },
    { season: '2014–15', harvestedMmt: 84.70, crushedMmt: 93.04, eventLabel: 'Mill Crush Surge', notes: 'Strong cross-border & regional mill draw pushed crushing to 93.04 MMT (+9.5% vs baseline).' },
    { season: '2015–16', harvestedMmt: 73.68, crushedMmt: 74.51, eventLabel: 'El Niño Contraction', notes: 'Moisture stress during 2015 Super El Niño curtailed both farm gate tonnage and crushing.' },
    { season: '2016–17', harvestedMmt: 52.26, crushedMmt: 37.31, eventLabel: 'Severe Drought', notes: 'Lowest Drought Trough: Farm harvest fell to 52.26 MMT & mill crushing plunged to 37.31 MMT due to acute fodder/seed diversion and drought.', highlight: 'trough' },
    { season: '2017–18', harvestedMmt: 82.98, crushedMmt: 95.39, eventLabel: 'V-Shaped Mill Rebound', notes: 'Aggressive mill procurement & high Adsali yields lifted crushing to 95.39 MMT.' },
    { season: '2018–19', harvestedMmt: 89.77, crushedMmt: 95.21, eventLabel: 'Surplus Plateau', notes: 'Both farm harvest (89.77 MMT) and mill crushing (95.21 MMT) exceeded the 85.0 MMT state baseline.' },
    { season: '2019–20', harvestedMmt: 69.31, crushedMmt: 54.53, eventLabel: 'Flood Impact', notes: 'Flood Impact: August 2019 Krishna-Panchganga inundation & 2018 dry planting lag reduced crushing to 54.53 MMT.', highlight: 'flood' },
    { season: '2020–21', harvestedMmt: 105.14, crushedMmt: 101.34, eventLabel: 'Strong Surplus', notes: 'Ample reservoir storage propelled harvest past 105 MMT (+23.7% above baseline).' },
    { season: '2021–22', harvestedMmt: 123.97, crushedMmt: 132.03, eventLabel: 'All-Time Record Peak', notes: 'All-Time Record Peak: Bumper harvest of 123.97 MMT and historic 132.03 MMT mill crush (+55.3% vs baseline).', highlight: 'peak' },
    { season: '2022–23', harvestedMmt: 112.09, crushedMmt: 105.53, eventLabel: 'Sustained High Volume', notes: '4th consecutive wet monsoon maintained harvest at 112.09 MMT and mill crushing at 105.53 MMT.' },
    { season: '2023–24', harvestedMmt: 109.97, crushedMmt: 107.62, eventLabel: 'Resilient Surplus', notes: 'High cane retention supported 109.97 MMT harvest and 107.62 MMT mill crush.' },
    { season: '2024–25', harvestedMmt: 85.23, crushedMmt: 85.44, eventLabel: 'Baseline Equilibrium', notes: 'Lagged 2023 El Niño impact brought harvest (85.23 MMT) and crush (85.44 MMT) right to the 85.0 MMT baseline.' },
    { season: '2025–26', harvestedMmt: 104.50, crushedMmt: 99.50, eventLabel: 'Strong Expansion', notes: '2024–25 normal monsoon recovery lifted farm harvest to 104.50 MMT and mill crushing to 99.50 MMT.' }
  ];

  const HARVEST_CRUSH_DATA = HARVEST_CRUSH_RAW.map(function (row) {
    const harvestDevPct = ((row.harvestedMmt - HARVEST_CRUSH_BASELINE_MMT) / HARVEST_CRUSH_BASELINE_MMT) * 100;
    const crushDevPct = ((row.crushedMmt - HARVEST_CRUSH_BASELINE_MMT) / HARVEST_CRUSH_BASELINE_MMT) * 100;
    const utilizationPct = (row.crushedMmt / row.harvestedMmt) * 100;
    const isSurplus = row.harvestedMmt >= HARVEST_CRUSH_BASELINE_MMT;
    return {
      season: row.season,
      harvestedMmt: row.harvestedMmt,
      crushedMmt: row.crushedMmt,
      harvestDevPct: Number(harvestDevPct.toFixed(2)),
      crushDevPct: Number(crushDevPct.toFixed(2)),
      utilizationPct: Number(utilizationPct.toFixed(1)),
      status: isSurplus ? 'Surplus (> 85 MMT)' : 'Deficit (< 85 MMT)',
      isSurplus: isSurplus,
      eventLabel: row.eventLabel,
      notes: row.notes,
      highlight: row.highlight || null
    };
  });

  // --------------------------------------------------------------------------
  // AUTHENTIC MAHARASHTRA SUGAR MILLS & GEOGRAPHIC PLOTS
  // --------------------------------------------------------------------------
  const SUGAR_MILLS = [
    {
      millId: 'MILL-KOP-01',
      name: 'Shree Datta SSK Ltd., Shirol (Kolhapur)',
      shortName: 'Shree Datta SSK, Shirol',
      district: 'Kolhapur',
      zone: 'Kolhapur Zone',
      lat: 16.7325,
      lng: 74.6042,
      capacityTcd: 9000,
      distilleryKlpd: 120,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 12.35,
      corridor: 'NH-166 / SH-192 Panchganga Corridor'
    },
    {
      millId: 'MILL-SAN-02',
      name: 'Rajarambapu Patil SSK Ltd., Sakharale (Sangli)',
      shortName: 'Rajarambapu Patil SSK, Sakharale',
      district: 'Sangli',
      zone: 'Kolhapur Zone',
      lat: 17.0642,
      lng: 74.2981,
      capacityTcd: 7500,
      distilleryKlpd: 105,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 12.10,
      corridor: 'NH-48 Pune-Bengaluru Highway'
    },
    {
      millId: 'MILL-PUN-03',
      name: 'The Malegaon SSK Ltd., Baramati (Pune)',
      shortName: 'Malegaon SSK, Baramati',
      district: 'Pune',
      zone: 'Pune Zone',
      lat: 18.1518,
      lng: 74.5029,
      capacityTcd: 8500,
      distilleryKlpd: 150,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 11.65,
      corridor: 'SH-61 Nira Left Bank Canal Route'
    },
    {
      millId: 'MILL-SAT-04',
      name: 'Sahyadri SSK Ltd., Yeshwantnagar, Karad (Satara)',
      shortName: 'Sahyadri SSK, Karad',
      district: 'Satara',
      zone: 'Kolhapur Zone',
      lat: 17.3284,
      lng: 74.1856,
      capacityTcd: 8000,
      distilleryKlpd: 90,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 11.95,
      corridor: 'NH-48 / SH-141 Koyna-Krishna Belt'
    },
    {
      millId: 'MILL-SOL-05',
      name: 'Vithalrao Shinde SSK Ltd., Pimpalner, Madha (Solapur)',
      shortName: 'Vithalrao Shinde SSK, Madha',
      district: 'Solapur',
      zone: 'Pune Zone',
      lat: 18.0321,
      lng: 75.3114,
      capacityTcd: 11000,
      distilleryKlpd: 150,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 11.15,
      corridor: 'NH-65 Pune-Solapur Ujjani Corridor'
    },
    {
      millId: 'MILL-AHM-06',
      name: 'Padmashri Dr. Vitthalrao Vikhe Patil SSK, Pravaranagar (Ahilyanagar)',
      shortName: 'Pravara SSK, Pravaranagar',
      district: 'Ahilyanagar',
      zone: 'Ahmednagar Zone',
      lat: 19.5761,
      lng: 74.4712,
      capacityTcd: 6500,
      distilleryKlpd: 80,
      baseFrpPerMt: 3400,
      avgRecoveryPct: 11.30,
      corridor: 'SH-44 Nashik-Ahilyanagar Godavari Belt'
    }
  ];

  // Preset Maharashtra Farmer Plot Clusters with Real Coordinates & Weather Profiles
  const PLOT_LOCATIONS = [
    {
      id: 'PLOT-KOP-KARVEER',
      label: 'Karveer Taluka, Kolhapur (Gat No. 142/B, Panchganga Bank)',
      district: 'Kolhapur',
      lat: 16.6912,
      lng: 74.2448,
      soilType: 'Deep Alluvial & Medium Black Soil',
      weather: {
        currentTempC: 29.4,
        condition: 'Partly Cloudy & Humid',
        humidityPct: 68,
        windKmh: 14,
        rainProbPct: 25,
        soilStatus: 'Firm — Ideal for 25T Multi-Axle Truck',
        advisory: 'Dry harvest window through Friday; afternoon isolated shower risk on Day 3.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'sun-cloud', highC: 30, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Fri (Oct 16)', icon: 'sun', highC: 31, lowC: 20, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sat (Oct 17)', icon: 'rain-light', highC: 28, lowC: 21, rainMm: 8.5, fieldState: 'Damp Headlands' },
          { day: 'Sun (Oct 18)', icon: 'sun-cloud', highC: 29, lowC: 20, rainMm: 1.2, fieldState: 'Firming Fast' }
        ]
      }
    },
    {
      id: 'PLOT-SAN-WALWA',
      label: 'Walwa Taluka, Islampur, Sangli (Gat No. 88/A, Krishna Canal)',
      district: 'Sangli',
      lat: 17.0489,
      lng: 74.2614,
      soilType: 'Rich Black Vertisol (Regur)',
      weather: {
        currentTempC: 31.2,
        condition: 'Clear Sky & Warm',
        humidityPct: 54,
        windKmh: 16,
        rainProbPct: 10,
        soilStatus: 'Dry & Compacted — High Traction',
        advisory: 'Zero rain interruption expected over next 96 hours; prioritize early morning harvest.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'sun', highC: 32, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Fri (Oct 16)', icon: 'sun', highC: 32, lowC: 20, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sat (Oct 17)', icon: 'sun-cloud', highC: 30, lowC: 21, rainMm: 0.5, fieldState: 'Optimal Dry' },
          { day: 'Sun (Oct 18)', icon: 'sun', highC: 31, lowC: 19, rainMm: 0.0, fieldState: 'Optimal Dry' }
        ]
      }
    },
    {
      id: 'PLOT-PUN-BARAMATI',
      label: 'Baramati Taluka, Malegaon Bk, Pune (Gat No. 319, Nira Canal)',
      district: 'Pune',
      lat: 18.1654,
      lng: 74.5762,
      soilType: 'Medium Black Calcareous Soil',
      weather: {
        currentTempC: 32.6,
        condition: 'Sunny & Dry',
        humidityPct: 44,
        windKmh: 18,
        rainProbPct: 5,
        soilStatus: 'Dry — Fast In-Field Loading',
        advisory: 'High afternoon evapotranspiration (+1.4°C El Niño anomaly); ship within 10 hrs of cutting.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'sun', highC: 33, lowC: 20, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Fri (Oct 16)', icon: 'sun', highC: 34, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sat (Oct 17)', icon: 'sun', highC: 33, lowC: 20, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sun (Oct 18)', icon: 'sun-cloud', highC: 32, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' }
        ]
      }
    },
    {
      id: 'PLOT-SAT-KARAD',
      label: 'Karad Taluka, Umbraj, Satara (Gat No. 204, Koyna River Belt)',
      district: 'Satara',
      lat: 17.3941,
      lng: 74.1018,
      soilType: 'Heavy Clay Loam Vertisol',
      weather: {
        currentTempC: 27.8,
        condition: 'Overcast with Post-Monsoon Shower',
        humidityPct: 79,
        windKmh: 12,
        rainProbPct: 65,
        soilStatus: 'Soft Field Edges — Tractor Double-Trolley Advised',
        advisory: '18 mm rainfall forecast on Day 2; stage heavy trucks on tarmac road & shuttle via tractor.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'rain-light', highC: 28, lowC: 21, rainMm: 6.4, fieldState: 'Soft / Damp' },
          { day: 'Fri (Oct 16)', icon: 'rain-heavy', highC: 26, lowC: 20, rainMm: 18.2, fieldState: 'Muddy Vertisol' },
          { day: 'Sat (Oct 17)', icon: 'sun-cloud', highC: 28, lowC: 20, rainMm: 2.0, fieldState: 'Draining' },
          { day: 'Sun (Oct 18)', icon: 'sun', highC: 30, lowC: 19, rainMm: 0.0, fieldState: 'Firming' }
        ]
      }
    },
    {
      id: 'PLOT-SOL-PANDHARPUR',
      label: 'Pandharpur Taluka, Karkamb, Solapur (Gat No. 512, Bhima Basin)',
      district: 'Solapur',
      lat: 17.8615,
      lng: 75.2912,
      soilType: 'Medium Black Cotton Soil',
      weather: {
        currentTempC: 34.1,
        condition: 'Hot & Arid Breeze',
        humidityPct: 38,
        windKmh: 21,
        rainProbPct: 5,
        soilStatus: 'Hard Dry Ground — Unrestricted Access',
        advisory: 'Elevated heat (34°C); cover harvested cane bundles with green tops to prevent Brix concentration & dextran rise.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'sun', highC: 34, lowC: 22, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Fri (Oct 16)', icon: 'sun', highC: 35, lowC: 22, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sat (Oct 17)', icon: 'sun', highC: 34, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sun (Oct 18)', icon: 'sun', highC: 34, lowC: 21, rainMm: 0.0, fieldState: 'Optimal Dry' }
        ]
      }
    },
    {
      id: 'PLOT-AHM-RAHURI',
      label: 'Rahuri Taluka, Deolali Pravara, Ahilyanagar (Gat No. 76, Mula Command)',
      district: 'Ahilyanagar',
      lat: 19.4318,
      lng: 74.6145,
      soilType: 'Deep Black Godavari Basin Soil',
      weather: {
        currentTempC: 31.8,
        condition: 'Mostly Sunny',
        humidityPct: 48,
        windKmh: 15,
        rainProbPct: 15,
        soilStatus: 'Firm — All Fleet Types Cleared',
        advisory: 'Favorable dry harvesting window; night temperatures dropping to 19°C boosting sucrose Pol %.',
        forecast: [
          { day: 'Thu (Oct 15)', icon: 'sun', highC: 32, lowC: 19, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Fri (Oct 16)', icon: 'sun-cloud', highC: 31, lowC: 20, rainMm: 1.5, fieldState: 'Optimal Dry' },
          { day: 'Sat (Oct 17)', icon: 'sun', highC: 32, lowC: 19, rainMm: 0.0, fieldState: 'Optimal Dry' },
          { day: 'Sun (Oct 18)', icon: 'sun', highC: 33, lowC: 19, rainMm: 0.0, fieldState: 'Optimal Dry' }
        ]
      }
    }
  ];

  // Haversine Road Distance & Transit Calculator
  function calculateRouteMetrics(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    // Apply 1.29x rural-to-state-highway winding factor (minimum 6.5 km for same-taluka haul)
    const roadKm = Math.max(6.5, Number((straightKm * 1.29).toFixed(1)));
    // Average loaded cane carrier speed ~28 km/h + 18 mins field/weighbridge staging
    const transitMins = Math.round((roadKm / 28) * 60 + 18);
    const hours = Math.floor(transitMins / 60);
    const mins = transitMins % 60;
    const formattedTime = hours > 0 ? hours + 'h ' + mins + 'm' : mins + ' mins';
    // Benchmark transport rate in Maharashtra: ₹260 base + ₹9.8 per km per MT
    const suggestedRatePerMt = Math.round(240 + roadKm * 8.5);
    return {
      roadKm: roadKm,
      transitMins: transitMins,
      formattedTime: formattedTime,
      suggestedRatePerMt: suggestedRatePerMt
    };
  }

  return {
    ENSO_BASELINE_RULES: ENSO_BASELINE_RULES,
    ENSO_DATA: ENSO_DATA,
    RAINFALL_BASELINE_MM: RAINFALL_BASELINE_MM,
    RAINFALL_DATA: RAINFALL_DATA,
    SUGAR_BASELINE_LMT: SUGAR_BASELINE_LMT,
    SUGAR_DATA: SUGAR_DATA,
    ETHANOL_BASELINE_CR_L: ETHANOL_BASELINE_CR_L,
    ETHANOL_DATA: ETHANOL_DATA,
    HARVEST_CRUSH_BASELINE_MMT: HARVEST_CRUSH_BASELINE_MMT,
    HARVEST_CRUSH_DATA: HARVEST_CRUSH_DATA,
    SUGAR_MILLS: SUGAR_MILLS,
    PLOT_LOCATIONS: PLOT_LOCATIONS,
    calculateRouteMetrics: calculateRouteMetrics
  };
})();
