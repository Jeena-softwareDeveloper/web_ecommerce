# 🚀 Jeenora Platform — How It Works

> **Version:** 2.1 | **Status:** Live in Production  
> **Domains:** [jeenora.com](https://jeenora.com) (Customer Store) | [dashboard.jeenora.com](https://dashboard.jeenora.com) (Admin Panel)  
> **Type:** AI-Powered B2B + B2C Fashion Marketplace

---

## 📋 Table of Contents

1. [Platform Overview — Who Uses It & How](#-platform-overview--who-uses-it--how)
2. [Customer Journey (B2C Shopping)](#-customer-journey-b2c-shopping)
3. [Supplier Journey (B2B Selling)](#-supplier-journey-b2b-selling)
4. [Admin Journey (Platform Management)](#-admin-journey-platform-management)
5. [AI Features — How They Work](#-ai-features--how-they-work)
6. [Key Feature Workflows](#-key-feature-workflows)
7. [Technology Stack Summary](#-technology-stack-summary)

---

## 🎯 Platform Overview — Who Uses It & How

Jeenora is a **3-sided marketplace platform** connecting three distinct user groups:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        THE JEENORA ECOSYSTEM                             │
│                                                                          │
│   ┌─────────────────────────────┐                                        │
│   │     👤 CUSTOMERS (B2C)      │                                        │
│   │    Browse, Shop & Buy       │                                        │
│   │    Fashion Products         │ ──────────────────┐                    │
│   │   jeenora.com               │                   │                    │
│   └─────────────────────────────┘                   │                    │
│                                                      ▼                    │
│   ┌─────────────────────────────┐           ┌────────────────────────┐   │
│   │    🏪 SUPPLIERS (B2B)       │◄──────────│   JEENORA BACKEND     │   │
│   │    Register, List Products  │──────────►│   API + AI Engine     │   │
│   │    Manage Inventory & Orders│           │   + Payments + Logis  │   │
│   │   jeenora.com/supplier-*    │           └────────────────────────┘   │
│   └─────────────────────────────┘                   │                    │
│                                                      ▼                    │
│   ┌─────────────────────────────┐                                        │
│   │   🔐 ADMIN TEAM            │                                        │
│   │   Manage Platform, Users,  │                                        │
│   │   Analytics, AI Insights   │                                        │
│   │   dashboard.jeenora.com    │                                        │
│   └─────────────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### Three Platforms — One System

| Platform | Who Uses It | Purpose |
|----------|-------------|---------|
| **jeenora.com** (E-Commerce Store) | Customers + Suppliers | Shopping, supplier operations (B2B tools) |
| **dashboard.jeenora.com** (Admin Panel) | Admin Team | Manage everything — users, orders, catalog, AI, logistics |
| **Jeenora Backend API** (hire.jeenora.com) | All platforms | Powers everything — business logic, AI, payments, notifications |

---

## 👤 Customer Journey (B2C Shopping) — Step by Step

### 1. Discover Products
```
Customer opens jeenora.com
        │
        ▼
┌─────────────────────────────────────┐
│         HOMEPAGE                    │
│  • Featured Products                │
│  • Category Sections                │
│  • Promotional Banners              │
│  • Supplier Offer Zones             │
└─────────────────────────────────────┘
        │
        ▼ (Can also search or browse categories)
┌─────────────────────────────────────┐
│     PRODUCT LISTING / SEARCH        │
│  • Filter by category, price, brand │
│  • Sort by popularity, price, new   │
│  • View product images & prices     │
└─────────────────────────────────────┘
```

### 2. View & Choose Product
```
Customer clicks a product
        │
        ▼
┌──────────────────────────────────────────────┐
│          PRODUCT DETAIL PAGE                  │
│  • Multiple product images (zoom supported)  │
│  • Select size, color, quantity              │
│  • See real-time price with discounts        │
│  • Read customer reviews & ratings           │
│  • View delivery estimate (AI-powered)       │
│  • See related & similar products            │
│  • Check active offers & coupons             │
│  • "Add to Cart" or "Add to Wishlist"        │
└──────────────────────────────────────────────┘
```

### 3. Complete Purchase
```
Customer proceeds to checkout
        │
        ▼
┌──────────────────────────────────────┐
│            CART                      │
│  • Review all selected items         │
│  • Update quantities or remove items │
│  • Apply coupon codes                │
│  • See price breakdown               │
│  • Proceed to checkout               │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│          CHECKOUT                    │
│  • Add/select delivery address       │
│  • Choose payment method:            │
│     - UPI (GPay, PhonePe, Paytm)     │
│     - Credit/Debit Card              │
│     - Net Banking                    │
│     - Wallet                         │
│  • Apply promo codes                 │
│  • See final order summary           │
│  • Place order                       │
└──────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│     PAYMENT (Via Cashfree Gateway)         │
│  • Secure payment processing               │
│  • Instant confirmation                    │
│  • Redirect to order success page          │
│  • Confetti animation (canvas-confetti)    │
└────────────────────────────────────────────┘
```

### 4. Order Processing Flow (Behind the Scenes)
```
Order Placed & Paid
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              AUTOMATED SYSTEM ACTIONS               │
│                                                     │
│  1. ✅ Order saved to database                      │
│  2. 📧 Email notification sent to customer          │
│     - Beautiful branded email with order details    │
│  3. 💬 WhatsApp notification sent (if opted in)     │
│  4. 🔔 Admin dashboard notified in real-time        │
│     (Socket.IO push notification)                   │
│  5. 🏪 Supplier gets order notification             │
│  6. 📦 Shiprocket tracking initiated                │
│  7. 📊 Analytics event logged                       │
└─────────────────────────────────────────────────────┘
        │
        ▼ (Customer can track live)
┌──────────────────────────────────────────────────────┐
│              ORDER TRACKING                          │
│  • Customer sees order status in real-time:          │
│     - 🟢 Order Placed                                │
│     - 🔵 Payment Confirmed                           │
│     - 🟡 Processing                                  │
│     - 🟠 Shipped (with tracking ID from Shiprocket)  │
│     - 🟢 Delivered                                   │
│     - 🔴 Cancelled / Returned                        │
│  • Live updates via Socket.IO (no page refresh)      │
│  • Delivery estimate shown at product page           │
└──────────────────────────────────────────────────────┘
```

### 5. Post-Purchase
```
Customer can:
  ┌─────────────────────────────────────┐
  │ • View order history in profile     │
  │ • Track live order status           │
  │ • Cancel order (within window)      │
  │ • Request return / RTO              │
  │ • Write product reviews & ratings   │
  │ • Contact AI customer support       │
  │ • Reorder from past orders          │
  └─────────────────────────────────────┘
```

---

## 🏪 Supplier Journey (B2B Selling) — Step by Step

### 1. Registration & Onboarding
```
Anyone can become a supplier on Jeenora
        │
        ▼
┌──────────────────────────────────────────────────┐
│         SUPPLIER REGISTRATION                    │
│  1. Click "Become a Supplier" from store or      │
│     visit jeenora.com/supplier-registration      │
│  2. Fill in:                                     │
│     • Business Details (shop name, GST, PAN)     │
│     • Address Details (warehouse location)       │
│     • Bank Details (for settlements)             │
│     • Supplier Details (category, experience)    │
│  3. Bank IFSC code verified automatically        │
│     (via Razorpay IFSC API)                      │
│  4. Submit application (status: pending)         │
└──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│         ADMIN REVIEW & APPROVAL                  │
│  • Admin reviews application in dashboard        │
│  • Can approve or reject with reason             │
│  • Once approved → Supplier gets access          │
└──────────────────────────────────────────────────┘
```

### 2. Supplier Dashboard — Daily Operations
```
After approval, supplier logs into jeenora.com
and accesses their supplier section:

┌───────────────────────────────────────────────────────────┐
│              SUPPLIER CONTROL CENTER                      │
│                                                           │
│  📊 DASHBOARD                                             │
│     • Sales overview (today, this week, this month)       │
│     • Order statistics (pending, processing, delivered)   │
│     • Revenue chart                                       │
│     • AI-generated performance insights                   │
│     • Quality score                                       │
│                                                           │
│  📦 CATALOG                                              │
│     • Add new products (name, description, images,        │
│       category, price, discount, sizes, colors, stock)    │
│     • Bulk upload via catalog upload tool                 │
│     • Edit / delete existing products                     │
│     • Product images uploaded to Cloudinary               │
│                                                           │
│  📋 ORDERS                                               │
│     • View incoming orders                                │
│     • Update order status (processing → shipped → delivered)│
│     • Print invoices                                      │
│     • View order history                                  │
│                                                           │
│  📦 INVENTORY                                            │
│     • Track current stock levels                          │
│     • Add stock to existing products                      │
│     • View AI stockout predictions                        │
│     • Receive restock alerts                              │
│                                                           │
│  🔄 RETURNS & RTO                                        │
│     • View return requests from customers                 │
│     • Accept or reject returns                            │
│     • Track RTO (Return to Origin) status                 │
│                                                           │
│  💰 PAYMENTS & WALLET                                    │
│     • View wallet balance                                 │
│     • Withdraw funds to bank account                      │
│     • View settlement history                             │
│     • Track payment requests                              │
│                                                           │
│  💲 PRICING & OFFERS                                     │
│     • Set product prices                                  │
│     • Create discount offers & promotions                 │
│     • AI-powered price recommendations                    │
│     • Offer zone management                               │
│                                                           │
│  🏭 WAREHOUSE                                            │
│     • Manage storage locations                            │
│     • Track inventory by warehouse                        │
│                                                           │
│  ⭐ QUALITY DASHBOARD                                     │
│     • View quality scores & metrics                       │
│     • AI-generated quality insights                       │
│                                                           │
│  🤖 AI PRICE RECOMMENDATIONS                              │
│     • AI suggests optimal pricing                         │
│     • Market comparison data                              │
└───────────────────────────────────────────────────────────┘
```

### 3. Order Fulfillment Workflow
```
New order arrives → Supplier gets notification
        │
        ▼
┌──────────────────────────────────────────────┐
│         SUPPLIER FULFILLMENT PROCESS         │
│                                              │
│  1. View order details (items, customer,     │
│     shipping address)                        │
│  2. Pack the items                           │
│  3. Update status to "Shipped"               │
│  4. System automatically:                    │
│     • Creates Shiprocket tracking            │
│     • Auto-generates shipping label          │
│     • Sends tracking link to customer        │
│     • Updates order status                   │
│  5. Customer gets real-time tracking         │
│  6. On delivery → settlement initiated       │
└──────────────────────────────────────────────┘
```

### 4. Settlement & Payments
```
Order Delivered
        │
        ▼
┌────────────────────────────────────────────┐
│         PAYMENT SETTLEMENT                │
│                                            │
│  • Amount credited to supplier wallet      │
│  • After platform commission deducted      │
│  • Supplier can withdraw anytime           │
│  • Withdrawals processed to bank account   │
│  • Full transaction history available      │
└────────────────────────────────────────────┘
```

---

## 🔐 Admin Journey (Platform Management)

### Admin Dashboard Features
```
Admins log in at dashboard.jeenora.com with role-based access:

┌────────────────────────────────────────────────────────┐
│              ADMIN CONTROL CENTER                      │
│                                                        │
│  👑 SUPER ADMIN — Full access to everything            │
│  👤 ADMIN — Manage day-to-day operations               │
│  👔 MANAGER — Limited operational access               │
└────────────────────────────────────────────────────────┘

Navigation Menu (based on role):
┌────────────────────────────────────────────────────────┐
│  🖥 DASHBOARD                                          │
│     • Real-time analytics (sales, orders, users)       │
│     • Revenue charts (daily, weekly, monthly)          │
│     • Order status distribution                        │
│     • Top selling products                             │
│     • Supplier performance metrics                     │
│     • AI-generated insights & predictions              │
│                                                        │
│  👥 MANAGERS (Super Admin only)                        │
│     • Create / manage sub-admin accounts               │
│     • Assign roles & permissions                       │
│                                                        │
│  👤 ADMINS                                             │
│     • View and manage admin users                      │
│                                                        │
│  📦 WEAR CATALOG                                       │
│     • Full view of all products on platform            │
│     • Approve / reject supplier products               │
│     • Manage categories                                │
│     • Oversee product quality                          │
│                                                        │
│  📋 WEAR ORDERS                                        │
│     • View all orders across platform                  │
│     • Force cancel orders if needed                    │
│     • Trigger manual refunds                           │
│     • Track order statuses                             │
│                                                        │
│  👥 WEAR BUYERS                                        │
│     • View all registered customers                    │
│     • Customer details & order history                 │
│                                                        │
│  💰 WEAR FINANCE                                       │
│     • Revenue reports                                  │
│     • Payment request management                       │
│     • Settlement tracking                              │
│     • Financial analytics                              │
│                                                        │
│  📊 WEAR ANALYTICS                                     │
│     • Advanced charts & metrics                        │
│     • Sales trends & patterns                          │
│     • Supplier performance analytics                   │
│     • AI-powered predictions                           │
│                                                        │
│  ⚠️ WEAR RISK                                          │
│     • Risk assessment dashboard                        │
│     • Flag suspicious orders / activities               │
│     • Security monitoring                               │
│                                                        │
│  📝 WEAR CATEGORIES                                    │
│     • Create / edit product categories                 │
│     • Set category display order                       │
│                                                        │
│  📋 WEAR LOGS                                          │
│     • View all platform activity logs                  │
│     • Audit trail for actions                          │
│                                                        │
│  🤖 WEAR AI LOGS                                       │
│     • View AI-generated insights & logs                │
│     • See AI predictions & recommendations             │
│                                                        │
│  🔮 WEAR INVENTORY FORECASTER                          │
│     • AI inventory predictions UI                      │
│     • Stockout risk analysis                           │
│     • Dead stock identification                        │
│                                                        │
│  🚚 SHIPROCKET LOGISTICS                               │
│     • Overview dashboard                               │
│     • Track all orders in Shiprocket                   │
│     • Manage deliveries                                │
│                                                        │
│  ⚙️ SETTINGS                                           │
│     • Configure platform settings                      │
│     • Menu display configuration                       │
│     • Wear module configuration                        │
└────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Features — How They Work

Jeenora uses **DeepSeek AI** (via GROQ SDK) and custom machine learning models to power intelligent automation. Here's how each AI feature works:

### 🔮 1. Inventory Stockout Prediction
```
How it works:
  Every day at 1:00 AM IST, the AI:
   1. Analyzes historical sales data for each product
   2. Checks current stock levels
   3. Calculates daily sell-through rate
   4. Predicts which products will run out of stock
   5. Flags products at risk (e.g., "will be out in 7 days")
   6. Updates product records with prediction data

Result: Suppliers & admins see stockout predictions in dashboard
```

### 🗑️ 2. Dead Stock Detection
```
How it works:
  Every Sunday at 3:00 AM IST, the AI:
   1. Identifies products with zero sales in last 30/60/90 days
   2. Calculates inventory holding cost
   3. Flags dead stock items
   4. Recommends markdown prices or removal
   5. Sends alerts to suppliers

Result: Suppliers notified to clear dead inventory
```

### 📦 3. Smart Restock Recommendations
```
How it works:
  Daily at 8:00 AM IST, the AI:
   1. Analyzes sales velocity for each product
   2. Checks current stock & supplier lead time
   3. Calculates optimal reorder quantity
   4. Generates restock alerts
   5. Sends notifications to suppliers via email & WhatsApp

Result: Suppliers know exactly when & how much to restock
```

### 📊 4. Admin Daily Briefing
```
How it works:
  Daily at 8:00 AM IST, DeepSeek AI:
   1. Collects yesterday's sales data
   2. Analyzes order trends & patterns
   3. Checks supplier performance metrics
   4. Reviews customer activity
   5. Generates natural-language business summary
   6. Highlights key insights & recommendations

Result: Admin receives AI-written business briefing every morning
```

### 📈 5. Supplier Weekly Growth Report
```
How it works:
  Every Monday at 10:00 AM IST, DeepSeek AI:
   1. Analyzes each supplier's weekly performance
   2. Compares week-over-week growth
   3. Identifies top-performing products
   4. Provides actionable insights (e.g., "increase stock of X")
   5. Generates personalized report for each supplier

Result: Suppliers get AI-crafted growth insights every week
```

### 💬 6. AI Customer Support
```
How it works:
  When a customer opens support chat:
   1. AI chatbot (powered by DeepSeek) greets the customer
   2. Understands natural language questions
   3. Answers FAQs (order status, returns, shipping)
   4. Escalates complex issues to human support
   5. Learns from conversations to improve responses

Result: 24/7 automated customer support
```

### 💲 7. AI Price Recommendations
```
How it works:
  For each supplier product, the AI:
   1. Analyzes market trends & competitor pricing
   2. Checks product demand & seasonality
   3. Reviews historical sales at different price points
   4. Recommends optimal price range
   5. Suggests discount strategies

Result: Suppliers get data-driven pricing suggestions
```

### 📦 8. Automated Logistics Tracking
```
How it works:
  Every 6 hours, the AI:
   1. Fetches tracking data from Shiprocket API
   2. Updates order statuses automatically
   3. Detects delivery delays
   4. Sends proactive notifications to customers
   5. Flags failed deliveries for admin review

Result: Customers get accurate, real-time delivery updates
```

---

## 🔄 Key Feature Workflows

### Shopping Cart Flow
```
1. Customer clicks "Add to Cart" on any product
2. Product added to cart (stored in backend, synced across devices)
3. Customer can view cart anytime, update quantities
4. Discounts & offers auto-applied in cart
5. Cart persists across sessions (user logged in)
6. Empty cart → Checkout → Order placed → Cart cleared
```

### Checkout & Payment Flow
```
1. Customer proceeds from cart to checkout
2. System calculates:
   • Subtotal (price × quantity)
   • Product discounts (if any)
   • Promo discount (if coupon code applied)
   • Shipping fee
   • Final total
3. Customer selects delivery address (or adds new one)
4. Customer chooses payment method
5. Payment processed via Cashfree Gateway:
   • UPI (QR code or UPI ID)
   • Credit/Debit Card
   • Net Banking
   • Wallet
6. On success → order confirmed → notifications sent
7. On failure → customer can retry payment
```

### Shiprocket Logistics Flow
```
1. Order placed & paid
2. Admin/supplier updates status to "shipped"
3. System auto-creates shipment in Shiprocket:
   • Generates AWB number (tracking ID)
   • Creates shipping label
   • Assigns courier partner
4. Tracking link sent to customer
5. Shiprocket tracks delivery status
6. AI checks tracking every 6 hours
7. On delivery → status updated to "delivered"
8. Settlement initiated for supplier
```

### WhatsApp Notification Flow
```
1. Customer opts in for WhatsApp notifications during registration
2. WhatsApp client initializes on server startup
3. On order events (placed, shipped, delivered):
   • System sends WhatsApp message with order details
   • Includes order ID, status, tracking link
4. On restock alerts:
   • AI generates restock notification
   • WhatsApp message sent to supplier
5. On dead stock alerts:
   • AI identifies dead stock
   • WhatsApp message sent to supplier with recommendations
```

### Real-Time Updates (Socket.IO) Flow
```
1. Customer opens website → Socket.IO connection established
2. Connection stays open (WebSocket preferred, falls back to polling)
3. When order status changes:
   • Server emits event to connected client
   • Dashboard updates without page refresh
   • Customer gets live order status updates
4. Admin dashboard gets real-time:
   • New order notifications
   • Payment updates
   • System alerts
```

### Coupon & Offer System Flow
```
1. Admin creates coupons via backend (type: percentage or flat)
2. Coupon has conditions:
   • Min order value
   • Max discount cap
   • Expiry date
   • Usage limit
3. Customer applies coupon code at checkout
4. System validates coupon:
   • Is active?
   • Is order value ≥ min order value?
   • Is coupon within usage limit?
5. Discount calculated:
   • Percentage type: discount % of total (capped at max)
   • Flat type: fixed amount off
6. Final total updated with discount applied
```

### Return / RTO Workflow
```
1. Customer requests return from order page
2. Admin/supplier reviews return request
3. If approved:
   • Return label generated
   • Customer ships item back
   • On receipt → refund initiated
4. If RTO (Return to Origin):
   • Delivery failed → package returning to supplier
   • System tracks RTO status
   • Refund processed after RTO completed
```

---

## 🛠 Technology Stack Summary

### Backend
| Technology | What It Does |
|-----------|--------------|
| **Node.js + Express** | Backend server & API framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.IO** | Real-time WebSocket communication |
| **JWT** | Authentication tokens |
| **bcrypt/bcryptjs** | Password hashing |
| **node-cron** | Scheduled AI job automation |
| **DeepSeek (GROQ SDK)** | AI/ML for insights & predictions |
| **Helmet** | Security headers |
| **express-rate-limit** | API rate limiting |
| **Cloudinary SDK** | Image/video upload & CDN |
| **Cashfree PG** | Payment gateway integration |
| **Shiprocket API** | Logistics & tracking |
| **Nodemailer** | Email sending |
| **whatsapp-web.js** | WhatsApp messaging |
| **Firebase Admin** | Firebase authentication |
| **Passport.js** | Facebook login |
| **Google APIs** | Google OAuth & services |

### Admin Dashboard
| Technology | What It Does |
|-----------|--------------|
| **React 18 + CRA** | UI framework |
| **Material UI 7** | Component library |
| **Tailwind CSS 3** | Styling |
| **Redux Toolkit** | State management |
| **React Router 6** | Page routing |
| **ApexCharts / Recharts / Chart.js** | Charts & analytics |
| **Socket.io-client** | Real-time updates |
| **SweetAlert2** | Alert modals |
| **react-toastify / sonner** | Toast notifications |

### Customer Storefront
| Technology | What It Does |
|-----------|--------------|
| **React 19 + Vite 6** | Ultra-fast UI framework |
| **Tailwind CSS 4** | Modern styling |
| **Redux Toolkit** | State management |
| **React Router 7** | Page routing |
| **Framer Motion** | Animations |
| **Axios** | API calls |
| **Firebase** | Social authentication |
| **Canvas Confetti** | Order success celebration |
| **React Barcode** | Barcode generation |

---

## 📌 Summary

**Jeenora is an end-to-end fashion marketplace platform** where:

- **👤 Customers** browse, shop, and track orders with AI-powered delivery estimates and customer support
- **🏪 Suppliers** register, list products, manage inventory, fulfill orders, and get AI-powered insights on pricing, stock, and performance
- **🔐 Admin team** manages the entire platform with role-based access, real-time analytics, AI-generated briefings, and logistics tracking

All powered by a central backend that handles payments (Cashfree), logistics (Shiprocket), media (Cloudinary), notifications (Email + WhatsApp), and AI automation (DeepSeek) — with real-time updates via Socket.IO across all platforms.

---

*Document prepared for client — May 2026*