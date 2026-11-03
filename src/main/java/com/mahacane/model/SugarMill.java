package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing an authentic Maharashtra cooperative or private sugar mill.
 */
public class SugarMill implements Serializable {
    private static final long serialVersionUID = 1L;

    private String millId;
    private String name;
    private String taluka;
    private String district;
    private double lat;
    private double lng;
    private int capacityTcd;
    private int distilleryKlpd;
    private double baseFrpPerMt;

    public SugarMill() {}

    public SugarMill(String millId, String name, String taluka, String district, double lat, double lng, int capacityTcd, int distilleryKlpd, double baseFrpPerMt) {
        this.millId = millId;
        this.name = name;
        this.taluka = taluka;
        this.district = district;
        this.lat = lat;
        this.lng = lng;
        this.capacityTcd = capacityTcd;
        this.distilleryKlpd = distilleryKlpd;
        this.baseFrpPerMt = baseFrpPerMt;
    }

    public String getMillId() { return millId; }
    public void setMillId(String millId) { this.millId = millId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTaluka() { return taluka; }
    public void setTaluka(String taluka) { this.taluka = taluka; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public int getCapacityTcd() { return capacityTcd; }
    public void setCapacityTcd(int capacityTcd) { this.capacityTcd = capacityTcd; }

    public int getDistilleryKlpd() { return distilleryKlpd; }
    public void setDistilleryKlpd(int distilleryKlpd) { this.distilleryKlpd = distilleryKlpd; }

    public double getBaseFrpPerMt() { return baseFrpPerMt; }
    public void setBaseFrpPerMt(double baseFrpPerMt) { this.baseFrpPerMt = baseFrpPerMt; }
}
