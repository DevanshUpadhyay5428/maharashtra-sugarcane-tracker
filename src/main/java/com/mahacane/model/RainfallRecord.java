package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing historical annual monsoon rainfall & agro-climatic impacts in Maharashtra.
 */
public class RainfallRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private int year;
    private double monsoonRainfallMm;
    private double departurePct;
    private String categoryBadge;
    private String categoryType;
    private String agroImpactSummary;

    public RainfallRecord() {}

    public RainfallRecord(int year, double monsoonRainfallMm, double departurePct, String categoryBadge, String categoryType, String agroImpactSummary) {
        this.year = year;
        this.monsoonRainfallMm = monsoonRainfallMm;
        this.departurePct = departurePct;
        this.categoryBadge = categoryBadge;
        this.categoryType = categoryType;
        this.agroImpactSummary = agroImpactSummary;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getMonsoonRainfallMm() { return monsoonRainfallMm; }
    public void setMonsoonRainfallMm(double monsoonRainfallMm) { this.monsoonRainfallMm = monsoonRainfallMm; }

    public double getDeparturePct() { return departurePct; }
    public void setDeparturePct(double departurePct) { this.departurePct = departurePct; }

    public String getCategoryBadge() { return categoryBadge; }
    public void setCategoryBadge(String categoryBadge) { this.categoryBadge = categoryBadge; }

    public String getCategoryType() { return categoryType; }
    public void setCategoryType(String categoryType) { this.categoryType = categoryType; }

    public String getAgroImpactSummary() { return agroImpactSummary; }
    public void setAgroImpactSummary(String agroImpactSummary) { this.agroImpactSummary = agroImpactSummary; }
}
