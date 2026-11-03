package com.mahacane.repository;

import com.mahacane.model.*;
import com.mahacane.service.RouteService;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Thread-safe In-Memory Relational Data Repository for Maharashtra Sugarcane Supply Chain.
 * Pre-seeds realistic agro-climatic, logistics, and sugar mill operational data.
 */
public class DataStore {

    private static final DataStore INSTANCE = new DataStore();

    public static DataStore getInstance() {
        return INSTANCE;
    }

    private final Map<String, User> demoUsers = new ConcurrentHashMap<>();
    private final List<Trip> trips = new CopyOnWriteArrayList<>();
    private final List<WeighbridgeBatch> weighbridgeBatches = new CopyOnWriteArrayList<>();
    private final List<MassBalanceRecord> massBalanceLedger = new CopyOnWriteArrayList<>();
    private final List<SugarMill> sugarMills = new CopyOnWriteArrayList<>();
    private final List<EnsoRecord> ensoRecords = new CopyOnWriteArrayList<>();
    private final List<RainfallRecord> rainfallRecords = new CopyOnWriteArrayList<>();

    private volatile User currentUser = null;
    private volatile String activeRoute = "landing";
    private final RouteService routeService = new RouteService();

    private DataStore() {
        initSeedData();
    }

    public synchronized void initSeedData() {
        demoUsers.clear();
        trips.clear();
        weighbridgeBatches.clear();
        massBalanceLedger.clear();
        sugarMills.clear();
        ensoRecords.clear();
        rainfallRecords.clear();
        currentUser = null;
        activeRoute = "landing";

        // 1. Demo Users
        User farmer = new User("MH-FRM-1042", "farmer", "Rajendra Dattatray Patil", "+91 98224 51902", "Kolhapur");
        farmer.setTaluka("Karveer");
        farmer.setPlotId("PLOT-KOP-KARVEER");
        farmer.setPlotAddress("Gat No. 142/B, Panchganga River Bank, Karveer, Kolhapur");
        farmer.setPlotLat(16.6912);
        farmer.setPlotLng(74.2448);
        farmer.setCultivableAreaHa(4.5);
        farmer.setCaneVariety("Co 86032");
        demoUsers.put("farmer", farmer);

        User logistics = new User("MH-TRN-2088", "logistics", "Sahyadri Agro-Freight & Cane Carriers", "+91 94230 77814", "Sangli");
        logistics.setOperatorName("Vikramjit Shinde");
        logistics.setPermitNo("MH-WEST-CANE-8841");
        logistics.setVehicleRegNo("MH-09-CV-4821");
        logistics.setVehicleType("Heavy Cane Truck (25 MT)");
        logistics.setMaxPayloadMt(25.0);
        logistics.setRating(4.9);
        demoUsers.put("logistics", logistics);

        User mill = new User("MH-MILL-3001", "mill", "Shree Datta SSK Ltd., Shirol (Kolhapur)", "+91 2322 236551", "Kolhapur");
        mill.setOperatorName("Er. Pratapsinh Deshmukh (Chief Chemist & GM)");
        mill.setIemLicense("IEM-MH-COOP-1969-042");
        mill.setZone("Kolhapur Zone");
        mill.setMillId("MILL-KOP-01");
        mill.setCapacityTcd(9000);
        mill.setDistilleryKlpd(120);
        mill.setBaseFrpPerMt(3400.0);
        demoUsers.put("mill", mill);

        // 2. Sugar Mills
        sugarMills.add(new SugarMill("MILL-KOP-01", "Shree Datta SSK Ltd., Shirol (Kolhapur)", "Shirol", "Kolhapur", 16.7325, 74.6042, 9000, 120, 3400.0));
        sugarMills.add(new SugarMill("MILL-SAN-02", "Rajarambapu Patil SSK Ltd., Sakharale (Sangli)", "Walwa", "Sangli", 17.0642, 74.2981, 7500, 100, 3400.0));
        sugarMills.add(new SugarMill("MILL-PUN-03", "The Malegaon SSK Ltd., Baramati (Pune)", "Baramati", "Pune", 18.1518, 74.5029, 6000, 60, 3400.0));
        sugarMills.add(new SugarMill("MILL-SAT-04", "Sahyadri SSK Ltd., Yeshwantnagar, Karad (Satara)", "Karad", "Satara", 17.3284, 74.1856, 7500, 90, 3400.0));
        sugarMills.add(new SugarMill("MILL-SOL-05", "Vithalrao Shinde SSK Ltd., Pimpalner, Madha (Solapur)", "Madha", "Solapur", 18.0321, 75.3114, 11000, 150, 3400.0));

        // 3. Initial Trips & Bids
        RouteMetrics m1 = routeService.calculateMetrics(16.6912, 74.2448, 16.7325, 74.6042);
        Trip t1 = new Trip();
        t1.setTripId("TRIP-MH-901");
        t1.setFarmerId("MH-FRM-1042");
        t1.setFarmerName("Rajendra Dattatray Patil");
        t1.setPlotId("PLOT-KOP-KARVEER");
        t1.setPlotAddress("Gat No. 142/B, Panchganga Bank, Karveer, Kolhapur");
        t1.setDistrict("Kolhapur");
        t1.setPlotLat(16.6912);
        t1.setPlotLng(74.2448);
        t1.setTargetMillId("MILL-KOP-01");
        t1.setTargetMillName("Shree Datta SSK Ltd., Shirol (Kolhapur)");
        t1.setMillLat(16.7325);
        t1.setMillLng(74.6042);
        t1.setCaneVariety("Co 86032");
        t1.setCropType("Adsali (18-Month High Sucrose)");
        t1.setQuantityMt(48.0);
        t1.setHarvestDate("2026-10-16");
        t1.setHarvestWindow("06:00 AM – 10:00 AM (Fresh Morning Cut)");
        t1.setDistanceKm(m1.getRoadKm());
        t1.setTransitMins(m1.getTransitMins());
        t1.setFormattedTransit(m1.getFormattedTime());
        t1.setHighwayCorridor(m1.getHighwayCorridor());
        t1.setStatus("open");

        List<Bid> b1 = new ArrayList<>();
        b1.add(new Bid("BID-701", "MH-TRN-2088", "Sahyadri Agro-Freight & Cane Carriers", "2x Heavy Cane Trucks (25 MT each)", "MH-09-CV-4821", 25920.0, 540.0, 2.5, 4.9, "Mechanical grab loader included; GPS-tracked direct to Shirol Gate #2.", "pending"));
        b1.add(new Bid("BID-702", "MH-TRN-2094", "Panchganga Kisan Tractor Logistics", "3x Tractor Double-Trolley (16 MT each)", "MH-09-BX-1190", 27840.0, 580.0, 1.5, 4.7, "High-flotation tires safe for river-bank black soil plots.", "pending"));
        b1.add(new Bid("BID-703", "MH-TRN-2105", "Mahalaxmi Bulk Cane Movers", "Multi-Axle Cane Carrier + 16T Trolley", "MH-10-CR-7732", 24960.0, 520.0, 4.0, 4.6, "Lowest per-ton rate; requires firm headland road access.", "pending"));
        t1.setBids(b1);
        trips.add(t1);

        RouteMetrics m2 = routeService.calculateMetrics(17.0489, 74.2614, 17.0642, 74.2981);
        Trip t2 = new Trip();
        t2.setTripId("TRIP-MH-902");
        t2.setFarmerId("MH-FRM-1042");
        t2.setFarmerName("Rajendra Dattatray Patil");
        t2.setPlotId("PLOT-SAN-WALWA");
        t2.setPlotAddress("Gat No. 88/A, Krishna Canal, Walwa, Sangli");
        t2.setDistrict("Sangli");
        t2.setPlotLat(17.0489);
        t2.setPlotLng(74.2614);
        t2.setTargetMillId("MILL-SAN-02");
        t2.setTargetMillName("Rajarambapu Patil SSK Ltd., Sakharale (Sangli)");
        t2.setMillLat(17.0642);
        t2.setMillLng(74.2981);
        t2.setCaneVariety("CoM 0265 (Phule 265)");
        t2.setCropType("Pre-Seasonal (15-Month)");
        t2.setQuantityMt(32.0);
        t2.setHarvestDate("2026-10-17");
        t2.setHarvestWindow("07:00 AM – 11:00 AM");
        t2.setDistanceKm(m2.getRoadKm());
        t2.setTransitMins(m2.getTransitMins());
        t2.setFormattedTransit(m2.getFormattedTime());
        t2.setHighwayCorridor("NH-48 Islampur-Sakharale Link");
        t2.setStatus("awarded");
        t2.setAwardedBidId("BID-704");
        t2.setAwardedFareInr(10240.0);
        t2.setGatePassCode("GP-MH-902-SAK");

        List<Bid> b2 = new ArrayList<>();
        b2.add(new Bid("BID-704", "MH-TRN-2088", "Sahyadri Agro-Freight & Cane Carriers", "2x Tractor Double-Trolley (16 MT each)", "MH-10-AN-9045", 10240.0, 320.0, 1.0, 4.9, "Priority token slot confirmed at Sakharale Yard.", "accepted"));
        t2.setBids(b2);
        trips.add(t2);

        RouteMetrics m3 = routeService.calculateMetrics(18.1654, 74.5762, 18.1518, 74.5029);
        Trip t3 = new Trip();
        t3.setTripId("TRIP-MH-903");
        t3.setFarmerId("MH-FRM-1089");
        t3.setFarmerName("Sureshchandra Pawar");
        t3.setPlotId("PLOT-PUN-BARAMATI");
        t3.setPlotAddress("Gat No. 319, Nira Left Canal, Malegaon Bk, Baramati, Pune");
        t3.setDistrict("Pune");
        t3.setPlotLat(18.1654);
        t3.setPlotLng(74.5762);
        t3.setTargetMillId("MILL-PUN-03");
        t3.setTargetMillName("The Malegaon SSK Ltd., Baramati (Pune)");
        t3.setMillLat(18.1518);
        t3.setMillLng(74.5029);
        t3.setCaneVariety("Co 86032");
        t3.setCropType("Suru (12-Month Plant Cane)");
        t3.setQuantityMt(25.0);
        t3.setHarvestDate("2026-10-16");
        t3.setHarvestWindow("05:30 AM – 09:00 AM");
        t3.setDistanceKm(m3.getRoadKm());
        t3.setTransitMins(m3.getTransitMins());
        t3.setFormattedTransit(m3.getFormattedTime());
        t3.setHighwayCorridor("SH-61 Baramati-Nira Road");
        t3.setStatus("open");

        List<Bid> b3 = new ArrayList<>();
        b3.add(new Bid("BID-705", "MH-TRN-2112", "Nira Valley Cane Transporters", "Heavy Cane Truck (25 MT)", "MH-42-T-3318", 8750.0, 350.0, 2.0, 4.8, "Direct mill gate unloading with zero transshipment.", "pending"));
        t3.setBids(b3);
        trips.add(t3);

        // 4. Weighbridge Batches
        WeighbridgeBatch wb1 = new WeighbridgeBatch();
        wb1.setBatchId("WB-2026-8801");
        wb1.setTripId("TRIP-MH-902");
        wb1.setFarmerName("Rajendra Dattatray Patil");
        wb1.setCaneVariety("CoM 0265 (Phule 265)");
        wb1.setGrossWeightMt(41.80);
        wb1.setTareWeightMt(9.80);
        wb1.setRawCaneMt(32.00);
        wb1.setTrashDeductionPct(2.20);
        wb1.setTrashDeductionMt(0.704);
        wb1.setNetPayableMt(31.296);
        wb1.setNetPayableQuintals(312.96);
        wb1.setPolPct(14.20);
        wb1.setBrixPct(20.60);
        wb1.setPurityPct(88.92);
        wb1.setEstimatedRecoveryPct(11.85);
        wb1.setReducingSugarsPct(0.38);
        wb1.setDextranPpm(140.0);
        wb1.setBaseFrpPerMt(3400.0);
        wb1.setRecoveryPremiumPerMt(531.20);
        wb1.setQualityAdjPerMt(45.00);
        wb1.setFinalRatePerMt(3976.20);
        wb1.setTotalPayableInr(124439.15);
        wb1.setTimestamp("2026-10-15 09:42 AM");
        weighbridgeBatches.add(wb1);

        WeighbridgeBatch wb2 = new WeighbridgeBatch();
        wb2.setBatchId("WB-2026-8802");
        wb2.setTripId("TRIP-MH-903");
        wb2.setFarmerName("Sureshchandra Pawar");
        wb2.setCaneVariety("Co 86032");
        wb2.setGrossWeightMt(33.40);
        wb2.setTareWeightMt(8.40);
        wb2.setRawCaneMt(25.00);
        wb2.setTrashDeductionPct(1.80);
        wb2.setTrashDeductionMt(0.450);
        wb2.setNetPayableMt(24.550);
        wb2.setNetPayableQuintals(245.50);
        wb2.setPolPct(14.65);
        wb2.setBrixPct(21.00);
        wb2.setPurityPct(89.76);
        wb2.setEstimatedRecoveryPct(12.28);
        wb2.setReducingSugarsPct(0.31);
        wb2.setDextranPpm(110.0);
        wb2.setBaseFrpPerMt(3400.0);
        wb2.setRecoveryPremiumPerMt(673.96);
        wb2.setQualityAdjPerMt(60.00);
        wb2.setFinalRatePerMt(4133.96);
        wb2.setTotalPayableInr(101488.72);
        wb2.setTimestamp("2026-10-15 11:15 AM");
        weighbridgeBatches.add(wb2);

        // 5. Mass Balance Ledger
        massBalanceLedger.add(new MassBalanceRecord(2018, 1120000, 126500, 14200, 324800, 49200));
        massBalanceLedger.add(new MassBalanceRecord(2019, 890000, 98800, 16800, 258100, 39600));
        massBalanceLedger.add(new MassBalanceRecord(2020, 1185000, 131500, 24500, 343650, 52100));
        massBalanceLedger.add(new MassBalanceRecord(2021, 1340000, 146000, 31200, 388600, 58900));
        massBalanceLedger.add(new MassBalanceRecord(2022, 1490000, 158200, 38400, 432100, 64800));
        massBalanceLedger.add(new MassBalanceRecord(2023, 1260000, 141100, 22900, 365400, 54200));
        massBalanceLedger.add(new MassBalanceRecord(2024, 1045000, 115900, 27600, 303050, 45900));
        massBalanceLedger.add(new MassBalanceRecord(2025, 1295000, 143800, 35800, 375550, 56400));
        massBalanceLedger.add(new MassBalanceRecord(2026, 1365000, 151500, 41200, 395850, 59500));

        // 6. ENSO Records
        ensoRecords.add(new EnsoRecord(2015, 2.6, "Super El Niño", "el-nino-super", "Severe southwest monsoon failure (-24.0% state rainfall deficit); acute reservoir depletion in Marathwada & Solapur triggered massive 2016-17 cane acreage collapse."));
        ensoRecords.add(new EnsoRecord(2016, -0.8, "Weak La Niña", "la-nina-weak", "Monsoon recovery replenished Koyna, Ujjani & Warna dams, stabilizing seed nurseries across southern Maharashtra."));
        ensoRecords.add(new EnsoRecord(2017, -1.0, "Moderate La Niña", "la-nina-mod", "Adequate precipitation supported bumper Adsali plantings; Kolhapur recovery reached 12.18%."));
        ensoRecords.add(new EnsoRecord(2018, 0.9, "Weak El Niño", "el-nino-weak", "Late dry spell in August-September; Ahmednagar and Solapur reported stunted stalk heights."));
        ensoRecords.add(new EnsoRecord(2019, 0.8, "El Niño Transition", "el-nino-mod", "Historic Panchganga river floods in August submerged 1.2 lakh Ha cane; followed by torrential late retreating monsoon."));
        ensoRecords.add(new EnsoRecord(2020, -1.3, "Moderate La Niña", "la-nina-mod", "Statewide abundant monsoon (+21.4%); groundwater tables rose to peak levels across western Maharashtra."));
        ensoRecords.add(new EnsoRecord(2021, -1.0, "Triple-Dip La Niña (Y1)", "la-nina-mod", "Exceptional cane biomass output; record crushing season (1,320 lakh MT cane crushed)."));
        ensoRecords.add(new EnsoRecord(2022, -1.1, "Triple-Dip La Niña (Y2)", "la-nina-mod", "All-time record Maharashtra sugar production of 137.3 lakh MT and peak ethanol output."));
        ensoRecords.add(new EnsoRecord(2023, 2.0, "Super El Niño", "el-nino-super", "August 2023 was the driest August in 122 years (-58% deficit); acute water rationing in Marathwada."));
        ensoRecords.add(new EnsoRecord(2024, -0.6, "Weak La Niña Emergence", "la-nina-weak", "Above-average retreating monsoon replenished critical southern reservoirs (Koyna & Radhanagari)."));
        ensoRecords.add(new EnsoRecord(2025, -1.2, "Moderate La Niña", "la-nina-mod", "Favorable monsoon distribution; Adsali and Pre-seasonal yields rebounded by +14.2%."));
        ensoRecords.add(new EnsoRecord(2026, -0.4, "Neutral-Cool Phase", "neutral", "Normal pre-monsoon precipitation; optimal vegetative tillering and high brix retention."));

        // 7. Rainfall Records
        rainfallRecords.add(new RainfallRecord(2012, 856.4, -15.1, "Deficient", "deficit", "Monsoon pause during critical grand growth phase; Marathwada faced acute fodder and water distress."));
        rainfallRecords.add(new RainfallRecord(2013, 1248.6, 23.8, "Excess", "excess", "Abundant widespread monsoon; Kolhapur and Sangli barrages maintained full storage."));
        rainfallRecords.add(new RainfallRecord(2014, 882.1, -12.6, "Deficient", "deficit", "El Niño precursor conditions; late sowing and reduced tillering across central belt."));
        rainfallRecords.add(new RainfallRecord(2015, 766.8, -24.0, "Deficient (Drought)", "drought", "Historic statewide drought; Marathwada & Solapur cane crushing halted early in 48 mills."));
        rainfallRecords.add(new RainfallRecord(2016, 1074.2, 6.5, "Normal", "normal", "Steady monsoon restored Krishna basin aquifers; high planting survival rate."));
        rainfallRecords.add(new RainfallRecord(2017, 1022.5, 1.4, "Normal", "normal", "Equable rainfall distribution across cane clusters; peak sugar recovery recorded."));
        rainfallRecords.add(new RainfallRecord(2018, 932.0, -7.6, "Normal (Deficit Bias)", "deficit-bias", "Mild deficit in Marathwada, but Kolhapur/Satara canal irrigation cushioned impacts."));
        rainfallRecords.add(new RainfallRecord(2019, 1362.4, 35.1, "Extreme Excess (Floods)", "excess", "Historic Krishna-Panchganga August inundation; waterlogged fields delayed cane harvesting."));
        rainfallRecords.add(new RainfallRecord(2020, 1224.8, 21.4, "Excess", "excess", "Favorable filling of 98% state reservoirs; expanded ratoon and Adsali plantings."));
        rainfallRecords.add(new RainfallRecord(2021, 1184.2, 17.4, "Excess", "excess", "Consecutive surplus year; set stage for record 2021-22 crushing operations."));
        rainfallRecords.add(new RainfallRecord(2022, 1198.5, 18.8, "Excess", "excess", "Extended late monsoon delayed factory start dates by 3 weeks, but yields were record high."));
        rainfallRecords.add(new RainfallRecord(2023, 868.0, -13.9, "Deficient", "deficit", "Dry August stressed rain-fed cane belts; prompted state curb on B-Heavy molasses diversion."));
        rainfallRecords.add(new RainfallRecord(2024, 1142.0, 13.2, "Excess", "excess", "Post-monsoon recharge enabled aggressive 2025-26 nursery sowing."));
        rainfallRecords.add(new RainfallRecord(2025, 1115.6, 10.6, "Normal-Excess", "normal", "Well-spaced spells fostered high cane stalk density and superior sucrose buildup."));
        rainfallRecords.add(new RainfallRecord(2026, 1045.0, 3.6, "Normal (Forecast)", "normal", "Optimal agro-climatic window for cut-to-crush operations without unseasonal delays."));
    }

