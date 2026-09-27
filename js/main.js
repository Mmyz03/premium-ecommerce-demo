/**
 * ===================================================================
 * MAISON AURA — MAIN STOREFRONT INTERACTION & ROUTER ENGINE
 * Single-Brand Luxury Perfume E-Commerce Store
 * ===================================================================
 */

let authModalIntent = null; // 'checkout' | 'general'

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Systems
  if (window.MaisonAuth) {
    window.MaisonAuth.init();
  }
  if (window.MaisonCart) {
    window.MaisonCart.init();
  }

  initStickyHeader();
  initMobileNav();
  initAccountMenu();
  initAuthModal();
  initPolicyModal();
  initSearch();
  initRouter();
  renderFeaturedGrid();


  // Listen for external auth state changes
  window.addEventListener('maison:auth-updated', () => {
    if (window.location.hash === '#checkout') {
      handleRoute();
    } else if (window.location.hash === '#account' || window.location.hash === '#orders') {
      if (window.MaisonAuth && !window.MaisonAuth.isAuthenticated()) {
        window.location.hash = '#home';
      } else if (window.MaisonAccount) {
        window.MaisonAccount.initAccount();
      }
    }
  });

  // Listen for admin auth state changes
  window.addEventListener('maison:admin-auth-updated', () => {
    if (window.location.hash === '#admin') {
      if (window.MaisonAdmin) {
        window.MaisonAdmin.initAdmin();
      }
    }
  });

  // Listen for order updates from admin or checkout
  window.addEventListener('maison:orders-updated', () => {
    if (window.location.hash === '#account' || window.location.hash === '#orders') {
      if (window.MaisonAccount) {
        window.MaisonAccount.renderActiveTabContent();
      }
    }
  });

  // Listen for product changes to dynamically refresh storefront
  window.addEventListener('maison:products-updated', () => {
    renderFeaturedGrid();
    if (window.location.hash === '#shop' || window.location.hash === '#catalog') {
      renderCatalog();
    } else if (window.location.hash.startsWith('#product/')) {
      const productId = window.location.hash.replace('#product/', '').trim();
      renderPDP(productId);
    }
  });
});

