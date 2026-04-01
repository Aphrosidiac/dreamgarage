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
| Document Export | html2canvas |
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
│       │   ├── auth/              # Login, profile
│       │   ├── documents/         # Full document system (CRUD, payments, conversions)
│       │   ├── document-settings/ # Per-type numbering, template, defaults
│       │   ├── payment-terms/     # Payment term management
│       │   ├── stock/             # Stock items CRUD
│       │   ├── categories/        # Stock categories CRUD
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
│       │   ├── stock/             # StockList, StockCreate, StockEdit
│       │   ├── documents/         # DocumentList, DocumentForm, DocumentView, DocumentSettings
│       │   └── website/           # Home, About, Services, Contact
│       ├── components/base/       # BaseButton, BaseInput, BaseSelect, BaseModal, BaseTable, etc.
│       ├── layouts/               # DashboardLayout, PublicLayout
│       ├── composables/           # useToast
│       ├── lib/api.ts             # Axios instance with JWT interceptor
│       └── types/index.ts         # TypeScript interfaces
└── README.md
```

## Database Schema

### Models (10 tables)

| Model | Description |
|-------|-------------|
| **Branch** | Workshop locations (multi-branch ready) |
| **User** | Staff accounts with ADMIN/STAFF roles |
| **StockCategory** | Inventory categories (Tyres, Engine Oil, Brake Parts, etc.) |
| **StockItem** | Inventory items with code, price, quantity |
| **Document** | Quotations, invoices, receipts, delivery orders |
| **DocumentItem** | Line items on documents with price, discount, tax |
| **Payment** | Payment records linked to invoices |
| **DocumentSetting** | Per-type numbering config, template, defaults |
| **PaymentTerm** | Configurable payment terms (Net 7, Net 30, etc.) |

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
- Invoice DRAFT → OUTSTANDING: stock auto-deducted for items with stockItemId
- Invoice → VOID: stock auto-restored
- Quotations, receipts, delivery orders do NOT affect stock
- Custom items (no stockItemId) skip stock deduction

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
- 9 default categories (Tyres, Engine Oil, Brake Parts, Filters, Battery, etc.)
- Search by item code or description
- Filter by category
- Pagination with configurable page size
- Soft-delete (isActive flag) to preserve invoice references
- Branch-scoped (all queries filter by user's branchId)

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

### Build
```bash
cd frontend && npm run build    # outputs to frontend/dist/
cd backend && npm run build     # outputs to backend/dist/
```

### Production (Azure VPS)
- Backend: PM2 or systemd service running `node dist/server.js`
- Frontend: Nginx serving `frontend/dist/` with SPA fallback
- Database: PostgreSQL on same VPS or managed service
- Domain: dreamgarage.my
- SSL: Let's Encrypt via Certbot

## Phase 2 (Planned)

- Customer management with vehicle history
- Supplier/vendor management
- Advanced stock (reorder levels, min/max pricing, purchase tax)
- Multi-branch support (branch switching UI)
- Role-based access control (granular permissions)
- Reporting & analytics (sales, stock movement, profit margins)
- E-Invoice (Malaysia MyInvois) integration

## Client

- **Company:** Dream Garage (M) Sdn Bhd
- **Address:** 22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor
- **Contact:** +60 18-207 8080
- **Referred by:** LewisGoh
