/**
 * ===================================================================
 * MAISON AURA — ADMIN DASHBOARD & ORDER MANAGEMENT ENGINE
 * Phase 6 — Single-Brand Luxury Perfume E-Commerce Demo
 * ===================================================================
 */

const MaisonAdminAuth = (() => {
  const ADMIN_SESSION_KEY = 'maison_aura_admin_session_v1';
  
  // Hardcoded demo credentials for client demonstration
  const DEMO_ADMIN_CREDENTIALS = {
    email: 'admin@maisonaura.com',
    password: 'maison2026',
    name: 'Eleanor Vance',
    role: 'Operations & Scent Director'
  };

  function getSession() {
    try {
      const data = localStorage.getItem(ADMIN_SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for admin session', e);
    }
    return null;
  }

  function isAuthenticated() {
    const session = getSession();
    return !!session && !!session.token;
  }

  function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (cleanEmail === DEMO_ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === DEMO_ADMIN_CREDENTIALS.password) {
      const session = {
        email: DEMO_ADMIN_CREDENTIALS.email,
        name: DEMO_ADMIN_CREDENTIALS.name,
        role: DEMO_ADMIN_CREDENTIALS.role,
        token: `sim-admin-tok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        loginTime: new Date().toISOString()
      };

      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn('Could not persist admin session', e);
      }

      window.dispatchEvent(new CustomEvent('maison:admin-auth-updated', { detail: { isAuthenticated: true, session } }));
      return { success: true, session };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Please use the demo credentials provided below.' 
    };
  }

  function logout() {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.warn('Could not clear admin session', e);
    }

    window.dispatchEvent(new CustomEvent('maison:admin-auth-updated', { detail: { isAuthenticated: false } }));
  }

  return {
    getSession,
    isAuthenticated,
    login,
    logout,
    DEMO_CREDENTIALS: {
      email: DEMO_ADMIN_CREDENTIALS.email,
      password: DEMO_ADMIN_CREDENTIALS.password
    }
  };
})();

const MaisonAdmin = (() => {
  const ADMIN_TAB_STORAGE_KEY = 'maison_aura_admin_tab_v1';
  let activeTab = 'dashboard'; // 'dashboard' | 'orders' | 'products'
  let orderFilterStatus = 'all';
  let orderSearchQuery = '';
  let selectedOrderId = null;

  function initAdmin() {
    const container = document.getElementById('adminView');
    if (!container) return;

    if (!MaisonAdminAuth.isAuthenticated()) {
      renderAdminLogin(container);
    } else {
      try {
        const savedTab = sessionStorage.getItem(ADMIN_TAB_STORAGE_KEY);
        if (savedTab && ['dashboard', 'orders', 'products'].includes(savedTab)) {
          activeTab = savedTab;
        }
      } catch (e) {
        console.warn('Could not load admin tab', e);
      }
      renderAdminDashboard(container);
    }
  }

  /* ===================================================================
     1. ADMIN LOGIN VIEW
     =================================================================== */
  function renderAdminLogin(container) {
    container.innerHTML = `
      <section class="admin-auth-section" aria-label="Admin Portal Authentication">
        <div class="container admin-auth-container">
          
          <div class="admin-login-card">
            <div class="admin-login-crest">✦</div>
            <span class="admin-login-eyebrow">Maison Aura Portal</span>
            <h1 class="admin-login-title">Operations Console</h1>
            <p class="admin-login-subtitle">
              Restricted management area for inventory allocation, fulfillment tracking, and flacon pricing.
            </p>

            <!-- Demo Credentials Helper Banner -->
            <div class="admin-demo-helper" role="note">
              <div class="admin-demo-helper-header">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Demo Admin Access</span>
              </div>
              <div class="admin-demo-helper-creds">
                <div>Email: <strong id="demoAdminEmailDisplay">admin@maisonaura.com</strong></div>
                <div>Password: <strong id="demoAdminPassDisplay">maison2026</strong></div>
              </div>
              <button class="admin-autofill-btn" id="autofillAdminBtn" type="button">Autofill Demo Credentials</button>
            </div>

            <!-- Login Form -->
            <form id="adminLoginForm" class="admin-login-form" onsubmit="event.preventDefault(); MaisonAdmin.handleAdminLogin();">
              <div class="admin-form-group">
                <label for="adminEmailInput" class="admin-label">Admin Email</label>
                <input 
                  type="email" 
                  id="adminEmailInput" 
                  class="admin-input" 
                  placeholder="admin@maisonaura.com" 
                  required 
                  autocomplete="username"
                >
              </div>

              <div class="admin-form-group">
                <label for="adminPasswordInput" class="admin-label">Password</label>
                <input 
                  type="password" 
                  id="adminPasswordInput" 
                  class="admin-input" 
                  placeholder="••••••••" 
                  required 
                  autocomplete="current-password"
                >
              </div>

              <div id="adminLoginError" class="admin-login-error" role="alert" style="display: none;"></div>

              <button type="submit" class="admin-btn admin-btn-primary admin-login-btn">
                <span>Authenticate & Access Console</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div class="admin-back-link-wrap">
              <a href="#home" class="admin-back-link">← Return to Maison Aura Storefront</a>
            </div>

          </div>

        </div>
      </section>
    `;

    // Attach autofill
    const autofillBtn = document.getElementById('autofillAdminBtn');
    if (autofillBtn) {
      autofillBtn.onclick = () => {
        const emailInput = document.getElementById('adminEmailInput');
        const passInput = document.getElementById('adminPasswordInput');
        if (emailInput && passInput) {
          emailInput.value = MaisonAdminAuth.DEMO_CREDENTIALS.email;
          passInput.value = MaisonAdminAuth.DEMO_CREDENTIALS.password;
        }
      };
    }
  }

  function handleAdminLogin() {
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    const errorEl = document.getElementById('adminLoginError');

    if (!emailInput || !passInput) return;

    const res = MaisonAdminAuth.login(emailInput.value, passInput.value);
    if (res.success) {
      if (errorEl) errorEl.style.display = 'none';
      initAdmin();
    } else {
      if (errorEl) {
        errorEl.textContent = res.message;
        errorEl.style.display = 'block';
      }
    }
  }

  function handleAdminLogout() {
    MaisonAdminAuth.logout();
    initAdmin();
  }

  /* ===================================================================
     2. ADMIN MAIN DASHBOARD & TABS
     =================================================================== */
  function renderAdminDashboard(container) {
    const session = MaisonAdminAuth.getSession() || { name: 'Operations Director', email: 'admin@maisonaura.com' };

    container.innerHTML = `
      <div class="admin-layout">
        
        <!-- Admin Top Navigation Bar -->
        <header class="admin-topbar">
          <div class="admin-topbar-inner">
            
            <div class="admin-brand">
              <span class="admin-crest">✦</span>
              <div>
                <span class="admin-brand-name">Maison Aura</span>
                <span class="admin-brand-portal">Operations & Inventory Console</span>
              </div>
            </div>

            <!-- Admin Navigation Tabs -->
            <nav class="admin-nav-tabs" aria-label="Admin Sections">
              <button class="admin-nav-tab ${activeTab === 'dashboard' ? 'is-active' : ''}" onclick="MaisonAdmin.switchTab('dashboard')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Overview</span>
              </button>
              
              <button class="admin-nav-tab ${activeTab === 'orders' ? 'is-active' : ''}" onclick="MaisonAdmin.switchTab('orders')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Orders & Fulfillment</span>
              </button>

              <button class="admin-nav-tab ${activeTab === 'products' ? 'is-active' : ''}" onclick="MaisonAdmin.switchTab('products')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                <span>Products & Stock</span>
              </button>
            </nav>

            <!-- Admin Profile Actions -->
            <div class="admin-user-controls">
              <a href="#shop" class="admin-store-link" title="Open Storefront">
                <span>View Storefront</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>

              <div class="admin-user-pill">
                <span class="admin-avatar">✦</span>
                <div class="admin-user-meta">
                  <span class="admin-user-name">${session.name}</span>
                  <span class="admin-user-role">${session.role}</span>
                </div>
              </div>

              <button class="admin-logout-btn" onclick="MaisonAdmin.handleAdminLogout()" title="Sign out of Admin Console">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>

          </div>
        </header>

        <!-- Admin Workspace Body -->
        <main class="admin-workspace" id="adminTabContent">
          <!-- Populated by tab renderers -->
        </main>

        <!-- Order Detail Modal Container -->
        <div id="adminOrderModalContainer"></div>

      </div>
    `;

    renderActiveTab();
  }

  function switchTab(tabKey) {
    activeTab = tabKey;
    try {
      sessionStorage.setItem(ADMIN_TAB_STORAGE_KEY, tabKey);
    } catch (e) {
      console.warn('Could not save admin active tab', e);
    }
    const tabBtns = document.querySelectorAll('.admin-nav-tab');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(tabKey)) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
    renderActiveTab();
  }

  function renderActiveTab() {
    const tabContent = document.getElementById('adminTabContent');
    if (!tabContent) return;

    if (activeTab === 'dashboard') {
      renderDashboardOverview(tabContent);
    } else if (activeTab === 'orders') {
      renderOrdersManagement(tabContent);
    } else if (activeTab === 'products') {
      renderProductsManagement(tabContent);
    }
  }

  /* ===================================================================
     3. OVERVIEW DASHBOARD TAB
     =================================================================== */
  function renderDashboardOverview(container) {
    const orders = window.MaisonOrders ? window.MaisonOrders.getAllOrders() : [];
    
    // Calculate metrics
    const totalOrders = orders.length;
    const processingOrders = orders.filter(o => o.fulfillmentStatus === 'Processing' || o.fulfillmentStatus === 'Placed').length;
    const shippedOrders = orders.filter(o => o.fulfillmentStatus === 'Shipped').length;
    const deliveredOrders = orders.filter(o => o.fulfillmentStatus === 'Delivered').length;
    const totalRevenue = orders
      .filter(o => o.fulfillmentStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const recentOrders = orders.slice(0, 5);

    container.innerHTML = `
      <div class="admin-container">
        
        <!-- Welcome Header -->
        <div class="admin-header-row">
          <div>
            <span class="admin-section-eyebrow">Real-Time Operational Analytics</span>
            <h1 class="admin-section-title">Boutique Executive Overview</h1>
            <p class="admin-section-desc">Summary of live customer demand, order fulfillment stages, and revenue.</p>
          </div>
          <div class="admin-header-actions">
            <button class="admin-btn admin-btn-secondary" onclick="MaisonAdmin.switchTab('orders')">Manage All Orders</button>
            <button class="admin-btn admin-btn-primary" onclick="MaisonAdmin.switchTab('products')">Configure Pricing & Stock</button>
          </div>
        </div>

        <!-- Metric Cards Grid -->
        <div class="admin-metrics-grid">
          
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Total Volume</span>
              <span class="metric-badge">All-Time</span>
            </div>
            <div class="metric-value">${totalOrders}</div>
            <div class="metric-subtext">Recorded customer orders</div>
          </div>

          <div class="metric-card metric-card-highlight">
            <div class="metric-card-top">
              <span class="metric-label">Pending / Processing</span>
              <span class="metric-badge metric-badge-amber">Action Needed</span>
            </div>
            <div class="metric-value">${processingOrders}</div>
            <div class="metric-subtext">Awaiting flacon preparation</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">In Transit</span>
              <span class="metric-badge metric-badge-blue">Shipped</span>
            </div>
            <div class="metric-value">${shippedOrders}</div>
            <div class="metric-subtext">Dispatched via Express Courier</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-label">Completed</span>
              <span class="metric-badge metric-badge-green">Delivered</span>
            </div>
            <div class="metric-value">${deliveredOrders}</div>
            <div class="metric-subtext">Safely received by clients</div>
          </div>

          <div class="metric-card metric-card-gold">
            <div class="metric-card-top">
              <span class="metric-label">Total Revenue</span>
              <span class="metric-badge metric-badge-gold">INR</span>
            </div>
            <div class="metric-value">₹${totalRevenue.toLocaleString('en-IN')}</div>
            <div class="metric-subtext">Gross verified order total</div>
          </div>

        </div>

        <!-- Recent Orders Table Section -->
        <div class="admin-card" style="margin-top: var(--space-8);">
          <div class="admin-card-header">
            <div>
              <h2 class="admin-card-title">Recent Boutique Orders</h2>
              <p class="admin-card-subtitle">Latest orders placed by discerning clients</p>
            </div>
            <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="MaisonAdmin.switchTab('orders')">
              View All Orders (${totalOrders}) →
            </button>
          </div>

          <div class="admin-table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Client</th>
                  <th>Date & Time</th>
                  <th>Items Summary</th>
                  <th>Order Total</th>
                  <th>Fulfillment Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentOrders.length === 0 ? `
                  <tr>
                    <td colspan="7" class="admin-table-empty">No orders recorded in the system yet.</td>
                  </tr>
                ` : recentOrders.map(order => `
                  <tr>
                    <td>
                      <span class="order-id-pill" onclick="MaisonAdmin.openOrderDetail('${order.orderId}')" role="button" tabindex="0">
                        ${order.orderId}
                      </span>
                    </td>
                    <td>
                      <div class="admin-client-cell">
                        <span class="client-name">${order.customer?.name || order.delivery?.fullName || 'Client'}</span>
                        <span class="client-email">${order.customer?.email || order.delivery?.email || ''}</span>
                      </div>
                    </td>
                    <td class="admin-date-cell">${order.formattedDate}</td>
                    <td>
                      <span class="admin-item-summary">
                        ${order.items.map(i => `${i.name} (${i.size}) × ${i.quantity}`).join(', ')}
                      </span>
                    </td>
                    <td class="admin-amount-cell">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span class="status-badge status-${(order.fulfillmentStatus || 'processing').toLowerCase()}">
                        ${order.fulfillmentStatus}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="admin-btn admin-btn-xs admin-btn-secondary" onclick="MaisonAdmin.openOrderDetail('${order.orderId}')">
                        Inspect
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    `;
  }

  /* ===================================================================
     4. ORDERS MANAGEMENT TAB
     =================================================================== */
  function renderOrdersManagement(container) {
    const allOrders = window.MaisonOrders ? window.MaisonOrders.getAllOrders() : [];

    // Filter by status & search
    let filtered = allOrders.filter(order => {
      if (orderFilterStatus !== 'all') {
        if (order.fulfillmentStatus?.toLowerCase() !== orderFilterStatus.toLowerCase()) {
          return false;
        }
      }

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.trim().toLowerCase();
        const matchesId = order.orderId.toLowerCase().includes(q);
        const matchesName = (order.customer?.name || order.delivery?.fullName || '').toLowerCase().includes(q);
        const matchesEmail = (order.customer?.email || order.delivery?.email || '').toLowerCase().includes(q);
        const matchesCity = (order.delivery?.city || '').toLowerCase().includes(q);
        return matchesId || matchesName || matchesEmail || matchesCity;
      }

      return true;
    });

    container.innerHTML = `
      <div class="admin-container">
        
        <div class="admin-header-row">
          <div>
            <span class="admin-section-eyebrow">Order Fulfillment & Tracking</span>
            <h1 class="admin-section-title">Customer Orders Portfolio</h1>
            <p class="admin-section-desc">Track and update dispatch statuses for all handcrafted fragrance shipments.</p>
          </div>
        </div>

        <!-- Orders Toolbar: Search & Filter Tabs -->
        <div class="admin-toolbar">
          
          <div class="admin-filter-pills">
            <button class="filter-pill ${orderFilterStatus === 'all' ? 'is-active' : ''}" onclick="MaisonAdmin.setOrderFilter('all')">
              All Orders (${allOrders.length})
            </button>
            <button class="filter-pill ${orderFilterStatus === 'processing' ? 'is-active' : ''}" onclick="MaisonAdmin.setOrderFilter('processing')">
              Processing (${allOrders.filter(o => o.fulfillmentStatus === 'Processing' || o.fulfillmentStatus === 'Placed').length})
            </button>
            <button class="filter-pill ${orderFilterStatus === 'shipped' ? 'is-active' : ''}" onclick="MaisonAdmin.setOrderFilter('shipped')">
              Shipped (${allOrders.filter(o => o.fulfillmentStatus === 'Shipped').length})
            </button>
            <button class="filter-pill ${orderFilterStatus === 'delivered' ? 'is-active' : ''}" onclick="MaisonAdmin.setOrderFilter('delivered')">
              Delivered (${allOrders.filter(o => o.fulfillmentStatus === 'Delivered').length})
            </button>
            <button class="filter-pill ${orderFilterStatus === 'cancelled' ? 'is-active' : ''}" onclick="MaisonAdmin.setOrderFilter('cancelled')">
              Cancelled (${allOrders.filter(o => o.fulfillmentStatus === 'Cancelled').length})
            </button>
          </div>

          <div class="admin-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="search" 
              placeholder="Search by Order ID, Client, Email, City..." 
              value="${orderSearchQuery}" 
              oninput="MaisonAdmin.handleOrderSearch(this.value)"
              aria-label="Search orders"
            >
          </div>

        </div>

        <!-- Full Orders Table -->
        <div class="admin-card">
          <div class="admin-table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Client Details</th>
                  <th>Destination</th>
                  <th>Date & Time</th>
                  <th>Payment Method</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="8" class="admin-table-empty">
                      No orders match the current filter criteria (${orderFilterStatus}).
                    </td>
                  </tr>
                ` : filtered.map(order => `
                  <tr>
                    <td>
                      <span class="order-id-pill" onclick="MaisonAdmin.openOrderDetail('${order.orderId}')" role="button" tabindex="0">
                        ${order.orderId}
                      </span>
                    </td>
                    <td>
                      <div class="admin-client-cell">
                        <span class="client-name">${order.customer?.name || order.delivery?.fullName || 'Client'}</span>
                        <span class="client-email">${order.customer?.email || order.delivery?.email || ''}</span>
                        <span class="client-phone">${order.delivery?.phone || ''}</span>
                      </div>
                    </td>
                    <td>
                      <div class="admin-destination-cell">
                        <span>${order.delivery?.city || 'India'}, ${order.delivery?.state || ''}</span>
                        <span class="pincode-label">${order.delivery?.pincode || ''}</span>
                      </div>
                    </td>
                    <td class="admin-date-cell">${order.formattedDate}</td>
                    <td>
                      <span class="payment-method-pill">
                        ${order.payment?.method || 'UPI'}
                      </span>
                    </td>
                    <td class="admin-amount-cell">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span class="status-badge status-${(order.fulfillmentStatus || 'processing').toLowerCase()}">
                        ${order.fulfillmentStatus}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="admin-btn admin-btn-xs admin-btn-primary" onclick="MaisonAdmin.openOrderDetail('${order.orderId}')">
                        Inspect & Update
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  function setOrderFilter(status) {
    orderFilterStatus = status;
    const tabContent = document.getElementById('adminTabContent');
    if (tabContent && activeTab === 'orders') {
      renderOrdersManagement(tabContent);
    }
  }

  function handleOrderSearch(query) {
    orderSearchQuery = query;
    const tabContent = document.getElementById('adminTabContent');
    if (tabContent && activeTab === 'orders') {
      renderOrdersManagement(tabContent);
    }
  }

  /* ===================================================================
     5. ORDER DETAIL MODAL & STATUS UPDATE
     =================================================================== */
  function openOrderDetail(orderId) {
    selectedOrderId = orderId;
    const order = window.MaisonOrders ? window.MaisonOrders.getOrderById(orderId) : null;
    if (!order) return;

    const modalContainer = document.getElementById('adminOrderModalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="admin-modal-backdrop is-open" id="orderDetailBackdrop" onclick="if(event.target===this) MaisonAdmin.closeOrderDetail();">
        <div class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="orderModalTitle">
          
          <!-- Modal Header -->
          <div class="admin-modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <span class="eyebrow" style="color: var(--color-accent-gold-deep);">✦ Order Manifest</span>
                <span class="status-badge status-${(order.fulfillmentStatus || 'processing').toLowerCase()}" id="modalStatusBadge">
                  ${order.fulfillmentStatus}
                </span>
              </div>
              <h2 class="admin-modal-title" id="orderModalTitle">${order.orderId}</h2>
              <span class="admin-modal-subtitle">Placed on ${order.formattedDate} • ${order.payment?.method || 'UPI'}</span>
            </div>
            <button class="admin-modal-close" onclick="MaisonAdmin.closeOrderDetail()" aria-label="Close manifest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="admin-modal-body">
            
            <!-- Fulfillment Status Quick Updater -->
            <div class="admin-status-updater-card">
              <div class="status-updater-title">Update Fulfillment Lifecycle:</div>
              <div class="status-updater-row">
                <select id="modalStatusSelect" class="admin-select" aria-label="Fulfillment Status">
                  <option value="Placed" ${order.fulfillmentStatus === 'Placed' ? 'selected' : ''}>Placed (Order Logged)</option>
                  <option value="Processing" ${order.fulfillmentStatus === 'Processing' ? 'selected' : ''}>Processing (Maceration & Bottling)</option>
                  <option value="Shipped" ${order.fulfillmentStatus === 'Shipped' ? 'selected' : ''}>Shipped (Dispatched with Bluedart)</option>
                  <option value="Delivered" ${order.fulfillmentStatus === 'Delivered' ? 'selected' : ''}>Delivered (Client Received)</option>
                  <option value="Cancelled" ${order.fulfillmentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="MaisonAdmin.saveOrderStatus('${order.orderId}')">
                  Update Status
                </button>
              </div>
            </div>

            <!-- Two-Column Manifest Details -->
            <div class="admin-manifest-grid">
              
              <!-- Left Column: Customer & Delivery -->
              <div class="admin-manifest-col">
                <div class="manifest-section-header">Client Information</div>
                <div class="manifest-info-box">
                  <div class="manifest-info-row">
                    <span class="info-label">Full Name:</span>
                    <strong class="info-value">${order.delivery?.fullName || order.customer?.name}</strong>
                  </div>
                  <div class="manifest-info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${order.delivery?.email || order.customer?.email}</span>
                  </div>
                  <div class="manifest-info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${order.delivery?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div class="manifest-section-header" style="margin-top: var(--space-4);">Delivery Address</div>
                <div class="manifest-info-box">
                  <p style="margin: 0; line-height: 1.6; color: var(--color-text-primary);">
                    ${order.delivery?.addressLine}<br>
                    ${order.delivery?.landmark ? `Landmark: ${order.delivery.landmark}<br>` : ''}
                    ${order.delivery?.city}, ${order.delivery?.state} — <strong>${order.delivery?.pincode}</strong><br>
                    India
                  </p>
                </div>

                <div class="manifest-section-header" style="margin-top: var(--space-4);">Payment Verification</div>
                <div class="manifest-info-box">
                  <div class="manifest-info-row">
                    <span class="info-label">Method:</span>
                    <span class="info-value">${order.payment?.method}</span>
                  </div>
                  <div class="manifest-info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: var(--color-status-success); font-weight: 600;">${order.payment?.status || 'Paid'}</span>
                  </div>
                  <div class="manifest-info-row">
                    <span class="info-label">Simulated Ref:</span>
                    <span class="info-value" style="font-family: monospace; font-size: 11px;">${order.payment?.referenceId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Order Items & Pricing Breakdown -->
              <div class="admin-manifest-col">
                <div class="manifest-section-header">Reserved Fragrance Flacons</div>
                
                <div class="manifest-items-list">
                  ${order.items.map(item => `
                    <div class="manifest-item-row">
                      <img src="${item.image}" alt="${item.name}" class="manifest-item-img" width="48" height="48">
                      <div class="manifest-item-meta">
                        <div class="manifest-item-name">${item.name}</div>
                        <div class="manifest-item-subtitle">${item.subtitle} • ${item.size}</div>
                        <div class="manifest-item-qty">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</div>
                      </div>
                      <div class="manifest-item-total">
                        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Packaging & Discovery Addons -->
                <div class="manifest-addon-row">
                  <span>Signature Velvet Gift Presentation</span>
                  <strong>${(order.pricing?.packaging || 0) > 0 ? 'Included (+₹350)' : 'Standard Boutique Box'}</strong>
                </div>
                <div class="manifest-addon-row">
                  <span>2ml Complimentary Discovery Vials</span>
                  <span style="color: var(--color-accent-gold-deep);">Included (x2)</span>
                </div>

                <!-- Financial Breakdown -->
                <div class="manifest-financials">
                  <div class="financial-row">
                    <span>Subtotal</span>
                    <span>₹${(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="financial-row">
                    <span>Gift Packaging</span>
                    <span>₹${(order.pricing?.packaging || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="financial-row">
                    <span>Express Pan-India Transit</span>
                    <span style="color: var(--color-status-success);">Complimentary (₹0)</span>
                  </div>
                  <div class="financial-row financial-total">
                    <span>Total Order Value</span>
                    <span class="financial-total-amount">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- Modal Footer -->
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" onclick="MaisonAdmin.closeOrderDetail()">
              Close Manifest
            </button>
          </div>

        </div>
      </div>
    `;

    document.addEventListener('keydown', handleModalKeydown);
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') {
      closeOrderDetail();
    }
  }

  function closeOrderDetail() {
    selectedOrderId = null;
    const modalContainer = document.getElementById('adminOrderModalContainer');
    if (modalContainer) modalContainer.innerHTML = '';
    document.removeEventListener('keydown', handleModalKeydown);
  }

  function saveOrderStatus(orderId) {
    const select = document.getElementById('modalStatusSelect');
    if (!select) return;

    const newStatus = select.value;
    if (window.MaisonOrders) {
      const res = window.MaisonOrders.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        // Update badge inside modal
        const badge = document.getElementById('modalStatusBadge');
        if (badge) {
          badge.className = `status-badge status-${newStatus.toLowerCase()}`;
          badge.textContent = newStatus;
        }

        // Show brief toast
        if (window.MaisonCart && window.MaisonCart.showCartToast) {
          window.MaisonCart.showCartToast(`Order ${orderId} status updated to: ${newStatus}`);
        }

        // Refresh underlying table
        renderActiveTab();
      }
    }
  }

  /* ===================================================================
     6. PRODUCTS & INVENTORY MANAGEMENT TAB
     =================================================================== */
  function renderProductsManagement(container) {
    const products = window.MaisonProducts ? window.MaisonProducts.getProducts() : (window.MAISON_PRODUCTS || []);

    container.innerHTML = `
      <div class="admin-container">
        
        <div class="admin-header-row">
          <div>
            <span class="admin-section-eyebrow">Fragrance Portfolio Management</span>
            <h1 class="admin-section-title">Products, Pricing & Stock Availability</h1>
            <p class="admin-section-desc">Configure retail bottle prices, toggle small-batch inventory status, and adjust availability in real-time.</p>
          </div>
          <div class="admin-header-actions">
            <button class="admin-btn admin-btn-secondary" onclick="MaisonAdmin.resetAllProductOverrides()">
              Reset to Factory Defaults
            </button>
          </div>
        </div>

        <!-- Products Grid / Table -->
        <div class="admin-products-grid">
          ${products.map(product => {
            const isOutOfStock = product.stockStatus === 'out_of_stock';
            const size50 = product.sizes.find(s => s.size === '50ml') || product.sizes[0];
            const size100 = product.sizes.find(s => s.size === '100ml') || product.sizes[1] || product.sizes[0];

            return `
              <div class="admin-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}" id="adminProductCard_${product.id}">
                
                <div class="admin-pcard-header">
                  <img src="${product.primaryImage}" alt="${product.name}" class="admin-pcard-img" width="60" height="60">
                  <div class="admin-pcard-title-meta">
                    <span class="admin-pcard-family">${product.family}</span>
                    <h3 class="admin-pcard-name">${product.name}</h3>
                    <span class="admin-pcard-sub">${product.subtitle}</span>
                  </div>
                  <span class="stock-status-pill ${isOutOfStock ? 'stock-pill-out' : 'stock-pill-in'}" id="stockPill_${product.id}">
                    ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>

                <div class="admin-pcard-body">
                  <p class="admin-pcard-desc">${product.shortDescription}</p>

                  <!-- Stock Availability Toggle -->
                  <div class="admin-pcard-toggle-row">
                    <span class="admin-toggle-label">Boutique Inventory State:</span>
                    <button 
                      type="button" 
                      class="admin-stock-toggle-btn ${isOutOfStock ? 'is-out' : 'is-in'}" 
                      id="stockToggleBtn_${product.id}"
                      onclick="MaisonAdmin.toggleProductStock('${product.id}')"
                    >
                      <span>${isOutOfStock ? 'Currently Marked Out of Stock' : '✓ Active & Available in Store'}</span>
                    </button>
                  </div>

                  <!-- Pricing Adjuster Form -->
                  <div class="admin-pcard-pricing-block">
                    <div class="pricing-block-title">Variant Retail Pricing (INR)</div>
                    
                    <div class="pricing-inputs-grid">
                      <div class="pricing-input-group">
                        <label for="price50_${product.id}">50ml Extrait (₹)</label>
                        <input 
                          type="number" 
                          id="price50_${product.id}" 
                          class="admin-price-input" 
                          value="${size50 ? size50.price : 4800}" 
                          step="100" 
                          min="500" 
                          aria-label="${product.name} 50ml Price"
                        >
                      </div>

                      <div class="pricing-input-group">
                        <label for="price100_${product.id}">100ml Extrait (₹)</label>
                        <input 
                          type="number" 
                          id="price100_${product.id}" 
                          class="admin-price-input" 
                          value="${size100 ? size100.price : 7800}" 
                          step="100" 
                          min="500" 
                          aria-label="${product.name} 100ml Price"
                        >
                      </div>
                    </div>

                    <button 
                      type="button" 
                      class="admin-btn admin-btn-sm admin-btn-primary admin-save-price-btn" 
                      id="savePriceBtn_${product.id}"
                      onclick="MaisonAdmin.saveProductPricing('${product.id}')"
                    >
                      Save Pricing Adjustments
                    </button>
                  </div>

                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  function toggleProductStock(productId) {
    if (!window.MaisonProducts) return;
    const current = window.MaisonProducts.getProductById(productId);
    if (!current) return;

    const newStockStatus = current.stockStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
    const newStockText = newStockStatus === 'in_stock' ? 'In Stock — Small Batch Reserve' : 'Out of Stock — Register for Next Harvest';

    window.MaisonProducts.updateProduct(productId, {
      stockStatus: newStockStatus,
      stockText: newStockText
    });

    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`${current.name} stock updated: ${newStockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}`);
    }

    renderProductsManagement(document.getElementById('adminTabContent'));
  }

  function saveProductPricing(productId) {
    if (!window.MaisonProducts) return;
    const current = window.MaisonProducts.getProductById(productId);
    if (!current) return;

    const input50 = document.getElementById(`price50_${productId}`);
    const input100 = document.getElementById(`price100_${productId}`);

    const newPrice50 = input50 ? parseInt(input50.value, 10) : (current.sizes[0]?.price || 4800);
    const newPrice100 = input100 ? parseInt(input100.value, 10) : (current.sizes[1]?.price || 7800);

    if (isNaN(newPrice50) || newPrice50 <= 0 || isNaN(newPrice100) || newPrice100 <= 0) {
      alert('Please enter valid positive numbers for fragrance prices.');
      return;
    }

    const updatedSizes = current.sizes.map(s => {
      if (s.size === '50ml') return { ...s, price: newPrice50 };
      if (s.size === '100ml') return { ...s, price: newPrice100 };
      return s;
    });

    window.MaisonProducts.updateProduct(productId, {
      sizes: updatedSizes
    });

    const saveBtn = document.getElementById(`savePriceBtn_${productId}`);
    if (saveBtn) {
      saveBtn.textContent = '✓ Pricing Saved';
      saveBtn.style.backgroundColor = 'var(--color-accent-gold)';
      setTimeout(() => {
        saveBtn.textContent = 'Save Pricing Adjustments';
        saveBtn.style.backgroundColor = '';
      }, 1500);
    }

    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`${current.name} pricing updated: 50ml @ ₹${newPrice50.toLocaleString('en-IN')}, 100ml @ ₹${newPrice100.toLocaleString('en-IN')}`);
    }
  }

  function resetAllProductOverrides() {
    if (confirm('Reset all product prices and stock availability to original factory defaults?')) {
      if (window.MaisonProducts) {
        window.MaisonProducts.resetProducts();
        if (window.MaisonCart && window.MaisonCart.showCartToast) {
          window.MaisonCart.showCartToast('All product prices & stock reset to defaults.');
        }
        renderProductsManagement(document.getElementById('adminTabContent'));
      }
    }
  }

  return {
    initAdmin,
    handleAdminLogin,
    handleAdminLogout,
    switchTab,
    setOrderFilter,
    handleOrderSearch,
    openOrderDetail,
    closeOrderDetail,
    saveOrderStatus,
    toggleProductStock,
    saveProductPricing,
    resetAllProductOverrides
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonAdminAuth = MaisonAdminAuth;
  window.MaisonAdmin = MaisonAdmin;
}