/* ===================================================================
   1. CLIENT-SIDE ROUTER & VIEW SWITCHING
   =================================================================== */
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  
  // Handle direct /admin path if accessed directly
  if (window.location.pathname.endsWith('/admin') || window.location.pathname.endsWith('/admin/')) {
    window.location.hash = '#admin';
  }

  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const homeView = document.getElementById('homeView');
  const catalogView = document.getElementById('catalogView');
  const pdpView = document.getElementById('pdpView');
  const checkoutView = document.getElementById('checkoutView');
  const adminView = document.getElementById('adminView');
  const accountView = document.getElementById('accountView');
  const siteHeader = document.getElementById('siteHeader');
  const announcementBar = document.getElementById('announcementBar');
  const siteFooter = document.getElementById('contact');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  // Close mobile drawer on route transition if open
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
    mobileDrawer.classList.remove('is-open');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  const hideAllViews = () => {
    if (homeView) homeView.style.display = 'none';
    if (catalogView) catalogView.style.display = 'none';
    if (pdpView) pdpView.style.display = 'none';
    if (checkoutView) checkoutView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    if (accountView) accountView.style.display = 'none';

    // Reset storefront chrome visibility
    if (siteHeader) siteHeader.style.display = '';
    if (announcementBar) announcementBar.style.display = '';
    if (siteFooter) siteFooter.style.display = '';
  };

  // Helper to switch active nav link
  const setActiveNav = (navKey) => {
    navLinks.forEach(link => {
      if (link.getAttribute('data-nav') === navKey) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  };

  if (hash === '#admin') {
    // 0. ADMIN OPERATIONS PORTAL
    hideAllViews();
    if (siteHeader) siteHeader.style.display = 'none';
    if (announcementBar) announcementBar.style.display = 'none';
    if (siteFooter) siteFooter.style.display = 'none';

    if (adminView) {
      adminView.style.display = 'block';
      if (window.MaisonAdmin) {
        window.MaisonAdmin.initAdmin();
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } else if (hash === '#account' || hash === '#orders') {
    // 1. CUSTOMER ACCOUNT & ORDER HISTORY (FORCED AUTH CHECK)
    if (!window.MaisonAuth || !window.MaisonAuth.isAuthenticated()) {
      openAuthModal(hash === '#orders' ? 'orders' : 'account');
      hideAllViews();
      if (homeView) homeView.style.display = 'block';
      setActiveNav('home');
      return;
    }

    hideAllViews();
    if (accountView) {
      accountView.style.display = 'block';
      if (window.MaisonAccount) {
        window.MaisonAccount.initAccount(hash === '#orders' ? 'orders' : null);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNav('home');

  } else if (hash.startsWith('#product/')) {
    // 2. PRODUCT DETAIL PAGE (PDP)
    const productId = hash.replace('#product/', '').trim();
    hideAllViews();
    if (pdpView) pdpView.style.display = 'block';

    renderPDP(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNav('shop');

  } else if (hash === '#shop' || hash === '#catalog') {
    // 3. SHOP / CATALOG VIEW
    hideAllViews();
    if (catalogView) catalogView.style.display = 'block';

    renderCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNav('shop');

  } else if (hash === '#checkout') {
    // 4. CHECKOUT VIEW (FORCED AUTH CHECK)
    if (!window.MaisonAuth || !window.MaisonAuth.isAuthenticated()) {
      openAuthModal('checkout');
      hideAllViews();
      if (homeView) homeView.style.display = 'block';
      setActiveNav('home');
      return;
    }

    hideAllViews();
    if (checkoutView) checkoutView.style.display = 'block';
    if (window.MaisonCheckout) {
      window.MaisonCheckout.initCheckout();
    }
    setActiveNav('home');

  } else {
    // 5. HOMEPAGE VIEW (Default)
    hideAllViews();
    if (homeView) homeView.style.display = 'block';

    if (hash === '#collections') {
      setActiveNav('collections');
      const target = document.getElementById('collections');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '#olfactory-pyramid') {
      setActiveNav('guide');
      const target = document.getElementById('olfactory-pyramid');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '#our-story') {
      setActiveNav('story');
      const target = document.getElementById('our-story');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else if (hash === '#contact') {
      setActiveNav('contact');
      const target = document.getElementById('contact');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveNav('home');
      if (hash === '#home' || hash === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}

function renderCheckoutPreview() {
  const user = window.MaisonAuth ? window.MaisonAuth.getUser() : { name: 'Customer', email: '' };
  const nameEl = document.getElementById('checkoutCustomerName');
  const emailEl = document.getElementById('checkoutCustomerEmail');
  const itemsContainer = document.getElementById('checkoutItemsPreview');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;

  if (itemsContainer && window.MaisonCart) {
    const items = window.MaisonCart.getItems();
    const subtotal = window.MaisonCart.getSubtotal();

    if (items.length === 0) {
      itemsContainer.innerHTML = `<p style="font-size: var(--text-xs); color: var(--color-text-secondary);">Your shopping bag is currently empty.</p>`;
      return;
    }

    itemsContainer.innerHTML = `
      <div class="checkout-items-preview-title">Reserved Fragrance Items (${window.MaisonCart.getTotalCount()} items)</div>
      ${items.map(item => `
        <div class="checkout-items-row">
          <span>${item.name} (${item.size}) × ${item.quantity}</span>
          <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
        </div>
      `).join('')}
      <div class="checkout-items-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); font-size: var(--text-sm);">
        <span>Total Order Value:</span>
        <strong style="color: var(--color-accent-gold-deep);">₹${subtotal.toLocaleString('en-IN')}</strong>
      </div>
    `;
  }
}

/* ===================================================================
   2. CUSTOMER AUTHENTICATION MODAL & ACCOUNT MENU
   =================================================================== */
function initAccountMenu() {
  const accountTrigger = document.getElementById('accountTrigger');
  const accountDropdown = document.getElementById('accountDropdown');
  const signOutBtn = document.getElementById('signOutBtn');
  const profileLink = document.getElementById('accountMenuProfileLink');
  const ordersLink = document.getElementById('accountMenuOrdersLink');

  if (!accountTrigger || !accountDropdown) return;

  accountTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.MaisonAuth && window.MaisonAuth.isAuthenticated()) {
      accountDropdown.classList.toggle('is-open');
    } else {
      openAuthModal('account');
    }
  });

  document.addEventListener('click', (e) => {
    if (!accountDropdown.contains(e.target) && e.target !== accountTrigger) {
      accountDropdown.classList.remove('is-open');
    }
  });

  if (profileLink) {
    profileLink.addEventListener('click', (e) => {
      accountDropdown.classList.remove('is-open');
      window.location.hash = '#account';
    });
  }

  if (ordersLink) {
    ordersLink.addEventListener('click', (e) => {
      accountDropdown.classList.remove('is-open');
      window.location.hash = '#orders';
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      accountDropdown.classList.remove('is-open');
      if (window.MaisonAuth) {
        window.MaisonAuth.logout();
      }
      if (window.location.hash === '#checkout' || window.location.hash === '#account' || window.location.hash === '#orders') {
        window.location.hash = '#home';
      }
    });
  }
}

function initAuthModal() {
  const backdrop = document.getElementById('authModalBackdrop');
  const closeBtn = document.getElementById('authModalCloseBtn');
  const googleBtn = document.getElementById('googleAuthBtn');

  // Form Switch Links
  const switchToRegister = document.getElementById('switchToRegisterLink');
  const switchToLogin = document.getElementById('switchToLoginLink');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotBackToLogin = document.getElementById('forgotBackToLoginLink');

  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAuthModal();
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      if (window.MaisonAuth) {
        window.MaisonAuth.loginWithGoogle();
        handleAuthSuccess();
      }
    });
  }

  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => showAuthForm('register'));
  }
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => showAuthForm('login'));
  }
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', () => showAuthForm('forgot'));
  }
  if (forgotBackToLogin) {
    forgotBackToLogin.addEventListener('click', () => showAuthForm('login'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) {
      closeAuthModal();
    }
  });
}

