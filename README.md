# Dream Garage (M) Sdn Bhd

Full-stack car workshop management system with documents, stock management, and company website.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Vite + Tailwind CSS + Pinia |
| Backend | Fastify + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (@fastify/jwt + bcrypt) |
| Document Export | modern-screenshot |
| Theme | Black + Yellow Gold (#FFD700) |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)

### Database Setup (Docker)
```bash
docker run -d --name dreamgarage-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dreamgarage \
  -p 5432:5432 postgres:16-alpine
```

### Backend
```bash
cd backend
cp .env.example .env          # edit with your DB credentials
npm install
npx prisma db push            # create tables
npm run db:seed                # seed branch, admin, categories, document settings
npm run dev                    # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

### Default Login
- **Email:** admin@dreamgarage.my
- **Password:** admin123

## Project Structure

```
DreamGarage/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   ├── seed.ts                # Seed data
│   │   └── migrations/
│   └── src/
│       ├── server.ts              # Fastify app entry point
│       ├── config/env.ts          # Environment variables
│       ├── plugins/
│       │   ├── auth.ts            # JWT authentication plugin
│       │   ├── prisma.ts          # Prisma client plugin
│       │   └── error-handler.ts   # Global error handler
│       ├── modules/
│       │   ├── auth/              # Login, JWT
│       │   ├── profile/           # User profile, password, branch settings, users list
│       │   ├── documents/         # Full document system (CRUD, payments, conversions)
│       │   ├── document-settings/ # Per-type numbering, template, defaults
│       │   ├── payment-terms/     # Payment term management
│       │   ├── stock/             # Stock items CRUD with brand, DOT, country
│       │   ├── categories/        # Stock categories CRUD with sort order
│       │   ├── brands/            # Brand CRUD (under categories)
│       │   ├── workers/           # Workshop staff CRUD (foremen, mechanics, etc.)
│       │   ├── customers/         # Customer + vehicle management
│       │   ├── debtors/           # Outstanding debtor tracking
│       │   ├── reports/           # Payment log with filters and export
│       │   └── dashboard/         # Stats, low stock, recent documents
│       └── utils/
│           ├── password.ts        # bcrypt hash/verify
│           └── pagination.ts      # Pagination helpers
├── frontend/
│   └── src/
│       ├── main.ts                # App entry
│       ├── App.vue
│       ├── router/index.ts        # Vue Router with auth guards
│       ├── stores/                # Pinia stores
│       │   ├── auth.ts
│       │   ├── documents.ts
│       │   ├── stock.ts
│       │   └── dashboard.ts
│       ├── pages/
│       │   ├── auth/LoginPage.vue
│       │   ├── dashboard/DashboardPage.vue
│       │   ├── stock/             # StockList, StockCreate, StockEdit, StockHistory
│       │   ├── workers/           # WorkerList (with roles management)
│       │   ├── customers/         # CustomerList, CustomerForm
│       │   ├── documents/         # DocumentList, DocumentForm, DocumentView, TakeOrder
│       │   ├── debtors/           # DebtorList, DebtorDetail
│       │   ├── reports/           # PaymentLog
│       │   └── website/           # Home, About, Services, Contact
│       ├── components/base/       # BaseButton, BaseInput, BaseSelect, BaseModal, BaseTable, etc.
│       ├── layouts/               # DashboardLayout, PublicLayout
│       ├── composables/           # useToast
│       ├── lib/api.ts             # Axios instance with JWT interceptor
│       └── types/index.ts         # TypeScript interfaces
└── README.md
```

## Database Schema

### Models (13 tables)

| Model | Description |
|-------|-------------|
| **Branch** | Workshop locations (multi-branch ready) |
| **User** | Staff accounts with ADMIN/STAFF roles |
| **Worker** | Workshop staff (foremen, salesmen, mechanics, technicians) |
| **StockCategory** | Inventory categories with sort order |
| **Brand** | Brands under categories (e.g. Michelin under Tyres) |
| **StockItem** | Inventory items with code, price, quantity, hold, DOT, country |
| **StockHistory** | Audit trail for all stock movements (IN/OUT/HOLD/RELEASE) |
| **Document** | Quotations, invoices, receipts, delivery orders |
| **DocumentItem** | Line items with price, discount, tax, service date |
| **Payment** | Payment records linked to invoices |
| **DocumentSetting** | Per-type numbering config, template, defaults |
| **PaymentTerm** | Configurable payment terms (Net 7, Net 30, etc.) |
| **Customer** | Customers with vehicles |

All core tables include `branchId` for multi-branch support.

## Features

### Documents System
Full document management system supporting 4 document types with conversions, payments, and configurable templates.

**Document Types:**
| Type | Prefix | Description |
|------|--------|-------------|
| Quotation | QT | Customer estimate before work begins |
| Invoice | INV | Bill for completed work/parts (auto-deducts stock) |
| Receipt | RCP | Proof of payment (generated from paid invoices) |
| Delivery Order | DO | Parts delivery document |

**Document Flow:**
```
Quotation (DRAFT → APPROVED → SENT)
    ↓ Convert
Invoice (DRAFT → OUTSTANDING → PARTIAL → PAID)
    ↓ Convert              ↓ Convert
Receipt (COMPLETED)    Delivery Order (DRAFT → APPROVED → COMPLETED)
```

**Statuses:**
| Status | Used By |
|--------|---------|
| DRAFT | QT, INV, DO |
| PENDING | QT, DO |
| APPROVED | QT, DO |
| SENT | QT |
| OUTSTANDING | INV (issued, awaiting payment) |
| PARTIAL | INV (partially paid) |
| PAID | INV (fully paid) |
| OVERDUE | INV (past due date) |
| COMPLETED | QT (converted), DO (delivered), RCP |
| CANCELLED | All |
| VOID | INV (voided, stock restored) |

**Auto-Numbering:**
- Format: `{PREFIX}{YY}-{PADDED_NUMBER}` (e.g., INV26-0001)
- Configurable prefix, year format, padding, separator per document type
- Race-condition safe (FOR UPDATE lock)
- Resets yearly

**Stock Integration:**
- Invoice DRAFT: stock placed on hold (holdQuantity)
- Invoice DRAFT → OUTSTANDING: hold released + stock deducted
- Invoice OUTSTANDING → DRAFT: stock restored + hold re-applied (blocked if payments exist)
- Invoice → VOID: stock auto-restored
- Invoice DRAFT → CANCELLED/DELETE: hold released
- Quotations, receipts, delivery orders do NOT affect stock
- Custom items (no stockItemId) skip stock deduction
- Full audit trail with HOLD/RELEASE stock history entries

**Payment System:**
- Record payments against invoices
- Payment methods: Cash, Bank Transfer, Cheque, Credit Card, E-Wallet, TNG, Boost
- Auto-updates invoice status: OUTSTANDING → PARTIAL → PAID
- Payment history with method, reference, bank, notes

**Vehicle Tracking:**
- Vehicle plate number, make/model, mileage on each document
- Visible on document template and list views

### Stock Management
- Full CRUD with item code, description, UOM, cost/sell price, quantity
- 9 default categories with sort order (Tyres, Engine Oil, Brake Parts, etc.)
- Brand hierarchy under categories (e.g. Michelin, Continental under Tyres)
- Brand CRUD with manage modal
- DOT code tracking for tyres (week/year format, auto-parsed)
- Country of origin with flag emoji display
- Stock hold system (draft invoices reserve stock)
- Search by item code or description
- Filter by category and brand
- Pagination with configurable page size
- Soft-delete (isActive flag) to preserve invoice references
- Branch-scoped (all queries filter by user's branchId)

### Workers
- Separate from system login accounts
- CRUD for workshop staff (foremen, salesmen, mechanics, technicians)
- Dynamic role management (add/delete roles, same pattern as stock categories)
- Role filter tabs on list page
- Assigned to documents as foreman/salesperson
- Soft-delete when worker has associated documents

### Take Order
- Streamlined single-page order entry
- Quick customer search (universal: name, phone, plate, model)
- Inline vehicle selection from customer
- Worker/foreman selection dropdown
- Fast stock item search per line
- Creates draft invoice directly

### Debtor Tracking
- List of customers with outstanding/partial/overdue invoices
- Total owed per customer, grand total
- Detail view shows all unpaid invoices per customer with payment history
- Links to invoice view for recording payments
- Works without customerId — groups by customer snapshot fields

### Payment Log (A/R)
- Daily/date-range payment log with pagination
- Payment method tabs (Cash, Bank Transfer, Credit Card, E-Wallet, etc.)
- Search by invoice number, customer, plate
- Summary cards: total collections, transaction count, method breakdown
- Print template: white document-style with company header, signature lines
- Prints all matching payments (not just current page)

### Dashboard
- Total stock items and quantity
- Invoices today / this month
- Revenue today / this month
- Low stock alerts (items with qty ≤ 5)
- Recent invoices with status and totals

### Company Website
- Public-facing pages: Home, About, Services, Contact
- Black + yellow gold theme matching Dream Garage branding
- Responsive design (mobile + desktop)
- WhatsApp contact integration
- Google Maps location embed
- Staff Login link in footer
- Services page shows brand logos per service (no descriptions)
- Service card hover animations (zoom + gold label overlay)
- "Ready to Visit?" section on homepage (3-step guide)
- Operating hours: Mon-Fri 9:30 AM - 7:30 PM

### Profile & Settings
- Edit user name and email
- Change password (with current password verification)
- Branch/company details management (admin only): name, address, phone, email

### Authentication
- JWT-based auth with 24-hour token expiry
- bcrypt password hashing (12 salt rounds)
- Route guards on frontend (redirect to /login if unauthenticated)
- Axios interceptor for automatic token attachment
- 401 response handling with auto-logout

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email + password |
| GET | `/api/v1/auth/me` | Get current user profile |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile` | Get full profile with branch details |
| GET | `/api/v1/profile/users` | List staff accounts (for dropdowns) |
| PUT | `/api/v1/profile` | Update name and email |
| PUT | `/api/v1/profile/password` | Change password |
| PUT | `/api/v1/profile/branch` | Update branch details (admin only) |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workers` | List active workers |
| POST | `/api/v1/workers` | Create worker |
| PUT | `/api/v1/workers/:id` | Update worker |
| DELETE | `/api/v1/workers/:id` | Delete/deactivate worker |

### Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/brands` | List brands (filter: categoryId) |
| POST | `/api/v1/brands` | Create brand |
| PUT | `/api/v1/brands/:id` | Update brand |
| DELETE | `/api/v1/brands/:id` | Delete brand (only if no items) |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/documents` | List documents (filter: type, status, search, from, to) |
| GET | `/api/v1/documents/:id` | Get document with items, payments, conversion targets |
| POST | `/api/v1/documents` | Create document |
| PUT | `/api/v1/documents/:id` | Update document (DRAFT/PENDING only) |
| DELETE | `/api/v1/documents/:id` | Delete document (DRAFT/CANCELLED, no payments) |
| PATCH | `/api/v1/documents/:id/status` | Change status (handles stock deduct/restore) |
| POST | `/api/v1/documents/:id/payments` | Record payment (invoices only) |
| POST | `/api/v1/documents/:id/convert` | Convert to another document type |

### Document Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/document-settings` | List all settings |
| PUT | `/api/v1/document-settings/:type` | Update settings for a document type |

### Payment Terms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/payment-terms` | List payment terms |
| POST | `/api/v1/payment-terms` | Create payment term |
| PUT | `/api/v1/payment-terms/:id` | Update payment term |
| DELETE | `/api/v1/payment-terms/:id` | Delete payment term |

### Stock
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stock` | List items (search, categoryId, sortBy, order, page, limit) |
| GET | `/api/v1/stock/:id` | Get single item |
| POST | `/api/v1/stock` | Create item |
| PUT | `/api/v1/stock/:id` | Update item |
| DELETE | `/api/v1/stock/:id` | Soft-delete item |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List categories with item counts |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete (only if no items) |

### Debtors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/debtors` | List customers with outstanding invoices |
| GET | `/api/v1/debtors/:id` | Get debtor detail with unpaid invoices |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/payment-log` | Payment log (filter: from, to, method, search, page) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Totals: items, invoices, revenue |
| GET | `/api/v1/dashboard/low-stock` | Items with qty ≤ 5 |
| GET | `/api/v1/dashboard/recent-invoices` | Last 10 invoices |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dreamgarage"
JWT_SECRET="your-jwt-secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@dreamgarage.my"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Dream Garage Admin"
```

## Security

- All API routes (except login and health) require JWT authentication
- All CRUD operations are branch-scoped (users can only access their branch's data)
- Stock sort fields are whitelisted to prevent field enumeration
- Invoice number generation uses database-level locking (FOR UPDATE)
- Passwords hashed with bcrypt (12 rounds)
- JWT secret required in production (server refuses to start without it)
- Soft-delete for stock items prevents orphaned document references

## Deployment

### Repository
- **GitHub**: [Aphrosidiac/dreamgarage](https://github.com/Aphrosidiac/dreamgarage)
- **Monorepo**: `frontend/` and `backend/` in one repo, deployed separately

### Frontend — Cloudflare Pages
- **Connect**: GitHub repo `Aphrosidiac/dreamgarage`
- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment**: Set `VITE_API_URL` to your backend URL

### Backend — Azure VPS
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run build
pm2 start dist/server.js --name dreamgarage-api
```
- Database: PostgreSQL on same VPS
- Domain: API subdomain (e.g., api.dreamgarage.my)
- SSL: Let's Encrypt via Certbot
- Process manager: PM2 or systemd

### Domain
- Website: dreamgarage.my → Cloudflare Pages
- API: api.dreamgarage.my → Azure VPS

## Phase 2 (Planned)

- Service date auto-reminder system (WhatsApp/SMS notification when service date arrives)
- Supplier/vendor management
- Advanced stock (reorder levels, min/max pricing, purchase tax)
- Multi-branch support (branch switching UI)
- Role-based access control (granular permissions)
- Advanced reporting & analytics (sales, stock movement, profit margins)
- E-Invoice (Malaysia MyInvois) integration

## Client

- **Company:** Dream Garage (M) Sdn Bhd
- **Address:** 22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor
- **Contact:** +60 18-207 8080
- **Referred by:** LewisGoh
