# Dream Garage (M) Sdn Bhd

Full-stack car workshop management system: documents, stock, purchasing, customers, staff, AI assistant, and company website.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Vite + Tailwind CSS v4 + Pinia |
| Backend | Fastify + TypeScript (ESM) |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Cache / Rate Limit | Redis 7 |
| Auth | JWT (@fastify/jwt + bcryptjs) |
| AI Assistant | Claude Opus 4.6 (Anthropic SDK, tool use) |
| Build | tsup (backend), Vite (frontend) |
| Process Manager | PM2 (cluster mode) |
| Theme | Black + Yellow Gold (#FFD700) |

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (for Postgres + Redis) or local installs

### Services (Docker)
```bash
docker run -d --name dreamgarage-db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dreamgarage -p 5432:5432 postgres:16-alpine

docker run -d --name dreamgarage-redis -p 6379:6379 redis:7-alpine
```

### Backend
```bash
cd backend
cp .env.example .env          # edit DB, Redis, JWT, Anthropic key
npm install
npx prisma db push            # create tables
npm run db:seed               # branch, admin, categories, settings
npx tsx prisma/seed-demo.ts   # optional: rich demo data
npm run dev                   # http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Default Login
- **Email:** admin@dreamgarage.my
- **Password:** admin123

## Project Structure

```
DreamGarage/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database models
│   │   ├── seed.ts               # Base seed (branch, admin, settings)
│   │   └── seed-demo.ts          # Rich demo data (customers, docs, stock)
│   └── src/
│       ├── server.ts             # Fastify app entry
│       ├── config/env.ts
│       ├── plugins/
│       │   ├── auth.ts           # JWT
│       │   ├── prisma.ts
│       │   ├── redis.ts          # Redis client + rate limit store
│       │   ├── cache-invalidation.ts
│       │   ├── audit-hook.ts     # Global audit logging
│       │   └── error-handler.ts
│       ├── middleware/
│       │   └── authorize.ts      # requireRole(...)
│       ├── modules/
│       │   ├── auth/             # Login, JWT, LOGIN audit
│       │   ├── profile/
│       │   ├── staff/            # Unified user/staff CRUD (replaces workers)
│       │   ├── documents/        # Quotations, invoices, receipts, delivery orders
│       │   ├── document-settings/
│       │   ├── payment-terms/
│       │   ├── stock/
│       │   ├── categories/
│       │   ├── brands/
│       │   ├── tyre-dots/        # DOT batch tracking for tyres
│       │   ├── customers/
│       │   ├── debtors/
│       │   ├── suppliers/        # Supplier directory
│       │   ├── purchase-invoices/
│       │   ├── supplier-payments/# A/P payments
│       │   ├── assistant/        # DG Assistant (Claude + tool use)
│       │   ├── audit/            # Admin audit log viewer
│       │   ├── reports/          # Payment log
│       │   └── dashboard/
│       └── utils/
├── frontend/
│   └── src/
│       ├── main.ts
│       ├── router/index.ts
│       ├── stores/               # Pinia (auth, assistant, etc.)
│       ├── pages/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── stock/
│       │   ├── staff/            # StaffListPage (unified)
│       │   ├── customers/
│       │   ├── documents/
│       │   ├── debtors/
│       │   ├── suppliers/
│       │   ├── purchase-invoices/
│       │   ├── supplier-payments/
│       │   ├── tyre/             # TyreDashboardPage
│       │   ├── audit/            # AuditLogPage (admin)
│       │   ├── reports/
│       │   └── website/          # Home, About, Services, Contact
│       ├── components/
│       │   ├── AssistantWidget.vue
│       │   └── base/             # BaseButton, BaseTable, BasePagination, etc.
│       ├── layouts/              # DashboardLayout, PublicLayout
│       └── lib/api.ts
└── README.md
```

## Database Schema

### Models

| Model | Description |
|-------|-------------|
| **Branch** | Workshop locations (multi-branch ready) |
| **User** | Unified staff + system accounts (ADMIN / MANAGER / WORKER) |
| **StockCategory** | Inventory categories with sort order |
| **Brand** | Brands under categories |
| **StockItem** | Inventory items with code, price, qty, hold, tyre flag |
| **TyreDOT** | DOT batch codes per tyre stock item |
| **StockHistory** | Audit trail for stock movements (IN/OUT/HOLD/RELEASE) |
| **Document** | Quotations, invoices, receipts, delivery orders |
| **DocumentItem** | Line items with price, discount, tax, service date |
| **Payment** | Payment records linked to invoices |
| **DocumentSetting** | Per-type numbering config + template |
| **PaymentTerm** | Configurable payment terms |
| **Customer** | Customers |
| **Vehicle** | Vehicles per customer |
| **Supplier** | Supplier / vendor directory |
| **PurchaseInvoice** | Purchase invoices from suppliers |
| **PurchaseInvoiceItem** | Purchase line items |
| **PurchaseAttachment** | File attachments for purchase invoices |
| **SupplierPayment** | A/P payments to suppliers |
| **AuditLog** | Branch-scoped activity trail (requests, logins, tool calls) |

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

**Auto-Numbering:**
- Format: `{PREFIX}{YY}-{PADDED_NUMBER}` (e.g., INV26-0001)
- Configurable prefix, year format, padding, separator per document type
- Race-condition safe (FOR UPDATE lock), resets yearly

**Stock Integration:**
- Invoice DRAFT: stock placed on hold
- DRAFT → OUTSTANDING: hold released + stock deducted
- VOID / cancelled: stock auto-restored
- Quotations, receipts, delivery orders do NOT affect stock
- Full audit trail via StockHistory

**Payment System:**
- Record payments against invoices
- Methods: Cash, Bank Transfer, Cheque, Credit Card, E-Wallet, TNG, Boost
- Auto-updates invoice status: OUTSTANDING → PARTIAL → PAID

### Stock Management
- Full CRUD, 9 default categories, brand hierarchy
- DOT code tracking for tyres (with dedicated Tyre Dashboard)
- Stock hold system (draft invoices reserve stock)
- Country of origin with flag emoji display
- Search, filter, pagination
- Soft-delete (isActive) to preserve invoice references
- Branch-scoped

### Customers & Vehicles
- Customer CRUD with universal search (name, phone, email, plate, model)
- Multiple vehicles per customer, default vehicle selection
- Auto-created from Take Order page when no customer is selected
- Duplicate detection by phone/plate

### Staff (Unified User Model)
- Single `User` table handles both system logins and workshop staff
- Roles: ADMIN, MANAGER, WORKER
- `jobTitle` captures role (Foreman, Mechanic, Salesman, etc.)
- Admin-only staff management page with create/edit/password-reset

### Take Order
Streamlined single-page order entry that manages the customer database automatically. Quick search, vehicle switcher, foreman dropdown, stock search per line. Auto-creates customer/vehicle with duplicate detection; creates draft invoice.

### Debtor Tracking
Unpaid invoices grouped by customer, sorted by total owed. Detail view shows all unpaid invoices with payment history.

### Purchasing (A/P)
- **Suppliers** — directory with contact details
- **Purchase Invoices** — status flow: ON_HOLD → VERIFIED → FINALIZED, with line items + attachments
- **Supplier Payments** — A/P payment log against suppliers/invoices

### Payment Log (A/R)
Daily/date-range log, method tabs, search, print template (white document-style), export all matching payments.

### DG Assistant (AI)
Floating chat widget powered by Claude Opus 4.6 with tool use. 9 read-only tools query live data: dashboard stats, documents, payments, debtors, stock, purchase invoices, suppliers, customers, staff. Branch-scoped automatically. All tool calls logged to AuditLog.

### Audit Logs (Admin)
Branch-scoped activity trail. Global hook captures every non-GET `/api/v1/*` request (method, path, status, user, IP). Explicit logging for LOGIN, LOGIN_FAILED, and ASSISTANT_TOOL. Filterable admin page at `/app/audit` with changes drawer.

### Dashboard
Totals (stock, invoices today/month, revenue today/month), low stock alerts, recent invoices.

### Company Website
Public-facing Home, About, Services, Contact. Black + gold theme, responsive, WhatsApp + Google Maps integration.

### Profile & Settings
Edit name/email, change password, admin-only branch details (name, address, phone, email, SSM, bank).

### Authentication
- JWT (24h expiry), bcrypt (12 rounds)
- Route guards on frontend, axios interceptor for token
- 401 → auto-logout

## API Reference

### Auth
| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/auth/me` |

### Profile
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/profile` |
| GET | `/api/v1/profile/users` |
| PUT | `/api/v1/profile` |
| PUT | `/api/v1/profile/password` |
| PUT | `/api/v1/profile/branch` (admin) |

### Staff (admin)
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/staff` |
| POST | `/api/v1/staff` |
| PUT | `/api/v1/staff/:id` |
| PUT | `/api/v1/staff/:id/password` |
| DELETE | `/api/v1/staff/:id` |

### Documents
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/documents` (type, status, search, from, to) |
| GET | `/api/v1/documents/:id` |
| POST | `/api/v1/documents` |
| PUT | `/api/v1/documents/:id` (DRAFT/PENDING only) |
| DELETE | `/api/v1/documents/:id` |
| PATCH | `/api/v1/documents/:id/status` |
| POST | `/api/v1/documents/:id/payments` |
| POST | `/api/v1/documents/:id/convert` |

### Stock / Categories / Brands / Tyre DOTs
| Method | Endpoint |
|--------|----------|
| GET/POST/PUT/DELETE | `/api/v1/stock` + `/:id` |
| GET/POST/PUT/DELETE | `/api/v1/categories` + `/:id` |
| GET/POST/PUT/DELETE | `/api/v1/brands` + `/:id` |
| GET/POST/PUT/DELETE | `/api/v1/tyre-dots` |
| GET | `/api/v1/tyre-stock` |

### Customers & Debtors
| Method | Endpoint |
|--------|----------|
| GET/POST/PUT | `/api/v1/customers` |
| GET | `/api/v1/debtors` |
| GET | `/api/v1/debtors/:id` |

### Purchasing
| Method | Endpoint |
|--------|----------|
| GET/POST/PUT/DELETE | `/api/v1/suppliers` |
| GET/POST/PUT/DELETE | `/api/v1/purchase-invoices` |
| GET/POST | `/api/v1/supplier-payments` |

### Assistant
| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/assistant/chat` |

### Audit (admin)
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/audit` (entity, action, dateFrom, dateTo, search, page) |

### Reports / Dashboard / Health
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/reports/payment-log` |
| GET | `/api/v1/dashboard/stats` |
| GET | `/api/v1/dashboard/low-stock` |
| GET | `/api/v1/dashboard/recent-invoices` |
| GET | `/api/health` |

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dreamgarage"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="your-jwt-secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@dreamgarage.my"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Dream Garage Admin"
ANTHROPIC_API_KEY="sk-ant-..."   # for DG Assistant
```

## Security

- All API routes (except login + health) require JWT authentication
- All CRUD operations are branch-scoped
- Admin-only routes guarded via `requireRole('ADMIN')`
- Stock sort fields whitelisted to prevent field enumeration
- Invoice numbering uses row-level locking (FOR UPDATE)
- Passwords hashed with bcrypt (12 rounds)
- JWT secret required in production (server refuses to start without it)
- Rate limiting via Redis-backed `@fastify/rate-limit` (100 req/min default)
- DG Assistant tools are read-only by construction (no write tool exists)
- Audit trail captures every mutation + auth + assistant tool call

## Deployment (Production)

Live on **Tencent Cloud VPS** (Ubuntu 24.04, `43.134.29.203`).

### Architecture
- `dreamgarage.my` → Nginx serves website from `frontend/dist/`
- `app.dreamgarage.my` → Nginx serves app + proxies `/api/*` to port 3000
- PM2 cluster mode running `dreamgarage-api`
- PostgreSQL 16 + Redis 7 on same VPS
- Let's Encrypt SSL (auto-renew)

### Deploy Updates
```bash
ssh ubuntu@43.134.29.203
cd /home/ubuntu/DreamGarage && git pull

# Backend:
cd backend && npm install && npm run build && pm2 restart dreamgarage-api

# Frontend:
cd frontend && npm install && npm run build

# Schema changes:
cd backend && npx prisma db push && npx prisma generate && npm run build && pm2 restart dreamgarage-api
```

### Repository
- **GitHub**: [Aphrosidiac/dreamgarage](https://github.com/Aphrosidiac/gm)
- **Monorepo**: `frontend/` and `backend/` in one repo

## Roadmap

- Service date auto-reminder (WhatsApp/SMS notification)
- Advanced reporting & analytics (sales, stock movement, profit margins)
- E-Invoice (Malaysia MyInvois) integration
- Multi-branch UI (branch switcher)
- Granular RBAC beyond ADMIN/MANAGER/WORKER
- Per-field diff capture in audit logs (before/after on key updates)

## Client

- **Company:** Dream Garage (M) Sdn Bhd
- **Address:** 22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor
- **Contact:** +60 18-207 8080
- **Referred by:** LewisGoh
