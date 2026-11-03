package com.mahacane.model;

import java.io.Serializable;

/**
 * Model representing annual mass balance and sugar mill processing yields.
 */
public class MassBalanceRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private int year;
    private double caneCrushedMt;
    private double sugarMt;
    private double ethanolKl;
    private double bagasseMt;
    private double molassesMt;

    public MassBalanceRecord() {}

    public MassBalanceRecord(int year, double caneCrushedMt, double sugarMt, double ethanolKl, double bagasseMt, double molassesMt) {
        this.year = year;
        this.caneCrushedMt = caneCrushedMt;
        this.sugarMt = sugarMt;
        this.ethanolKl = ethanolKl;
        this.bagasseMt = bagasseMt;
        this.molassesMt = molassesMt;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public double getCaneCrushedMt() { return caneCrushedMt; }
    public void setCaneCrushedMt(double caneCrushedMt) { this.caneCrushedMt = caneCrushedMt; }

    public double getSugarMt() { return sugarMt; }
    public void setSugarMt(double sugarMt) { this.sugarMt = sugarMt; }

    public double getEthanolKl() { return ethanolKl; }
    public void setEthanolKl(double ethanolKl) { this.ethanolKl = ethanolKl; }

    public double getBagasseMt() { return bagasseMt; }
    public void setBagasseMt(double bagasseMt) { this.bagasseMt = bagasseMt; }

    public double getMolassesMt() { return molassesMt; }
    public void setMolassesMt(double molassesMt) { this.molassesMt = molassesMt; }
}