    // Accessors & Operations
    public Map<String, User> getDemoUsers() { return Collections.unmodifiableMap(demoUsers); }
    public List<Trip> getTrips() { return trips; }
    public List<WeighbridgeBatch> getWeighbridgeBatches() { return weighbridgeBatches; }
    public List<MassBalanceRecord> getMassBalanceLedger() { return massBalanceLedger; }
    public List<SugarMill> getSugarMills() { return sugarMills; }
    public List<EnsoRecord> getEnsoRecords() { return ensoRecords; }
    public List<RainfallRecord> getRainfallRecords() { return rainfallRecords; }

    public User getCurrentUser() { return currentUser; }
    public void setCurrentUser(User user) { this.currentUser = user; }

    public String getActiveRoute() { return activeRoute; }
    public void setActiveRoute(String activeRoute) { this.activeRoute = activeRoute; }

    public synchronized Trip findTripById(String tripId) {
        for (Trip t : trips) {
            if (t.getTripId().equalsIgnoreCase(tripId)) return t;
        }
        return null;
    }

    public synchronized void addTrip(Trip trip) {
        if (trip.getTripId() == null || trip.getTripId().isEmpty()) {
            trip.setTripId("TRIP-MH-" + (900 + trips.size() + 1));
        }
        trips.add(0, trip); // Insert at top
    }

