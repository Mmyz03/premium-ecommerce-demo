/**
 * ===================================================================
 * MAISON AURA — CUSTOMER ACCOUNT & ORDER HISTORY CONTROLLER
 * Phase 7 — Single-Brand Luxury Perfume E-Commerce Demo
 * ===================================================================
 */

const MaisonAccount = (() => {
  const ACCOUNT_STORAGE_KEY = 'maison_aura_account_tab_v1';
  let activeTab = 'orders'; // 'orders' | 'profile' | 'address'
  let selectedOrderId = null;

  function initAccount(initialTab = null) {
    if (initialTab) {
      activeTab = initialTab;
    } else {
      try {
        const saved = sessionStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (saved) {
          activeTab = saved;
        } else if (window.location.hash === '#orders') {
          activeTab = 'orders';
        } else {
          activeTab = 'profile';
        }
      } catch (e) {
        activeTab = window.location.hash === '#orders' ? 'orders' : 'profile';
      }
    }

    const container = document.getElementById('accountView');
    if (!container) return;

    if (!window.MaisonAuth || !window.MaisonAuth.isAuthenticated()) {
      window.location.hash = '#home';
      if (window.openAuthModal) {
        window.openAuthModal('account');
      }
      return;
    }

    renderAccount(container);
  }

  function renderAccount(container) {
    const user = window.MaisonAuth.getUser();
    const orders = window.MaisonOrders ? window.MaisonOrders.getCustomerOrders(user.email) : [];

    container.innerHTML = `
      <section class="account-section" aria-label="Customer Account">
        <div class="container account-container">
          
          <!-- Account Executive Header -->
          <div class="account-header-card">
            <div class="account-header-left">
              <div class="account-avatar-circle">
                <span>${user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
              </div>
              <div class="account-profile-meta">
                <div class="account-patron-badge">
                  <span>✦ Verified Private Salon Patron</span>
                </div>
                <h1 class="account-user-title">${user.name}</h1>
                <div class="account-user-submeta">
                  <span>${user.email}</span>
                  <span class="meta-dot">•</span>
                  <span>Patron Member since ${user.joinedAt || '2026'}</span>
                </div>
              </div>
            </div>

            <div class="account-header-actions">
              <a href="#shop" class="btn btn-secondary btn-sm">
                <span>Explore Boutique</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </a>
              <button class="btn btn-secondary btn-sm account-signout-btn" onclick="MaisonAccount.handleSignOut()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <!-- Account Navigation Tabs -->
          <div class="account-nav-bar">
            <div class="account-nav-pills" role="tablist">
              <button 
                class="account-tab-btn ${activeTab === 'orders' ? 'is-active' : ''}" 
                role="tab" 
                aria-selected="${activeTab === 'orders'}"
                onclick="MaisonAccount.switchTab('orders')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Order History & Manifests</span>
                <span class="account-tab-count">${orders.length}</span>
              </button>

              <button 
                class="account-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}" 
                role="tab" 
                aria-selected="${activeTab === 'profile'}"
                onclick="MaisonAccount.switchTab('profile')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Personal Profile & Contact</span>
              </button>

              <button 
                class="account-tab-btn ${activeTab === 'address' ? 'is-active' : ''}" 
                role="tab" 
                aria-selected="${activeTab === 'address'}"
                onclick="MaisonAccount.switchTab('address')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Saved Concierge Address</span>
              </button>
            </div>
          </div>

          <!-- Dynamic Tab Content Workspace -->
          <div class="account-workspace" id="accountTabContent">
            <!-- Rendered by specific tab renderers -->
          </div>

        </div>

        <!-- Customer Order Detail Modal Container -->
        <div id="customerOrderModalContainer"></div>

      </section>
    `;

    renderActiveTabContent();
  }

  function switchTab(tabKey) {
    activeTab = tabKey;
    try {
      sessionStorage.setItem(ACCOUNT_STORAGE_KEY, tabKey);
    } catch (e) {
      console.warn('Could not save active account tab', e);
    }
    const tabBtns = document.querySelectorAll('.account-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(tabKey)) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
    renderActiveTabContent();
  }

  function renderActiveTabContent() {
    const container = document.getElementById('accountTabContent');
    if (!container) return;

    if (activeTab === 'orders') {
      renderOrderHistoryTab(container);
    } else if (activeTab === 'profile') {
      renderProfileTab(container);
    } else if (activeTab === 'address') {
      renderAddressTab(container);
    }
  }

  /* ===================================================================
     1. ORDER HISTORY TAB
     =================================================================== */
  function renderOrderHistoryTab(container) {
    const user = window.MaisonAuth.getUser();
    const orders = window.MaisonOrders ? window.MaisonOrders.getCustomerOrders(user.email) : [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="account-empty-state">
          <div class="empty-state-crest">✦</div>
          <h2 class="empty-state-title">Your Fragrance Journey Begins Here</h2>
          <p class="empty-state-desc">
            You have not placed any boutique orders yet. Explore our handcrafted Extrait de Parfum portfolio to begin your personalized scent collection.
          </p>
          <a href="#shop" class="btn btn-primary btn-md">
            <span>Explore Fragrance Portfolio</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="account-orders-stack">
        
        <div class="orders-section-heading-row">
          <div>
            <h2 class="account-sub-heading">Fragrance Order History</h2>
            <p class="account-sub-desc">Track artisanal fulfillment, courier dispatches, and flacon manifests.</p>
          </div>
          <div class="orders-count-label">${orders.length} Verified Order${orders.length > 1 ? 's' : ''}</div>
        </div>

        ${orders.map(order => {
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          const statusLower = (order.fulfillmentStatus || 'processing').toLowerCase();

          return `
            <article class="customer-order-card">
              
              <!-- Order Card Top Bar -->
              <div class="c-order-header">
                <div class="c-order-id-meta">
                  <div class="c-order-ref-wrap">
                    <span class="c-order-ref">${order.orderId}</span>
                    <span class="status-badge status-${statusLower}">${order.fulfillmentStatus}</span>
                  </div>
                  <span class="c-order-date">${order.formattedDate}</span>
                </div>

                <div class="c-order-header-right">
                  <span class="c-order-total-price">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</span>
                  <span class="c-order-item-count">${itemCount} Flacon${itemCount > 1 ? 's' : ''}</span>
                </div>
              </div>

              <!-- Order Card Items Summary List -->
              <div class="c-order-items-preview">
                ${order.items.map(item => `
                  <div class="c-order-item-row">
                    <img src="${item.image}" alt="${item.name}" class="c-order-item-thumb" width="52" height="52" loading="lazy">
                    <div class="c-order-item-info">
                      <div class="c-order-item-name">${item.name}</div>
                      <div class="c-order-item-variant">${item.subtitle || 'Extrait de Parfum'} • ${item.size}</div>
                      <div class="c-order-item-qty">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div class="c-order-item-subtotal">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Order Card Footer & Actions -->
              <div class="c-order-footer">
                <div class="c-order-footer-meta">
                  <span class="c-order-payment-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>${order.payment?.method || 'UPI'}</span>
                  </span>
                  ${(order.pricing?.packaging || 0) > 0 ? `
                    <span class="c-order-addon-tag">✦ Signature Velvet Gift Packaging</span>
                  ` : ''}
                  <span class="c-order-addon-tag">✦ 2 Discovery Vials</span>
                </div>

                <button class="btn btn-secondary btn-sm" onclick="MaisonAccount.openOrderDetailModal('${order.orderId}')">
                  <span>View Full Manifest</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

            </article>
          `;
        }).join('')}

      </div>
    `;
  }

  /* ===================================================================
     2. PERSONAL PROFILE TAB
     =================================================================== */
  function renderProfileTab(container) {
    const user = window.MaisonAuth.getUser();

    container.innerHTML = `
      <div class="account-card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Personal Profile & Concierge Details</h2>
          <p class="panel-subtitle">Manage your verified name, primary contact phone, and boutique salon privileges.</p>
        </div>

        <form class="account-form" onsubmit="event.preventDefault(); MaisonAccount.handleProfileSubmit();">
          
          <div class="account-form-grid">
            
            <div class="account-form-group">
              <label for="accProfileName" class="account-label">Full Name</label>
              <input 
                type="text" 
                id="accProfileName" 
                class="account-input" 
                value="${user.name}" 
                required 
                autocomplete="name"
              >
            </div>

            <div class="account-form-group">
              <label for="accProfileEmail" class="account-label">Email Address (Verified)</label>
              <input 
                type="email" 
                id="accProfileEmail" 
                class="account-input" 
                value="${user.email}" 
                disabled 
                title="Email is verified to your private salon account"
              >
              <span class="account-field-note">Linked to your authentication credentials.</span>
            </div>

            <div class="account-form-group">
              <label for="accProfilePhone" class="account-label">Primary Mobile Phone</label>
              <input 
                type="tel" 
                id="accProfilePhone" 
                class="account-input" 
                value="${user.phone || '+91 98200 12345'}" 
                placeholder="+91 98200 12345" 
                required 
                autocomplete="tel"
              >
              <span class="account-field-note">Used for Bluedart delivery SMS & dispatch updates.</span>
            </div>

            <div class="account-form-group">
              <label class="account-label">Salon Privilege Status</label>
              <div class="account-status-card">
                <div class="status-card-icon">✦</div>
                <div>
                  <div class="status-card-title">Maison Aura Private Salon Member</div>
                  <div class="status-card-desc">Complimentary Discovery Vials & Pan-India Priority Dispatch enabled.</div>
                </div>
              </div>
            </div>

          </div>

          <div class="account-form-actions">
            <button type="submit" class="btn btn-primary btn-md" id="saveProfileBtn">
              <span>Save Profile Changes</span>
            </button>
          </div>

        </form>
      </div>
    `;
  }

  function handleProfileSubmit() {
    const nameInput = document.getElementById('accProfileName');
    const phoneInput = document.getElementById('accProfilePhone');
    const saveBtn = document.getElementById('saveProfileBtn');

    if (!nameInput || !phoneInput) return;

    if (nameInput.value.trim().length < 2) {
      alert('Please enter your valid full name.');
      return;
    }

    window.MaisonAuth.updateProfile({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim()
    });

    if (saveBtn) {
      saveBtn.innerHTML = `<span>✓ Profile Saved</span>`;
      saveBtn.style.backgroundColor = 'var(--color-accent-gold)';
      setTimeout(() => {
        saveBtn.innerHTML = `<span>Save Profile Changes</span>`;
        saveBtn.style.backgroundColor = '';
      }, 1500);
    }

    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast('Profile information updated successfully.');
    }

    // Refresh header
    const user = window.MaisonAuth.getUser();
    const titleEl = document.querySelector('.account-user-title');
    if (titleEl) titleEl.textContent = user.name;
  }

  /* ===================================================================
     3. SAVED CONCIERGE ADDRESS TAB
     =================================================================== */
  function renderAddressTab(container) {
    const user = window.MaisonAuth.getUser();
    const addr = user.address || {
      addressLine: 'Apt 14B, Regency Crest, Altamount Road',
      landmark: 'Near Cumballa Hill Hospital',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400026'
    };

    container.innerHTML = `
      <div class="account-card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Saved Concierge Shipping Address</h2>
          <p class="panel-subtitle">Your default delivery destination for temperature-controlled fragrance express transit.</p>
        </div>

        <form class="account-form" onsubmit="event.preventDefault(); MaisonAccount.handleAddressSubmit();">
          
          <div class="account-form-grid">
            
            <div class="account-form-group span-2">
              <label for="accAddrLine" class="account-label">Street / Apartment / Residence</label>
              <input 
                type="text" 
                id="accAddrLine" 
                class="account-input" 
                value="${addr.addressLine}" 
                required 
                autocomplete="street-address"
              >
            </div>

            <div class="account-form-group">
              <label for="accAddrLandmark" class="account-label">Landmark / Estate</label>
              <input 
                type="text" 
                id="accAddrLandmark" 
                class="account-input" 
                value="${addr.landmark || ''}" 
                placeholder="e.g. Near Cumballa Hill Hospital"
              >
            </div>

            <div class="account-form-group">
              <label for="accAddrCity" class="account-label">City</label>
              <input 
                type="text" 
                id="accAddrCity" 
                class="account-input" 
                value="${addr.city}" 
                required 
                autocomplete="address-level2"
              >
            </div>

            <div class="account-form-group">
              <label for="accAddrState" class="account-label">State</label>
              <input 
                type="text" 
                id="accAddrState" 
                class="account-input" 
                value="${addr.state}" 
                required 
                autocomplete="address-level1"
              >
            </div>

            <div class="account-form-group">
              <label for="accAddrPin" class="account-label">PIN Code (India)</label>
              <input 
                type="text" 
                id="accAddrPin" 
                class="account-input" 
                value="${addr.pincode}" 
                required 
                pattern="[0-9]{6}" 
                maxlength="6"
                autocomplete="postal-code"
              >
            </div>

          </div>

          <div class="account-form-actions">
            <button type="submit" class="btn btn-primary btn-md" id="saveAddrBtn">
              <span>Save Concierge Address</span>
            </button>
          </div>

        </form>
      </div>
    `;
  }

  function handleAddressSubmit() {
    const lineInput = document.getElementById('accAddrLine');
    const landmarkInput = document.getElementById('accAddrLandmark');
    const cityInput = document.getElementById('accAddrCity');
    const stateInput = document.getElementById('accAddrState');
    const pinInput = document.getElementById('accAddrPin');
    const saveBtn = document.getElementById('saveAddrBtn');

    if (!lineInput || !cityInput || !pinInput) return;

    window.MaisonAuth.updateProfile({
      address: {
        addressLine: lineInput.value.trim(),
        landmark: landmarkInput ? landmarkInput.value.trim() : '',
        city: cityInput.value.trim(),
        state: stateInput ? stateInput.value.trim() : 'Maharashtra',
        pincode: pinInput.value.trim()
      }
    });

    if (saveBtn) {
      saveBtn.innerHTML = `<span>✓ Address Saved</span>`;
      saveBtn.style.backgroundColor = 'var(--color-accent-gold)';
      setTimeout(() => {
        saveBtn.innerHTML = `<span>Save Concierge Address</span>`;
        saveBtn.style.backgroundColor = '';
      }, 1500);
    }

    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast('Concierge delivery address updated successfully.');
    }
  }

  /* ===================================================================
     4. CUSTOMER ORDER DETAIL MODAL
     =================================================================== */
  function openOrderDetailModal(orderId) {
    selectedOrderId = orderId;
    const order = window.MaisonOrders ? window.MaisonOrders.getOrderById(orderId) : null;
    if (!order) return;

    const modalContainer = document.getElementById('customerOrderModalContainer');
    if (!modalContainer) return;

    const statusLower = (order.fulfillmentStatus || 'processing').toLowerCase();

    modalContainer.innerHTML = `
      <div class="c-modal-backdrop is-open" id="customerOrderBackdrop" onclick="if(event.target===this) MaisonAccount.closeOrderDetailModal();">
        <div class="c-order-modal" role="dialog" aria-modal="true" aria-labelledby="cOrderModalTitle">
          
          <!-- Modal Header -->
          <div class="c-modal-header">
            <div>
              <div class="c-modal-eyebrow-row">
                <span class="eyebrow">✦ Flacon Order Manifest</span>
                <span class="status-badge status-${statusLower}">${order.fulfillmentStatus}</span>
              </div>
              <h2 class="c-modal-title" id="cOrderModalTitle">${order.orderId}</h2>
              <span class="c-modal-subtitle">Ordered on ${order.formattedDate} • ${order.payment?.method || 'UPI'}</span>
            </div>
            <button class="c-modal-close" onclick="MaisonAccount.closeOrderDetailModal()" aria-label="Close manifest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="c-modal-body">
            
            <!-- Delivery & Dispatch Tracking Banner -->
            <div class="c-tracking-banner">
              <div class="tracking-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div class="tracking-info">
                <div class="tracking-title">Estimated Transit: ${order.estimatedDelivery || '48–72 Hours Express'}</div>
                <div class="tracking-sub">Temperature-controlled secured parcel via Bluedart Express Pan-India.</div>
              </div>
            </div>

            <!-- Two Column Layout: Delivery vs Reserved Items -->
            <div class="c-manifest-grid">
              
              <!-- Left: Delivery & Payment Details -->
              <div class="c-manifest-col">
                <div class="c-manifest-section-title">Delivery Destination</div>
                <div class="c-manifest-box">
                  <div class="c-dest-name">${order.delivery?.fullName || order.customer?.name}</div>
                  <div class="c-dest-address">
                    ${order.delivery?.addressLine}<br>
                    ${order.delivery?.landmark ? `Landmark: ${order.delivery.landmark}<br>` : ''}
                    ${order.delivery?.city}, ${order.delivery?.state} — <strong>${order.delivery?.pincode}</strong><br>
                    India
                  </div>
                  <div class="c-dest-contact" style="margin-top: 8px;">
                    <div>Phone: ${order.delivery?.phone || 'Not provided'}</div>
                    <div>Email: ${order.delivery?.email || order.customer?.email}</div>
                  </div>
                </div>

                <div class="c-manifest-section-title" style="margin-top: var(--space-4);">Payment Verification</div>
                <div class="c-manifest-box">
                  <div class="c-info-row">
                    <span>Payment Method:</span>
                    <strong>${order.payment?.method}</strong>
                  </div>
                  <div class="c-info-row">
                    <span>Transaction State:</span>
                    <span style="color: var(--color-status-success); font-weight: 600;">${order.payment?.status || 'Paid'}</span>
                  </div>
                  <div class="c-info-row">
                    <span>Reference ID:</span>
                    <span style="font-family: monospace; font-size: 11px;">${order.payment?.referenceId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Items & Financial Breakdown -->
              <div class="c-manifest-col">
                <div class="c-manifest-section-title">Reserved Fragrances</div>
                
                <div class="c-items-list">
                  ${order.items.map(item => `
                    <div class="c-item-row">
                      <img src="${item.image}" alt="${item.name}" class="c-item-img" width="48" height="48">
                      <div class="c-item-meta">
                        <div class="c-item-name">${item.name}</div>
                        <div class="c-item-sub">${item.subtitle || 'Extrait de Parfum'} • ${item.size}</div>
                        <div class="c-item-qty">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</div>
                      </div>
                      <div class="c-item-total">
                        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Addons -->
                <div class="c-addon-line">
                  <span>Signature Velvet Gift Presentation</span>
                  <strong>${(order.pricing?.packaging || 0) > 0 ? 'Included (+₹350)' : 'Standard Boutique Box'}</strong>
                </div>
                <div class="c-addon-line">
                  <span>2ml Complimentary Discovery Vials</span>
                  <span style="color: var(--color-accent-gold-deep);">Included (x2)</span>
                </div>

                <!-- Financials -->
                <div class="c-financials-block">
                  <div class="c-fin-row">
                    <span>Subtotal</span>
                    <span>₹${(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="c-fin-row">
                    <span>Gift Packaging</span>
                    <span>₹${(order.pricing?.packaging || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="c-fin-row">
                    <span>Express Pan-India Transit</span>
                    <span style="color: var(--color-status-success);">Complimentary (₹0)</span>
                  </div>
                  <div class="c-fin-row c-fin-total">
                    <span>Total Amount Paid</span>
                    <span class="c-fin-total-val">₹${(order.pricing?.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- Modal Footer -->
          <div class="c-modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="MaisonAccount.closeOrderDetailModal()">
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
      closeOrderDetailModal();
    }
  }

  function closeOrderDetailModal() {
    selectedOrderId = null;
    const modalContainer = document.getElementById('customerOrderModalContainer');
    if (modalContainer) modalContainer.innerHTML = '';
    document.removeEventListener('keydown', handleModalKeydown);
  }

  function handleSignOut() {
    if (window.MaisonAuth) {
      window.MaisonAuth.logout();
    }
    window.location.hash = '#home';
  }

  return {
    initAccount,
    switchTab,
    renderActiveTabContent,
    handleProfileSubmit,
    handleAddressSubmit,
    openOrderDetailModal,
    closeOrderDetailModal,
    handleSignOut
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonAccount = MaisonAccount;
}
