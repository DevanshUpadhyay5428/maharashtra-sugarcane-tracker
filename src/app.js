/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — MAIN APPLICATION CONTROLLER
 * File: src/app.js
 * Connects:
 *   - Shared Operational Portal Header (with Role Session Lock badge & Quick Switcher)
 *   - Non-blocking Toast Notification Engine
 *   - Reactive State Subscription & Root View Dispatcher
 * ============================================================================
 */

window.AppUI = (function () {
  let toastTimeout = null;

  function showToast(title, message, color) {
    const container = document.getElementById('app-toast-container');
    if (!container) return;

    const borderMap = {
      emerald: 'border-emerald-500 bg-slate-900 text-white',
      amber: 'border-amber-500 bg-slate-900 text-white',
      indigo: 'border-indigo-500 bg-slate-900 text-white',
      rose: 'border-rose-500 bg-slate-900 text-white'
    };
    const badgeMap = {
      emerald: 'bg-emerald-500 text-slate-950',
      amber: 'bg-amber-500 text-slate-950',
      indigo: 'bg-indigo-500 text-white',
      rose: 'bg-rose-500 text-white'
    };

    const cls = borderMap[color] || borderMap.emerald;
    const dotCls = badgeMap[color] || badgeMap.emerald;

    container.innerHTML =
      '<div class="pointer-events-auto max-w-md w-full rounded-xl border-l-4 p-4 shadow-2xl flex items-start justify-between gap-3 transition-all ' + cls + '">' +
      '  <div class="flex items-start gap-2.5">' +
      '    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ' + dotCls + '">LIVE</span>' +
      '    <div>' +
      '      <div class="text-xs sm:text-sm font-bold">' + title + '</div>' +
      '      <div class="text-xs text-slate-300 mt-0.5">' + message + '</div>' +
      '    </div>' +
      '  </div>' +
      '  <button type="button" onclick="document.getElementById(\'app-toast-container\').innerHTML=\'\'" class="text-slate-400 hover:text-white text-sm font-bold">×</button>' +
      '</div>';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      if (container) container.innerHTML = '';
    }, 4800);
  }

  function switchDemoRoleDirectly(targetRole) {
    const user = window.AppStore.loginWithRole(targetRole);
    showToast(
      'Switched Active Role to ' + window.AppRouter.formatRoleLabel(targetRole),
      'Signed in as ' + user.name + '. Interconnected state preserved.',
      targetRole === 'farmer' ? 'emerald' : targetRole === 'logistics' ? 'amber' : 'indigo'
    );
  }

  function renderPortalHeader(activeRole, user) {
    const roleBadgeMap = {
      farmer: { label: 'FARMER PORTAL', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      logistics: { label: 'LOGISTICS & TRANSPORT PORTAL', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      mill: { label: 'SUGAR MILL PORTAL', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' }
    };
    const badge = roleBadgeMap[activeRole] || roleBadgeMap.farmer;

    return (
      '<header class="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800 shadow-md">' +
      '  <div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">' +
      '    <!-- Left Brand & Active Portal Badge -->' +
      '    <div class="flex items-center gap-3">' +
      '      <button type="button" onclick="window.AppRouter.navigate(\'landing\')" title="Return to Macro Climate & Production Analytical Landing Page" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition">' +
      '        <span>← Macro Landing Tables</span>' +
      '      </button>' +
      '      <div class="hidden sm:block h-5 w-px bg-slate-800"></div>' +
      '      <div>' +
      '        <div class="flex items-center gap-2">' +
      '          <span class="px-2 py-0.5 rounded text-[10px] font-mono-num font-bold uppercase border ' + badge.bg + '">' + badge.label + '</span>' +
      '          <span class="text-xs text-slate-400 font-mono-num hidden md:inline">Session Locked • ' + user.userId + '</span>' +
      '          <span class="px-2 py-0.5 rounded text-[10px] font-mono-num font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden lg:inline-flex items-center gap-1">☕ Java 25 Engine</span>' +
      '        </div>' +
      '        <div class="text-xs sm:text-sm font-bold text-white mt-0.5">' + user.name + ' <span class="text-xs font-normal text-slate-400">(' + user.district + ', Maharashtra)</span></div>' +
      '      </div>' +
      '    </div>' +
      '    <!-- Right Role Switcher (for testing interconnected workflow) & Sign Out -->' +
      '    <div class="flex flex-wrap items-center gap-2">' +
      '      <div class="hidden xl:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">' +
      '        <span class="px-2 text-[11px] text-slate-400">Quick Switch Role:</span>' +
      '        <button type="button" onclick="window.AppUI.switchDemoRoleDirectly(\'farmer\')" class="px-2.5 py-1 rounded font-semibold transition ' + (activeRole === 'farmer' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800') + '">1. Farmer</button>' +
      '        <button type="button" onclick="window.AppUI.switchDemoRoleDirectly(\'logistics\')" class="px-2.5 py-1 rounded font-semibold transition ' + (activeRole === 'logistics' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800') + '">2. Logistics</button>' +
      '        <button type="button" onclick="window.AppUI.switchDemoRoleDirectly(\'mill\')" class="px-2.5 py-1 rounded font-semibold transition ' + (activeRole === 'mill' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800') + '">3. Sugar Mill</button>' +
      '      </div>' +
      '      <button type="button" onclick="window.ArchitectureModal.open()" class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition">Architecture</button>' +
      '      <button type="button" onclick="window.AppRouter.navigate(\'auth\')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">Switch Role / Auth</button>' +
      '      <button type="button" onclick="window.AppStore.logout()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/70 transition">Sign Out</button>' +
      '    </div>' +
      '  </div>' +
      '</header>'
    );
  }

  function renderApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    const state = window.AppStore.getState();
    const route = state.activeRoute || 'landing';

    if (route === 'auth') {
      window.AuthPortal.render(root);
    } else if (route === 'farmer') {
      window.FarmerPortal.render(root);
    } else if (route === 'logistics') {
      window.LogisticsPortal.render(root);
    } else if (route === 'mill') {
      window.MillPortal.render(root);
    } else {
      window.LandingPortal.render(root);
    }
  }

  function init() {
    window.AppStore.subscribe(function () {
      renderApp();
    });
    renderApp();
  }

  return {
    init: init,
    renderApp: renderApp,
    renderPortalHeader: renderPortalHeader,
    showToast: showToast,
    switchDemoRoleDirectly: switchDemoRoleDirectly
  };
})();

window.addEventListener('DOMContentLoaded', function () {
  window.AppUI.init();
});
