package com.mahacane.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing a farmer's cane dispatch and logistics trip request.
 */
public class Trip implements Serializable {
    private static final long serialVersionUID = 1L;

    private String tripId;
    private String farmerId;
    private String farmerName;
    private String plotId;
    private String plotAddress;
    private String district;
    private Double plotLat;
    private Double plotLng;
    private String targetMillId;
    private String targetMillName;
    private Double millLat;
    private Double millLng;
    private String caneVariety;
    private String cropType;
    private Double quantityMt;
    private Double quantityQuintals;
    private String harvestDate;
    private String harvestWindow;
    private Double distanceKm;
    private Integer transitMins;
    private String formattedTransit;
    private String highwayCorridor;
    private String status; // "open", "bidding", "awarded", "in_transit", "delivered", "settled"
    private String awardedBidId;
    private Double awardedFareInr;
    private String gatePassCode;
    private List<Bid> bids = new ArrayList<>();

    public Trip() {}

    // Getters and Setters
    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getPlotId() { return plotId; }
    public void setPlotId(String plotId) { this.plotId = plotId; }

    public String getPlotAddress() { return plotAddress; }
    public void setPlotAddress(String plotAddress) { this.plotAddress = plotAddress; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public Double getPlotLat() { return plotLat; }
    public void setPlotLat(Double plotLat) { this.plotLat = plotLat; }

    public Double getPlotLng() { return plotLng; }
    public void setPlotLng(Double plotLng) { this.plotLng = plotLng; }

    public String getTargetMillId() { return targetMillId; }
    public void setTargetMillId(String targetMillId) { this.targetMillId = targetMillId; }

    public String getTargetMillName() { return targetMillName; }
    public void setTargetMillName(String targetMillName) { this.targetMillName = targetMillName; }

    public Double getMillLat() { return millLat; }
    public void setMillLat(Double millLat) { this.millLat = millLat; }

    public Double getMillLng() { return millLng; }
    public void setMillLng(Double millLng) { this.millLng = millLng; }

    public String getCaneVariety() { return caneVariety; }
    public void setCaneVariety(String caneVariety) { this.caneVariety = caneVariety; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public Double getQuantityMt() { return quantityMt; }
    public void setQuantityMt(Double quantityMt) { 
        this.quantityMt = quantityMt;
        if (quantityMt != null) {
            this.quantityQuintals = Math.round(quantityMt * 10.0 * 100.0) / 100.0;
        }
    }

    public Double getQuantityQuintals() { return quantityQuintals; }
    public void setQuantityQuintals(Double quantityQuintals) { this.quantityQuintals = quantityQuintals; }

    public String getHarvestDate() { return harvestDate; }
    public void setHarvestDate(String harvestDate) { this.harvestDate = harvestDate; }

    public String getHarvestWindow() { return harvestWindow; }
    public void setHarvestWindow(String harvestWindow) { this.harvestWindow = harvestWindow; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Integer getTransitMins() { return transitMins; }
    public void setTransitMins(Integer transitMins) { this.transitMins = transitMins; }

    public String getFormattedTransit() { return formattedTransit; }
    public void setFormattedTransit(String formattedTransit) { this.formattedTransit = formattedTransit; }

    public String getHighwayCorridor() { return highwayCorridor; }
    public void setHighwayCorridor(String highwayCorridor) { this.highwayCorridor = highwayCorridor; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAwardedBidId() { return awardedBidId; }
    public void setAwardedBidId(String awardedBidId) { this.awardedBidId = awardedBidId; }

    public Double getAwardedFareInr() { return awardedFareInr; }
    public void setAwardedFareInr(Double awardedFareInr) { this.awardedFareInr = awardedFareInr; }

    public String getGatePassCode() { return gatePassCode; }
    public void setGatePassCode(String gatePassCode) { this.gatePassCode = gatePassCode; }

    public List<Bid> getBids() { return bids; }
    public void setBids(List<Bid> bids) { this.bids = bids; }
}
