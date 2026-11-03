package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing computed geospatial route metrics between farmer plot and sugar mill.
 */
public class RouteMetrics implements Serializable {
    private static final long serialVersionUID = 1L;

    private double haversineKm;
    private double roadKm;
    private int transitMins;
    private String formattedTime;
    private String highwayCorridor;

    public RouteMetrics() {}

    public RouteMetrics(double haversineKm, double roadKm, int transitMins, String formattedTime, String highwayCorridor) {
        this.haversineKm = haversineKm;
        this.roadKm = roadKm;
        this.transitMins = transitMins;
        this.formattedTime = formattedTime;
        this.highwayCorridor = highwayCorridor;
    }

    public double getHaversineKm() { return haversineKm; }
    public void setHaversineKm(double haversineKm) { this.haversineKm = haversineKm; }

    public double getRoadKm() { return roadKm; }
    public void setRoadKm(double roadKm) { this.roadKm = roadKm; }

    public int getTransitMins() { return transitMins; }
    public void setTransitMins(int transitMins) { this.transitMins = transitMins; }

    public String getFormattedTime() { return formattedTime; }
    public void setFormattedTime(String formattedTime) { this.formattedTime = formattedTime; }

    public String getHighwayCorridor() { return highwayCorridor; }
    public void setHighwayCorridor(String highwayCorridor) { this.highwayCorridor = highwayCorridor; }
}
