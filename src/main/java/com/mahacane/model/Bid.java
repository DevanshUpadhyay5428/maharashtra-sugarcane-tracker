package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing a transporter bid on a farmer's cane dispatch trip request.
 */
public class Bid implements Serializable {
    private static final long serialVersionUID = 1L;

    private String bidId;
    private String transporterId;
    private String transporterName;
    private String vehicleType;
    private String vehicleRegNo;
    private Double proposedFareInr;
    private Double ratePerMtInr;
    private Double etaPickupHrs;
    private Double rating;
    private String notes;
    private String status; // "pending", "accepted", "rejected"

    public Bid() {
        this.status = "pending";
    }

    public Bid(String bidId, String transporterId, String transporterName, String vehicleType,
               String vehicleRegNo, Double proposedFareInr, Double ratePerMtInr, Double etaPickupHrs,
               Double rating, String notes, String status) {
        this.bidId = bidId;
        this.transporterId = transporterId;
        this.transporterName = transporterName;
        this.vehicleType = vehicleType;
        this.vehicleRegNo = vehicleRegNo;
        this.proposedFareInr = proposedFareInr;
        this.ratePerMtInr = ratePerMtInr;
        this.etaPickupHrs = etaPickupHrs;
        this.rating = rating;
        this.notes = notes;
        this.status = status != null ? status : "pending";
    }

    // Getters and Setters
    public String getBidId() { return bidId; }
    public void setBidId(String bidId) { this.bidId = bidId; }

    public String getTransporterId() { return transporterId; }
    public void setTransporterId(String transporterId) { this.transporterId = transporterId; }

    public String getTransporterName() { return transporterName; }
    public void setTransporterName(String transporterName) { this.transporterName = transporterName; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleRegNo() { return vehicleRegNo; }
    public void setVehicleRegNo(String vehicleRegNo) { this.vehicleRegNo = vehicleRegNo; }

    public Double getProposedFareInr() { return proposedFareInr; }
    public void setProposedFareInr(Double proposedFareInr) { this.proposedFareInr = proposedFareInr; }

    public Double getRatePerMtInr() { return ratePerMtInr; }
    public void setRatePerMtInr(Double ratePerMtInr) { this.ratePerMtInr = ratePerMtInr; }

    public Double getEtaPickupHrs() { return etaPickupHrs; }
    public void setEtaPickupHrs(Double etaPickupHrs) { this.etaPickupHrs = etaPickupHrs; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