function openAuthModal(intent = 'general') {
  authModalIntent = intent;
  const backdrop = document.getElementById('authModalBackdrop');
  const gateNotice = document.getElementById('authGateNotice');

  if (!backdrop) return;

  if (intent === 'checkout') {
    if (gateNotice) gateNotice.style.display = 'flex';
  } else {
    if (gateNotice) gateNotice.style.display = 'none';
  }

  showAuthForm('login');
  backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const backdrop = document.getElementById('authModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
}

function showAuthForm(state) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');
  const title = document.getElementById('authModalTitle');
  const subtitle = document.getElementById('authModalSubtitle');

  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (forgotForm) forgotForm.style.display = 'none';

  if (state === 'register') {
    if (registerForm) registerForm.style.display = 'block';
    if (title) title.textContent = 'Create Your Account';
    if (subtitle) subtitle.textContent = 'Register to reserve limited fragrance harvests, track orders, and experience private salon privileges.';
  } else if (state === 'forgot') {
    if (forgotForm) forgotForm.style.display = 'block';
    if (title) title.textContent = 'Recover Password';
    if (subtitle) subtitle.textContent = 'Enter your email to receive recovery instructions.';
  } else {
    // login
    if (loginForm) loginForm.style.display = 'block';
    if (title) title.textContent = 'Sign in to Continue';
    if (subtitle) subtitle.textContent = 'An account is required to place your order, ensure artisanal batch reservation, and track secure dispatch.';
  }
}

function handleLoginSubmit() {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passError = document.getElementById('loginPasswordError');

  let valid = true;
  if (!emailInput.value || !emailInput.value.includes('@')) {
    emailError.classList.add('is-visible');
    valid = false;
  } else {
    emailError.classList.remove('is-visible');
  }

  if (!passInput.value || passInput.value.length < 4) {
    passError.classList.add('is-visible');
    valid = false;
  } else {
    passError.classList.remove('is-visible');
  }

  if (!valid) return;

  if (window.MaisonAuth) {
    const res = window.MaisonAuth.login(emailInput.value, passInput.value);
    if (res.success) {
      handleAuthSuccess();
    }
  }
}

function handleRegisterSubmit() {
  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const passInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirmPassword');

  const nameError = document.getElementById('regNameError');
  const emailError = document.getElementById('regEmailError');
  const passError = document.getElementById('regPasswordError');
  const confirmError = document.getElementById('regConfirmError');

  let valid = true;

  if (!nameInput.value || nameInput.value.trim().length < 2) {
    nameError.classList.add('is-visible');
    valid = false;
  } else {
    nameError.classList.remove('is-visible');
  }

  if (!emailInput.value || !emailInput.value.includes('@')) {
    emailError.classList.add('is-visible');
    valid = false;
  } else {
    emailError.classList.remove('is-visible');
  }

  if (!passInput.value || passInput.value.length < 6) {
    passError.classList.add('is-visible');
    valid = false;
  } else {
    passError.classList.remove('is-visible');
  }

  if (passInput.value !== confirmInput.value) {
    confirmError.classList.add('is-visible');
    valid = false;
  } else {
    confirmError.classList.remove('is-visible');
  }

  if (!valid) return;

  if (window.MaisonAuth) {
    const res = window.MaisonAuth.register(nameInput.value, emailInput.value, passInput.value, confirmInput.value);
    if (res.success) {
      handleAuthSuccess();
    }
  }
}

function handleForgotSubmit() {
  const emailInput = document.getElementById('forgotEmail');
  if (emailInput && emailInput.value) {
    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`Demo: Recovery link simulated for ${emailInput.value}`);
    }
    showAuthForm('login');
  }
}

