package com.mahacane.service;

import com.mahacane.model.RouteMetrics;

/**
 * Service for calculating GIS routes, Haversine great-circle distances,
 * and realistic sugarcane transport transit times along Maharashtra corridors.
 */
public class RouteService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double WINDING_FACTOR = 1.28; // Rural sugarcane terrain winding multiplier
    private static final double AVERAGE_TRUCK_SPEED_KMH = 28.0; // Cane-loaded truck/tractor average speed

    public RouteMetrics calculateMetrics(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        double haversineKm = Math.round((EARTH_RADIUS_KM * c) * 10.0) / 10.0;
        double roadKm = Math.round((haversineKm * WINDING_FACTOR) * 10.0) / 10.0;

        int transitMins = Math.max(15, (int) Math.round((roadKm / AVERAGE_TRUCK_SPEED_KMH) * 60.0));
        int hours = transitMins / 60;
        int mins = transitMins % 60;
        String formattedTime = (hours > 0 ? hours + "h " : "") + mins + "m";

        String corridor = determineCorridor(lat1, lon1, lat2, lon2);

        return new RouteMetrics(haversineKm, roadKm, transitMins, formattedTime, corridor);
    }

    private String determineCorridor(double lat1, double lon1, double lat2, double lon2) {
        double midLat = (lat1 + lat2) / 2.0;
        double midLon = (lon1 + lon2) / 2.0;

        if (midLat < 16.9) {
            return "NH-166 / SH-192 Panchganga Basin Corridor (Kolhapur)";
        } else if (midLat >= 16.9 && midLat < 17.2) {
            return "NH-48 Krishna River Agri-Highway (Sangli-Islampur)";
        } else if (midLat >= 17.2 && midLat < 17.6) {
            return "NH-48 Koyna-Krishna Confluence Link (Satara-Karad)";
        } else if (midLat >= 17.6 && midLat < 18.0) {
            return "NH-65 / SH-77 Bhima Valley Freight Corridor (Solapur)";
        } else {
            return "SH-61 Nira Left Canal Agri Corridor (Pune-Baramati)";
        }
    }
}
