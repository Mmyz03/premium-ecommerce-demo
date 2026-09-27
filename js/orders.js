/**
 * ===================================================================
 * MAISON AURA — CENTRALIZED ORDER MANAGEMENT STATE
 * Single-Brand Luxury Perfume E-Commerce Store (Demo)
 * ===================================================================
 */

const MaisonOrders = (() => {
  const STORAGE_KEY = 'maison_aura_orders_v1';
  let memoryOrders = null;

  // Realistic seed orders for initial demo presentation
  const DEFAULT_SEED_ORDERS = [
    {
      orderId: 'MA-2026-849201',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      formattedDate: '27 Sep 2026, 21:15',
      customer: {
        name: 'Alexander Wright',
        email: 'alexander@example.com'
      },
      delivery: {
        fullName: 'Alexander Wright',
        phone: '+91 98200 12345',
        email: 'alexander@example.com',
        addressLine: 'Apt 14B, Regency Crest, Altamount Road',
        landmark: 'Near Cumballa Hill Hospital',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400026'
      },
      items: [
        {
          productId: 'noir-oud',
          name: 'Noir Oud',
          subtitle: 'Extrait de Parfum',
          size: '100ml',
          price: 8600,
          quantity: 1,
          image: 'assets/images/perfume_oud_noir.jpg',
          itemTotal: 8600
        },
        {
          productId: 'rose-nocturne',
          name: 'Rose Nocturne',
          subtitle: 'Extrait de Parfum',
          size: '50ml',
          price: 5100,
          quantity: 1,
          image: 'assets/images/perfume_rose_nocturne.jpg',
          itemTotal: 5100
        }
      ],
      pricing: {
        subtotal: 13700,
        packaging: 350,
        shipping: 0,
        total: 14050
      },
      payment: {
        method: 'UPI (Google Pay)',
        status: 'Paid',
        simulated: true,
        referenceId: 'SIM-TXN-98421094'
      },
      fulfillmentStatus: 'Processing',
      estimatedDelivery: '48–72 Hours Express Delivery'
    },
    {
      orderId: 'MA-2026-724119',
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString(), // Yesterday
      formattedDate: '26 Sep 2026, 14:30',
      customer: {
        name: 'Elena Rostova',
        email: 'elena.rostova@luxury.co'
      },
      delivery: {
        fullName: 'Elena Rostova',
        phone: '+91 98111 87654',
        email: 'elena.rostova@luxury.co',
        addressLine: 'Villa 8, The Camellias, Golf Course Road',
        landmark: 'Sector 42',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002'
      },
      items: [
        {
          productId: 'alabaster-oud',
          name: 'Alabaster & Oud',
          subtitle: 'Extrait de Parfum',
          size: '100ml',
          price: 9200,
          quantity: 1,
          image: 'assets/images/hero_perfume_campaign.jpg',
          itemTotal: 9200
        }
      ],
      pricing: {
        subtotal: 9200,
        packaging: 350,
        shipping: 0,
        total: 9550
      },
      payment: {
        method: 'Credit Card (Visa)',
        status: 'Paid',
        simulated: true,
        referenceId: 'SIM-TXN-41908233'
      },
      fulfillmentStatus: 'Shipped',
      estimatedDelivery: '28 Sep 2026 • Bluedart Express'
    },
    {
      orderId: 'MA-2026-519082',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
      formattedDate: '24 Sep 2026, 11:05',
      customer: {
        name: 'Devendra Sharma',
        email: 'dev.sharma@outlook.com'
      },
      delivery: {
        fullName: 'Devendra Sharma',
        phone: '+91 97400 33211',
        email: 'dev.sharma@outlook.com',
        addressLine: '42 Lavelle Road, Richmond Town',
        landmark: 'Opposite UB City',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      items: [
        {
          productId: 'santal-ambre',
          name: 'Santal Ambré',
          subtitle: 'Extrait de Parfum',
          size: '50ml',
          price: 4800,
          quantity: 1,
          image: 'assets/images/perfume_santal_ambre.jpg',
          itemTotal: 4800
        }
      ],
      pricing: {
        subtotal: 4800,
        packaging: 0,
        shipping: 0,
        total: 4800
      },
      payment: {
        method: 'UPI (PhonePe)',
        status: 'Paid',
        simulated: true,
        referenceId: 'SIM-TXN-10293847'
      },
      fulfillmentStatus: 'Delivered',
      estimatedDelivery: 'Delivered on 26 Sep 2026'
    }
  ];

  function loadOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryOrders = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for orders, using memory', e);
    }

    if (!memoryOrders || memoryOrders.length === 0) {
      memoryOrders = [...DEFAULT_SEED_ORDERS];
      saveOrders(memoryOrders);
    }
    return memoryOrders;
  }

  function saveOrders(orders) {
    memoryOrders = orders;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not save orders', e);
    }
    window.dispatchEvent(new CustomEvent('maison:orders-updated'));
  }

  function generateOrderId() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `MA-2026-${randomDigits}`;
  }

  function createOrder({ customer, delivery, items, subtotal, packaging = 0, shipping = 0, total, paymentMethod = 'UPI' }) {
    if (!items || items.length === 0) {
      return { success: false, message: 'Cannot create order with an empty bag.' };
    }

    const orderId = generateOrderId();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newOrder = {
      orderId,
      createdAt: now.toISOString(),
      formattedDate,
      customer: {
        name: customer.name || 'Valued Customer',
        email: customer.email || ''
      },
      delivery: {
        fullName: delivery.fullName,
        phone: delivery.phone,
        email: delivery.email,
        addressLine: delivery.addressLine,
        landmark: delivery.landmark || '',
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode
      },
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        subtitle: item.subtitle || 'Extrait de Parfum',
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        itemTotal: item.price * item.quantity
      })),
      pricing: {
        subtotal,
        packaging,
        shipping,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'Paid',
        simulated: true,
        referenceId: `SIM-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
      },
      fulfillmentStatus: 'Processing',
      estimatedDelivery: '48–72 Hours Express Delivery'
    };

    const orders = loadOrders();
    orders.unshift(newOrder); // Latest orders first
    saveOrders(orders);

    window.dispatchEvent(new CustomEvent('maison:order-created', { detail: { order: newOrder } }));
    return { success: true, order: newOrder };
  }

  function updateOrderStatus(orderId, newStatus) {
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, message: 'Invalid fulfillment status' };
    }

    const orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }

    orders[orderIndex].fulfillmentStatus = newStatus;
    saveOrders(orders);
    return { success: true, order: orders[orderIndex] };
  }

  function getCustomerOrders(email) {
    if (!email) return [];
    const orders = loadOrders();
    return orders.filter(o => o.customer.email.toLowerCase() === email.toLowerCase());
  }

  function getOrderById(orderId) {
    const orders = loadOrders();
    return orders.find(o => o.orderId === orderId) || null;
  }

  function getAllOrders() {
    return loadOrders();
  }

  function resetOrders() {
    memoryOrders = [...DEFAULT_SEED_ORDERS];
    saveOrders(memoryOrders);
  }

  return {
    createOrder,
    updateOrderStatus,
    getCustomerOrders,
    getOrderById,
    getAllOrders,
    resetOrders
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonOrders = MaisonOrders;
}
