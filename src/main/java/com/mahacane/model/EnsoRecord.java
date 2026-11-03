package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing Pacific Climate Anomaly (ENSO) Oceanic Niño Index (ONI).
 */
public class EnsoRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private int year;
    private double oniPeak;
    private String statusBadge;
    private String phaseType;
    private String regionalCorrelation;

    public EnsoRecord() {}

    public EnsoRecord(int year, double oniPeak, String statusBadge, String phaseType, String regionalCorrelation) {
        this.year = year;
        this.oniPeak = oniPeak;
        this.statusBadge = statusBadge;
        this.phaseType = phaseType;
        this.regionalCorrelation = regionalCorrelation;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getOniPeak() { return oniPeak; }
    public void setOniPeak(double oniPeak) { this.oniPeak = oniPeak; }

    public String getStatusBadge() { return statusBadge; }
    public void setStatusBadge(String statusBadge) { this.statusBadge = statusBadge; }

    public String getPhaseType() { return phaseType; }
    public void setPhaseType(String phaseType) { this.phaseType = phaseType; }

    public String getRegionalCorrelation() { return regionalCorrelation; }
    public void setRegionalCorrelation(String regionalCorrelation) { this.regionalCorrelation = regionalCorrelation; }
}
