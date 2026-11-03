package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing a Sugar Mill Weighbridge entry & Laboratory Quality FRP Settlement.
 */
public class WeighbridgeBatch implements Serializable {
    private static final long serialVersionUID = 1L;

    private String batchId;
    private String tripId;
    private String farmerName;
    private String caneVariety;
    private Double grossWeightMt;
    private Double tareWeightMt;
    private Double rawCaneMt;
    private Double trashDeductionPct;
    private Double trashDeductionMt;
    private Double netPayableMt;
    private Double netPayableQuintals;
    private Double polPct;
    private Double brixPct;
    private Double purityPct;
    private Double estimatedRecoveryPct;
    private Double reducingSugarsPct;
    private Double dextranPpm;
    private Double baseFrpPerMt;
    private Double recoveryPremiumPerMt;
    private Double qualityAdjPerMt;
    private Double finalRatePerMt;
    private Double totalPayableInr;
    private String timestamp;

    public WeighbridgeBatch() {}

    // Getters and Setters
    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getCaneVariety() { return caneVariety; }
    public void setCaneVariety(String caneVariety) { this.caneVariety = caneVariety; }

    public Double getGrossWeightMt() { return grossWeightMt; }
    public void setGrossWeightMt(Double grossWeightMt) { this.grossWeightMt = grossWeightMt; }

    public Double getTareWeightMt() { return tareWeightMt; }
    public void setTareWeightMt(Double tareWeightMt) { this.tareWeightMt = tareWeightMt; }

    public Double getRawCaneMt() { return rawCaneMt; }
    public void setRawCaneMt(Double rawCaneMt) { this.rawCaneMt = rawCaneMt; }

    public Double getTrashDeductionPct() { return trashDeductionPct; }
    public void setTrashDeductionPct(Double trashDeductionPct) { this.trashDeductionPct = trashDeductionPct; }

    public Double getTrashDeductionMt() { return trashDeductionMt; }
    public void setTrashDeductionMt(Double trashDeductionMt) { this.trashDeductionMt = trashDeductionMt; }

    public Double getNetPayableMt() { return netPayableMt; }
    public void setNetPayableMt(Double netPayableMt) { this.netPayableMt = netPayableMt; }

    public Double getNetPayableQuintals() { return netPayableQuintals; }
    public void setNetPayableQuintals(Double netPayableQuintals) { this.netPayableQuintals = netPayableQuintals; }

    public Double getPolPct() { return polPct; }
    public void setPolPct(Double polPct) { this.polPct = polPct; }

    public Double getBrixPct() { return brixPct; }
    public void setBrixPct(Double brixPct) { this.brixPct = brixPct; }

    public Double getPurityPct() { return purityPct; }
    public void setPurityPct(Double purityPct) { this.purityPct = purityPct; }

    public Double getEstimatedRecoveryPct() { return estimatedRecoveryPct; }
    public void setEstimatedRecoveryPct(Double estimatedRecoveryPct) { this.estimatedRecoveryPct = estimatedRecoveryPct; }

    public Double getReducingSugarsPct() { return reducingSugarsPct; }
    public void setReducingSugarsPct(Double reducingSugarsPct) { this.reducingSugarsPct = reducingSugarsPct; }

    public Double getDextranPpm() { return dextranPpm; }
    public void setDextranPpm(Double dextranPpm) { this.dextranPpm = dextranPpm; }

    public Double getBaseFrpPerMt() { return baseFrpPerMt; }
    public void setBaseFrpPerMt(Double baseFrpPerMt) { this.baseFrpPerMt = baseFrpPerMt; }

    public Double getRecoveryPremiumPerMt() { return recoveryPremiumPerMt; }
    public void setRecoveryPremiumPerMt(Double recoveryPremiumPerMt) { this.recoveryPremiumPerMt = recoveryPremiumPerMt; }

    public Double getQualityAdjPerMt() { return qualityAdjPerMt; }
    public void setQualityAdjPerMt(Double qualityAdjPerMt) { this.qualityAdjPerMt = qualityAdjPerMt; }

    public Double getFinalRatePerMt() { return finalRatePerMt; }
    public void setFinalRatePerMt(Double finalRatePerMt) { this.finalRatePerMt = finalRatePerMt; }

    public Double getTotalPayableInr() { return totalPayableInr; }
    public void setTotalPayableInr(Double totalPayableInr) { this.totalPayableInr = totalPayableInr; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
