/**
 * ============================================================================
 * MAHARASHTRA SUGARCANE SUPPLY CHAIN TRACKER — AUTHENTICATION & ROLE PORTAL
 * File: src/components/auth_portal.js
 * Features:
 *   - Role Selection: Farmer, Transporter / Logistics, Sugar Mill Operator
 *   - Login & Account Registration toggle with role-specific input fields
 *   - Instant 1-Click Demo Role Login & dynamic role-based redirection
 * ============================================================================
 */

window.AuthPortal = (function () {
  let selectedRole = 'farmer'; // 'farmer' | 'logistics' | 'mill'
  let authMode = 'login'; // 'login' | 'register'

  function setPreselectedRole(role) {
    if (['farmer', 'logistics', 'mill'].indexOf(role) !== -1) {
      selectedRole = role;
    }
  }

  function selectRole(role) {
    selectedRole = role;
    const container = document.getElementById('app-root');
    if (container) render(container);
  }

  function setAuthMode(mode) {
    authMode = mode;
    const container = document.getElementById('app-root');
    if (container) render(container);
  }

  function handleQuickDemoLogin(roleKey) {
    const user = window.AppStore.loginWithRole(roleKey);
    if (window.AppUI) {
      window.AppUI.showToast(
        'Authenticated as ' + user.name,
        'Redirected to ' + window.AppRouter.formatRoleLabel(roleKey) + ' with active session lock.',
        'emerald'
      );
    }
    window.AppRouter.navigate(roleKey, { forceRoleSwitch: true, silent: true });
  }

  function handleFormSubmit(event) {
    if (event) event.preventDefault();
    const nameEl = document.getElementById('auth-input-name');
    const phoneEl = document.getElementById('auth-input-phone');
    const districtEl = document.getElementById('auth-input-district');

    const customData = {};
    if (nameEl && nameEl.value.trim()) customData.name = nameEl.value.trim();
    if (phoneEl && phoneEl.value.trim()) customData.phone = phoneEl.value.trim();
    if (districtEl && districtEl.value.trim()) customData.district = districtEl.value.trim();

    if (selectedRole === 'farmer') {
      const kisanEl = document.getElementById('auth-farmer-id');
      const plotAddrEl = document.getElementById('auth-farmer-plot');
      const caneVarEl = document.getElementById('auth-farmer-variety');
      if (kisanEl && kisanEl.value.trim()) customData.userId = kisanEl.value.trim();
      if (plotAddrEl && plotAddrEl.value.trim()) customData.plotAddress = plotAddrEl.value.trim();
      if (caneVarEl && caneVarEl.value.trim()) customData.caneVariety = caneVarEl.value.trim();
    } else if (selectedRole === 'logistics') {
      const vehRegEl = document.getElementById('auth-logistics-reg');
      const vehTypeEl = document.getElementById('auth-logistics-type');
      const permitEl = document.getElementById('auth-logistics-permit');
      if (vehRegEl && vehRegEl.value.trim()) customData.vehicleRegNo = vehRegEl.value.trim();
      if (vehTypeEl && vehTypeEl.value.trim()) customData.vehicleType = vehTypeEl.value.trim();
      if (permitEl && permitEl.value.trim()) customData.permitNo = permitEl.value.trim();
    } else if (selectedRole === 'mill') {
      const licenseEl = document.getElementById('auth-mill-license');
      const capEl = document.getElementById('auth-mill-capacity');
      const zoneEl = document.getElementById('auth-mill-zone');
      if (licenseEl && licenseEl.value.trim()) customData.iemLicense = licenseEl.value.trim();
      if (capEl && capEl.value) customData.capacityTcd = parseInt(capEl.value, 10) || 9000;
      if (zoneEl && zoneEl.value) customData.zone = zoneEl.value;
    }

    const user = window.AppStore.loginWithRole(selectedRole, customData);
    if (window.AppUI) {
      window.AppUI.showToast(
        (authMode === 'register' ? 'Account Created: ' : 'Welcome back, ') + user.name,
        'Session locked and routed to ' + window.AppRouter.formatRoleLabel(selectedRole) + '.',
        'emerald'
      );
    }
    window.AppRouter.navigate(selectedRole, { forceRoleSwitch: true, silent: true });
  }

  function buildRoleSpecificFields() {
    const demo = window.AppStore.DEMO_USERS[selectedRole];

    if (selectedRole === 'farmer') {
      return (
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">' +
        '  <div>' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">Farmer Kisan / Gat ID *</label>' +
        '    <input type="text" id="auth-farmer-id" value="' + demo.userId + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono-num" />' +
        '  </div>' +
        '  <div>' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">Primary Sugarcane Variety *</label>' +
        '    <select id="auth-farmer-variety" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white">' +
        '      <option value="Co 86032">Co 86032 (Nira - High Recovery)</option>' +
        '      <option value="CoM 0265 (Phule 265)">CoM 0265 (Phule 265 - High Tonnage)</option>' +
        '      <option value="Co 94012">Co 94012 (Early Maturing)</option>' +
        '      <option value="CoC 671">CoC 671 (VSI Standard)</option>' +
        '    </select>' +
        '  </div>' +
        '  <div class="sm:col-span-2">' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">Registered Plot Location &amp; Survey / Gat Details (Maharashtra) *</label>' +
        '    <input type="text" id="auth-farmer-plot" value="' + demo.plotAddress + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
        '  </div>' +
        '</div>'
      );
    }

    if (selectedRole === 'logistics') {
      return (
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">' +
        '  <div>' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">RTO Vehicle Registration No. *</label>' +
        '    <input type="text" id="auth-logistics-reg" value="' + demo.vehicleRegNo + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono-num" />' +
        '  </div>' +
        '  <div>' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">Contractor Transport Permit ID *</label>' +
        '    <input type="text" id="auth-logistics-permit" value="' + demo.permitNo + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono-num" />' +
        '  </div>' +
        '  <div class="sm:col-span-2">' +
        '    <label class="block text-xs font-semibold text-slate-700 mb-1">Primary Cane Carrier Fleet Configuration *</label>' +
        '    <select id="auth-logistics-type" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white">' +
        '      <option value="Heavy Cane Truck (25 MT)">Heavy Cane Truck (25 MT Payload)</option>' +
        '      <option value="Tractor Double-Trolley (16 MT)">Tractor Double-Trolley (16 MT Soft-Soil)</option>' +
        '      <option value="Multi-Axle Cane Carrier (35 MT)">Multi-Axle Bulk Cane Carrier (35 MT)</option>' +
        '    </select>' +
        '  </div>' +
        '</div>'
      );
    }

    return (
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">' +
      '  <div>' +
      '    <label class="block text-xs font-semibold text-slate-700 mb-1">Mill Crushing License / IEM No. *</label>' +
      '    <input type="text" id="auth-mill-license" value="' + demo.iemLicense + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono-num" />' +
      '  </div>' +
      '  <div>' +
      '    <label class="block text-xs font-semibold text-slate-700 mb-1">Sugar Commissionerate Zone *</label>' +
      '    <select id="auth-mill-zone" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white">' +
      '      <option value="Kolhapur Zone">Kolhapur Zone (High Recovery Belt)</option>' +
      '      <option value="Pune Zone">Pune / Solapur Zone</option>' +
      '      <option value="Ahmednagar Zone">Ahilyanagar / Nashik Zone</option>' +
      '      <option value="Aurangabad Zone">Chhatrapati Sambhajinagar (Marathwada)</option>' +
      '    </select>' +
      '  </div>' +
      '  <div class="sm:col-span-2">' +
      '    <label class="block text-xs font-semibold text-slate-700 mb-1">Installed Daily Crushing Capacity (TCD) *</label>' +
      '    <input type="number" id="auth-mill-capacity" value="' + demo.capacityTcd + '" min="1250" max="20000" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono-num" />' +
      '  </div>' +
      '</div>'
    );
  }

  function render(container) {
    const demo = window.AppStore.DEMO_USERS[selectedRole];
    const currentUser = window.AppStore.getState().currentUser;

    container.innerHTML =
      '<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">' +
      '  <!-- Top Bar Back to Macro Analytical Landing Page -->' +
      '  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 sm:px-6 h-16 flex items-center justify-between">' +
      '    <button type="button" onclick="window.AppRouter.navigate(\'landing\')" class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition">' +
      '      <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
      '        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />' +
      '      </svg>' +
      '      <span>Back to Maharashtra Climate &amp; Production Analytical Tables</span>' +
      '    </button>' +
      '    <div class="flex items-center gap-2 text-xs font-mono-num text-slate-400">' +
      '      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>' +
      '      <span>Role-Based Access Control (RBAC) Gateway</span>' +
      '    </div>' +
      '  </header>' +
      '  <!-- Main Auth & Role Selection Container -->' +
      '  <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">' +
      (currentUser
        ? '<div class="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/70 flex flex-wrap items-center justify-between gap-3">' +
          '  <div class="text-xs sm:text-sm">' +
          '    <span class="text-emerald-300 font-bold">Active Session Detected:</span> You are signed in as <strong>' + currentUser.name + '</strong> (' + window.AppRouter.formatRoleLabel(currentUser.role) + ').' +
          '  </div>' +
          '  <div class="flex items-center gap-2">' +
          '    <button type="button" onclick="window.AppRouter.navigate(\'' + currentUser.role + '\')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">Resume ' + window.AppRouter.formatRoleLabel(currentUser.role) + ' →</button>' +
          '    <button type="button" onclick="window.AppStore.logout(); window.AuthPortal.selectRole(\'farmer\');" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-rose-900 text-slate-200 border border-slate-700 transition">Sign Out</button>' +
          '  </div>' +
          '</div>'
        : '') +
      '    <div class="text-center max-w-2xl mx-auto mb-6">' +
      '      <span class="px-3 py-1 rounded-full text-xs font-mono-num font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">STEP 1 OF 2 • SELECT OPERATIONAL ROLE</span>' +
      '      <h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-2">Select Your Supply Chain Role</h1>' +
      '      <p class="text-xs sm:text-sm text-slate-400 mt-1">Each role unlocks a dedicated Maharashtra operational portal with role-specific telemetry, routing, and session locking.</p>' +
      '    </div>' +
      '    <!-- 3 Role Cards -->' +
      '    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">' +
      '      <!-- Role 1: Farmer -->' +
      '      <div onclick="window.AuthPortal.selectRole(\'farmer\')" class="cursor-pointer rounded-2xl p-5 border transition-all ' +
      (selectedRole === 'farmer'
        ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700') +
      '">' +
      '        <div class="flex items-center justify-between mb-3">' +
      '          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">01 • Producer</span>' +
      '          <span class="w-3 h-3 rounded-full ' + (selectedRole === 'farmer' ? 'bg-emerald-400 ring-4 ring-emerald-400/20' : 'bg-slate-700') + '"></span>' +
      '        </div>' +
      '        <h2 class="text-lg font-bold text-white">Sugarcane Farmer</h2>' +
      '        <p class="text-xs text-slate-400 mt-1 leading-relaxed">Register Maharashtra cane plots (GPS), schedule harvest windows, view interactive mill route maps, and award transport bids.</p>' +
      '        <button type="button" onclick="event.stopPropagation(); window.AuthPortal.handleQuickDemoLogin(\'farmer\')" class="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs">Instant Demo Login: Farmer →</button>' +
      '      </div>' +
      '      <!-- Role 2: Transporter / Logistics -->' +
      '      <div onclick="window.AuthPortal.selectRole(\'logistics\')" class="cursor-pointer rounded-2xl p-5 border transition-all ' +
      (selectedRole === 'logistics'
        ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700') +
      '">' +
      '        <div class="flex items-center justify-between mb-3">' +
      '          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">02 • Fleet &amp; Carrier</span>' +
      '          <span class="w-3 h-3 rounded-full ' + (selectedRole === 'logistics' ? 'bg-amber-400 ring-4 ring-amber-400/20' : 'bg-slate-700') + '"></span>' +
      '        </div>' +
      '        <h2 class="text-lg font-bold text-white">Transporter / Logistics</h2>' +
      '        <p class="text-xs text-slate-400 mt-1 leading-relaxed">Browse farmer harvest requests, inspect plot-to-mill highway corridors, check 4-day field mud/weather forecasts, and bid fares.</p>' +
      '        <button type="button" onclick="event.stopPropagation(); window.AuthPortal.handleQuickDemoLogin(\'logistics\')" class="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-xs">Instant Demo Login: Logistics →</button>' +
      '      </div>' +
      '      <!-- Role 3: Sugar Mill Operator -->' +
      '      <div onclick="window.AuthPortal.selectRole(\'mill\')" class="cursor-pointer rounded-2xl p-5 border transition-all ' +
      (selectedRole === 'mill'
        ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400/40 shadow-lg'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700') +
      '">' +
      '        <div class="flex items-center justify-between mb-3">' +
      '          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">03 • Processor</span>' +
      '          <span class="w-3 h-3 rounded-full ' + (selectedRole === 'mill' ? 'bg-indigo-400 ring-4 ring-indigo-400/20' : 'bg-slate-700') + '"></span>' +
      '        </div>' +
      '        <h2 class="text-lg font-bold text-white">Sugar Mill Operator</h2>' +
      '        <p class="text-xs text-slate-400 mt-1 leading-relaxed">Run weighbridge &amp; lab quality FRP batch pricing (Pol%, Brix%, Dextran, Trash) and manage the 5-graph annual mass balance ledger.</p>' +
      '        <button type="button" onclick="event.stopPropagation(); window.AuthPortal.handleQuickDemoLogin(\'mill\')" class="mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-xs">Instant Demo Login: Sugar Mill →</button>' +
      '      </div>' +
      '    </div>' +
      '    <!-- Step 2: Role-Specific Login / Registration Form -->' +
      '    <div class="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl w-full mx-auto">' +
      '      <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">' +
      '        <div>' +
      '          <span class="text-[11px] font-mono-num uppercase font-bold text-slate-500">STEP 2 OF 2 • ' + selectedRole.toUpperCase() + ' CREDENTIALS</span>' +
      '          <h3 class="text-base font-bold text-slate-900">' +
      (authMode === 'login' ? 'Sign In to ' : 'Create New Account for ') +
      window.AppRouter.formatRoleLabel(selectedRole) +
      '</h3>' +
      '        </div>' +
      '        <div class="inline-flex rounded-lg p-1 bg-slate-200/80 text-xs font-semibold">' +
      '          <button type="button" onclick="window.AuthPortal.setAuthMode(\'login\')" class="px-3 py-1 rounded-md transition ' + (authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900') + '">Sign In</button>' +
      '          <button type="button" onclick="window.AuthPortal.setAuthMode(\'register\')" class="px-3 py-1 rounded-md transition ' + (authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900') + '">Create Account</button>' +
      '        </div>' +
      '      </div>' +
      '      <form onsubmit="window.AuthPortal.handleFormSubmit(event)" class="p-6 space-y-4">' +
      '        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">' +
      '          <div>' +
      '            <label class="block text-xs font-semibold text-slate-700 mb-1">' +
      (selectedRole === 'mill' ? 'Official Sugar Mill Name *' : selectedRole === 'logistics' ? 'Transport Agency / Name *' : 'Farmer Full Name *') +
      '</label>' +
      '            <input type="text" id="auth-input-name" value="' + demo.name + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none" />' +
      '          </div>' +
      '          <div>' +
      '            <label class="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile / Contact *</label>' +
      '            <input type="text" id="auth-input-phone" value="' + demo.phone + '" required class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono-num" />' +
      '          </div>' +
      '          <div>' +
      '            <label class="block text-xs font-semibold text-slate-700 mb-1">Base District (Maharashtra) *</label>' +
      '            <select id="auth-input-district" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white">' +
      '              <option value="Kolhapur" ' + (demo.district === 'Kolhapur' ? 'selected' : '') + '>Kolhapur</option>' +
      '              <option value="Sangli" ' + (demo.district === 'Sangli' ? 'selected' : '') + '>Sangli</option>' +
      '              <option value="Pune" ' + (demo.district === 'Pune' ? 'selected' : '') + '>Pune (Baramati)</option>' +
      '              <option value="Satara" ' + (demo.district === 'Satara' ? 'selected' : '') + '>Satara (Karad)</option>' +
      '              <option value="Solapur" ' + (demo.district === 'Solapur' ? 'selected' : '') + '>Solapur (Pandharpur)</option>' +
      '              <option value="Ahilyanagar" ' + (demo.district === 'Ahilyanagar' ? 'selected' : '') + '>Ahilyanagar (Pravara)</option>' +
      '            </select>' +
      '          </div>' +
      '        </div>' +
      buildRoleSpecificFields() +
      '        <div class="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">' +
      '          <span class="text-xs text-slate-500">Dynamic router will lock your session into the <strong>' + window.AppRouter.formatRoleLabel(selectedRole) + '</strong> upon submission.</span>' +
      '          <button type="submit" class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-emerald-700 transition shadow-md">' +
      (authMode === 'login' ? 'Authenticate &amp; Enter ' : 'Register &amp; Launch ') +
      window.AppRouter.formatRoleLabel(selectedRole) +
      ' →</button>' +
      '        </div>' +
      '      </form>' +
      '    </div>' +
      '  </main>' +
      '</div>';
  }

  return {
    render: render,
    selectRole: selectRole,
    setAuthMode: setAuthMode,
    setPreselectedRole: setPreselectedRole,
    handleQuickDemoLogin: handleQuickDemoLogin,
    handleFormSubmit: handleFormSubmit
  };
})();
