/**
 * ===================================================================
 * MAISON AURA — CENTRALIZED CUSTOMER AUTHENTICATION STATE
 * Single-Brand Luxury Perfume E-Commerce Store (Demo)
 * ===================================================================
 */

const MaisonAuth = (() => {
  const STORAGE_KEY = 'maison_aura_auth_user_v1';
  let memoryUser = null;

  function loadUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for auth, using memory', e);
    }
    return memoryUser;
  }

  function saveUser(user) {
    memoryUser = user;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not save user state', e);
    }
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('maison:auth-updated', { detail: { user } }));
  }

  function getUser() {
    const user = loadUser();
    if (user && user.email) {
      return {
        isAuthenticated: true,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        phone: user.phone || '+91 98200 12345',
        address: user.address || {
          addressLine: 'Apt 14B, Regency Crest, Altamount Road',
          landmark: 'Near Cumballa Hill Hospital',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400026'
        },
        authProvider: user.authProvider || 'email',
        joinedAt: user.joinedAt || 'September 2026'
      };
    }
    return {
      isAuthenticated: false,
      name: '',
      email: '',
      phone: '',
      address: null,
      authProvider: null
    };
  }

  function updateProfile(updates) {
    const current = getUser();
    if (!current.isAuthenticated) {
      return { success: false, message: 'Not authenticated' };
    }

    const updatedUser = {
      ...loadUser(),
      ...updates
    };

    saveUser(updatedUser);
    return { success: true, user: getUser() };
  }

  function isAuthenticated() {
    return getUser().isAuthenticated;
  }

  function login(email, password) {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Please enter your password.' };
    }

    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const user = {
      name: name || 'Valued Customer',
      email: email.trim().toLowerCase(),
      authProvider: 'email',
      joinedAt: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    };

    saveUser(user);
    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`Welcome back, ${user.name}`);
    }
    return { success: true, user };
  }

  function register(name, email, password, confirmPassword) {
    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      authProvider: 'email',
      joinedAt: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    };

    saveUser(user);
    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`Account created. Welcome to Maison Aura, ${user.name}`);
    }
    return { success: true, user };
  }

  function loginWithGoogle() {
    // Simulated Google OAuth Flow for Client Demo
    const mockGoogleProfiles = [
      { name: 'Alexander Wright', email: 'alexander.wright@gmail.com' },
      { name: 'Elena Rostova', email: 'elena.rostova@gmail.com' },
      { name: 'Devon Vance', email: 'devon.vance@gmail.com' }
    ];
    const profile = mockGoogleProfiles[0];

    const user = {
      name: profile.name,
      email: profile.email,
      authProvider: 'google',
      joinedAt: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    };

    saveUser(user);
    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast(`Authenticated via Google: ${user.name}`);
    }
    return { success: true, user };
  }

  function logout() {
    const prevUser = getUser();
    saveUser(null);
    if (window.MaisonCart && window.MaisonCart.showCartToast) {
      window.MaisonCart.showCartToast('Signed out of Maison Aura');
    }
    return { success: true };
  }

  function updateAuthUI() {
    const user = getUser();
    const accountTrigger = document.getElementById('accountTrigger');
    const accountDropdownName = document.getElementById('accountDropdownName');
    const accountDropdownEmail = document.getElementById('accountDropdownEmail');
    const accountBadge = document.getElementById('accountBadge');

    if (accountTrigger) {
      if (user.isAuthenticated) {
        accountTrigger.classList.add('is-authenticated');
        accountTrigger.setAttribute('title', `Account: ${user.name}`);
        accountTrigger.setAttribute('aria-label', `Account Menu: ${user.name}`);
        if (accountBadge) {
          accountBadge.textContent = user.name.charAt(0);
          accountBadge.style.display = 'flex';
        }
      } else {
        accountTrigger.classList.remove('is-authenticated');
        accountTrigger.setAttribute('title', 'Sign In / Account');
        accountTrigger.setAttribute('aria-label', 'Customer Account');
        if (accountBadge) {
          accountBadge.style.display = 'none';
        }
      }
    }

    if (accountDropdownName && accountDropdownEmail) {
      if (user.isAuthenticated) {
        accountDropdownName.textContent = user.name;
        accountDropdownEmail.textContent = user.email;
      }
    }
  }

  function init() {
    updateAuthUI();
  }

  return {
    init,
    getUser,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    updateAuthUI
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonAuth = MaisonAuth;
}