    public synchronized boolean awardTripBid(String tripId, String bidId) {
        Trip trip = findTripById(tripId);
        if (trip == null) return false;

        Bid targetBid = null;
        for (Bid b : trip.getBids()) {
            if (b.getBidId().equalsIgnoreCase(bidId)) {
                b.setStatus("accepted");
                targetBid = b;
            } else {
                b.setStatus("rejected");
            }
        }

        if (targetBid != null) {
            trip.setStatus("awarded");
            trip.setAwardedBidId(targetBid.getBidId());
            trip.setAwardedFareInr(targetBid.getProposedFareInr());
            String tripSuffix = trip.getTripId().replace("TRIP-MH-", "");
            String millCode = trip.getTargetMillId() != null ? trip.getTargetMillId().replace("MILL-", "") : "GATE";
            trip.setGatePassCode("GP-MH-" + tripSuffix + "-" + millCode);
            return true;
        }
        return false;
    }

    public synchronized boolean submitTransporterBid(String tripId, Bid bid) {
        Trip trip = findTripById(tripId);
        if (trip == null) return false;

        if (bid.getBidId() == null || bid.getBidId().isEmpty()) {
            int totalBids = 0;
            for (Trip t : trips) totalBids += t.getBids().size();
            bid.setBidId("BID-" + (700 + totalBids + 1));
        }
        bid.setStatus("pending");
        trip.getBids().add(0, bid);
        return true;
    }

    public synchronized void addWeighbridgeBatch(WeighbridgeBatch batch) {
        if (batch.getBatchId() == null || batch.getBatchId().isEmpty()) {
            batch.setBatchId("WB-2026-" + (8800 + weighbridgeBatches.size() + 1));
        }
        if (batch.getTimestamp() == null || batch.getTimestamp().isEmpty()) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm a");
            batch.setTimestamp(sdf.format(new Date()));
        }
        weighbridgeBatches.add(0, batch);
    }

    public synchronized void upsertMassBalanceRecord(MassBalanceRecord record) {
        for (int i = 0; i < massBalanceLedger.size(); i++) {
            if (massBalanceLedger.get(i).getYear() == record.getYear()) {
                massBalanceLedger.set(i, record);
                return;
            }
        }
        massBalanceLedger.add(record);
        massBalanceLedger.sort(Comparator.comparingInt(MassBalanceRecord::getYear));
    }

    public synchronized boolean deleteMassBalanceRecord(int year) {
        return massBalanceLedger.removeIf(r -> r.getYear() == year);
    }
}
