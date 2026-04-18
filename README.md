# 🍔 FoodOrder — Multi-Restaurant Food Ordering System

A production-ready, full-stack food ordering platform built with **Next.js 14 (App Router)**, **MongoDB**, and **Socket.IO**.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a strong random secret (e.g. `openssl rand -base64 32`)

### 3. Run the dev server
```bash
# Standard Next.js (no WebSocket)
npm run dev

# With Socket.IO real-time tracking (recommended)
npx ts-node server.ts
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
food-ordering/
├── app/
│   ├── api/                    # All API routes
│   │   ├── auth/               # register, login, me
│   │   ├── restaurants/        # CRUD + menu
│   │   ├── categories/         # Menu categories
│   │   ├── menu-items/         # Menu item CRUD
│   │   ├── cart/               # Cart management
│   │   ├── orders/             # Order placement + tracking
│   │   ├── admin/              # Admin stats, users, orders
│   │   └── notifications/      # In-app notifications
│   ├── (pages)/
│   │   ├── page.tsx            # Home — restaurant listing
│   │   ├── restaurants/[id]/   # Restaurant detail + menu
│   │   ├── cart/               # Cart page
│   │   ├── checkout/           # Checkout + address selection
│   │   ├── orders/             # Order history
│   │   ├── orders/[id]/        # Order tracking (real-time)
│   │   ├── admin/              # Admin dashboard
│   │   └── dashboard/          # Restaurant owner dashboard
│   └── layout.tsx
├── lib/
│   ├── models/                 # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Restaurant.ts
│   │   ├── Menu.ts             # Category + MenuItem
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   └── Notification.ts
│   ├── context/
│   │   ├── AuthContext.tsx     # JWT auth state
│   │   └── CartContext.tsx     # Global cart state
│   ├── hooks/
│   │   ├── useApi.ts           # Authenticated fetch hook
│   │   └── useSocket.ts        # Socket.IO client hooks
│   └── utils/
│       ├── jwt.ts              # Token sign/verify
│       └── api.ts              # Response helpers + middleware
├── types/index.ts              # All TypeScript interfaces
├── server.ts                   # Custom server with Socket.IO
└── components/
    └── layout/Navbar.tsx
```

---

## 🗄️ Database Schema (MongoDB)

### Users
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, indexed |
| password | String | bcrypt hashed, select: false |
| phone | String | optional |
| role | Enum | customer / restaurant_owner / admin |
| addresses | Array | label, street, city, state, pincode, isDefault |
| isActive | Boolean | soft-delete flag |

### Restaurants
| Field | Type | Notes |
|-------|------|-------|
| name | String | text-indexed for search |
| description | String | |
| cuisineTypes | [String] | |
| location | Object | address, city, state, pincode, coordinates |
| coverImage / logo | String | URL |
| rating | Number | 0–5 |
| avgDeliveryTime | Number | minutes |
| minOrderAmount | Number | |
| deliveryFee | Number | |
| isOpen | Boolean | owner-toggleable |
| isActive | Boolean | soft-delete |
| ownerId | ObjectId | ref: User |

### Categories
| Field | Type |
|-------|------|
| restaurantId | ObjectId (ref: Restaurant) |
| name | String |
| sortOrder | Number |
| isActive | Boolean |

### MenuItems
| Field | Type | Notes |
|-------|------|-------|
| restaurantId | ObjectId | indexed |
| categoryId | ObjectId | indexed |
| name, description | String | |
| price | Number | |
| discountedPrice | Number | optional |
| image | String | URL |
| foodType | Enum | veg / non-veg / egg |
| isAvailable | Boolean | |
| isPopular | Boolean | shown as badge |
| preparationTime | Number | minutes |

### Cart
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | unique per user |
| items | Array | menuItemId, restaurantId, name, price, qty, foodType |

### Orders
| Field | Type | Notes |
|-------|------|-------|
| orderId | String | FO-XXXXX, auto-generated |
| userId / restaurantId | ObjectId | |
| restaurantName | String | denormalized for display |
| items | Array | snapshot of item details |
| deliveryAddress | Object | copied from user at checkout |
| totalAmount / deliveryFee | Number | |
| status | Enum | pending → confirmed → preparing → out_for_delivery → delivered / cancelled |
| paymentMethod | String | always "cash_on_delivery" |
| paymentStatus | Enum | pending / paid |
| statusHistory | Array | {status, timestamp, note} |
| estimatedDeliveryTime | Date | |
| groupOrderId | String | links orders from same checkout |

### Notifications
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | |
| type | Enum | order_placed / status_update / general |
| title / message | String | |
| orderId | ObjectId | optional |
| isRead | Boolean | |
| createdAt | Date | TTL index: auto-deleted after 30 days |

---

## 🔑 API Reference

### Auth
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/me` | ✅ | Update name/phone |

### Restaurants
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/restaurants` | — | List with search/filter |
| POST | `/api/restaurants` | Owner/Admin | Create restaurant |
| GET | `/api/restaurants/:id` | — | Get details |
| PATCH | `/api/restaurants/:id` | Owner/Admin | Update |
| GET | `/api/restaurants/:id/menu` | — | Full menu (nested by category) |

### Menu
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/categories` | Owner | Create category |
| POST | `/api/menu-items` | Owner | Create item |
| GET | `/api/menu-items?restaurantId=` | — | List items |
| PATCH | `/api/menu-items/:id` | Owner | Update item |
| DELETE | `/api/menu-items/:id` | Owner | Delete item |

### Cart
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/cart` | Customer | Get cart (grouped) |
| POST | `/api/cart` | Customer | Add item |
| PATCH | `/api/cart` | Customer | Update quantity (0 = remove) |
| DELETE | `/api/cart` | Customer | Clear cart |

### Orders
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/orders` | Customer | My orders (paginated) |
| POST | `/api/orders` | Customer | Checkout (auto-splits by restaurant) |
| GET | `/api/orders/:id` | Customer/Admin | Order details |
| PATCH | `/api/orders/:id` | Owner/Admin | Update status |

### Admin
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users?id=` | Admin | Toggle user status |
| GET | `/api/admin/orders` | Admin | All orders |

### Notifications
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/notifications` | Customer | Get notifications |
| PATCH | `/api/notifications` | Customer | Mark all as read |

---

## ⚡ Key Features

- **Multi-restaurant cart** — add from any restaurant, order splits automatically at checkout
- **Per-order tracking** — Socket.IO rooms isolate updates per order (`order:<id>`)
- **Role-based access** — customer / restaurant_owner / admin middleware guards on all protected routes
- **JWT auth** — stateless, stored in `localStorage`, injected as `Authorization: Bearer <token>`
- **Veg/Non-veg filter** — toggle on restaurant page
- **Human-readable order IDs** — `FO-00001`, `FO-00002`...
- **30-day TTL** — notifications auto-deleted by MongoDB index
- **Soft deletes** — restaurants and users use `isActive` flag

---

## 🚢 Deployment

### Vercel (recommended)
```bash
vercel deploy
```
Add env vars in Vercel dashboard. For Socket.IO, use a separate Node.js server (Railway, Render, etc.) and set `NEXT_PUBLIC_SOCKET_URL`.

### Environment Variables Required
```
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SOCKET_URL=
```

---

## 🔮 Future Enhancements (from FRD)
- [ ] Ratings & reviews system (schema-ready)
- [ ] Coupon / discount codes
- [ ] AI-based restaurant recommendations
- [ ] Live delivery agent tracking
- [ ] Push notifications (FCM)
- [ ] Admin analytics charts
