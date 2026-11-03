package com.mahacane.service;

import com.mahacane.model.EnsoRecord;
import com.mahacane.model.RainfallRecord;
import com.mahacane.model.SugarMill;
import com.mahacane.repository.DataStore;

import java.util.List;

/**
 * Service providing Maharashtra macro agro-climatic datasets (ENSO, Rainfall, Mill locations).
 */
public class ClimateService {

    private final DataStore dataStore = DataStore.getInstance();

    public List<EnsoRecord> getEnsoRecords() {
        return dataStore.getEnsoRecords();
    }

    public List<RainfallRecord> getRainfallRecords() {
        return dataStore.getRainfallRecords();
    }

    public List<SugarMill> getSugarMills() {
        return dataStore.getSugarMills();
    }
}
