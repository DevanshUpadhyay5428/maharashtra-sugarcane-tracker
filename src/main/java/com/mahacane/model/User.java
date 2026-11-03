package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing a user in the Maharashtra Sugarcane Supply Chain ecosystem.
 * Supports RBAC roles: 'farmer', 'logistics', and 'mill'.
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private String role; // "farmer", "logistics", "mill"
    private String name;
    private String operatorName;
    private String phone;
    private String email;
    private String district;
    private String taluka;
    
    // Farmer-specific attributes
    private String plotId;
    private String plotAddress;
    private Double plotLat;
    private Double plotLng;
    private Double cultivableAreaHa;
    private String caneVariety;

    // Logistics-specific attributes
    private String permitNo;
    private String vehicleRegNo;
    private String vehicleType;
    private Double maxPayloadMt;
    private Double rating;

    // Mill-specific attributes
    private String millId;
    private String iemLicense;
    private String zone;
    private Integer capacityTcd;
    private Integer distilleryKlpd;
    private Double baseFrpPerMt;

    public User() {}

    public User(String userId, String role, String name, String phone, String district) {
        this.userId = userId;
        this.role = role;
        this.name = name;
        this.phone = phone;
        this.district = district;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getTaluka() { return taluka; }
    public void setTaluka(String taluka) { this.taluka = taluka; }

    public String getPlotId() { return plotId; }
    public void setPlotId(String plotId) { this.plotId = plotId; }

    public String getPlotAddress() { return plotAddress; }
    public void setPlotAddress(String plotAddress) { this.plotAddress = plotAddress; }

    public Double getPlotLat() { return plotLat; }
    public void setPlotLat(Double plotLat) { this.plotLat = plotLat; }

    public Double getPlotLng() { return plotLng; }
    public void setPlotLng(Double plotLng) { this.plotLng = plotLng; }

    public Double getCultivableAreaHa() { return cultivableAreaHa; }
    public void setCultivableAreaHa(Double cultivableAreaHa) { this.cultivableAreaHa = cultivableAreaHa; }

    public String getCaneVariety() { return caneVariety; }
    public void setCaneVariety(String caneVariety) { this.caneVariety = caneVariety; }

    public String getPermitNo() { return permitNo; }
    public void setPermitNo(String permitNo) { this.permitNo = permitNo; }

    public String getVehicleRegNo() { return vehicleRegNo; }
    public void setVehicleRegNo(String vehicleRegNo) { this.vehicleRegNo = vehicleRegNo; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Double getMaxPayloadMt() { return maxPayloadMt; }
    public void setMaxPayloadMt(Double maxPayloadMt) { this.maxPayloadMt = maxPayloadMt; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getMillId() { return millId; }
    public void setMillId(String millId) { this.millId = millId; }

    public String getIemLicense() { return iemLicense; }
    public void setIemLicense(String iemLicense) { this.iemLicense = iemLicense; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Integer getCapacityTcd() { return capacityTcd; }
    public void setCapacityTcd(Integer capacityTcd) { this.capacityTcd = capacityTcd; }

    public Integer getDistilleryKlpd() { return distilleryKlpd; }
    public void setDistilleryKlpd(Integer distilleryKlpd) { this.distilleryKlpd = distilleryKlpd; }

    public Double getBaseFrpPerMt() { return baseFrpPerMt; }
    public void setBaseFrpPerMt(Double baseFrpPerMt) { this.baseFrpPerMt = baseFrpPerMt; }
}
