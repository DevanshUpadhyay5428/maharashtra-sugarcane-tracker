package com.mahacane.service;

import com.mahacane.model.MassBalanceRecord;
import com.mahacane.model.WeighbridgeBatch;
import com.mahacane.repository.DataStore;

import java.util.List;

/**
 * Service managing Sugar Mill weighbridge intake, lab FRP settlement, and mass balance analytics.
 */
public class MillService {

    private final DataStore dataStore = DataStore.getInstance();
    private final FrpCalculatorService frpService = new FrpCalculatorService();

    public WeighbridgeBatch recordWeighbridgeBatch(WeighbridgeBatch input) {
        WeighbridgeBatch calculated = frpService.calculatePricing(input);
        dataStore.addWeighbridgeBatch(calculated);
        return calculated;
    }

    public List<WeighbridgeBatch> getWeighbridgeBatches() {
        return dataStore.getWeighbridgeBatches();
    }

    public List<MassBalanceRecord> getMassBalanceLedger() {
        return dataStore.getMassBalanceLedger();
    }

    public void upsertMassBalanceRecord(MassBalanceRecord record) {
        dataStore.upsertMassBalanceRecord(record);
    }

    public boolean deleteMassBalanceRecord(int year) {
        return dataStore.deleteMassBalanceRecord(year);
    }
}
