/**
 * ===================================================================
 * MAISON AURA — CENTRALIZED SHOPPING BAG MOCK STATE & DRAWER
 * Single-Brand Luxury Perfume E-Commerce Store
 * ===================================================================
 */

const MaisonCart = (() => {
  const STORAGE_KEY = 'maison_aura_cart_v1';
  const FREE_SHIPPING_THRESHOLD = 2500;
  let memoryCart = [];

  function loadCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory cart', e);
    }
    return memoryCart;
  }

  function saveCart(cart) {
    memoryCart = cart;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    updateCartUI();
    renderDrawer();
    window.dispatchEvent(new CustomEvent('maison:cart-updated', { detail: { cart } }));
  }

  function getItems() {
    return loadCart();
  }

  function addItem(productId, size = '50ml', quantity = 1, openDrawerAfter = true) {
    const product = (window.MAISON_PRODUCTS || []).find(p => p.id === productId);
    if (!product) {
      console.error(`Product not found: ${productId}`);
      return false;
    }

    const sizeObj = product.sizes.find(s => s.size === size) || product.sizes[0];
    const unitPrice = sizeObj ? sizeObj.price : product.sizes[0].price;

    const cart = loadCart();
    const existingIndex = cart.findIndex(item => item.productId === productId && item.size === size);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        subtitle: product.subtitle,
        family: product.family,
        size: size,
        price: unitPrice,
        quantity: quantity,
        image: product.primaryImage
      });
    }

    saveCart(cart);
    showCartToast(`Added to Bag: ${product.name} (${size}) × ${quantity}`);

    if (openDrawerAfter) {
      setTimeout(() => {
        openDrawer();
      }, 350);
    }

    return true;
  }

  function updateQuantity(productId, size, delta) {
    const cart = loadCart();
    const index = cart.findIndex(item => item.productId === productId && item.size === size);
    if (index > -1) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      saveCart(cart);
    }
  }

  function removeItem(productId, size) {
    const cart = loadCart().filter(item => !(item.productId === productId && item.size === size));
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getTotalCount() {
    const cart = loadCart();
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  function getSubtotal() {
    const cart = loadCart();
    return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  }

  function updateCartUI() {
    const totalCount = getTotalCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = totalCount;
      badge.setAttribute('aria-label', `Shopping Bag with ${totalCount} items`);
      badge.style.transform = 'scale(1.25)';
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, 200);
    });

    const drawerCount = document.getElementById('cartDrawerCount');
    if (drawerCount) {
      drawerCount.textContent = `(${totalCount} ${totalCount === 1 ? 'item' : 'items'})`;
    }
  }

  function renderDrawer() {
    const container = document.getElementById('cartDrawerItems');
    const footer = document.getElementById('cartDrawerFooter');
    const incentiveText = document.getElementById('shippingIncentiveText');
    const progressBar = document.getElementById('shippingProgressBar');
    const subtotalDisplay = document.getElementById('cartSubtotalDisplay');
    const totalDisplay = document.getElementById('cartTotalDisplay');

    if (!container) return;

    const cart = loadCart();
    const subtotal = getSubtotal();

    // Shipping calculation & incentive progress
    const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
    const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    if (incentiveText) {
      if (remainingForFreeShipping <= 0) {
        incentiveText.innerHTML = `✦ <span class="shipping-text-highlight">Complimentary Express Shipping Unlocked</span>`;
      } else {
        incentiveText.innerHTML = `Add <span class="shipping-text-highlight">₹${remainingForFreeShipping.toLocaleString('en-IN')}</span> more for Complimentary Express Delivery`;
      }
    }

    if (subtotalDisplay) {
      subtotalDisplay.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    }
    if (totalDisplay) {
      totalDisplay.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    }

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">✦</div>
          <h3 class="cart-empty-title">Your Bag is Empty</h3>
          <p class="cart-empty-desc">Discover our artisanal extrait formulations and find your signature olfactory portrait.</p>
          <a href="#shop" class="btn btn-primary btn-sm" onclick="MaisonCart.closeDrawer()">Explore Fragrance Portfolio</a>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    container.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.quantity;

      return `
        <div class="cart-item" data-id="${item.productId}" data-size="${item.size}">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>

          <div class="cart-item-details">
            <span class="cart-item-family">${item.family || 'Extrait de Parfum'}</span>
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-size-row">
              <span>Volume: ${item.size}</span>
            </div>

            <div class="cart-item-qty-row">
              <div class="cart-qty-stepper">
                <button class="cart-stepper-btn" onclick="MaisonCart.updateQuantity('${item.productId}', '${item.size}', -1)" aria-label="Decrease quantity">−</button>
                <span class="cart-stepper-value">${item.quantity}</span>
                <button class="cart-stepper-btn" onclick="MaisonCart.updateQuantity('${item.productId}', '${item.size}', 1)" aria-label="Increase quantity">+</button>
              </div>

              <button class="cart-item-remove-btn" onclick="MaisonCart.removeItem('${item.productId}', '${item.size}')">Remove</button>
            </div>
          </div>

          <div class="cart-item-price-col">
            <span class="cart-item-total">₹${itemTotal.toLocaleString('en-IN')}</span>
            <span class="cart-item-unit-price">₹${item.price.toLocaleString('en-IN')} each</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (!drawer || !backdrop) return;

    renderDrawer();
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    drawer.focus();
  }

  function closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function showCartToast(message) {
    let toastContainer = document.getElementById('cartToastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'cartToastContainer';
      toastContainer.className = 'cart-toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <div class="toast-icon">✦</div>
      <div class="toast-message">${message}</div>
      <button class="toast-action" onclick="MaisonCart.openDrawer()">View Bag</button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-visible');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.parentNode.removeChild(toast);
        } else if (toast && typeof toast.remove === 'function') {
          toast.remove();
        }
      }, 400);
    }, 3800);
  }

  function init() {
    updateCartUI();
    renderDrawer();

    const trigger = document.getElementById('cartTrigger');
    const closeBtn = document.getElementById('cartDrawerCloseBtn');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    const continueBtn = document.getElementById('cartContinueBtn');

    if (trigger) trigger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (continueBtn) continueBtn.addEventListener('click', closeDrawer);

    // Proceed to Checkout button click listener
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = loadCart();
        if (cart.length === 0) {
          showCartToast('Your bag is empty.');
          return;
        }

        // FORCED AUTHENTICATION GATE
        if (!window.MaisonAuth || !window.MaisonAuth.isAuthenticated()) {
          closeDrawer();
          if (window.openAuthModal) {
            window.openAuthModal('checkout');
          }
        } else {
          // Customer is authenticated -> proceed to checkout view
          closeDrawer();
          window.location.hash = '#checkout';
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const drawer = document.getElementById('cartDrawer');
        if (drawer && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
      }
    });
  }

  return {
    init,
    getItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalCount,
    getSubtotal,
    openDrawer,
    closeDrawer,
    renderDrawer,
    showCartToast
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonCart = MaisonCart;
}
