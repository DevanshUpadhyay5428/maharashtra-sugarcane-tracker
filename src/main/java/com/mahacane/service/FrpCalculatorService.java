package com.mahacane.service;

import com.mahacane.model.WeighbridgeBatch;

/**
 * Service for computing Statutory Fair & Remunerative Price (FRP),
 * Commercial Cane Sugar (CCS / Recovery %) using official VSI formulas,
 * and quality adjustments (Dextran & Reducing Sugars penalties/bonuses).
 */
public class FrpCalculatorService {

    public WeighbridgeBatch calculatePricing(WeighbridgeBatch input) {
        double grossMt = Math.max(0.0, input.getGrossWeightMt() != null ? input.getGrossWeightMt() : 0.0);
        double tareMt = Math.max(0.0, input.getTareWeightMt() != null ? input.getTareWeightMt() : 0.0);
        double rawCaneMt = Math.max(0.0, Math.round((grossMt - tareMt) * 1000.0) / 1000.0);

        double trashPct = Math.min(25.0, Math.max(0.0, input.getTrashDeductionPct() != null ? input.getTrashDeductionPct() : 0.0));
        double trashDeductionMt = Math.round(((rawCaneMt * trashPct) / 100.0) * 1000.0) / 1000.0;
        double netPayableMt = Math.max(0.0, Math.round((rawCaneMt - trashDeductionMt) * 1000.0) / 1000.0);
        double netPayableQuintals = Math.round(netPayableMt * 10.0 * 100.0) / 100.0;

        double polPct = Math.max(5.0, Math.min(20.0, input.getPolPct() != null ? input.getPolPct() : 13.8));
        double brixPct = Math.max(polPct + 0.5, Math.min(26.0, input.getBrixPct() != null ? input.getBrixPct() : 20.2));
        double purityPct = Math.round(((polPct / brixPct) * 100.0) * 100.0) / 100.0;

        // Official VSI / Maharashtra Sugar Commissionerate Commercial Cane Sugar formula:
        // Recovery % = (Pol% - 0.4 * (Brix% - Pol%)) * 0.74
        double estRecoveryPct = Math.max(7.5, Math.round(((polPct - 0.4 * (brixPct - polPct)) * 0.74) * 100.0) / 100.0);

        double reducingSugarsPct = Math.max(0.1, input.getReducingSugarsPct() != null ? input.getReducingSugarsPct() : 0.42);
        double dextranPpm = Math.max(20.0, input.getDextranPpm() != null ? input.getDextranPpm() : 160.0);
        double baseFrpPerMt = Math.max(2500.0, input.getBaseFrpPerMt() != null ? input.getBaseFrpPerMt() : 3400.0);

        // FRP Premium: Base FRP at 10.25% recovery.
        // Each +0.1% above 10.25% earns +₹33.20/MT
        double recoveryDiff = estRecoveryPct - 10.25;
        double recoveryPremiumPerMt = Math.round((recoveryDiff * 10.0 * 33.20) * 100.0) / 100.0;

        // Quality freshness bonus vs staleness penalty
        double qualityAdjPerMt = 0.0;
        if (dextranPpm <= 150.0 && reducingSugarsPct <= 0.40) {
            qualityAdjPerMt = 50.0; // Fresh harvest cut-to-crush (<12h) sucrose preservation bonus
        } else if (dextranPpm > 300.0 || reducingSugarsPct > 0.65) {
            double excessDextran = Math.max(0.0, dextranPpm - 250.0);
            qualityAdjPerMt = -Math.min(180.0, Math.round(excessDextran * 0.25 + (reducingSugarsPct - 0.5) * 60.0));
        }

        double finalRatePerMt = Math.max(2910.0, Math.round((baseFrpPerMt + recoveryPremiumPerMt + qualityAdjPerMt) * 100.0) / 100.0);
        double totalPayableInr = Math.round((netPayableMt * finalRatePerMt) * 100.0) / 100.0;

        WeighbridgeBatch result = new WeighbridgeBatch();
        result.setTripId(input.getTripId());
        result.setFarmerName(input.getFarmerName());
        result.setCaneVariety(input.getCaneVariety());
        result.setGrossWeightMt(grossMt);
        result.setTareWeightMt(tareMt);
        result.setRawCaneMt(rawCaneMt);
        result.setTrashDeductionPct(trashPct);
        result.setTrashDeductionMt(trashDeductionMt);
        result.setNetPayableMt(netPayableMt);
        result.setNetPayableQuintals(netPayableQuintals);
        result.setPolPct(polPct);
        result.setBrixPct(brixPct);
        result.setPurityPct(purityPct);
        result.setEstimatedRecoveryPct(estRecoveryPct);
        result.setReducingSugarsPct(reducingSugarsPct);
        result.setDextranPpm(dextranPpm);
        result.setBaseFrpPerMt(baseFrpPerMt);
        result.setRecoveryPremiumPerMt(recoveryPremiumPerMt);
        result.setQualityAdjPerMt(qualityAdjPerMt);
        result.setFinalRatePerMt(finalRatePerMt);
        result.setTotalPayableInr(totalPayableInr);

        return result;
    }
}
