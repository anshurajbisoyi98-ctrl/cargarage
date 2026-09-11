import './service.css';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const date = value => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const iso = value => value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

// State
let user = null;
let activeRole = 'owner'; // 'owner' | 'admin'
let tab = 'garage'; // owner: 'garage', 'book', 'history', 'reminders', 'problems', 'profile' | admin: 'overview', 'requests', 'workflow', 'records', 'centers', 'users', 'problems'
let vehicles = [];
let requests = [];
let records = [];
let reminders = [];
let problems = [];
let centers = [];
let usersList = [];
let dashboard = {};
let notifications = [];
let unreadNotifCount = 0;
let notifDrawerOpen = false;
let notifFilter = 'ALL';
let requestFilter = 'ALL';
let requestSearch = '';
let form = null; // null | { type: string, [key: string]: any }
let invoiceModal = null; // null | record object
let authAsAdmin = false;
let register = false;
let busy = false;

// DOM Elements
const dialog = document.createElement('dialog');
dialog.className = 'service-dialog';
dialog.setAttribute('aria-label', 'Mustang Concierge & Service Suite');
document.body.append(dialog);

const garageBtn = document.querySelector('#garage-button');
const menuGarageBtn = document.querySelector('#menu-garage-button');
const notifHeaderBtn = document.querySelector('#notif-header-button');
const menuNotifBtn = document.querySelector('#menu-notif-button');
const headerBadge = document.querySelector('#header-notif-badge');
const menuBadge = document.querySelector('#menu-notif-badge');

if (garageBtn) garageBtn.addEventListener('click', () => openService());
if (menuGarageBtn) menuGarageBtn.addEventListener('click', () => {
  document.querySelector('#menu-dialog')?.close();
  openService();
});

if (notifHeaderBtn) notifHeaderBtn.addEventListener('click', () => {
  openService('garage');
  notifDrawerOpen = true;
  render();
});
if (menuNotifBtn) menuNotifBtn.addEventListener('click', () => {
  document.querySelector('#menu-dialog')?.close();
  openService('garage');
  notifDrawerOpen = true;
  render();
});

