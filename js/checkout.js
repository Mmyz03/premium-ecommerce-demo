/**
 * ===================================================================
 * MAISON AURA — MULTI-STEP CHECKOUT & PAYMENT CONTROLLER
 * Single-Brand Luxury Perfume E-Commerce Store
 * ===================================================================
 */

const MaisonCheckout = (() => {
  const PACKAGING_PRICE = 350;
  const FREE_SHIPPING_THRESHOLD = 2500;
  const STANDARD_SHIPPING_FEE = 150;
  const CHECKOUT_STORAGE_KEY = 'maison_aura_checkout_state_v1';

  let currentStep = 1;
  let deliveryData = {
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  };
  let includePackaging = false;
  let selectedPaymentMethod = 'UPI';
  let simulateFailureMode = false;
  let confirmedOrder = null;

  function saveState() {
    try {
      const state = {
        currentStep,
        deliveryData,
        includePackaging,
        selectedPaymentMethod,
        confirmedOrderId: confirmedOrder ? confirmedOrder.orderId : null
      };
      sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save checkout state', e);
    }
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (state.deliveryData) {
          deliveryData = Object.assign(deliveryData, state.deliveryData);
        }
        if (typeof state.includePackaging === 'boolean') {
          includePackaging = state.includePackaging;
        }
        if (state.selectedPaymentMethod) {
          selectedPaymentMethod = state.selectedPaymentMethod;
        }
        if (state.confirmedOrderId && window.MaisonOrders) {
          const found = window.MaisonOrders.getOrderById(state.confirmedOrderId);
          if (found) {
            confirmedOrder = found;
          }
        }
        if (state.currentStep && state.currentStep >= 1 && state.currentStep <= 4) {
          if (state.currentStep === 4 && !confirmedOrder) {
            currentStep = 1;
          } else {
            currentStep = state.currentStep;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load checkout state', e);
    }
  }

  function clearState() {
    try {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear checkout state', e);
    }
    currentStep = 1;
    confirmedOrder = null;
    includePackaging = false;
  }

  function initCheckout() {
    // 1. Verify Authentication Gate
    if (!window.MaisonAuth || !window.MaisonAuth.isAuthenticated()) {
      window.location.hash = '#home';
      if (window.openAuthModal) {
        window.openAuthModal('checkout');
      }
      return;
    }

    // Load any saved checkout state from current session
    loadState();

    const cart = window.MaisonCart ? window.MaisonCart.getItems() : [];

    // If cart has items but state was on step 4 (previous order), reset to step 1 for a new checkout
    if (cart.length > 0 && currentStep === 4) {
      currentStep = 1;
      confirmedOrder = null;
      saveState();
    }

    // 2. Verify Cart not empty (unless we are viewing confirmation)
    if (cart.length === 0 && currentStep !== 4) {
      currentStep = 1;
      saveState();
      const container = document.getElementById('checkoutView');
      if (container) {
        container.innerHTML = `
          <div class="container" style="text-align: center; padding: 5rem 1rem;">
            <div style="font-size: 2.5rem; color: var(--color-accent-gold); margin-bottom: 1rem;">✦</div>
            <h2 style="font-family: var(--font-serif); font-size: 2.2rem; margin-bottom: 1rem;">Your Shopping Bag is Empty</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">Please select an artisanal fragrance before proceeding to checkout.</p>
            <a href="#shop" class="btn btn-primary btn-md">Explore Fragrance Portfolio</a>
          </div>
        `;
      }
      return;
    }

    // 3. Prefill authenticated customer details
    const user = window.MaisonAuth.getUser();
    if (user) {
      if (!deliveryData.fullName) deliveryData.fullName = user.name || '';
      if (!deliveryData.email) deliveryData.email = user.email || '';
      if (user.phone && !deliveryData.phone) deliveryData.phone = user.phone;
      if (user.address) {
        if (user.address.addressLine && !deliveryData.addressLine) deliveryData.addressLine = user.address.addressLine;
        if (user.address.landmark && !deliveryData.landmark) deliveryData.landmark = user.address.landmark;
        if (user.address.city && !deliveryData.city) deliveryData.city = user.address.city;
        if (user.address.state && !deliveryData.state) deliveryData.state = user.address.state;
        if (user.address.pincode && !deliveryData.pincode) deliveryData.pincode = user.address.pincode;
      }
    }

    renderCheckoutLayout();
    goToStep(currentStep);
  }

  function renderCheckoutLayout() {
    const container = document.getElementById('checkoutView');
    if (!container) return;

    container.innerHTML = `
      <section class="checkout-section" aria-label="Multi-Step Checkout">
        <div class="container">
          
          <!-- Stepper Progress Bar -->
          <div class="checkout-stepper-wrap" id="stepperWrapper">
            <div class="checkout-stepper">
              <div class="step-node is-active" id="stepNode1">
                <span class="step-number">01</span>
                <span class="step-label">Delivery</span>
              </div>
              <div class="step-node" id="stepNode2">
                <span class="step-number">02</span>
                <span class="step-label">Review</span>
              </div>
              <div class="step-node" id="stepNode3">
                <span class="step-number">03</span>
                <span class="step-label">Payment</span>
              </div>
              <div class="step-node" id="stepNode4">
                <span class="step-number">04</span>
                <span class="step-label">Confirmation</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Step Panels -->
          <div id="checkoutStepContent">
            <!-- Populated by step renderers -->
          </div>

        </div>
      </section>

      <!-- Payment Processing Overlay -->
      <div class="payment-processing-overlay" id="paymentProcessingOverlay">
        <div class="processing-card">
          <div class="luxury-spinner"></div>
          <h3 class="processing-title">Securing Transaction</h3>
          <p class="processing-subtitle">Verifying simulated payment authorization with gateway...</p>
        </div>
      </div>
    `;
  }

  function goToStep(stepNumber) {
    currentStep = stepNumber;
    saveState();
    updateStepperUI();

    const content = document.getElementById('checkoutStepContent');
    if (!content) return;

    if (stepNumber === 1) {
      renderStep1(content);
    } else if (stepNumber === 2) {
      renderStep2(content);
    } else if (stepNumber === 3) {
      renderStep3(content);
    } else if (stepNumber === 4) {
      renderStep4(content);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateStepperUI() {
    const stepperWrapper = document.getElementById('stepperWrapper');
    if (currentStep === 4 && stepperWrapper) {
      // Hide or complete stepper on confirmation
      stepperWrapper.style.display = 'none';
      return;
    } else if (stepperWrapper) {
      stepperWrapper.style.display = 'block';
    }

    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`stepNode${i}`);
      if (!node) continue;
      node.classList.remove('is-active', 'is-completed');
      if (i === currentStep) {
        node.classList.add('is-active');
      } else if (i < currentStep) {
        node.classList.add('is-completed');
      }
    }
  }

  function getCalculatedTotals() {
    const cartSubtotal = window.MaisonCart ? window.MaisonCart.getSubtotal() : 0;
    const shipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
    const packaging = includePackaging ? PACKAGING_PRICE : 0;
    const grandTotal = cartSubtotal + shipping + packaging;

    return {
      subtotal: cartSubtotal,
      shipping,
      packaging,
      total: grandTotal
    };
  }

  /* ===================================================================
     STEP 1: DELIVERY INFORMATION
     =================================================================== */
  function renderStep1(container) {
    const totals = getCalculatedTotals();

    container.innerHTML = `
      <div class="checkout-layout">
        
        <!-- Left: Delivery Form -->
        <div class="checkout-main-card">
          <span class="eyebrow">✦ Step 01 of 03</span>
          <h2 class="checkout-panel-title">Shipping & Delivery Details</h2>
          <p class="checkout-panel-desc">All Maison Aura extrait flacons are dispatched in temperature-regulated packaging via express transit.</p>

          <form id="deliveryForm" onsubmit="event.preventDefault(); MaisonCheckout.handleDeliverySubmit();">
            <div class="delivery-grid">
              
              <div class="form-group">
                <label class="form-label" for="delFullName">Full Name *</label>
                <input type="text" id="delFullName" class="form-input" value="${deliveryData.fullName}" placeholder="e.g. Alexander Wright" required>
                <div class="form-error" id="delFullNameError">Please enter your full name.</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="delPhone">Mobile Number (10 Digits) *</label>
                <input type="tel" id="delPhone" class="form-input" value="${deliveryData.phone}" placeholder="9876543210" maxlength="10" required>
                <div class="form-error" id="delPhoneError">Please enter a valid 10-digit mobile number.</div>
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="delEmail">Email for Order Updates *</label>
                <input type="email" id="delEmail" class="form-input" value="${deliveryData.email}" placeholder="name@example.com" required>
                <div class="form-error" id="delEmailError">Please enter a valid email address.</div>
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="delAddress">Street Address / Apartment *</label>
                <input type="text" id="delAddress" class="form-input" value="${deliveryData.addressLine}" placeholder="Flat 4B, Heritage Residence, Altamount Road" required>
                <div class="form-error" id="delAddressError">Please enter a complete delivery address.</div>
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="delLandmark">Landmark (Optional)</label>
                <input type="text" id="delLandmark" class="form-input" value="${deliveryData.landmark}" placeholder="Near Royal Opera House">
              </div>

              <div class="form-group">
                <label class="form-label" for="delCity">City *</label>
                <input type="text" id="delCity" class="form-input" value="${deliveryData.city}" required>
                <div class="form-error" id="delCityError">Please enter city.</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="delState">State *</label>
                <select id="delState" class="form-select" required>
                  <option value="Maharashtra" ${deliveryData.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
                  <option value="Delhi" ${deliveryData.state === 'Delhi' ? 'selected' : ''}>Delhi NCR</option>
                  <option value="Karnataka" ${deliveryData.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
                  <option value="Tamil Nadu" ${deliveryData.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
                  <option value="Telangana" ${deliveryData.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
                  <option value="Gujarat" ${deliveryData.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
                  <option value="West Bengal" ${deliveryData.state === 'West Bengal' ? 'selected' : ''}>West Bengal</option>
                  <option value="Rajasthan" ${deliveryData.state === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="delPincode">PIN Code (6 Digits) *</label>
                <input type="text" id="delPincode" class="form-input" value="${deliveryData.pincode}" maxlength="6" placeholder="400001" required>
                <div class="form-error" id="delPincodeError">Please enter a valid 6-digit PIN code.</div>
              </div>

            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-4); border-top: 1px solid var(--color-border-subtle);">
              <a href="#shop" class="btn btn-link">← Return to Store</a>
              <button type="submit" class="btn btn-primary btn-md">Continue to Review →</button>
            </div>
          </form>
        </div>

        <!-- Right: Order Summary Sidebar -->
        ${renderSidebarSummary(totals)}

      </div>
    `;

    attachDeliveryInputListeners();
  }

  function attachDeliveryInputListeners() {
    const fields = [
      { id: 'delFullName', prop: 'fullName' },
      { id: 'delPhone', prop: 'phone' },
      { id: 'delEmail', prop: 'email' },
      { id: 'delAddress', prop: 'addressLine' },
      { id: 'delLandmark', prop: 'landmark' },
      { id: 'delCity', prop: 'city' },
      { id: 'delState', prop: 'state' },
      { id: 'delPincode', prop: 'pincode' }
    ];

    fields.forEach(({ id, prop }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          deliveryData[prop] = el.value.trim();
          saveState();
        });
        el.addEventListener('change', () => {
          deliveryData[prop] = el.value.trim();
          saveState();
        });
      }
    });
  }

  function handleDeliverySubmit() {
    const nameInput = document.getElementById('delFullName');
    const phoneInput = document.getElementById('delPhone');
    const emailInput = document.getElementById('delEmail');
    const addressInput = document.getElementById('delAddress');
    const landmarkInput = document.getElementById('delLandmark');
    const cityInput = document.getElementById('delCity');
    const stateInput = document.getElementById('delState');
    const pinInput = document.getElementById('delPincode');

    let valid = true;

    // Validate Name
    if (!nameInput.value || nameInput.value.trim().length < 2) {
      document.getElementById('delFullNameError').classList.add('is-visible');
      nameInput.classList.add('has-error');
      valid = false;
    } else {
      document.getElementById('delFullNameError').classList.remove('is-visible');
      nameInput.classList.remove('has-error');
    }

    // Validate Indian Phone (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
      document.getElementById('delPhoneError').classList.add('is-visible');
      phoneInput.classList.add('has-error');
      valid = false;
    } else {
      document.getElementById('delPhoneError').classList.remove('is-visible');
      phoneInput.classList.remove('has-error');
    }

    // Validate Email
    if (!emailInput.value || !emailInput.value.includes('@')) {
      document.getElementById('delEmailError').classList.add('is-visible');
      emailInput.classList.add('has-error');
      valid = false;
    } else {
      document.getElementById('delEmailError').classList.remove('is-visible');
      emailInput.classList.remove('has-error');
    }

    // Validate Address
    if (!addressInput.value || addressInput.value.trim().length < 5) {
      document.getElementById('delAddressError').classList.add('is-visible');
      addressInput.classList.add('has-error');
      valid = false;
    } else {
      document.getElementById('delAddressError').classList.remove('is-visible');
      addressInput.classList.remove('has-error');
    }

    // Validate PIN Code (6 digits)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pinInput.value.trim())) {
      document.getElementById('delPincodeError').classList.add('is-visible');
      pinInput.classList.add('has-error');
      valid = false;
    } else {
      document.getElementById('delPincodeError').classList.remove('is-visible');
      pinInput.classList.remove('has-error');
    }

    if (!valid) return;

    deliveryData = {
      fullName: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      addressLine: addressInput.value.trim(),
      landmark: landmarkInput ? landmarkInput.value.trim() : '',
      city: cityInput.value.trim(),
      state: stateInput.value,
      pincode: pinInput.value.trim()
    };
    saveState();

    goToStep(2);
  }

  /* ===================================================================
     STEP 2: ORDER REVIEW & PACKAGING SELECTION
     =================================================================== */
  function renderStep2(container) {
    const items = window.MaisonCart ? window.MaisonCart.getItems() : [];
    const totals = getCalculatedTotals();

    container.innerHTML = `
      <div class="checkout-layout">
        
        <div class="checkout-main-card">
          <span class="eyebrow">✦ Step 02 of 03</span>
          <h2 class="checkout-panel-title">Review Order & Presentation</h2>
          <p class="checkout-panel-desc">Verify your delivery destination and select bespoke packaging options.</p>

          <!-- Delivery Address Recap -->
          <div class="address-recap-box">
            <div>
              <div class="address-recap-name">${deliveryData.fullName} • ${deliveryData.phone}</div>
              <div class="address-recap-text">
                ${deliveryData.addressLine}${deliveryData.landmark ? ', ' + deliveryData.landmark : ''}<br>
                ${deliveryData.city}, ${deliveryData.state} — ${deliveryData.pincode}
              </div>
            </div>
            <button class="address-recap-edit-btn" onclick="MaisonCheckout.goToStep(1)">Edit Details</button>
          </div>

          <!-- Optional Signature Velvet Packaging Selection -->
          <label class="packaging-card">
            <input type="checkbox" class="packaging-checkbox" id="packagingCheckbox" ${includePackaging ? 'checked' : ''} onchange="MaisonCheckout.togglePackaging(this.checked)">
            <div>
              <div class="packaging-title">
                <span>Signature Maison Velvet Gift Box & Wax Seal</span>
                <strong style="color: var(--color-accent-gold-deep);">+₹${PACKAGING_PRICE}</strong>
              </div>
              <p class="packaging-desc">
                Handcrafted obsidian velvet rigid box with golden hot-stamped ribbon and personalized wax seal certificate. Ideal for connoisseurs and gifting.
              </p>
            </div>
          </label>

          <!-- Reserved Cart Items List -->
          <div class="review-items-list">
            <h3 style="font-family: var(--font-serif); font-size: var(--text-lg); margin-bottom: var(--space-3);">Reserved Items (${window.MaisonCart.getTotalCount()})</h3>
            ${items.map(item => `
              <div class="review-item-row">
                <div class="review-item-thumb">
                  <img src="${item.image}" alt="${item.name}">
                </div>
                <div>
                  <div class="review-item-title">${item.name}</div>
                  <div class="review-item-sub">Volume: ${item.size} • Qty: ${item.quantity}</div>
                </div>
                <div class="review-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-6); border-top: 1px solid var(--color-border-subtle);">
            <button class="btn btn-secondary btn-md" onclick="MaisonCheckout.goToStep(1)">← Back to Delivery</button>
            <button class="btn btn-primary btn-md" onclick="MaisonCheckout.goToStep(3)">Proceed to Payment →</button>
          </div>
        </div>

        <!-- Right: Summary Sidebar -->
        ${renderSidebarSummary(totals)}

      </div>
    `;
  }

  function togglePackaging(checked) {
    includePackaging = checked;
    saveState();
    goToStep(2); // re-render with updated pricing
  }

  /* ===================================================================
     STEP 3: PAYMENT SIMULATION
     =================================================================== */
  function renderStep3(container) {
    const totals = getCalculatedTotals();

    container.innerHTML = `
      <div class="checkout-layout">
        
        <div class="checkout-main-card">
          <span class="eyebrow">✦ Step 03 of 03</span>
          <h2 class="checkout-panel-title">Simulated Payment Authorization</h2>
          <p class="checkout-panel-desc">Select UPI or Card payment method. This is a realistic interactive demo simulator.</p>

          <!-- Payment Error Banner (if retry needed) -->
          <div id="paymentErrorBanner" style="display: none;" class="payment-error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong>Payment Declined (Simulated Failure)</strong>
              <div>Bank authorization declined the test transaction. Your shopping bag remains intact. Please retry.</div>
            </div>
          </div>

          <!-- Method Selection Tabs -->
          <div class="payment-tabs">
            <button class="payment-tab-btn ${selectedPaymentMethod === 'UPI' ? 'is-active' : ''}" onclick="MaisonCheckout.selectPaymentMethod('UPI')">
              ✦ UPI (Instant / QR)
            </button>
            <button class="payment-tab-btn ${selectedPaymentMethod === 'Card' ? 'is-active' : ''}" onclick="MaisonCheckout.selectPaymentMethod('Card')">
              💳 Credit / Debit Cards
            </button>
          </div>

          <!-- A. UPI SIMULATOR VIEW -->
          <div class="payment-view-panel ${selectedPaymentMethod === 'UPI' ? 'is-active' : ''}" id="upiPanel">
            <div class="upi-sim-box">
              <div class="qr-code-placeholder">
                <div class="qr-pattern"></div>
              </div>
              <div style="text-align: center; font-size: var(--text-2xs); color: var(--color-text-muted); margin-bottom: var(--space-4);">
                Scan with PhonePe, Google Pay, Paytm, or any BHIM UPI App
              </div>

              <div class="upi-apps-row">
                <span class="upi-app-pill is-active">GPay</span>
                <span class="upi-app-pill">PhonePe</span>
                <span class="upi-app-pill">Paytm</span>
                <span class="upi-app-pill">Cred</span>
              </div>

              <div class="form-group" style="margin-top: var(--space-4);">
                <label class="form-label" for="upiIdInput">Or Enter Virtual Payment Address (UPI ID)</label>
                <input type="text" id="upiIdInput" class="form-input" value="alexander@okhdfcbank" placeholder="yourname@okhdfcbank">
              </div>
            </div>
          </div>

          <!-- B. CARD SIMULATOR VIEW -->
          <div class="payment-view-panel ${selectedPaymentMethod === 'Card' ? 'is-active' : ''}" id="cardPanel">
            <div style="display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-6);">
              
              <div class="form-group">
                <label class="form-label" for="cardName">Cardholder Name</label>
                <input type="text" id="cardName" class="form-input" value="${deliveryData.fullName || 'Alexander Wright'}" placeholder="Name on card">
              </div>

              <div class="form-group">
                <label class="form-label" for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" class="form-input" value="4532 •••• •••• 8842" placeholder="4532 0000 0000 0000" maxlength="19">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                <div class="form-group">
                  <label class="form-label" for="cardExpiry">Expiry Date</label>
                  <input type="text" id="cardExpiry" class="form-input" value="08/29" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                  <label class="form-label" for="cardCvv">CVV</label>
                  <input type="password" id="cardCvv" class="form-input" value="789" placeholder="•••" maxlength="4">
                </div>
              </div>

              <div style="font-size: 11px; color: var(--color-text-muted); line-height: 1.4;">
                🔒 Simulated 256-Bit SSL Gateway. In accordance with PCI-DSS guidelines, no card details are recorded or persisted in local storage.
              </div>

            </div>
          </div>

          <!-- Tester Simulation Failure Toggle -->
          <label class="sim-fail-toggle-wrap">
            <input type="checkbox" id="simFailToggle" ${simulateFailureMode ? 'checked' : ''} onchange="MaisonCheckout.toggleSimulateFailure(this.checked)">
            <span>[Demo QA Utility]: Simulate Payment Authorization Failure to test error recovery</span>
          </label>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-6); border-top: 1px solid var(--color-border-subtle);">
            <button class="btn btn-secondary btn-md" onclick="MaisonCheckout.goToStep(2)">← Back to Review</button>
            <button class="btn btn-primary btn-lg" onclick="MaisonCheckout.processSimulatedPayment()">
              <span>Pay Securely • ₹${totals.total.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>

        <!-- Right: Summary Sidebar -->
        ${renderSidebarSummary(totals)}

      </div>
    `;
  }

  function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    saveState();
    const upiPanel = document.getElementById('upiPanel');
    const cardPanel = document.getElementById('cardPanel');
    const tabs = document.querySelectorAll('.payment-tab-btn');

    tabs.forEach((tab, index) => {
      if ((method === 'UPI' && index === 0) || (method === 'Card' && index === 1)) {
        tab.classList.add('is-active');
      } else {
        tab.classList.remove('is-active');
      }
    });

    if (method === 'UPI') {
      if (upiPanel) upiPanel.classList.add('is-active');
      if (cardPanel) cardPanel.classList.remove('is-active');
    } else {
      if (cardPanel) cardPanel.classList.add('is-active');
      if (upiPanel) upiPanel.classList.remove('is-active');
    }
  }

  function toggleSimulateFailure(checked) {
    simulateFailureMode = checked;
  }

  function processSimulatedPayment() {
    const overlay = document.getElementById('paymentProcessingOverlay');
    const errorBanner = document.getElementById('paymentErrorBanner');
    const totals = getCalculatedTotals();
    const items = window.MaisonCart ? window.MaisonCart.getItems() : [];

    if (overlay) overlay.classList.add('is-open');

    setTimeout(() => {
      if (overlay) overlay.classList.remove('is-open');

      if (simulateFailureMode) {
        // SIMULATE FAILURE PATH
        if (errorBanner) errorBanner.style.display = 'flex';
        if (window.MaisonCart && window.MaisonCart.showCartToast) {
          window.MaisonCart.showCartToast('Payment Failed: Test authorization declined.');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // SUCCESS PATH: Create Mock Order & Clear Cart
        const user = window.MaisonAuth.getUser();
        const orderResult = window.MaisonOrders.createOrder({
          customer: {
            name: user.name || deliveryData.fullName,
            email: user.email || deliveryData.email
          },
          delivery: deliveryData,
          items: items,
          subtotal: totals.subtotal,
          packaging: totals.packaging,
          shipping: totals.shipping,
          total: totals.total,
          paymentMethod: selectedPaymentMethod === 'UPI' ? 'UPI (Google Pay / QR)' : 'Credit Card (•••• 8842)'
        });

        if (orderResult.success) {
          confirmedOrder = orderResult.order;
          saveState();
          if (window.MaisonCart) {
            window.MaisonCart.clearCart();
          }
          goToStep(4);
        }
      }
    }, 1600);
  }

  /* ===================================================================
     STEP 4: ORDER CONFIRMATION
     =================================================================== */
  function renderStep4(container) {
    if (!confirmedOrder) {
      container.innerHTML = `
        <div class="confirmation-wrap">
          <h2 class="confirmation-title">No Active Order Confirmation</h2>
          <a href="#shop" class="btn btn-primary btn-md">Return to Fragrance Portfolio</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="confirmation-wrap">
        
        <div class="confirmation-icon">✓</div>
        <span class="eyebrow" style="margin-bottom: 6px;">✦ Order Verified</span>
        <h1 class="confirmation-title">Your fragrance journey begins.</h1>
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary); max-width: 540px; margin: 0 auto var(--space-4); line-height: var(--leading-relaxed);">
          Thank you, <strong>${confirmedOrder.customer.name}</strong>. Your artisanal formulation has been placed in small-batch fulfillment.
        </p>

        <div class="confirmation-order-id">Order Reference: ${confirmedOrder.orderId}</div>

        <!-- Order Summary Details Card -->
        <div class="confirmation-details-box">
          <div class="confirmation-meta-grid">
            <div>
              <div class="conf-meta-label">Date & Time</div>
              <div class="conf-meta-val">${confirmedOrder.formattedDate}</div>
            </div>
            <div>
              <div class="conf-meta-label">Payment Method</div>
              <div class="conf-meta-val">${confirmedOrder.payment.method}</div>
            </div>
            <div>
              <div class="conf-meta-label">Fulfillment Status</div>
              <div class="conf-meta-val" style="color: var(--color-status-success);">Confirmed (${confirmedOrder.fulfillmentStatus})</div>
            </div>
          </div>

          <div style="margin-bottom: var(--space-5);">
            <div class="conf-meta-label" style="margin-bottom: var(--space-2);">Delivery Address</div>
            <div style="font-size: var(--text-xs); color: var(--color-text-secondary); line-height: 1.5;">
              <strong>${confirmedOrder.delivery.fullName}</strong> (${confirmedOrder.delivery.phone})<br>
              ${confirmedOrder.delivery.addressLine}${confirmedOrder.delivery.landmark ? ', ' + confirmedOrder.delivery.landmark : ''}<br>
              ${confirmedOrder.delivery.city}, ${confirmedOrder.delivery.state} — ${confirmedOrder.delivery.pincode}
            </div>
          </div>

          <div>
            <div class="conf-meta-label" style="margin-bottom: var(--space-3);">Ordered Items</div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${confirmedOrder.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs);">
                  <span>${item.name} (${item.size}) × ${item.quantity}</span>
                  <strong>₹${item.itemTotal.toLocaleString('en-IN')}</strong>
                </div>
              `).join('')}
              ${confirmedOrder.pricing.packaging > 0 ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs); color: var(--color-accent-gold-deep);">
                  <span>Signature Velvet Gift Presentation</span>
                  <strong>+₹${confirmedOrder.pricing.packaging.toLocaleString('en-IN')}</strong>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-sm); font-weight: 700; padding-top: var(--space-3); border-top: 1px solid var(--color-border-subtle); margin-top: var(--space-2);">
                <span>Total Paid:</span>
                <span style="color: var(--color-accent-gold-deep);">₹${confirmedOrder.pricing.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: var(--space-4); flex-wrap: wrap;">
          <button class="btn btn-primary btn-md" onclick="MaisonCheckout.openOrderHistoryModal()">
            <span>View in Order History</span>
          </button>
          <a href="#shop" class="btn btn-secondary btn-md">Continue Exploring Boutique</a>
        </div>

      </div>
    `;
  }

  /* ===================================================================
     SIDEBAR ORDER SUMMARY COMPONENT
     =================================================================== */
  function renderSidebarSummary(totals) {
    const items = window.MaisonCart ? window.MaisonCart.getItems() : [];

    return `
      <aside class="checkout-sidebar">
        <h3 class="sidebar-title">Order Summary</h3>

        <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4); max-height: 220px; overflow-y: auto;">
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs);">
              <span>${item.name} (${item.size}) × ${item.quantity}</span>
              <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
            </div>
          `).join('')}
        </div>

        <div class="sidebar-summary-row">
          <span>Bag Subtotal</span>
          <span>₹${totals.subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div class="sidebar-summary-row">
          <span>Express Delivery</span>
          <span>${totals.shipping === 0 ? '<strong style="color: var(--color-status-success);">Complimentary</strong>' : '₹' + totals.shipping}</span>
        </div>

        ${includePackaging ? `
          <div class="sidebar-summary-row" style="color: var(--color-accent-gold-deep);">
            <span>Velvet Presentation</span>
            <span>+₹${PACKAGING_PRICE}</span>
          </div>
        ` : ''}

        <div class="sidebar-summary-row">
          <span>2ml Discovery Vials</span>
          <span style="color: var(--color-accent-gold-deep);">Included (x2)</span>
        </div>

        <div class="sidebar-summary-row total">
          <span>Total</span>
          <span style="color: var(--color-accent-gold-deep);">₹${totals.total.toLocaleString('en-IN')}</span>
        </div>
      </aside>
    `;
  }

  /* ===================================================================
     CUSTOMER ORDER HISTORY MODAL
     =================================================================== */
  function openOrderHistoryModal() {
    const user = window.MaisonAuth ? window.MaisonAuth.getUser() : null;
    if (!user || !user.email) {
      if (window.MaisonCart && window.MaisonCart.showCartToast) {
        window.MaisonCart.showCartToast('Please sign in to view your order history.');
      }
      return;
    }

    const orders = window.MaisonOrders ? window.MaisonOrders.getCustomerOrders(user.email) : [];
    let modalBackdrop = document.getElementById('orderHistoryBackdrop');

    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'orderHistoryBackdrop';
      modalBackdrop.className = 'history-modal-backdrop';
      document.body.appendChild(modalBackdrop);
    }

    modalBackdrop.innerHTML = `
      <div class="history-modal" role="dialog" aria-modal="true" aria-label="Customer Order History">
        <div class="history-modal-header">
          <div>
            <span class="eyebrow" style="margin-bottom: 2px;">✦ Customer Account</span>
            <h3 style="font-family: var(--font-serif); font-size: var(--text-xl);">Order History</h3>
          </div>
          <button class="cart-drawer-close-btn" onclick="MaisonCheckout.closeOrderHistoryModal()" aria-label="Close order history">✕</button>
        </div>

        <div class="history-modal-body">
          ${orders.length === 0 ? `
            <div style="text-align: center; padding: var(--space-8) var(--space-4);">
              <div style="font-size: var(--text-2xl); color: var(--color-accent-gold); margin-bottom: var(--space-2);">✦</div>
              <h4 style="font-family: var(--font-serif); font-size: var(--text-lg); margin-bottom: 4px;">No Orders Placed Yet</h4>
              <p style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-4);">Your completed perfume purchases will appear here.</p>
              <a href="#shop" class="btn btn-primary btn-sm" onclick="MaisonCheckout.closeOrderHistoryModal()">Explore Catalog</a>
            </div>
          ` : orders.map(ord => `
            <div class="history-order-card">
              <div class="history-card-header">
                <div>
                  <strong style="font-size: var(--text-xs); letter-spacing: 0.05em;">${ord.orderId}</strong>
                  <div style="font-size: 11px; color: var(--color-text-muted);">${ord.formattedDate}</div>
                </div>
                <span class="history-order-status">Confirmed • ${ord.fulfillmentStatus}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3);">
                ${ord.items.map(it => `
                  <div style="display: flex; justify-content: space-between; font-size: var(--text-xs);">
                    <span>${it.name} (${it.size}) × ${it.quantity}</span>
                    <span>₹${it.itemTotal.toLocaleString('en-IN')}</span>
                  </div>
                `).join('')}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-2); border-top: 1px solid var(--color-border-subtle); font-size: var(--text-xs);">
                <span style="color: var(--color-text-muted);">Payment: ${ord.payment.method}</span>
                <strong>Total: ₹${ord.pricing.total.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) closeOrderHistoryModal();
    };
  }

  function closeOrderHistoryModal() {
    const modalBackdrop = document.getElementById('orderHistoryBackdrop');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  return {
    initCheckout,
    goToStep,
    handleDeliverySubmit,
    togglePackaging,
    selectPaymentMethod,
    toggleSimulateFailure,
    processSimulatedPayment,
    openOrderHistoryModal,
    closeOrderHistoryModal,
    saveState,
    loadState,
    clearState,
    getCurrentStep: () => currentStep
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonCheckout = MaisonCheckout;
}
