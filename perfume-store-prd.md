# Product Requirements Document (PRD)
## Perfume E-Commerce Website

**Version:** 1.0
**Date:** September 28, 2026
**Owner:** [Your Name]
**Client:** [Client Name]

---

## 1. Overview

A single-brand e-commerce website for selling perfumes online. The site allows customers to browse products, view details, add items to a cart, and complete purchases using UPI (PhonePe, Google Pay, Paytm, etc.) or card payments. The project will be built using Google Antigravity (AI-assisted coding).

## 2. Goals & Objectives

- Launch a functional, professional-looking online store for the client's perfume brand
- Enable customers to browse, select, and purchase perfumes without needing a physical store visit
- Support online payments (UPI + Cards) securely
- Keep hosting and operating costs low (budget-conscious build)
- Deliver a mobile-friendly, fast-loading experience

## 3. Target Users

| User Type | Description |
|---|---|
| Customer | Browses perfumes, adds to cart, pays online, tracks order status |
| Admin (Client) | Manages product listings, prices, stock, and views orders |

## 4. Scope

### 4.1 In Scope (v1 / MVP)
- Homepage with brand banner and featured products
- Product listing page (all perfumes, filter/sort optional)
- Individual product detail page (images, description, price, size/variant selector)
- Shopping cart
- Checkout flow
- Payment integration (UPI + Card via Razorpay or Cashfree)
- Order confirmation page + email/WhatsApp notification
- Basic admin view or dashboard to manage products and see orders (can start manual via a simple admin panel or spreadsheet-linked system)
- About Us / Contact page
- Shipping & Refund Policy page (required for payment gateway approval)
- Mobile-responsive design
- SSL/HTTPS secure connection

### 4.2 Out of Scope (v1)
- Multi-vendor support
- Loyalty/rewards program
- Advanced analytics dashboard
- Multi-language support
- International shipping/currency support
- Live chat support

*(These can be added in future versions once the store is live and validated.)*

## 5. Functional Requirements

### 5.1 Product Catalog
- Each product must have: name, images (multiple), description, fragrance notes, price, size/variant (e.g., 30ml/50ml/100ml), stock status
- Products organized by category (e.g., Men, Women, Unisex, Gift Sets)

### 5.2 Cart & Checkout
- Add to cart, update quantity, remove item
- Display subtotal, shipping charge (if any), and total
- Guest checkout allowed (no forced account creation)
- Collect: name, phone number, delivery address, email (optional)

### 5.3 Payments
- Integrate Razorpay or Cashfree payment gateway
- Accept: UPI (covers PhonePe, Google Pay, Paytm, BHIM automatically), Credit/Debit Cards, Netbanking (optional)
- Payment success/failure handling with clear user feedback
- Order should only be marked "confirmed" after payment success webhook/callback is verified

### 5.4 Order Management
- On successful order: generate an order ID, send confirmation (email and/or WhatsApp)
- Admin should be able to view a list of orders with status (Placed / Shipped / Delivered)

### 5.5 Content Pages
- About the brand
- Contact details (phone, email, social links)
- Shipping policy
- Refund/cancellation policy
- Privacy policy (required by payment gateways)
- Terms & conditions

## 6. Non-Functional Requirements

- **Performance:** Pages should load within 2-3 seconds on average mobile connection
- **Security:** HTTPS/SSL enabled; no card details stored on our own server (handled entirely by the payment gateway)
- **Responsiveness:** Fully usable on mobile, tablet, and desktop
- **Uptime:** Reliable hosting with minimal downtime
- **Scalability (light):** Should comfortably handle a small-to-medium product catalog (up to ~50-100 products) and moderate daily traffic

## 7. Tech Stack (Proposed)

| Layer | Choice |
|---|---|
| Frontend | HTML/CSS/JavaScript (or React), built with Google Antigravity |
| Backend (for payment handling) | Node.js (lightweight server for Razorpay/Cashfree order creation & webhook verification) |
| Payment Gateway | Razorpay or Cashfree (UPI + Cards) |
| Hosting (frontend) | Netlify / Vercel (free/cheap tier) |
| Hosting (backend server) | Render / Railway (free/cheap tier) |
| Domain | .shop / .store / .in (~₹200–800/year) |
| Notifications | Email (e.g., via Resend/SendGrid free tier) or WhatsApp API (optional) |

## 8. Budget Considerations

- Domain: ₹200–800/year
- Hosting: Free tier to start (Netlify/Vercel + Render free tier); may need small paid tier as traffic grows
- Payment gateway: No setup fee; per-transaction fee (~2% typical, varies by provider)
- Total to launch MVP: Roughly ₹500–1,500 (mostly just the domain)

## 9. Success Metrics

- Website successfully live and accessible via custom domain
- At least one successful end-to-end test transaction (UPI + card)
- Client can add/update products without developer help (or with minimal help)
- Mobile page load under 3 seconds
- Zero payment/checkout failures in testing before go-live

## 10. Timeline (Suggested)

| Phase | Task | Est. Duration |
|---|---|---|
| 1 | Domain + hosting setup | 1 day |
| 2 | Build product catalog & pages (via Antigravity) | 3–5 days |
| 3 | Cart & checkout flow | 2–3 days |
| 4 | Payment gateway integration & testing | 2–3 days |
| 5 | Content pages (policies, about, contact) | 1 day |
| 6 | End-to-end testing | 1–2 days |
| 7 | Launch | 1 day |

**Total estimated time: ~2 weeks** (part-time, first-project pace)

## 11. Open Questions / Decisions Needed

- [ ] Final product list, pricing, and images from client
- [ ] Preferred payment gateway (Razorpay vs Cashfree)
- [ ] Domain name choice
- [ ] Shipping partner/method (self-managed vs courier service)
- [ ] Return/refund policy terms (client to confirm)
- [ ] Business bank account & KYC docs ready for payment gateway activation

---

*This PRD is a living document and can be updated as requirements evolve during development.*
