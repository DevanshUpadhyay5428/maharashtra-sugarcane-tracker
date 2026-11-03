package com.mahacane.service;

import com.mahacane.model.Bid;
import com.mahacane.model.RouteMetrics;
import com.mahacane.model.Trip;
import com.mahacane.repository.DataStore;

import java.util.List;

/**
 * Service managing farmer cane transport bookings, route metrics, and logistics bidding.
 */
public class TripService {

    private final DataStore dataStore = DataStore.getInstance();
    private final RouteService routeService = new RouteService();

    public List<Trip> getAllTrips() {
        return dataStore.getTrips();
    }

    public Trip getTripById(String tripId) {
        return dataStore.findTripById(tripId);
    }

    public Trip createTrip(Trip input) {
        if (input.getPlotLat() != null && input.getPlotLng() != null &&
            input.getMillLat() != null && input.getMillLng() != null) {
            RouteMetrics metrics = routeService.calculateMetrics(
                input.getPlotLat(), input.getPlotLng(),
                input.getMillLat(), input.getMillLng()
            );
            input.setDistanceKm(metrics.getRoadKm());
            input.setTransitMins(metrics.getTransitMins());
            input.setFormattedTransit(metrics.getFormattedTime());
            input.setHighwayCorridor(metrics.getHighwayCorridor());
        }

        if (input.getStatus() == null || input.getStatus().isEmpty()) {
            input.setStatus("open");
        }

        dataStore.addTrip(input);
        return input;
    }

    public boolean awardBid(String tripId, String bidId) {
        return dataStore.awardTripBid(tripId, bidId);
    }

    public boolean submitBid(String tripId, Bid bid) {
        return dataStore.submitTransporterBid(tripId, bid);
    }
}