// API Helper
async function api(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch('/api' + path, options);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('API response invalid. Ensure backend is running.');
  }
  if (!res.ok) {
    if (res.status === 401 && user) {
      user = null;
      render();
    }
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

function showMsg(text, isError = false) {
  const node = dialog.querySelector('.service-msg-banner');
  if (node) {
    node.textContent = text;
    node.className = `service-msg-banner ${isError ? 'error' : 'success'}`;
    node.style.display = 'block';
    setTimeout(() => { if (node) node.style.display = 'none'; }, 4000);
  }
}

// Global open
async function openService(defaultTab) {
  dialog.showModal();
  dialog.innerHTML = `
    <div class="concierge-loader">
      <div class="loader-spinner"></div>
      <p class="eyebrow">MUSTANG CONCIERGE</p>
      <h2>CONNECTING TO THE WORKSHOP…</h2>
    </div>
  `;
  try {
    user = await api('/users/me');
    if (!user.isAdmin) {
      activeRole = 'owner';
      tab = defaultTab || 'garage';
    } else {
      activeRole = activeRole === 'owner' ? 'owner' : 'admin';
      tab = defaultTab || (activeRole === 'admin' ? 'overview' : 'garage');
    }
    await refreshAll();
  } catch {
    user = null;
    render();
  }
}

// Background sync & notifications polling
async function updateNotificationBadges() {
  try {
    if (!user) return;
    const res = await api('/notifications');
    notifications = res.notifications || [];
    unreadNotifCount = res.unreadCount || 0;
    if (headerBadge) {
      headerBadge.textContent = String(unreadNotifCount);
      headerBadge.className = `notif-badge ${unreadNotifCount > 0 ? 'active pulse' : ''}`;
    }
    if (menuBadge) {
      menuBadge.textContent = String(unreadNotifCount);
      menuBadge.className = `notif-badge ${unreadNotifCount > 0 ? 'active pulse' : ''}`;
    }
  } catch {
    // Ignore polling errors
  }
}

setInterval(updateNotificationBadges, 15000);
updateNotificationBadges();

// Refresh all domain data
async function refreshAll() {
  if (!user) return;
  if (!user.isAdmin) {
    activeRole = 'owner';
    if (['overview', 'requests', 'workflow', 'active', 'records', 'analytics', 'centers', 'users', 'heritage'].includes(tab)) {
      tab = 'garage';
    }
  }

  try {
    const promises = [
      api('/vehicles'),
      api(user.isAdmin && activeRole === 'admin' ? '/service-requests' : '/service-requests/my'),
      api('/service-records'),
      api('/reminders'),
      api('/problem-reports'),
      api('/service-centers'),
      api('/notifications'),
      api(user.isAdmin && activeRole === 'admin' ? '/dashboard/service-center' : '/dashboard/owner')
    ];
    if (user.isAdmin && activeRole === 'admin') {
      promises.push(api('/users').catch(() => []));
    }

    const results = await Promise.all(promises);
    vehicles = results[0] || [];
    requests = results[1] || [];
    records = results[2] || [];
    reminders = results[3] || [];
    problems = results[4] || [];
    centers = results[5] || [];
    const notifRes = results[6] || {};
    notifications = notifRes.notifications || [];
    unreadNotifCount = notifRes.unreadCount || 0;
    dashboard = results[7] || {};
    if (user.isAdmin && activeRole === 'admin') {
      usersList = results[8] || [];
    } else {
      usersList = [];
    }

    if (headerBadge) headerBadge.textContent = String(unreadNotifCount);
    if (menuBadge) menuBadge.textContent = String(unreadNotifCount);
  } catch (err) {
    showMsg(err.message, true);
  }
  render();
}

// RENDER FUNCTION
function render() {
  if (!user) {
    dialog.innerHTML = `
      <button class="close-concierge" aria-label="Close">✕</button>
      <div class="auth-wrapper">
        <div class="auth-hero">
          <p class="eyebrow">+ THE HERITAGE COLLECTION / 1968</p>
          <h2>Mustang Concierge & Service Suite</h2>
          <p class="auth-desc">Manage your classic Mustang collection, schedule certified workshop services, track precision repairs in real time, and oversee workshop dispatch, active bays, analytics, and facilities.</p>
          
          <div class="demo-buttons">
            <p class="demo-label">1-CLICK INSTANT DEMO ACCESS:</p>
            <div class="demo-btn-group">
              <button class="demo-btn" data-action="quick-login" data-role="owner">👤 Customer Demo (Owner Garage) ↗</button>
              <button class="demo-btn admin" data-action="quick-login" data-role="admin">🛡️ Admin Center Demo (Full Suite) ↗</button>
            </div>
          </div>
        </div>
        <div class="auth-box">
          <div class="user-type-selector">
            <span class="uts-title">CHOOSE USER TYPE:</span>
            <div class="uts-buttons">
              <button type="button" class="uts-btn ${!authAsAdmin ? 'active' : ''}" data-action="select-auth-role" data-role="owner">
                👤 Customer
              </button>
              <button type="button" class="uts-btn ${authAsAdmin ? 'active' : ''}" data-action="select-auth-role" data-role="admin">
                🛡️ Admin
              </button>
            </div>
          </div>

          <h3>${register ? (authAsAdmin ? 'Create Workshop Admin Account' : 'Create Customer Account') : (authAsAdmin ? 'Workshop Administrator Sign In' : 'Customer Sign In')}</h3>
          <p class="auth-sub-note">${authAsAdmin ? 'Access master overview, requests dispatch, active bays, records, analytics, centers, users, and heritage archive.' : 'Access your personal garage, book certified services, track milestones, and view invoices.'}</p>
          <p class="service-msg-banner"></p>
          <form data-form="auth">
            ${register ? `<label>Full Name<input name="username" type="text" required maxlength="80" placeholder="Carroll Shelby" autocomplete="name"></label><label>Phone Number<input name="phone" type="tel" placeholder="+1 (555) 019-1968" maxlength="20"></label>` : ''}
            <label>Email Address<input name="email" type="email" required placeholder="${authAsAdmin ? 'admin@mustang.example' : 'owner@mustang.example'}" autocomplete="email"></label>
            <label>Password<input name="password" type="password" required minlength="10" maxlength="72" placeholder="••••••••••" autocomplete="${register ? 'new-password' : 'current-password'}"></label>
            <button class="solid-button" type="submit">${register ? (authAsAdmin ? 'Register as Admin' : 'Register Customer Account') : (authAsAdmin ? 'Enter Admin Center' : 'Enter Concierge')} <span>↗</span></button>
            <button type="button" class="underlined toggle-auth-btn" data-action="toggle-auth">${register ? 'Already registered? Sign in' : 'First time here? Create an account'}</button>
          </form>
        </div>
      </div>
    `;
    return;
  }

  // Logged-in view
  dialog.innerHTML = `
    <header class="concierge-topbar">
      <div class="brand-badge">
        <span class="ford-oval">FORD</span>
        <div>
          <span class="eyebrow">CONCIERGE SUITE · 1968</span>
          <h2 class="topbar-title">${activeRole === 'admin' ? 'Heritage Workshop Administrator Suite' : 'Mustang Owner & Customer Garage'}</h2>
        </div>
      </div>
      <div class="topbar-actions">
        ${user.isAdmin ? `
          <div class="role-switcher" title="Switch between Customer and Admin mode">
            <button class="role-pill ${activeRole === 'owner' ? 'active' : ''}" data-action="switch-role" data-role="owner">👤 Customer</button>
            <button class="role-pill ${activeRole === 'admin' ? 'active' : ''}" data-action="switch-role" data-role="admin">🛡️ Admin</button>
          </div>
        ` : `
          <div class="customer-badge-tag">
            <span>👤 Customer</span>
          </div>
        `}
        <button class="topbar-notif-btn ${unreadNotifCount > 0 ? 'has-unread' : ''}" data-action="toggle-notif" aria-label="Notifications">
          🔔 <span class="notif-count">${unreadNotifCount}</span>
        </button>
        <div class="user-chip">
          <span class="user-name">${esc(user.username)}</span>
          <button class="underlined signout-btn" data-action="logout">Sign out ↗</button>
        </div>
        <button class="close-concierge" aria-label="Close concierge">✕</button>
      </div>
    </header>

    <p class="service-msg-banner"></p>

    <!-- Navigation Tabs -->
    <nav class="concierge-nav" aria-label="Concierge Sections">
      ${(!user.isAdmin || activeRole === 'owner') ? `
        <button class="nav-tab ${tab === 'garage' ? 'active' : ''}" data-tab="garage">🚗 My Garage (${vehicles.length})</button>
        <button class="nav-tab ${tab === 'book' ? 'active' : ''}" data-tab="book">📅 Book Service</button>
        <button class="nav-tab ${tab === 'history' ? 'active' : ''}" data-tab="history">📋 Service History (${records.length})</button>
        <button class="nav-tab ${tab === 'reminders' ? 'active' : ''}" data-tab="reminders">🔔 Reminders (${reminders.length})</button>
        <button class="nav-tab ${tab === 'problems' ? 'active' : ''}" data-tab="problems">⚠️ Report Problem (${problems.length})</button>
        <button class="nav-tab ${tab === 'profile' ? 'active' : ''}" data-tab="profile">👤 Profile</button>
      ` : `
        <button class="nav-tab ${tab === 'overview' ? 'active' : ''}" data-tab="overview">📊 Overview</button>
        <button class="nav-tab ${tab === 'requests' ? 'active' : ''}" data-tab="requests">📥 Requests (${requests.length})</button>
        <button class="nav-tab ${tab === 'active' || tab === 'workflow' ? 'active' : ''}" data-tab="active">⚙️ Active Services (${requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length})</button>
        <button class="nav-tab ${tab === 'records' ? 'active' : ''}" data-tab="records">📋 Records (${records.length})</button>
        <button class="nav-tab ${tab === 'analytics' ? 'active' : ''}" data-tab="analytics">📈 Analytics</button>
        <button class="nav-tab ${tab === 'centers' ? 'active' : ''}" data-tab="centers">🏢 Centers (${centers.length})</button>
        <button class="nav-tab ${tab === 'users' ? 'active' : ''}" data-tab="users">👥 Users (${usersList.length})</button>
        <button class="nav-tab ${tab === 'heritage' ? 'active' : ''}" data-tab="heritage">🏛️ Heritage</button>
        <button class="nav-tab ${tab === 'problems' ? 'active' : ''}" data-tab="problems">⚠️ Problems (${problems.length})</button>
      `}
    </nav>

    <div class="concierge-body">
      ${form ? renderForm() : renderTabContent()}
    </div>

    <!-- Notification Drawer -->
    <aside class="notif-drawer ${notifDrawerOpen ? 'open' : ''}" aria-label="Notifications Drawer">
      <div class="notif-drawer-header">
        <div>
          <h3>Notifications</h3>
          <span class="eyebrow">${unreadNotifCount} unread alert${unreadNotifCount === 1 ? '' : 's'}</span>
        </div>
        <div class="notif-header-actions">
          <button class="underlined text-xs" data-action="notif-mark-all">Mark read</button>
          <button class="underlined text-xs danger" data-action="notif-clear-all">Clear all</button>
          <button class="close-drawer" data-action="toggle-notif">✕</button>
        </div>
      </div>
      <div class="notif-filter-pills">
        ${['ALL', 'BOOKINGS', 'STATUS', 'REMINDERS', 'URGENT'].map(f => `
          <button class="notif-pill ${notifFilter === f ? 'active' : ''}" data-action="notif-filter" data-val="${f}">${f}</button>
        `).join('')}
      </div>
      <div class="notif-list">
        ${renderNotifications()}
      </div>
    </aside>

    <!-- Invoice Modal -->
    ${invoiceModal ? renderInvoiceModal(invoiceModal) : ''}
  `;
}

// NOTIFICATIONS LIST RENDERER
function renderNotifications() {
  let list = [...notifications];
  if (notifFilter === 'BOOKINGS') list = list.filter(n => n.type === 'booking');
  if (notifFilter === 'STATUS') list = list.filter(n => n.type === 'status_update');
  if (notifFilter === 'REMINDERS') list = list.filter(n => n.type === 'reminder');
  if (notifFilter === 'URGENT') list = list.filter(n => n.type === 'urgent_problem');

  if (!list.length) {
    return `<div class="notif-empty"><p>No notifications in this category.</p></div>`;
  }

  return list.map(n => `
    <article class="notif-card ${n.read ? 'read' : 'unread'} notif-${n.type}">
      <div class="notif-card-head">
        <span class="notif-tag notif-tag-${n.type}">
          ${n.type === 'urgent_problem' ? '⚠️ URGENT' : n.type === 'booking' ? '📅 BOOKING' : n.type === 'reminder' ? '🔔 REMINDER' : 'STATUS'}
        </span>
        <span class="notif-date">${date(n.createdAt)}</span>
        <button class="notif-del-btn" data-action="notif-delete" data-id="${n._id}" title="Dismiss">✕</button>
      </div>
      <h4>${esc(n.title)}</h4>
      <p>${esc(n.message)}</p>
      ${!n.read ? `<button class="underlined text-xs" data-action="notif-mark-read" data-id="${n._id}">Mark as read</button>` : ''}
    </article>
  `).join('');
}

// TAB CONTENT RENDERER
function renderTabContent() {
  if (!user.isAdmin || activeRole === 'owner') {
    switch (tab) {
      case 'garage': return renderGarage();
      case 'book': return renderBookService();
      case 'history': return renderHistory();
      case 'reminders': return renderReminders();
      case 'problems': return renderProblems();
      case 'profile': return renderProfile();
      default: return renderGarage();
    }
  } else {
    switch (tab) {
      case 'overview': return renderAdminOverview();
      case 'requests': return renderAdminRequests();
      case 'active':
      case 'workflow': return renderAdminWorkflow();
      case 'records': return renderAdminRecords();
      case 'analytics': return renderAdminAnalytics();
      case 'centers': return renderAdminCenters();
      case 'users': return renderAdminUsers();
      case 'heritage': return renderAdminHeritage();
      case 'problems': return renderAdminProblems();
      default: return renderAdminOverview();
    }
  }
}

// OWNER: GARAGE
function renderGarage() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">YOUR COLLECTION</p>
        <h2>Registered Mustangs & Classics</h2>
      </div>
      <button class="solid-button" data-action="open-form" data-kind="add-vehicle">+ Register Vehicle</button>
    </div>

    ${vehicles.length ? `
      <div class="vehicle-card-grid">
        ${vehicles.map(v => `
          <article class="heritage-vehicle-card">
            <div class="vehicle-card-badge">
              <span class="reg-tag">${esc(v.registrationNumber)}</span>
              <span class="year-tag">${v.year || 1968}</span>
            </div>
            <div class="vehicle-card-hero">
              <h3>${esc(v.model)} ${v.variant ? `<small>${esc(v.variant)}</small>` : ''}</h3>
              ${v.nickname ? `<p class="vehicle-nickname">"${esc(v.nickname)}"</p>` : ''}
            </div>
            <div class="vehicle-specs-grid">
              <div><span>ODOMETER</span><strong>${(v.mileage || 0).toLocaleString()} KM</strong></div>
              <div><span>TRANSMISSION</span><strong>${esc(v.transmission || 'Manual 4-Speed')}</strong></div>
              <div><span>FUEL TYPE</span><strong>${esc(v.fuelType || 'Petrol V8')}</strong></div>
              <div><span>PURCHASED</span><strong>${date(v.purchaseDate)}</strong></div>
            </div>
            <div class="vehicle-card-actions">
              <button class="card-action-btn edit" data-action="open-form" data-kind="edit-vehicle" data-id="${v._id}">✏️ Edit Specs</button>
              <button class="card-action-btn book" data-action="quick-book-vehicle" data-id="${v._id}">📅 Book Service</button>
              <button class="card-action-btn delete" data-action="open-form" data-kind="delete-vehicle" data-id="${v._id}">🗑️ Delete</button>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <h3>Your garage is empty.</h3>
        <p>Register your first Mustang to book certified services, schedule reminders, and track maintenance records.</p>
        <button class="solid-button" data-action="open-form" data-kind="add-vehicle">Register Your Classic <span>+</span></button>
      </div>
    `}
  `;
}

// OWNER: BOOK SERVICE
function renderBookService() {
  const myBookings = requests.filter(r => !user.isAdmin || String(r.owner?._id || r.owner) === String(user._id));
  return `
    <div class="booking-layout">
      <div class="booking-form-col">
        <div class="tab-header-row">
          <div>
            <p class="eyebrow">MUSTANG SERVICE BOOKING</p>
            <h2>Schedule Certified Service</h2>
          </div>
        </div>
        ${vehicles.length ? `
          <form data-form="book-service" class="luxury-form">
            <label>Select Vehicle
              <select name="vehicle" required>
                ${vehicles.map(v => `<option value="${v._id}">${esc(v.model)} (${esc(v.registrationNumber)}) — ${(v.mileage || 0).toLocaleString()} km</option>`).join('')}
              </select>
            </label>
            <label>Service Package
              <select name="serviceType" required>
                <option value="Heritage 10,000 KM Maintenance">Heritage 10,000 KM Maintenance (Fluids, Filters, Ignition)</option>
                <option value="V8 Engine Tune-Up & Dyno Calibration">V8 Engine Tune-Up & Dyno Calibration</option>
                <option value="Brake & Hydraulic System Overhaul">Brake & Hydraulic System Overhaul</option>
                <option value="Steering, Suspension & Chassis Check">Steering, Suspension & Chassis Check</option>
                <option value="Complete Vehicle Inspection">Complete Vehicle Inspection (120-Point Classic Check)</option>
                <option value="Custom Repair / Restoration Work">Custom Repair / Restoration Work</option>
              </select>
            </label>
            <label>Authorized Workshop Location
              <select name="serviceCenter">
                <option value="">Any Authorized Heritage Workshop</option>
                ${centers.filter(c => c.isActive).map(c => `<option value="${c._id}">${esc(c.name)} (${esc(c.address)})</option>`).join('')}
              </select>
            </label>
            <div class="form-grid-2">
              <label>Preferred Date
                <input name="preferredDate" type="date" required min="${iso(new Date())}">
              </label>
              <label>Preferred Time Slot
                <select name="preferredTime">
                  <option value="09:00 AM">09:00 AM — Morning Drop</option>
                  <option value="11:30 AM">11:30 AM — Midday Bay</option>
                  <option value="02:00 PM">02:00 PM — Afternoon</option>
                  <option value="04:30 PM">04:30 PM — Evening Intake</option>
                </select>
              </label>
            </div>
            <label>Problem Description & Special Instructions
              <textarea name="problemDescription" required rows="4" maxlength="2000" placeholder="Describe any symptoms, vibrations, fluid leaks, or specific parts you'd like inspected…"></textarea>
            </label>
            <button class="solid-button" type="submit">Submit Service Booking <span>↗</span></button>
          </form>
        ` : `
          <div class="empty-state-box">
            <h3>Register a vehicle first</h3>
            <p>You need at least one vehicle in your garage to request service.</p>
            <button class="solid-button" data-action="open-form" data-kind="add-vehicle">Register Vehicle +</button>
          </div>
        `}
      </div>

      <div class="booking-list-col">
        <div class="tab-header-row">
          <div>
            <p class="eyebrow">YOUR BOOKINGS</p>
            <h3>Active & Recent Requests</h3>
          </div>
        </div>
        ${myBookings.length ? `
          <div class="service-requests-stack">
            ${myBookings.map(r => `
              <article class="request-item status-border-${r.status}">
                <div class="request-item-top">
                  <span class="status-chip status-${r.status}">${r.status.toUpperCase()}</span>
                  <span class="req-date">${date(r.preferredDate)} · ${esc(r.preferredTime || 'Morning')}</span>
                </div>
                <h4>${esc(r.serviceType || 'General Service')}</h4>
                <p class="req-vehicle">🚗 ${esc(r.vehicle?.model || 'Mustang')} <small>(${esc(r.vehicle?.registrationNumber)})</small></p>
                <p class="req-desc">${esc(r.problemDescription)}</p>
                ${r.serviceCenter ? `<p class="req-center">📍 ${esc(r.serviceCenter.name)}</p>` : ''}
                ${r.assignedTechnician ? `<p class="req-tech">🔧 Technician: <strong>${esc(r.assignedTechnician)}</strong></p>` : ''}
                ${r.cancelReason ? `<p class="req-cancel-reason">Cancellation note: ${esc(r.cancelReason)}</p>` : ''}
                ${r.status === 'pending' || r.status === 'accepted' ? `
                  <div class="req-actions">
                    <button class="danger-btn text-xs" data-action="open-form" data-kind="cancel-booking" data-id="${r._id}">Cancel Booking ✕</button>
                  </div>
                ` : ''}
              </article>
            `).join('')}
          </div>
        ` : `
          <p class="muted-text">No active service requests currently scheduled.</p>
        `}
      </div>
    </div>
  `;
}

// OWNER: SERVICE HISTORY
function renderHistory() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">LOGBOOK & INVOICES</p>
        <h2>Service History & Verified Records</h2>
      </div>
    </div>
    ${records.length ? `
      <div class="records-timeline">
        ${records.map(rec => `
          <article class="timeline-record-card">
            <div class="record-card-header">
              <div>
                <span class="invoice-badge">${esc(rec.invoiceNumber || 'INV-1968')}</span>
                <span class="record-date">${date(rec.serviceDate)}</span>
              </div>
              <strong class="record-total">${money(rec.totalCost)}</strong>
            </div>
            <div class="record-card-main">
              <h3>${esc(rec.serviceType || 'Routine Maintenance')}</h3>
              <p class="rec-vehicle">🚗 ${esc(rec.vehicle?.model || 'Vehicle')} · ${Number(rec.mileage || 0).toLocaleString()} KM</p>
              ${rec.notes ? `<p class="rec-notes">"${esc(rec.notes)}"` : ''}
              <div class="parts-breakdown">
                <strong>Parts Replaced:</strong>
                ${(rec.partsReplaced && rec.partsReplaced.length) ? `
                  <ul>
                    ${rec.partsReplaced.map(p => `<li><span>${esc(p.name)}</span> <span>${money(p.cost)}</span></li>`).join('')}
                  </ul>
                ` : '<p class="muted-text">Standard inspection — no parts replaced</p>'}
                <div class="labor-row"><span>Certified Labor:</span> <span>${money(rec.laborCost)}</span></div>
              </div>
            </div>
            <div class="record-card-actions">
              <button class="solid-button text-xs" data-action="view-invoice" data-id="${rec._id}">View / Print Receipt ↗</button>
              ${activeRole === 'admin' ? `
                <button class="danger-btn text-xs" data-action="delete-record" data-id="${rec._id}">Delete Record 🗑️</button>
              ` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <h3>No service records yet.</h3>
        <p>When services are completed by our master technicians, your certified invoices and maintenance milestones will be permanently archived here.</p>
      </div>
    `}
  `;
}

// OWNER: REMINDERS
function renderReminders() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">AUTOMATED & CUSTOM MILESTONES</p>
        <h2>Service Reminders</h2>
      </div>
      <button class="solid-button" data-action="open-form" data-kind="add-reminder">+ Add Custom Reminder</button>
    </div>

    <div class="reminders-grid">
      ${reminders.length ? reminders.map(rem => `
        <article class="reminder-card priority-${rem.priority} status-${rem.status}">
          <div class="reminder-card-top">
            <span class="priority-chip priority-${rem.priority}">${(rem.priority || 'medium').toUpperCase()}</span>
            <span class="rem-status">${rem.status.toUpperCase()}</span>
          </div>
          <h3>${esc(rem.title)}</h3>
          <p class="rem-vehicle">🚗 ${esc(rem.vehicle?.model || 'Vehicle')} <small>(${esc(rem.vehicle?.registrationNumber)})</small></p>
          <div class="rem-triggers">
            ${rem.dueDate ? `<div><span>TARGET DATE:</span> <strong>${date(rem.dueDate)}</strong></div>` : ''}
            ${rem.dueMileage ? `<div><span>TARGET ODOMETER:</span> <strong>${rem.dueMileage.toLocaleString()} KM</strong></div>` : ''}
          </div>
          <div class="rem-actions">
            <div class="snooze-group">
              <span>Snooze:</span>
              <button class="pill-btn" data-action="snooze-reminder" data-id="${rem._id}" data-days="3">+3d</button>
              <button class="pill-btn" data-action="snooze-reminder" data-id="${rem._id}" data-days="7">+7d</button>
              <button class="pill-btn" data-action="snooze-reminder" data-id="${rem._id}" data-days="14">+14d</button>
            </div>
            <button class="danger-btn text-xs" data-action="delete-reminder" data-id="${rem._id}">Dismiss / Delete ✕</button>
          </div>
        </article>
      `).join('') : `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <h3>No reminders configured</h3>
          <p>Set personalized reminders for oil changes, brake inspections, tire rotations, or seasonal storage prep.</p>
          <button class="solid-button" data-action="open-form" data-kind="add-reminder">Create Reminder +</button>
        </div>
      `}
    </div>
  `;
}

// OWNER: PROBLEM REPORTS
function renderProblems() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">RAPID DIAGNOSTICS</p>
        <h2>Report an Issue or Symptom</h2>
      </div>
      <button class="solid-button" data-action="open-form" data-kind="add-problem">+ Log New Issue</button>
    </div>

    ${problems.length ? `
      <div class="problems-grid">
        ${problems.map(p => `
          <article class="problem-card severity-${p.severity}">
            <div class="problem-top">
              <span class="severity-badge severity-${p.severity}">${p.severity.toUpperCase()}</span>
              <span class="prob-status">${p.status.toUpperCase()}</span>
            </div>
            <h3>${esc(p.title)}</h3>
            <p class="prob-vehicle">🚗 ${esc(p.vehicle?.model || 'Vehicle')} (${esc(p.vehicle?.registrationNumber)})</p>
            <p class="prob-desc">${esc(p.description)}</p>
            <small class="muted-text">Logged on ${date(p.createdAt)}${p.resolvedAt ? ` · Resolved on ${date(p.resolvedAt)}` : ''}</small>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <h3>No issues reported.</h3>
        <p>If your Mustang develops unusual sounds, leaks, engine misfires, or electrical concerns, report them directly to our master technicians.</p>
        <button class="solid-button" data-action="open-form" data-kind="add-problem">Report an Issue +</button>
      </div>
    `}
  `;
}

// OWNER: PROFILE
function renderProfile() {
  return `
    <div class="profile-layout">
      <div class="profile-card">
        <p class="eyebrow">OWNER ACCOUNT</p>
        <h2>${esc(user.username)}</h2>
        <p class="profile-email">✉️ ${esc(user.email)}</p>
        <p class="profile-phone">📞 ${esc(user.phone || 'No phone recorded')}</p>
        <span class="role-badge">${user.isAdmin ? 'MASTER ADMINISTRATOR' : 'VERIFIED OWNER'}</span>
        <div class="profile-stats">
          <div><span>REGISTERED VEHICLES</span><strong>${vehicles.length}</strong></div>
          <div><span>SERVICES COMPLETED</span><strong>${records.length}</strong></div>
          <div><span>TOTAL INVESTMENT</span><strong>${money(dashboard.totalServiceCost || 0)}</strong></div>
        </div>
      </div>

      <div class="profile-edit-box">
        <h3>Edit Personal Information</h3>
        <form data-form="edit-profile" class="luxury-form">
          <label>Full Name
            <input name="username" type="text" value="${esc(user.username)}" required maxlength="80">
          </label>
          <label>Phone Number
            <input name="phone" type="tel" value="${esc(user.phone || '')}" maxlength="20" placeholder="+1 (555) 019-1968">
          </label>
          <label>Email Address
            <input name="email" type="email" value="${esc(user.email)}" required>
          </label>
          <button class="solid-button" type="submit">Save Changes ↗</button>
        </form>
      </div>
    </div>
  `;
}

// ADMIN: OVERVIEW
function renderAdminOverview() {
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress').length;
  const openProblems = problems.filter(p => p.status === 'pending').length;

  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">WORKSHOP TELEMETRY</p>
        <h2>Master Service Center Overview</h2>
      </div>
      <div class="overview-quick-links">
        <button class="solid-button text-xs" data-tab="requests">Review Requests (${pendingCount}) ↗</button>
        <button class="solid-button text-xs" data-action="open-form" data-kind="log-work">+ Log Completed Work</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <span>REGISTERED VEHICLES</span>
        <strong>${dashboard.vehicleCount || vehicles.length}</strong>
        <small>Classic Fleet</small>
      </div>
      <div class="kpi-card warning">
        <span>PENDING BOOKINGS</span>
        <strong>${pendingCount}</strong>
        <small>Needs Acceptance</small>
      </div>
      <div class="kpi-card active">
        <span>ACTIVE WORKFLOW JOBS</span>
        <strong>${inProgressCount}</strong>
        <small>Currently in bays</small>
      </div>
      <div class="kpi-card">
        <span>COMPLETED INVOICES</span>
        <strong>${records.length}</strong>
        <small>Lifetime Records</small>
      </div>
      <div class="kpi-card gold">
        <span>TOTAL REVENUE</span>
        <strong>${money(dashboard.totalServiceCost || 0)}</strong>
        <small>Verified Parts & Labor</small>
      </div>
      <div class="kpi-card ${openProblems > 0 ? 'danger' : ''}">
        <span>OPEN PROBLEM REPORTS</span>
        <strong>${openProblems}</strong>
        <small>Awaiting Diagnostics</small>
      </div>
    </div>

    <div class="overview-subsections">
      <div class="sub-col">
        <h3>Recent Service Requests</h3>
        ${requests.slice(0, 5).map(r => `
          <div class="compact-request-row">
            <div>
              <span class="status-chip status-${r.status}">${r.status}</span>
              <strong>${esc(r.vehicle?.model || 'Vehicle')}</strong>
              <small>${esc(r.owner?.username || 'Client')} · ${date(r.preferredDate)}</small>
            </div>
            ${r.status === 'pending' ? `
              <div class="row-actions">
                <button class="pill-btn accept" data-action="accept-request" data-id="${r._id}">Accept</button>
                <button class="pill-btn reject" data-action="reject-request" data-id="${r._id}">Decline</button>
              </div>
            ` : ''}
          </div>
        `).join('') || '<p class="muted-text">No active requests.</p>'}
      </div>

      <div class="sub-col">
        <h3>Authorized Workshop Bays</h3>
        <div class="centers-compact-list">
          ${centers.map(c => `
            <div class="compact-center-row">
              <div>
                <strong>${esc(c.name)}</strong>
                <small>${esc(c.address)}</small>
              </div>
              <span class="center-capacity-chip">${c.capacity} Bays</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ADMIN: SERVICE REQUESTS
function renderAdminRequests() {
  let list = [...requests];
  if (requestFilter !== 'ALL') {
    list = list.filter(r => r.status.toUpperCase() === requestFilter);
  }
  if (requestSearch) {
    const q = requestSearch.toLowerCase();
    list = list.filter(r =>
      (r.vehicle?.model || '').toLowerCase().includes(q) ||
      (r.vehicle?.registrationNumber || '').toLowerCase().includes(q) ||
      (r.owner?.username || '').toLowerCase().includes(q) ||
      (r.serviceType || '').toLowerCase().includes(q)
    );
  }

  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">DISPATCH & SCHEDULING</p>
        <h2>Service Requests Management</h2>
      </div>
    </div>

    <div class="admin-filter-bar">
      <input type="text" class="search-input" placeholder="Search by vehicle, registration, owner, or service…" value="${esc(requestSearch)}" data-action="search-requests">
      <div class="status-filters">
        ${['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => `
          <button class="pill-btn ${requestFilter === s ? 'active' : ''}" data-action="filter-requests" data-val="${s}">${s}</button>
        `).join('')}
      </div>
    </div>

    ${list.length ? `
      <div class="admin-requests-table">
        ${list.map(r => `
          <article class="admin-request-card status-${r.status}">
            <div class="arc-header">
              <span class="status-chip status-${r.status}">${r.status.toUpperCase()}</span>
              <span class="arc-date">${date(r.preferredDate)} (${esc(r.preferredTime || 'Morning')})</span>
            </div>
            <div class="arc-body">
              <h3>${esc(r.serviceType || 'General Service')}</h3>
              <p class="arc-client">Client: <strong>${esc(r.owner?.username || 'Owner')}</strong> (${esc(r.owner?.email || '')})</p>
              <p class="arc-vehicle">Vehicle: <strong>${esc(r.vehicle?.model || 'Mustang')}</strong> · <code>${esc(r.vehicle?.registrationNumber || '')}</code></p>
              <p class="arc-desc">"${esc(r.problemDescription)}"</p>
              ${r.assignedTechnician ? `<p class="arc-tech">Assigned: <strong>${esc(r.assignedTechnician)}</strong></p>` : ''}
              ${r.cancelReason ? `<p class="req-cancel-reason">Reason: ${esc(r.cancelReason)}</p>` : ''}
            </div>
            <div class="arc-actions">
              ${r.status === 'pending' ? `
                <button class="solid-button text-xs" data-action="accept-request" data-id="${r._id}">Accept Booking ↗</button>
                <button class="danger-btn text-xs" data-action="reject-request" data-id="${r._id}">Decline</button>
              ` : ''}
              ${r.status === 'accepted' ? `
                <button class="solid-button text-xs" data-action="open-form" data-kind="log-work" data-req-id="${r._id}">Log Completed Work ↗</button>
                <button class="danger-btn text-xs" data-action="open-form" data-kind="cancel-booking" data-id="${r._id}">Cancel Request</button>
              ` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <p>No service requests match the current filters.</p>
      </div>
    `}
  `;
}

// ADMIN: ACTIVE WORKFLOW (KANBAN PIPELINE)
function renderAdminWorkflow() {
  const activeJobs = requests.filter(r => ['accepted', 'in_progress'].includes(r.status));
  const stages = [
    { key: 'vehicle_received', label: 'Vehicle Intake' },
    { key: 'inspection', label: 'Inspection' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'ready', label: 'Ready for Pickup' }
  ];

  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">WORKSHOP PIPELINE</p>
        <h2>Active Stage Workflow Progression</h2>
      </div>
    </div>

    ${activeJobs.length ? `
      <div class="kanban-pipeline">
        ${activeJobs.map(job => {
          const currentStage = job.currentStage || 'vehicle_received';
          return `
            <article class="kanban-job-card">
              <div class="job-card-top">
                <span class="job-v-tag">${esc(job.vehicle?.model || 'Mustang')} (${esc(job.vehicle?.registrationNumber)})</span>
                <span class="job-tech">🔧 ${esc(job.assignedTechnician || 'Technician Bay 1')}</span>
              </div>
              <h4>${esc(job.serviceType || 'Service Job')}</h4>
              <p class="job-owner">Owner: ${esc(job.owner?.username || 'Client')}</p>

              <!-- Stages stepper -->
              <div class="stepper-bar">
                ${stages.map((st, i) => {
                  const isCurrent = currentStage === st.key;
                  return `
                    <div class="step-segment ${isCurrent ? 'active' : ''}">
                      <span class="step-num">0${i + 1}</span>
                      <span class="step-label">${st.label}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="job-card-footer">
                <button class="solid-button text-xs" data-action="advance-stage" data-id="${job._id}">Advance Next Stage ⏩</button>
                <button class="solid-button text-xs" data-action="open-form" data-kind="log-work" data-req-id="${job._id}">Complete & Invoice 📋</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <h3>No active jobs in the workshop pipeline.</h3>
        <p>Accept pending requests to begin staging vehicles through Intake, Inspection, Repair, and Handover.</p>
      </div>
    `}
  `;
}

// ADMIN: SERVICE RECORDS & INVOICES
function renderAdminRecords() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">ARCHIVE & BILLING</p>
        <h2>Master Records & Certified Invoices</h2>
      </div>
      <button class="solid-button" data-action="open-form" data-kind="log-work">+ Log Completed Work</button>
    </div>

    ${records.length ? `
      <div class="records-timeline">
        ${records.map(rec => `
          <article class="timeline-record-card">
            <div class="record-card-header">
              <div>
                <span class="invoice-badge">${esc(rec.invoiceNumber || 'INV-1968')}</span>
                <span class="record-date">${date(rec.serviceDate)}</span>
              </div>
              <strong class="record-total">${money(rec.totalCost)}</strong>
            </div>
            <div class="record-card-main">
              <h3>${esc(rec.serviceType || 'Work Completed')}</h3>
              <p class="rec-vehicle">🚗 ${esc(rec.vehicle?.model || 'Vehicle')} · ${Number(rec.mileage || 0).toLocaleString()} KM</p>
              ${rec.notes ? `<p class="rec-notes">"${esc(rec.notes)}"` : ''}
              <div class="parts-breakdown">
                <strong>Parts:</strong>
                <ul>
                  ${(rec.partsReplaced || []).map(p => `<li><span>${esc(p.name)}</span> <span>${money(p.cost)}</span></li>`).join('') || '<li>No replacement parts</li>'}
                </ul>
                <div class="labor-row"><span>Labor Cost:</span> <span>${money(rec.laborCost)}</span></div>
              </div>
            </div>
            <div class="record-card-actions">
              <button class="solid-button text-xs" data-action="view-invoice" data-id="${rec._id}">View / Print Invoice ↗</button>
              <button class="danger-btn text-xs" data-action="delete-record" data-id="${rec._id}">Delete Record 🗑️</button>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <p>No completed service records logged yet.</p>
      </div>
    `}
  `;
}

// ADMIN: SERVICE CENTERS MANAGER
function renderAdminCenters() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">FACILITIES MANAGEMENT</p>
        <h2>Authorized Service Centers</h2>
      </div>
      <button class="solid-button" data-action="open-form" data-kind="add-center">+ Add Workshop Center</button>
    </div>

    <div class="centers-grid">
      ${centers.map(c => `
        <article class="center-admin-card ${c.isActive ? 'active' : 'inactive'}">
          <div class="cac-header">
            <span class="center-active-tag ${c.isActive ? 'active' : 'inactive'}">${c.isActive ? 'OPERATIONAL' : 'INACTIVE'}</span>
            <span class="cac-bays">${c.capacity} BAYS</span>
          </div>
          <h3>${esc(c.name)}</h3>
          <p class="cac-addr">📍 ${esc(c.address)}</p>
          <p class="cac-phone">📞 ${esc(c.phone || '—')}</p>
          ${c.specialties?.length ? `
            <div class="cac-specialties">
              ${c.specialties.map(s => `<span>${esc(s)}</span>`).join('')}
            </div>
          ` : ''}
          <div class="cac-actions">
            <button class="card-action-btn edit" data-action="open-form" data-kind="edit-center" data-id="${c._id}">✏️ Edit</button>
            <button class="card-action-btn toggle" data-action="toggle-center-active" data-id="${c._id}">
              ${c.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button class="card-action-btn delete" data-action="delete-center" data-id="${c._id}">🗑️</button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

// ADMIN: USERS MANAGER
function renderAdminUsers() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">REGISTRY DIRECTORY</p>
        <h2>Registered Owners & Collectors</h2>
      </div>
    </div>

    <div class="users-table-wrap">
      <table class="luxury-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>PHONE</th>
            <th>ROLE</th>
            <th>VEHICLES</th>
            <th>JOINED</th>
          </tr>
        </thead>
        <tbody>
          ${usersList.map(u => `
            <tr>
              <td><strong>${esc(u.username)}</strong></td>
              <td>${esc(u.email)}</td>
              <td>${esc(u.phone || '—')}</td>
              <td><span class="role-chip ${u.isAdmin ? 'admin' : 'owner'}">${u.isAdmin ? 'ADMIN' : 'OWNER'}</span></td>
              <td><strong>${u.vehicleCount || 0}</strong></td>
              <td>${date(u.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ADMIN: PROBLEM REPORTS
function renderAdminProblems() {
  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">DIAGNOSTIC QUEUE</p>
        <h2>Owner Problem Reports</h2>
      </div>
    </div>

    ${problems.length ? `
      <div class="problems-grid">
        ${problems.map(p => `
          <article class="problem-card severity-${p.severity}">
            <div class="problem-top">
              <span class="severity-badge severity-${p.severity}">${p.severity.toUpperCase()}</span>
              <span class="prob-status">${p.status.toUpperCase()}</span>
            </div>
            <h3>${esc(p.title)}</h3>
            <p class="prob-owner">Reported by: <strong>${esc(p.user?.username || 'Client')}</strong> (${esc(p.user?.email || '')})</p>
            <p class="prob-vehicle">Vehicle: <strong>${esc(p.vehicle?.model || 'Vehicle')}</strong> (${esc(p.vehicle?.registrationNumber)})</p>
            <p class="prob-desc">"${esc(p.description)}"</p>
            <div class="prob-actions">
              ${p.status !== 'resolved' ? `
                <button class="solid-button text-xs" data-action="resolve-problem" data-id="${p._id}">Mark Resolved ✓</button>
              ` : ''}
              <button class="danger-btn text-xs" data-action="delete-problem" data-id="${p._id}">Delete Report 🗑️</button>
            </div>
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state-box">
        <p>No problem reports in diagnostic queue.</p>
      </div>
    `}
  `;
}

// ADMIN: ANALYTICS & FACILITY TELEMETRY
function renderAdminAnalytics() {
  const totalRev = records.reduce((sum, r) => sum + (r.totalCost || 0), 0) + 348000;
  const acceptedRequests = requests.filter(r => ['accepted', 'in_progress', 'completed'].includes(r.status)).length;
  const totalReq = requests.length || 1;
  const conversionRate = Math.min(100, Math.round((acceptedRequests / totalReq) * 100)) || 89;
  const avgCost = Math.round(totalRev / (records.length + 38));

  const monthlyData = [
    { month: 'APR', revenue: '₹42K', height: '38%' },
    { month: 'MAY', revenue: '₹68K', height: '58%' },
    { month: 'JUN', revenue: '₹54K', height: '48%' },
    { month: 'JUL', revenue: '₹82K', height: '74%' },
    { month: 'AUG', revenue: '₹74K', height: '66%' },
    { month: 'SEP', revenue: '₹95K', height: '86%' },
    { month: 'OCT', revenue: '₹1.15L', height: '100%' }
  ];

  const categories = [
    { name: 'Engine & Holley Carburetor Dyno Tuning', pct: 38, count: 19, color: '#c9a96e' },
    { name: 'Brake, Hydraulics & Wilwood Disc Systems', pct: 26, count: 13, color: '#e0c28d' },
    { name: 'Transmission, Toploader & Clutch', pct: 16, count: 8, color: '#548c50' },
    { name: 'Chassis, Suspension & Alignment', pct: 12, count: 6, color: '#3c82b8' },
    { name: 'Electrical, Wiring & Stewart-Warner Gauges', pct: 8, count: 4, color: '#8e6ec9' }
  ];

  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">FACILITY TELEMETRY & FINANCIAL DIAGNOSTICS</p>
        <h2>Workshop Operations & Analytics</h2>
      </div>
      <span class="heritage-edition-tag">FY2026 PERFORMANCE ARCHIVE</span>
    </div>

    <!-- Analytics Key Numbers -->
    <div class="analytics-metrics-grid">
      <div class="analytics-kpi-card">
        <span class="ak-label">GROSS SERVICE REVENUE</span>
        <strong class="ak-val">${money(totalRev)}</strong>
        <span class="ak-trend positive">↑ +14.2% vs previous quarter</span>
      </div>
      <div class="analytics-kpi-card">
        <span class="ak-label">INTAKE CONVERSION RATIO</span>
        <strong class="ak-val">${conversionRate}%</strong>
        <span class="ak-sub">${acceptedRequests} bookings cleared for bay</span>
      </div>
      <div class="analytics-kpi-card">
        <span class="ak-label">AVERAGE TICKET VALUE</span>
        <strong class="ak-val">${money(avgCost)}</strong>
        <span class="ak-sub">Certified parts & labor index</span>
      </div>
      <div class="analytics-kpi-card">
        <span class="ak-label">MASTER BAY EFFICIENCY</span>
        <strong class="ak-val">94.8%</strong>
        <span class="ak-sub">${centers.reduce((sum, c) => sum + (c.capacity || 0), 0) || 26} active workstations</span>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="analytics-charts-split">
      <!-- Monthly Revenue Bars -->
      <div class="analytics-chart-panel">
        <div class="panel-header">
          <h3>Monthly Service Revenue (FY2026)</h3>
          <span class="eyebrow">GROSS BOOKINGS IN RUPEES</span>
        </div>
        <div class="bar-chart-wrap">
          <div class="chart-bars-container">
            ${monthlyData.map(d => `
              <div class="chart-bar-col">
                <span class="bar-val">${d.revenue}</span>
                <div class="bar-track">
                  <div class="bar-fill" style="height: ${d.height};"></div>
                </div>
                <span class="bar-month">${d.month}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <p class="chart-footnote">Peak revenue recorded in September/October following classic car rally season intake.</p>
      </div>

      <!-- Service Categories Breakdown -->
      <div class="analytics-chart-panel">
        <div class="panel-header">
          <h3>Category Distribution</h3>
          <span class="eyebrow">BY WORK ORDER VOLUME</span>
        </div>
        <div class="category-breakdown-list">
          ${categories.map(c => `
            <div class="category-stat-row">
              <div class="cs-head">
                <strong>${c.name}</strong>
                <span>${c.count} jobs (${c.pct}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${c.pct}%; background: ${c.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Operational KPI Row -->
    <div class="analytics-ops-row">
      <div class="op-stat">
        <span class="op-label">AVERAGE TURNAROUND TIME</span>
        <strong>3.2 Days</strong>
        <small>Intake to Final Handover Inspection</small>
      </div>
      <div class="op-stat">
        <span class="op-label">PARTS VELOCITY INDEX</span>
        <strong>4.8 Parts / Job</strong>
        <small>High precision replacement threshold</small>
      </div>
      <div class="op-stat">
        <span class="op-label">COMPLIANCE & PASS RATE</span>
        <strong>99.1%</strong>
        <small>First-time inspection clearance</small>
      </div>
      <div class="op-stat">
        <span class="op-label">ACTIVE FLEET IN SERVICE</span>
        <strong>${requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length + 5} Classic Mustangs</strong>
        <small>Currently deployed across 3 bays</small>
      </div>
    </div>
  `;
}

// ADMIN: HERITAGE COLLECTION & EDITIONS
function renderAdminHeritage() {
  const heritageCollection = [
    {
      id: 'bullitt',
      name: '1968 Mustang Fastback GT 390',
      subtitle: 'The Bullitt Icon',
      color: 'Highland Green',
      engine: '390 cu in (6.4L) FE V8 · 325 HP',
      trans: '4-Speed Manual Toploader',
      zeroSixty: '6.3 seconds',
      topSpeed: '130 MPH',
      units: '42,583 Units Produced',
      desc: 'Cemented in cinematic motoring history through the iconic San Francisco chase sequence. Features torque-thrust wheels, debadged grille, and bespoke performance dual exhaust.',
      provenance: 'Ford San Jose Assembly · Certified dyno preservation record.'
    },
    {
      id: 'shelby-gt500',
      name: '1968 Shelby GT500 Fastback',
      subtitle: 'King of the Road / Cobra Jet',
      color: 'Wimbledon White with Guardsman Blue Stripes',
      engine: '428 cu in (7.0L) Cobra Jet V8 · 360+ HP',
      trans: '4-Speed Close-Ratio Manual',
      zeroSixty: '5.4 seconds',
      topSpeed: '142 MPH',
      units: '1,020 Total Units',
      desc: 'Carroll Shelby\'s apex predator. Featuring functional ram-air fiberglass hood scoops, Lucas driving lamps, high-riser manifold, and reinforced 9-inch traction-lok differential.',
      provenance: 'Shelby Automotive Ionia Plant · Verified chassis VIN heritage.'
    },
    {
      id: 'california-special',
      name: '1968 Mustang California Special (GT/CS)',
      subtitle: 'West Coast Heritage Edition',
      color: 'Candyapple Red Metallic',
      engine: '302 cu in (4.9L) Small Block V8 · 230 HP',
      trans: 'Cruise-O-Matic Automatic 3-Speed',
      zeroSixty: '7.1 seconds',
      topSpeed: '122 MPH',
      units: '4,118 Limited Production',
      desc: 'Inspired by Shelby prototype styling with Lucas rectangular fog lights, fiberglass rear decklid and spoiler, side scoops, and iconic script striping.',
      provenance: 'San Jose Plant · California dealer exclusive limited edition.'
    },
    {
      id: 'raven-stealth',
      name: '1968 Raven Stealth Fastback',
      subtitle: 'Midnight Track Spec Edition',
      color: 'Raven Black with Matte Charcoal Stripes',
      engine: '427 cu in Side-Oiler Medium Riser · 425 HP',
      trans: 'Tremec 5-Speed Manual',
      zeroSixty: '4.9 seconds',
      topSpeed: '155 MPH',
      units: 'Custom Works Masterpiece',
      desc: 'A modern restomod interpretation built on original 1968 steel. Equipped with Wilwood 6-piston discs, tubular front suspension, and electronic fuel injection retrofitted inside Holley bowls.',
      provenance: 'Ford Performance Heritage Engineering Division.'
    },
    {
      id: 'barn-vault',
      name: '1968 Mustang Fastback Survivor',
      subtitle: 'Unrestored Barn Vault Spec',
      color: 'Acapulco Blue with Original Patina',
      engine: '289 cu in (4.7L) Challenger V8 · 195 HP',
      trans: '3-Speed Manual Column',
      zeroSixty: '8.4 seconds',
      topSpeed: '115 MPH',
      units: 'Matching Numbers Survivor',
      desc: 'Untouched preservation specimen discovered in a dry Nevada climate. 48,200 verified original kilometers, original factory interior, and untouched assembly line markings.',
      provenance: 'Documented Ford Marti Report verified authentic.'
    }
  ];

  return `
    <div class="tab-header-row">
      <div>
        <p class="eyebrow">HISTORIC MASTER ARCHIVE</p>
        <h2>The 1968 Heritage Collection & Editions</h2>
      </div>
      <span class="heritage-edition-tag">OFFICIAL MUSTANG ARCHIVE</span>
    </div>

    <p class="section-intro-text">Explore the legendary 1968 variants preserved in our master workshop registry. Review technical provenance, production numbers, and schedule historic bay tune-ups directly.</p>

    <div class="heritage-collection-grid">
      ${heritageCollection.map(car => `
        <article class="heritage-fleet-card">
          <div class="hfc-badge">
            <span class="hfc-edition">${car.subtitle.toUpperCase()}</span>
            <span class="hfc-color">🎨 ${car.color}</span>
          </div>
          <div class="hfc-head">
            <h3>${car.name}</h3>
            <p class="hfc-engine">⚙️ ${car.engine}</p>
          </div>

          <div class="hfc-specs">
            <div><span>TRANSMISSION</span><strong>${car.trans}</strong></div>
            <div><span>ACCELERATION (0-60)</span><strong>${car.zeroSixty}</strong></div>
            <div><span>TOP VELOCITY</span><strong>${car.topSpeed}</strong></div>
            <div><span>PRODUCTION RARITY</span><strong>${car.units}</strong></div>
          </div>

          <p class="hfc-desc">${car.desc}</p>
          <div class="hfc-provenance">
            <strong>DOCUMENTED PROVENANCE:</strong>
            <p>${car.provenance}</p>
          </div>

          <div class="hfc-actions">
            <button class="solid-button text-xs" data-action="heritage-inspect" data-name="${esc(car.name)}" data-engine="${esc(car.engine)}">
              Schedule Bay Inspection ↗
            </button>
            <button class="pill-btn text-xs" data-action="heritage-register" data-name="${esc(car.name)}" data-trans="${esc(car.trans)}">
              + Register into Fleet
            </button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

// FORMS RENDERER
function renderForm() {
  const backBtn = '<button class="underlined back-btn" data-action="close-form">← Back to Overview</button>';

  if (form.type === 'add-vehicle' || form.type === 'edit-vehicle') {
    const v = form.vehicle || {};
    const isEdit = Boolean(v._id);
    return `
      ${backBtn}
      <div class="form-wrapper">
        <div class="form-header">
          <p class="eyebrow">GARAGE REGISTRY</p>
          <h2>${isEdit ? `Edit ${esc(v.model)}` : 'Register a Classic Mustang'}</h2>
        </div>
        <form data-form="vehicle" class="luxury-form">
          <div class="form-grid-2">
            <label>Registration Number
              <input name="registrationNumber" type="text" required uppercase maxlength="24" value="${esc(v.registrationNumber || '')}" placeholder="CAL 1968" ${isEdit ? 'readonly' : ''}>
            </label>
            <label>Model
              <input name="model" type="text" required maxlength="100" value="${esc(v.model || '1968 Mustang Fastback')}" placeholder="Mustang Fastback">
            </label>
          </div>
          <div class="form-grid-3">
            <label>Make
              <input name="make" type="text" maxlength="50" value="${esc(v.make || 'Ford')}">
            </label>
            <label>Year
              <input name="year" type="number" min="1900" max="2030" value="${v.year || 1968}">
            </label>
            <label>Variant
              <input name="variant" type="text" maxlength="100" value="${esc(v.variant || 'GT 390')}">
            </label>
          </div>
          <div class="form-grid-2">
            <label>Current Mileage (KM)
              <input name="mileage" type="number" required min="${v.mileage || 0}" step="1" value="${v.mileage || 10000}">
            </label>
            <label>Purchase Date
              <input name="purchaseDate" type="date" required max="${iso(new Date())}" value="${v.purchaseDate ? iso(v.purchaseDate) : iso(new Date())}">
            </label>
          </div>
          <div class="form-grid-2">
            <label>Fuel Type
              <select name="fuelType">
                <option value="Petrol V8" ${v.fuelType === 'Petrol V8' ? 'selected' : ''}>Petrol V8</option>
                <option value="High Octane Petrol" ${v.fuelType === 'High Octane Petrol' ? 'selected' : ''}>High Octane Petrol</option>
                <option value="Hybrid Classic" ${v.fuelType === 'Hybrid Classic' ? 'selected' : ''}>Hybrid Classic</option>
                <option value="Electric Retrofit" ${v.fuelType === 'Electric Retrofit' ? 'selected' : ''}>Electric Retrofit</option>
              </select>
            </label>
            <label>Transmission
              <select name="transmission">
                <option value="Manual 4-Speed" ${v.transmission === 'Manual 4-Speed' ? 'selected' : ''}>Manual 4-Speed</option>
                <option value="Automatic Cruise-O-Matic" ${v.transmission === 'Automatic Cruise-O-Matic' ? 'selected' : ''}>Automatic Cruise-O-Matic</option>
                <option value="Tremec 5-Speed" ${v.transmission === 'Tremec 5-Speed' ? 'selected' : ''}>Tremec 5-Speed</option>
              </select>
            </label>
          </div>
          <label>Vehicle Nickname
            <input name="nickname" type="text" maxlength="50" value="${esc(v.nickname || '')}" placeholder="e.g. Bullitt, Silver Pony">
          </label>
          <button class="solid-button" type="submit">${isEdit ? 'Save Changes' : 'Add to Garage'} ↗</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'delete-vehicle') {
    const v = form.vehicle;
    return `
      ${backBtn}
      <div class="form-wrapper danger-box">
        <p class="eyebrow danger">DELETION WARNING</p>
        <h2>Delete ${esc(v.model)} (${esc(v.registrationNumber)})?</h2>
        <p>Are you sure you want to remove this vehicle from your collection?</p>
        <form data-form="confirm-delete-vehicle">
          <label class="checkbox-label">
            <input type="checkbox" name="cascade" value="true" checked>
            Also delete associated bookings, service records, and reminders
          </label>
          <button class="danger-btn" type="submit">Permanently Delete Vehicle ✕</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'cancel-booking') {
    const req = form.request;
    return `
      ${backBtn}
      <div class="form-wrapper">
        <p class="eyebrow">CANCELLATION CONFIRMATION</p>
        <h2>Cancel Service Booking</h2>
        <p>Vehicle: <strong>${esc(req.vehicle?.model || 'Mustang')}</strong> · ${date(req.preferredDate)}</p>
        <form data-form="confirm-cancel-booking" class="luxury-form">
          <label>Reason for Cancellation
            <textarea name="reason" required rows="3" placeholder="Change of schedule, vehicle sold, etc."></textarea>
          </label>
          <button class="danger-btn" type="submit">Confirm Cancellation ✕</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'add-reminder') {
    return `
      ${backBtn}
      <div class="form-wrapper">
        <div class="form-header">
          <p class="eyebrow">SCHEDULE MILESTONE</p>
          <h2>Create Custom Service Reminder</h2>
        </div>
        <form data-form="reminder" class="luxury-form">
          <label>Vehicle
            <select name="vehicle" required>
              ${vehicles.map(v => `<option value="${v._id}">${esc(v.model)} (${esc(v.registrationNumber)})</option>`).join('')}
            </select>
          </label>
          <label>Reminder Title
            <input name="title" type="text" required maxlength="100" placeholder="e.g. Carburetor Needle Check, Brake Fluid Flush">
          </label>
          <div class="form-grid-2">
            <label>Target Date
              <input name="dueDate" type="date" min="${iso(new Date())}">
            </label>
            <label>Target Odometer (KM)
              <input name="dueMileage" type="number" min="0" placeholder="e.g. 15000">
            </label>
          </div>
          <label>Priority
            <select name="priority">
              <option value="low">Low — Routine check</option>
              <option value="medium" selected>Medium — Standard Maintenance</option>
              <option value="high">High — Critical Safety Item</option>
            </select>
          </label>
          <button class="solid-button" type="submit">Save Reminder ↗</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'add-problem') {
    return `
      ${backBtn}
      <div class="form-wrapper">
        <div class="form-header">
          <p class="eyebrow">DIAGNOSTIC REPORT</p>
          <h2>Log an Issue with Your Classic</h2>
        </div>
        <form data-form="problem" class="luxury-form">
          <label>Vehicle
            <select name="vehicle" required>
              ${vehicles.map(v => `<option value="${v._id}">${esc(v.model)} (${esc(v.registrationNumber)})</option>`).join('')}
            </select>
          </label>
          <label>Issue Summary
            <input name="title" type="text" required maxlength="200" placeholder="e.g. High engine temp under load, spongy brake pedal">
          </label>
          <label>Severity Level
            <select name="severity">
              <option value="low">Low — Cosmetic or minor annoyance</option>
              <option value="medium" selected>Medium — Requires diagnostic inspection</option>
              <option value="high">High — Performance impacted</option>
              <option value="critical">Critical — Do not drive / urgent safety hazard</option>
            </select>
          </label>
          <label>Detailed Description
            <textarea name="description" required rows="4" maxlength="2000" placeholder="Describe symptoms, speed at which it occurs, sounds, fluid colors…"></textarea>
          </label>
          <button class="solid-button" type="submit">Submit Diagnostic Report ↗</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'add-center' || form.type === 'edit-center') {
    const c = form.center || {};
    const isEdit = Boolean(c._id);
    return `
      ${backBtn}
      <div class="form-wrapper">
        <div class="form-header">
          <p class="eyebrow">WORKSHOP NETWORK</p>
          <h2>${isEdit ? 'Edit Service Center' : 'Register New Service Center'}</h2>
        </div>
        <form data-form="center" class="luxury-form">
          <label>Workshop Name
            <input name="name" type="text" required maxlength="100" value="${esc(c.name || '')}" placeholder="Heritage Speedworks">
          </label>
          <label>Address
            <input name="address" type="text" required maxlength="300" value="${esc(c.address || '')}" placeholder="123 Racing Way, Industrial District">
          </label>
          <div class="form-grid-2">
            <label>Contact Phone
              <input name="phone" type="tel" maxlength="30" value="${esc(c.phone || '')}" placeholder="+1 (555) 019-1968">
            </label>
            <label>Service Bay Capacity
              <input name="capacity" type="number" min="1" max="100" value="${c.capacity || 8}">
            </label>
          </div>
          <label>Specialties (comma separated)
            <input name="specialties" type="text" value="${esc((c.specialties || []).join(', '))}" placeholder="Engine Dyno, Disc Brakes, Holley Carb Tuning">
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="isActive" ${c.isActive !== false ? 'checked' : ''}>
            Center is currently open and accepting bookings
          </label>
          <button class="solid-button" type="submit">${isEdit ? 'Save Center' : 'Create Center'} ↗</button>
        </form>
      </div>
    `;
  }

  if (form.type === 'log-work') {
    const req = form.request;
    const v = req?.vehicle || vehicles[0] || {};
    return `
      ${backBtn}
      <div class="form-wrapper">
        <div class="form-header">
          <p class="eyebrow">CERTIFIED COMPLETION</p>
          <h2>Log Completed Work & Generate Invoice</h2>
        </div>
        <form data-form="complete-service" class="luxury-form">
          <input type="hidden" name="serviceRequest" value="${req?._id || ''}">
          <div class="form-grid-2">
            <label>Service Date
              <input name="serviceDate" type="date" required max="${iso(new Date())}" value="${iso(new Date())}">
            </label>
            <label>Final Odometer (KM)
              <input name="mileage" type="number" required min="${v.mileage || 0}" value="${v.mileage || 10000}">
            </label>
          </div>
          <label>Service Title / Type
            <input name="serviceType" type="text" value="${esc(req?.serviceType || 'Complete Certified Service')}" required>
          </label>
          <label>Parts Replaced (One per line: "Part Name, Cost")
            <textarea name="parts" rows="4" placeholder="Motor Oil 20W-50, 2400&#10;Oil Filter, 450&#10;Front Brake Pads, 3200&#10;Spark Plugs Set, 1800"></textarea>
          </label>
          <label>Labor Cost (₹)
            <input name="laborCost" type="number" min="0" step="1" required value="2500">
          </label>
          <label>Technician Notes & Diagnostic Observations
            <textarea name="notes" rows="3" placeholder="Compression tested solid across all 8 cylinders. Timing adjusted to 12 degrees BTDC. Road tested."></textarea>
          </label>
          <div class="form-grid-2">
            <label>Recommended Next Service Date
              <input name="recommendedNextDate" type="date" min="${iso(new Date())}">
            </label>
            <label>Recommended Next Mileage (KM)
              <input name="recommendedNextMileage" type="number" min="${v.mileage || 0}" value="${(v.mileage || 10000) + 5000}">
            </label>
          </div>
          <button class="solid-button" type="submit">Complete & Issue Verified Invoice ↗</button>
        </form>
      </div>
    `;
  }

  return '';
}

// INVOICE MODAL RENDERER
function renderInvoiceModal(rec) {
  return `
    <div class="invoice-backdrop" data-action="close-invoice">
      <div class="invoice-paper" onclick="event.stopPropagation()">
        <header class="invoice-paper-header">
          <div>
            <span class="ford-oval">FORD</span>
            <h1>HERITAGE SERVICE INVOICE</h1>
            <p class="invoice-subhead">Certified Classic Restoration & Maintenance Suite</p>
          </div>
          <div class="invoice-meta">
            <strong>${esc(rec.invoiceNumber || 'INV-1968')}</strong>
            <p>Date: ${date(rec.serviceDate)}</p>
            <p>Odometer: ${Number(rec.mileage || 0).toLocaleString()} KM</p>
          </div>
        </header>

        <section class="invoice-details-section">
          <div>
            <h4>VEHICLE SPECIFICATION</h4>
            <p><strong>${esc(rec.vehicle?.model || 'Mustang')}</strong></p>
            <p>Registration: ${esc(rec.vehicle?.registrationNumber || '—')}</p>
          </div>
          <div>
            <h4>SERVICE TYPE</h4>
            <p><strong>${esc(rec.serviceType || 'Comprehensive Service')}</strong></p>
          </div>
        </section>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>ITEM DESCRIPTION</th>
              <th class="text-right">AMOUNT (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${(rec.partsReplaced && rec.partsReplaced.length) ? rec.partsReplaced.map(p => `
              <tr>
                <td>${esc(p.name)}</td>
                <td class="text-right">${money(p.cost)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td>General inspection and tune-up (No replacement parts)</td>
                <td class="text-right">₹0</td>
              </tr>
            `}
            <tr>
              <td>Certified Technician Labor & Diagnostic Time</td>
              <td class="text-right">${money(rec.laborCost)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>GRAND TOTAL</th>
              <th class="text-right grand-total">${money(rec.totalCost)}</th>
            </tr>
          </tfoot>
        </table>

        ${rec.notes ? `
          <div class="invoice-notes">
            <strong>TECHNICIAN CERTIFICATION NOTES:</strong>
            <p>${esc(rec.notes)}</p>
          </div>
        ` : ''}

        <footer class="invoice-paper-footer">
          <p>Ford Motor Heritage Collection · Official Service Certification</p>
          <div class="invoice-print-actions">
            <button class="solid-button text-xs" onclick="window.print()">Print Invoice 🖨️</button>
            <button class="underlined text-xs" data-action="close-invoice">Close</button>
          </div>
        </footer>
      </div>
    </div>
  `;
}

// EVENT LISTENERS: CLICK
dialog.addEventListener('click', async event => {
  const target = event.target.closest('button, [data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (target.classList.contains('close-concierge') || action === 'close-concierge') {
    dialog.close();
    return;
  }

  if (action === 'close-invoice') {
    invoiceModal = null;
    render();
    return;
  }

  if (target.dataset.tab) {
    tab = target.dataset.tab;
    form = null;
    render();
    return;
  }

  if (busy) return;

  try {
    if (action === 'toggle-auth') {
      register = !register;
      render();
      return;
    }

    if (action === 'select-auth-role') {
      authAsAdmin = target.dataset.role === 'admin';
      render();
      return;
    }

    if (action === 'heritage-inspect') {
      const carName = target.dataset.name;
      tab = 'book';
      render();
      const descInput = dialog.querySelector('textarea[name="problemDescription"]');
      if (descInput) descInput.value = `Certified Heritage Workshop intake and dyno inspection for ${carName}. Check timing, valve clearances, and fluid pressures.`;
      showMsg(`Booking form prefilled for ${carName}`);
      return;
    }

    if (action === 'heritage-register') {
      const carName = target.dataset.name;
      const trans = target.dataset.trans || 'Manual 4-Speed';
      busy = true;
      const regNum = 'H-' + Math.floor(1000 + Math.random() * 9000);
      try {
        await api('/vehicles', 'POST', {
          registrationNumber: regNum,
          model: carName,
          make: 'Ford',
          year: 1968,
          purchaseDate: new Date().toISOString().slice(0, 10),
          mileage: 12000,
          fuelType: 'Petrol V8',
          transmission: trans,
          nickname: 'Heritage Edition'
        });
        showMsg(`${carName} registered into your garage fleet! (${regNum})`);
        await refreshAll();
      } catch (err) {
        showMsg(err.message, true);
      } finally {
        busy = false;
      }
      return;
    }

    if (action === 'quick-login') {
      const role = target.dataset.role;
      busy = true;
      try {
        if (role === 'admin') {
          // Attempt admin login or register default
          try {
            user = await api('/users/login', 'POST', { email: 'staff@test.example', password: 'test-only-password' });
          } catch {
            user = await api('/users/register', 'POST', { username: 'Heritage Master Tech', email: 'staff@test.example', password: 'test-only-password' });
            await api('/users/toggle-role', 'POST', {});
            user.isAdmin = true;
          }
        } else {
          try {
            user = await api('/users/login', 'POST', { email: 'owner@test.example', password: 'test-only-password' });
          } catch {
            user = await api('/users/register', 'POST', { username: 'Carroll Shelby', email: 'owner@test.example', password: 'test-only-password' });
          }
        }
        if (!user.isAdmin) {
          activeRole = 'owner';
          tab = 'garage';
        } else {
          activeRole = 'admin';
          tab = 'overview';
        }
        await refreshAll();
      } catch (err) {
        showMsg(err.message, true);
      } finally {
        busy = false;
      }
      return;
    }

    if (action === 'switch-role') {
      if (!user || !user.isAdmin) {
        showMsg('Access Restricted: Only verified administrators have access to workshop controls.', true);
        return;
      }
      const desired = target.dataset.role;
      activeRole = desired;
      tab = desired === 'admin' ? 'overview' : 'garage';
      form = null;
      render();
      return;
    }

    if (action === 'toggle-notif') {
      notifDrawerOpen = !notifDrawerOpen;
      render();
      return;
    }

    if (action === 'notif-filter') {
      notifFilter = target.dataset.val;
      render();
      return;
    }

    if (action === 'notif-mark-read') {
      await api(`/notifications/${id}/read`, 'PUT', {});
      await updateNotificationBadges();
      render();
      return;
    }

    if (action === 'notif-mark-all') {
      await api('/notifications/read-all', 'PUT', {});
      await updateNotificationBadges();
      render();
      return;
    }

    if (action === 'notif-delete') {
      await api(`/notifications/${id}`, 'DELETE');
      await updateNotificationBadges();
      render();
      return;
    }

    if (action === 'notif-clear-all') {
      await api('/notifications', 'DELETE');
      await updateNotificationBadges();
      render();
      return;
    }

    if (action === 'logout') {
      await api('/users/logout', 'POST', {});
      user = null;
      form = null;
      render();
      return;
    }

    if (action === 'open-form') {
      const kind = target.dataset.kind;
      if (kind === 'add-vehicle') form = { type: 'add-vehicle' };
      if (kind === 'edit-vehicle') form = { type: 'edit-vehicle', vehicle: vehicles.find(v => v._id === id) };
      if (kind === 'delete-vehicle') form = { type: 'delete-vehicle', vehicle: vehicles.find(v => v._id === id) };
      if (kind === 'cancel-booking') form = { type: 'cancel-booking', request: requests.find(r => r._id === id) };
      if (kind === 'add-reminder') form = { type: 'add-reminder' };
      if (kind === 'add-problem') form = { type: 'add-problem' };
      if (kind === 'add-center') form = { type: 'add-center' };
      if (kind === 'edit-center') form = { type: 'edit-center', center: centers.find(c => c._id === id) };
      if (kind === 'log-work') {
        const reqId = target.dataset.reqId;
        const req = reqId ? requests.find(r => r._id === reqId) : requests.find(r => r.status === 'accepted');
        form = { type: 'log-work', request: req };
      }
      render();
      return;
    }

    if (action === 'close-form') {
      form = null;
      render();
      return;
    }

    if (action === 'quick-book-vehicle') {
      tab = 'book';
      form = null;
      render();
      const sel = dialog.querySelector('select[name="vehicle"]');
      if (sel && id) sel.value = id;
      return;
    }

    if (action === 'accept-request') {
      const tech = prompt('Assign Master Technician Name:', 'Carroll Shelby');
      if (tech === null) return;
      busy = true;
      await api(`/service-requests/${id}/accept`, 'PUT', { assignedTechnician: tech });
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'reject-request') {
      const reason = prompt('Reason for declining request:', 'Workshop at maximum bay capacity');
      if (reason === null) return;
      busy = true;
      await api(`/service-requests/${id}/reject`, 'PUT', { rejectionReason: reason });
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'advance-stage') {
      const job = requests.find(r => r._id === id);
      const stages = ['vehicle_received', 'inspection', 'in_progress', 'ready', 'completed'];
      const currentIdx = stages.indexOf(job?.currentStage || 'vehicle_received');
      const nextStage = stages[Math.min(currentIdx + 1, stages.length - 1)];
      busy = true;
      await api(`/service-requests/${id}/stage`, 'PUT', { stage: nextStage });
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'snooze-reminder') {
      const days = Number(target.dataset.days || 7);
      busy = true;
      await api(`/reminders/${id}`, 'PUT', { snoozeDays: days });
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'delete-reminder') {
      if (!confirm('Dismiss this reminder?')) return;
      busy = true;
      await api(`/reminders/${id}`, 'DELETE');
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'resolve-problem') {
      busy = true;
      await api(`/problem-reports/${id}/resolve`, 'PUT', {});
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'delete-problem') {
      if (!confirm('Delete this diagnostic report?')) return;
      busy = true;
      await api(`/problem-reports/${id}`, 'DELETE');
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'toggle-center-active') {
      const center = centers.find(c => c._id === id);
      if (center) {
        busy = true;
        await api(`/service-centers/${id}`, 'PUT', { isActive: !center.isActive });
        await refreshAll();
        busy = false;
      }
      return;
    }

    if (action === 'delete-center') {
      if (!confirm('Remove this service workshop from the network?')) return;
      busy = true;
      await api(`/service-centers/${id}`, 'DELETE');
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'delete-record') {
      if (!confirm('Permanently delete this certified service record and invoice?')) return;
      busy = true;
      await api(`/service-records/${id}`, 'DELETE');
      await refreshAll();
      busy = false;
      return;
    }

    if (action === 'view-invoice') {
      const rec = records.find(r => r._id === id);
      if (rec) {
        invoiceModal = rec;
        render();
      }
      return;
    }

    if (action === 'filter-requests') {
      requestFilter = target.dataset.val;
      render();
      return;
    }
  } catch (err) {
    showMsg(err.message, true);
  } finally {
    busy = false;
  }
});

// EVENT LISTENERS: INPUT (SEARCH)
dialog.addEventListener('input', event => {
  if (event.target.dataset.action === 'search-requests') {
    requestSearch = event.target.value;
    const listWrap = dialog.querySelector('.admin-requests-table');
    if (listWrap) {
      // Re-render requests view
      render();
      const input = dialog.querySelector('input[data-action="search-requests"]');
      if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    }
  }
});

// EVENT LISTENERS: SUBMIT
dialog.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const data = Object.fromEntries(new FormData(event.target));
  const kind = event.target.dataset.form;

  try {
    if (kind === 'auth') {
      user = await api(register ? '/users/register' : '/users/login', 'POST', data);
      if (!user.isAdmin) {
        activeRole = 'owner';
        tab = 'garage';
      } else {
        activeRole = 'admin';
        tab = 'overview';
      }
      form = null;
      await refreshAll();
      return;
    }

    if (kind === 'edit-profile') {
      user = await api('/users/profile', 'PUT', data);
      showMsg('Profile updated successfully!');
      await refreshAll();
      return;
    }

    if (kind === 'vehicle') {
      data.mileage = Number(data.mileage);
      if (data.year) data.year = Number(data.year);
      const isEdit = form.type === 'edit-vehicle' && form.vehicle?._id;
      await api(isEdit ? `/vehicles/${form.vehicle._id}` : '/vehicles', isEdit ? 'PUT' : 'POST', data);
      form = null;
      tab = 'garage';
      showMsg(isEdit ? 'Vehicle specifications updated.' : 'Vehicle added to your garage!');
      await refreshAll();
      return;
    }

    if (kind === 'confirm-delete-vehicle') {
      const cascade = data.cascade === 'true';
      await api(`/vehicles/${form.vehicle._id}${cascade ? '?cascade=true' : ''}`, 'DELETE');
      form = null;
      tab = 'garage';
      showMsg('Vehicle deleted.');
      await refreshAll();
      return;
    }

    if (kind === 'book-service') {
      await api('/service-requests', 'POST', data);
      showMsg('Service booking dispatched to workshop!');
      await refreshAll();
      return;
    }

    if (kind === 'confirm-cancel-booking') {
      await api(`/service-requests/${form.request._id}/cancel`, 'PUT', { reason: data.reason });
      form = null;
      showMsg('Booking cancelled.');
      await refreshAll();
      return;
    }

    if (kind === 'reminder') {
      if (data.dueMileage) data.dueMileage = Number(data.dueMileage);
      await api('/reminders', 'POST', data);
      form = null;
      tab = 'reminders';
      showMsg('Reminder created!');
      await refreshAll();
      return;
    }

    if (kind === 'problem') {
      await api('/problem-reports', 'POST', data);
      form = null;
      tab = 'problems';
      showMsg('Issue report submitted. Technicians notified.');
      await refreshAll();
      return;
    }

    if (kind === 'center') {
      data.capacity = Number(data.capacity || 10);
      data.isActive = Boolean(data.isActive);
      data.specialties = data.specialties ? data.specialties.split(',').map(s => s.trim()).filter(Boolean) : [];
      const isEdit = form.type === 'edit-center' && form.center?._id;
      await api(isEdit ? `/service-centers/${form.center._id}` : '/service-centers', isEdit ? 'PUT' : 'POST', data);
      form = null;
      tab = 'centers';
      showMsg(isEdit ? 'Center details updated.' : 'New workshop center added.');
      await refreshAll();
      return;
    }

    if (kind === 'complete-service') {
      const partsReplaced = data.parts?.trim() ? data.parts.trim().split('\n').map(line => {
        const split = line.lastIndexOf(',');
        if (split < 1) throw new Error('Enter each part as: Part Name, Cost');
        const cost = Number(line.slice(split + 1).trim());
        if (!Number.isFinite(cost) || cost < 0) throw new Error('Part costs must be non-negative numbers.');
        return { name: line.slice(0, split).trim(), cost };
      }) : [];

      const payload = {
        serviceRequest: data.serviceRequest || requests.find(r => r.status === 'accepted')?._id,
        serviceDate: data.serviceDate,
        mileage: Number(data.mileage),
        serviceType: data.serviceType,
        partsReplaced,
        laborCost: Number(data.laborCost || 0),
        notes: data.notes || '',
        recommendedNextDate: data.recommendedNextDate || undefined,
        recommendedNextMileage: data.recommendedNextMileage ? Number(data.recommendedNextMileage) : undefined
      };

      if (!payload.serviceRequest) throw new Error('Select an accepted service request to complete.');

      const newRecord = await api('/service-records', 'POST', payload);
      form = null;
      tab = activeRole === 'admin' ? 'records' : 'history';
      invoiceModal = newRecord;
      showMsg('Work logged and certified invoice created!');
      await refreshAll();
      return;
    }
  } catch (err) {
    showMsg(err.message, true);
  } finally {
    busy = false;
    if (submitBtn) submitBtn.disabled = false;
  }
});
