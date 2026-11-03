/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — ROLE-BASED ROUTER & AUTH GUARD
 * File: src/router/router.js
 * Enforces:
 *   - Centralized Landing & Auth routing
 *   - Role-based redirection upon login ('farmer' -> Farmer Portal,
 *     'logistics' -> Logistics Portal, 'mill' -> Sugar Mill Portal)
 *   - Session locking so authenticated users remain in their authorized portal
 * ============================================================================
 */

window.AppRouter = (function () {
  const PROTECTED_ROUTES = ['farmer', 'logistics', 'mill'];

  function navigate(targetRoute, options) {
    const opts = options || {};
    const state = window.AppStore.getState();
    const user = state.currentUser;

    // If accessing a protected operational portal
    if (PROTECTED_ROUTES.indexOf(targetRoute) !== -1) {
      if (!user) {
        // Not logged in -> redirect to dedicated Auth Portal with target role pre-selected
        window.AuthPortal && window.AuthPortal.setPreselectedRole(targetRoute);
        window.AppStore.setRoute('auth');
        if (!opts.silent && window.AppUI) {
          window.AppUI.showToast(
            'Authentication Required',
            'Please sign in or select a role profile to access the ' + formatRoleLabel(targetRoute) + '.',
            'amber'
          );
        }
        return;
      }

      // Session Lock check: keep authenticated users securely locked into their authorized portal
      if (user.role !== targetRoute && !opts.forceRoleSwitch) {
        window.AppStore.setRoute(user.role);
        if (!opts.silent && window.AppUI) {
          window.AppUI.showToast(
            'Role Session Lock Active',
            'Your active session is locked to ' +
              formatRoleLabel(user.role) +
              '. Use "Switch Role / Sign Out" in the top bar to change portals.',
            'amber'
          );
        }
        return;
      }
    }

    window.AppStore.setRoute(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatRoleLabel(role) {
    if (role === 'farmer') return 'Farmer Portal';
    if (role === 'logistics') return 'Logistics & Transport Portal';
    if (role === 'mill') return 'Sugar Mill Portal';
    return 'Landing Portal';
  }

  return {
    navigate: navigate,
    formatRoleLabel: formatRoleLabel
  };
})();
