package com.mahacane.service;

import com.mahacane.model.User;
import com.mahacane.repository.DataStore;

/**
 * Service managing Role-Based Access Control (RBAC) authentication and active sessions.
 */
public class AuthService {

    private final DataStore dataStore = DataStore.getInstance();

    public User loginWithRole(String roleKey, String customName, String phone, String district) {
        User base = dataStore.getDemoUsers().get(roleKey != null ? roleKey.toLowerCase() : "farmer");
        if (base == null) {
            base = dataStore.getDemoUsers().get("farmer");
        }

        User sessionUser = new User();
        sessionUser.setUserId(base.getUserId());
        sessionUser.setRole(base.getRole());
        sessionUser.setName(customName != null && !customName.trim().isEmpty() ? customName.trim() : base.getName());
        sessionUser.setPhone(phone != null && !phone.trim().isEmpty() ? phone.trim() : base.getPhone());
        sessionUser.setDistrict(district != null && !district.trim().isEmpty() ? district.trim() : base.getDistrict());
        sessionUser.setTaluka(base.getTaluka());
        sessionUser.setPlotId(base.getPlotId());
        sessionUser.setPlotAddress(base.getPlotAddress());
        sessionUser.setPlotLat(base.getPlotLat());
        sessionUser.setPlotLng(base.getPlotLng());
        sessionUser.setCultivableAreaHa(base.getCultivableAreaHa());
        sessionUser.setCaneVariety(base.getCaneVariety());
        sessionUser.setPermitNo(base.getPermitNo());
        sessionUser.setVehicleRegNo(base.getVehicleRegNo());
        sessionUser.setVehicleType(base.getVehicleType());
        sessionUser.setMaxPayloadMt(base.getMaxPayloadMt());
        sessionUser.setRating(base.getRating());
        sessionUser.setMillId(base.getMillId());
        sessionUser.setIemLicense(base.getIemLicense());
        sessionUser.setZone(base.getZone());
        sessionUser.setCapacityTcd(base.getCapacityTcd());
        sessionUser.setDistilleryKlpd(base.getDistilleryKlpd());
        sessionUser.setBaseFrpPerMt(base.getBaseFrpPerMt());

        dataStore.setCurrentUser(sessionUser);
        dataStore.setActiveRoute(sessionUser.getRole());
        return sessionUser;
    }

    public void logout() {
        dataStore.setCurrentUser(null);
        dataStore.setActiveRoute("landing");
    }

    public User getCurrentUser() {
        return dataStore.getCurrentUser();
    }
}