function handleAuthSuccess() {
  closeAuthModal();
  if (authModalIntent === 'checkout') {
    authModalIntent = null;
    if (window.location.hash === '#checkout') {
      handleRoute();
    } else {
      window.location.hash = '#checkout';
    }
  } else if (authModalIntent === 'account' || authModalIntent === 'orders') {
    const intent = authModalIntent;
    authModalIntent = null;
    const targetHash = intent === 'orders' ? '#orders' : '#account';
    if (window.location.hash === targetHash) {
      handleRoute();
    } else {
      window.location.hash = targetHash;
    }
  }
}

// Global expose for inline handlers
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleLoginSubmit = handleLoginSubmit;
window.handleRegisterSubmit = handleRegisterSubmit;
window.handleForgotSubmit = handleForgotSubmit;

/* ===================================================================
   3. HOMEPAGE FEATURED EDITIONS RENDERER
   =================================================================== */
function renderFeaturedGrid() {
  const container = document.getElementById('featuredProductGrid');
  if (!container) return;

  const products = (window.MAISON_PRODUCTS || []).filter(p => p.featured);
  
  container.innerHTML = products.map(product => {
    const defaultSize = product.sizes[0];
    const largeSize = product.sizes[1] || defaultSize;
    const isOutOfStock = product.stockStatus === 'out_of_stock';
    const badgeText = isOutOfStock ? 'Sold Out' : (product.tag || 'Extrait');

    const quickActionBtn = isOutOfStock
      ? `<button class="quick-add-btn" onclick="MaisonCart.showCartToast('${product.name} is currently out of stock. View edition to join the waitlist.')">Out of Stock</button>`
      : `<button class="quick-add-btn" onclick="MaisonCart.addItem('${product.id}', '${defaultSize.size}', 1)">Quick Add to Bag</button>`;

    return `
      <article class="product-card ${isOutOfStock ? 'is-out-of-stock' : ''}" data-id="${product.id}">
        <div class="product-image-box">
          <span class="product-badge ${isOutOfStock ? 'is-out-of-stock' : ''}">${badgeText}</span>
          <a href="#product/${product.id}">
            <img src="${product.primaryImage}" alt="${product.name} luxury perfume bottle" width="400" height="400" loading="lazy">
          </a>
          <div class="product-quick-action">
            ${quickActionBtn}
          </div>
        </div>
        <div class="product-meta">
          <span class="product-family">${product.family}</span>
          <h3 class="product-name">
            <a href="#product/${product.id}">${product.name}</a>
          </h3>
          <p class="product-notes">${product.fragranceNotes.top.join(', ')} • ${product.fragranceNotes.heart[0]} • ${product.fragranceNotes.base[0]}</p>
          <div class="product-footer">
            <span class="product-price">₹${defaultSize.price.toLocaleString('en-IN')}</span>
            <div class="product-sizes">
              <a href="#product/${product.id}" class="size-pill is-active">${defaultSize.size}</a>
              <a href="#product/${product.id}" class="size-pill">${largeSize.size}</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ===================================================================
   4. CATALOG / SHOP VIEW RENDERER & FILTERS
   =================================================================== */
const CATALOG_STORAGE_KEY = 'maison_aura_catalog_state_v1';
let currentCatalogFilter = 'all';
let currentCatalogSort = 'featured';

function saveCatalogState() {
  try {
    sessionStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({
      filter: currentCatalogFilter,
      sort: currentCatalogSort
    }));
  } catch (e) {
    console.warn('Could not save catalog state', e);
  }
}

function loadCatalogState() {
  try {
    const raw = sessionStorage.getItem(CATALOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.filter) currentCatalogFilter = parsed.filter;
      if (parsed.sort) currentCatalogSort = parsed.sort;
    }
  } catch (e) {
    console.warn('Could not load catalog state', e);
  }
}

function renderCatalog() {
  loadCatalogState();
  const grid = document.getElementById('catalogProductGrid');
  const countAll = document.getElementById('countAll');
  if (!grid) return;

  const allProducts = window.MAISON_PRODUCTS || [];
  if (countAll) countAll.textContent = allProducts.length;

  // Filter
  let filtered = allProducts.filter(p => {
    if (currentCatalogFilter === 'all') return true;
    return p.category === currentCatalogFilter;
  });

  // Sort
  if (currentCatalogSort === 'price-asc') {
    filtered.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
  } else if (currentCatalogSort === 'price-desc') {
    filtered.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
  } else if (currentCatalogSort === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Featured first
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  // Handle empty state
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <div class="catalog-empty-icon">✦</div>
        <h3 class="catalog-empty-title">No Editions Found</h3>
        <p class="catalog-empty-desc">We could not find fragrances matching this category filter.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetCatalogFilter()">View All Editions</button>
      </div>
    `;
    initCatalogToolbarEvents();
    return;
  }

  // Render cards
  grid.innerHTML = filtered.map(product => {
    const defaultSize = product.sizes[0];
    const isOutOfStock = product.stockStatus === 'out_of_stock';

    const tagMarkup = isOutOfStock
      ? `<span class="catalog-card-tag is-out-of-stock">Sold Out</span>`
      : `<span class="catalog-card-tag">${product.tag || 'Extrait'}</span>`;

    const addBtnMarkup = isOutOfStock
      ? `<button class="catalog-quick-add is-out-of-stock" onclick="MaisonCart.showCartToast('${product.name} is currently out of stock. View edition to join the waitlist.')" title="Out of Stock">Sold Out</button>`
      : `<button class="catalog-quick-add" onclick="MaisonCart.addItem('${product.id}', '${defaultSize.size}', 1)" title="Quick Add">+ Add</button>`;

    return `
      <article class="catalog-card ${isOutOfStock ? 'is-out-of-stock' : ''}">
        <a href="#product/${product.id}" class="catalog-image-link" aria-label="View ${product.name}">
          ${tagMarkup}
          <img src="${product.primaryImage}" alt="${product.name} luxury perfume bottle" width="400" height="400" loading="lazy">
        </a>
        <div class="catalog-card-body">
          <span class="catalog-card-family">${product.family}</span>
          <h2 class="catalog-card-title">
            <a href="#product/${product.id}">${product.name}</a>
          </h2>
          <p class="catalog-card-desc">${product.shortDescription}</p>
          <div class="catalog-card-footer">
            <span class="catalog-card-price">₹${defaultSize.price.toLocaleString('en-IN')}</span>
            <div class="catalog-card-actions">
              <a href="#product/${product.id}" class="catalog-view-btn">Details</a>
              ${addBtnMarkup}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  initCatalogToolbarEvents();
}

function initCatalogToolbarEvents() {
  const filterButtons = document.querySelectorAll('#catalogCategoryFilters .catalog-filter-btn');
  const sortSelect = document.getElementById('catalogSortSelect');

  // Synchronize button active states
  filterButtons.forEach(btn => {
    if (btn.getAttribute('data-category') === currentCatalogFilter) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }

    btn.onclick = () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentCatalogFilter = btn.getAttribute('data-category');
      saveCatalogState();
      renderCatalog();
    };
  });

  if (sortSelect) {
    sortSelect.value = currentCatalogSort;
    sortSelect.onchange = (e) => {
      currentCatalogSort = e.target.value;
      saveCatalogState();
      renderCatalog();
    };
  }
}

function resetCatalogFilter() {
  currentCatalogFilter = 'all';
  saveCatalogState();
  const filterButtons = document.querySelectorAll('#catalogCategoryFilters .catalog-filter-btn');
  filterButtons.forEach(b => {
    if (b.getAttribute('data-category') === 'all') b.classList.add('is-active');
    else b.classList.remove('is-active');
  });
  renderCatalog();
}

/* ===================================================================
   5. PRODUCT DETAIL PAGE (PDP) RENDERER
   =================================================================== */
function renderPDP(productId) {
  const container = document.getElementById('pdpContainer');
  if (!container) return;

  const product = (window.MAISON_PRODUCTS || []).find(p => p.id === productId);

  if (!product) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 4rem 1rem;">
        <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 1rem;">Fragrance Edition Not Found</h2>
        <p style="margin-bottom: 2rem; color: var(--color-text-secondary);">The requested fragrance edition could not be located in our catalog.</p>
        <a href="#shop" class="btn btn-primary btn-md">Return to Fragrance Portfolio</a>
      </div>
    `;
    return;
  }

  let activeSize = product.sizes[0].size;
  let activePrice = product.sizes[0].price;
  let quantity = 1;

  container.innerHTML = `
    <div class="container">
      
      <!-- Breadcrumbs -->
      <nav class="pdp-breadcrumbs" aria-label="Breadcrumb">
        <a href="#home">Home</a>
        <span class="breadcrumbs-sep">/</span>
        <a href="#shop">Shop Editions</a>
        <span class="breadcrumbs-sep">/</span>
        <span>${product.name}</span>
      </nav>

      <div class="pdp-grid">
        
        <!-- Gallery Column -->
        <div class="pdp-gallery">
          <div class="pdp-main-image-frame" id="pdpMainImageFrame">
            <span class="pdp-gallery-badge">${product.tag || 'Extrait de Parfum'}</span>
            <img id="pdpMainImage" src="${product.primaryImage}" alt="${product.name} luxury flacon presentation" width="600" height="600">
          </div>

          <!-- Thumbnails -->
          <div class="pdp-thumbnails">
            ${product.galleryImages.map((imgSrc, index) => `
              <button class="pdp-thumb-btn ${index === 0 ? 'is-active' : ''}" data-img="${imgSrc}" aria-label="View flacon photo ${index + 1}">
                <img src="${imgSrc}" alt="${product.name} preview" width="70" height="70">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Details Column -->
        <div class="pdp-content">
          
          <div class="pdp-header-meta">
            <span class="pdp-family-label">${product.family}</span>
            <div class="pdp-stock-status ${product.stockStatus === 'out_of_stock' ? 'is-out-of-stock' : ''}">
              <span class="stock-dot ${product.stockStatus === 'out_of_stock' ? 'stock-dot-out' : ''}"></span>
              <span>${product.stockText || (product.stockStatus === 'out_of_stock' ? 'Out of Stock — Register for Next Harvest' : 'In Stock — Small Batch Reserve')}</span>
            </div>
          </div>

          <h1 class="pdp-product-title">${product.name}</h1>
          <div class="pdp-concentration-label">${product.concentration} • ${product.longevity}</div>

          <div class="pdp-price-row">
            <span class="pdp-current-price" id="pdpPriceDisplay">₹${activePrice.toLocaleString('en-IN')}</span>
            <span class="pdp-tax-note">Inclusive of all taxes • Free express shipping</span>
          </div>

          <p class="pdp-story-desc">${product.fullDescription}</p>

          <!-- Bottle Size Selector -->
          <div class="pdp-option-group">
            <div class="pdp-option-header">
              <span class="pdp-option-title">Select Bottle Volume</span>
              <span style="font-size: var(--text-2xs); color: var(--color-accent-gold-deep); font-weight: 500;">Includes 2ml discovery vials</span>
            </div>
            <div class="pdp-size-selector">
              ${product.sizes.map((s, index) => `
                <button class="pdp-size-btn ${index === 0 ? 'is-active' : ''}" data-size="${s.size}" data-price="${s.price}">
                  <span class="pdp-size-name">${s.label}</span>
                  <span class="pdp-size-cost">₹${s.price.toLocaleString('en-IN')}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Quantity Stepper & Add to Bag CTA -->
          <div class="pdp-purchase-row">
            <div class="pdp-stepper">
              <button class="stepper-btn" id="stepperMinus" aria-label="Decrease quantity">−</button>
              <span class="stepper-value" id="stepperValue">1</span>
              <button class="stepper-btn" id="stepperPlus" aria-label="Increase quantity">+</button>
            </div>

            <button class="pdp-add-to-bag-btn" id="pdpAddBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span id="pdpBtnText">Add to Bag • ₹${activePrice.toLocaleString('en-IN')}</span>
            </button>
          </div>

          <!-- Olfactory Pyramid Block -->
          <div class="pdp-pyramid-block">
            <h3 class="pdp-pyramid-heading">Olfactory Notes Architecture</h3>
            <div class="pdp-pyramid-tiers">
              <div class="pdp-tier-box">
                <div class="pdp-tier-name">Top Notes (0–15m)</div>
                <div class="pdp-tier-notes">${product.fragranceNotes.top.join('<br>')}</div>
              </div>
              <div class="pdp-tier-box">
                <div class="pdp-tier-name">Heart Notes (15m–4h)</div>
                <div class="pdp-tier-notes">${product.fragranceNotes.heart.join('<br>')}</div>
              </div>
              <div class="pdp-tier-box">
                <div class="pdp-tier-name">Base Notes (4h–16h)</div>
                <div class="pdp-tier-notes">${product.fragranceNotes.base.join('<br>')}</div>
              </div>
            </div>
          </div>

          <!-- Luxury Accordions -->
          <div class="pdp-accordion-wrap">
            
            <div class="accordion-item is-open">
              <button class="accordion-header" aria-expanded="true">
                <span>Fragrance Character & Sillage</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <div class="accordion-content">
                  <p><strong>Concentration:</strong> ${product.concentration}</p>
                  <p><strong>Longevity:</strong> ${product.longevity}</p>
                  <p><strong>Sillage:</strong> ${product.sillage}</p>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header" aria-expanded="false">
                <span>How to Apply & Ritual</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <div class="accordion-content">
                  <p>${product.details.howToWear}</p>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header" aria-expanded="false">
                <span>Clean Ingredients & Safety</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <div class="accordion-content">
                  <p>${product.details.ingredients}</p>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <button class="accordion-header" aria-expanded="false">
                <span>Complimentary Shipping & Sample Testing</span>
                <span class="accordion-icon">+</span>
              </button>
              <div class="accordion-body">
                <div class="accordion-content">
                  <p>${product.details.shippingReturns}</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Reassurance Grid -->
          <div class="pdp-reassurance-strip">
            <div class="reassurance-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <div>
                <div class="reassurance-title">Express Pan-India</div>
                <div class="reassurance-desc">Delivered in 48–72 hours</div>
              </div>
            </div>

            <div class="reassurance-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <div>
                <div class="reassurance-title">Risk-Free Testing</div>
                <div class="reassurance-desc">2 free samples included</div>
              </div>
            </div>

            <div class="reassurance-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <div class="reassurance-title">Artisanal Extrait</div>
                <div class="reassurance-desc">100% genuine formulation</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach PDP Interactions
  attachPDPInteractions(product, (size, price, qty) => {
    activeSize = size;
    activePrice = price;
    quantity = qty;
  });
}

function attachPDPInteractions(product, onStateChange) {
  let currentSize = product.sizes[0].size;
  let currentPrice = product.sizes[0].price;
  let currentQty = 1;

  // 1. Gallery Thumbnail Switcher
  const thumbBtns = document.querySelectorAll('.pdp-thumb-btn');
  const mainImg = document.getElementById('pdpMainImage');

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const newSrc = btn.getAttribute('data-img');
      if (mainImg && newSrc) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.src = newSrc;
          mainImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  // 2. Size Selector
  const sizeBtns = document.querySelectorAll('.pdp-size-btn');
  const priceDisplay = document.getElementById('pdpPriceDisplay');
  const btnText = document.getElementById('pdpBtnText');

  const updatePriceUI = () => {
    const totalForQty = currentPrice * currentQty;
    if (priceDisplay) priceDisplay.textContent = `₹${currentPrice.toLocaleString('en-IN')}`;
    if (btnText) btnText.textContent = `Add to Bag • ₹${totalForQty.toLocaleString('en-IN')}`;
    onStateChange(currentSize, currentPrice, currentQty);
  };

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentSize = btn.getAttribute('data-size');
      currentPrice = parseInt(btn.getAttribute('data-price'), 10);
      updatePriceUI();
    });
  });

  // 3. Quantity Stepper
  const minusBtn = document.getElementById('stepperMinus');
  const plusBtn = document.getElementById('stepperPlus');
  const stepperVal = document.getElementById('stepperValue');

  if (minusBtn && plusBtn && stepperVal) {
    minusBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty -= 1;
        stepperVal.textContent = currentQty;
        updatePriceUI();
      }
    });

    plusBtn.addEventListener('click', () => {
      if (currentQty < 10) {
        currentQty += 1;
        stepperVal.textContent = currentQty;
        updatePriceUI();
      }
    });
  }

  // 4. Add to Bag Button
  const addBtn = document.getElementById('pdpAddBtn');
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  if (isOutOfStock && btnText) {
    btnText.textContent = 'Out of Stock — Join Reserve Waitlist';
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (isOutOfStock) {
        if (window.MaisonCart && window.MaisonCart.showCartToast) {
          window.MaisonCart.showCartToast(`✓ You have been added to the small-batch waitlist for ${product.name}.`);
        }
        btnText.textContent = '✓ Added to Reserve Waitlist';
        addBtn.style.backgroundColor = 'var(--color-accent-gold)';
        addBtn.style.borderColor = 'var(--color-accent-gold)';
        setTimeout(() => {
          btnText.textContent = 'Out of Stock — Join Reserve Waitlist';
          addBtn.style.backgroundColor = '';
          addBtn.style.borderColor = '';
        }, 2000);
        return;
      }

      if (window.MaisonCart) {
        window.MaisonCart.addItem(product.id, currentSize, currentQty);
        
        btnText.textContent = '✓ Added to Bag';
        addBtn.style.backgroundColor = 'var(--color-accent-gold)';
        addBtn.style.borderColor = 'var(--color-accent-gold)';

        setTimeout(() => {
          updatePriceUI();
          addBtn.style.backgroundColor = '';
          addBtn.style.borderColor = '';
        }, 1600);
      }
    });
  }

  // 5. Accordions
  const accordionItems = document.querySelectorAll('.pdp-accordion-wrap .accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        header.setAttribute('aria-expanded', String(!isOpen));
      });
    }
  });
}

/* ===================================================================
   6. HEADER & MOBILE NAVIGATION
   =================================================================== */
function initStickyHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link');

  if (!toggleBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawer.focus();
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

/* ===================================================================
   7. SEARCH TRIGGER HANDLER
   =================================================================== */
function initSearch() {
  const searchTrigger = document.getElementById('searchTrigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      window.location.hash = '#shop';
      if (window.MaisonCart && window.MaisonCart.showCartToast) {
        window.MaisonCart.showCartToast('Displaying all artisanal fragrance editions.');
      }
    });
  }
}

/* ===================================================================
   8. LUXURY POLICY & INFORMATIONAL MODAL SYSTEM
   =================================================================== */
const MAISON_POLICIES = {
  shipping: {
    eyebrow: 'White-Glove Logistics',
    title: 'Shipping & White-Glove Transit Policy',
    content: `
      <p>Maison Aura ensures temperature-regulated, fully insured delivery for all precious artisanal Extrait de Parfum flacons across India.</p>
      <h4>Pan-India Transit Timelines</h4>
      <p>All orders are dispatched within 24 hours of batch reservation. Express transit takes <strong>48 to 72 business hours</strong> across all metro regions (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata) and 3 to 5 business days for regional destinations via our secured courier partner, Bluedart Express.</p>
      <h4>Complimentary Pan-India Delivery</h4>
      <p>We provide complimentary insured express shipping on all orders nationwide with zero hidden surcharges.</p>
      <h4>Custom Shock-Absorbing Packaging</h4>
      <p>Flacons are sealed within custom shock-absorbent presentation boxes with tamper-evident holograms to preserve olfactory maceration notes during transit.</p>
    `
  },
  refund: {
    eyebrow: 'Artisanal Guarantee',
    title: 'Refund, Returns & Discovery Guarantee',
    content: `
      <p>We want you to discover your bespoke signature fragrance with complete serenity.</p>
      <h4>Complimentary 2ml Discovery Vials</h4>
      <p>Every 50ml or 100ml flacon order includes <strong>two complimentary 2ml discovery vials</strong> of the ordered fragrance. We invite you to test the fragrance on your pulse points before breaking the presentation seal on the main bottle.</p>
      <h4>14-Day Full Return Window</h4>
      <p>If the fragrance does not harmonize with your chemistry, return the <strong>unopened, sealed main flacon</strong> within 14 days of delivery for a 100% full refund or exchange. The 2ml discovery samples are complimentary for you to keep.</p>
      <h4>Concierge Return Pickup</h4>
      <p>Contact our concierge at <a href="mailto:concierge@maisonaura.com">concierge@maisonaura.com</a> to arrange a white-glove doorstep courier collection.</p>
    `
  },
  privacy: {
    eyebrow: 'Patron Privacy & Governance',
    title: 'Patron Privacy & Data Safeguard Policy',
    content: `
      <p>Maison Aura values the trust and discretion of our patrons. We strictly uphold global data security standards.</p>
      <h4>Information We Collect</h4>
      <p>We collect solely the details required for flacon allocation and delivery: customer name, shipping destination, phone number, and email for dispatch tracking.</p>
      <h4>Zero Commercial Monetization</h4>
      <p>We never sell, rent, or distribute personal patron information or preferences to third-party data brokers or marketing affiliates.</p>
      <h4>Demo & Production Security</h4>
      <p>In this client prototype, data remains strictly isolated in local sandbox storage. In live production, all payment processing complies with PCI-DSS Level 1 encryption standards.</p>
    `
  },
  terms: {
    eyebrow: 'Atelier Agreement',
    title: 'Terms of Service & Atelier Rules',
    content: `
      <p>By exploring and purchasing with Maison Aura Haute Parfumerie, you agree to our brand terms.</p>
      <h4>Artisanal Batches & Maceration</h4>
      <p>Our Extrait de Parfum creations are formulated in limited maceration batches. In the event of small-batch depletion, orders are placed in priority allocation for the subsequent harvest.</p>
      <h4>Intellectual Property</h4>
      <p>All fragrance names, olfactory architecture descriptions, formulations, visual compositions, and brand marks are the proprietary property of Maison Aura Parfums.</p>
      <h4>Demonstration Notice</h4>
      <p>This interactive digital storefront serves as a functional client demonstration prototype for evaluation prior to production gateway and backend provisioning.</p>
    `
  }
};

function initPolicyModal() {
  const backdrop = document.getElementById('policyModalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePolicyModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) {
      closePolicyModal();
    }
  });
}

function openPolicyModal(type = 'shipping') {
  const policy = MAISON_POLICIES[type] || MAISON_POLICIES.shipping;
  const backdrop = document.getElementById('policyModalBackdrop');
  const eyebrow = document.getElementById('policyModalEyebrow');
  const title = document.getElementById('policyModalTitle');
  const body = document.getElementById('policyModalBody');

  if (!backdrop) return;

  if (eyebrow) eyebrow.textContent = `✦ ${policy.eyebrow}`;
  if (title) title.textContent = policy.title;
  if (body) body.innerHTML = policy.content;

  backdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closePolicyModal() {
  const backdrop = document.getElementById('policyModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Global window exposure
window.openPolicyModal = openPolicyModal;
window.closePolicyModal = closePolicyModal;

