# RCS Blaster Web Panel

Web-based control panel untuk RCS Blaster dengan arsitektur cloud + local worker.

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Web Panel)                           │
│  • Dashboard UI, Login, CRUD                                    │
│  • API Routes                                                   │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ HTTPS
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                   MONGODB ATLAS (Database)                      │
│  • Users, Campaigns, Contacts, Templates, Proxies              │
│  • Task Queue, Workers                                         │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ Polling (5 detik)
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                   LOCAL PC (Worker)                             │
│  • Puppeteer Browser Automation                                 │
│  • Session Management, Campaign Execution                       │
└─────────────────────────────────────────────────────────────────┘
```

## Fitur

### Web Panel (Vercel)
- Dashboard dengan sidebar navigation
- Login/Register dengan role-based access (USER/ADMIN)
- Session management
- Campaign management dengan progress tracking
- Template editor
- Contact management dengan groups
- Proxy management
- Fingerprint browser
- Worker management
- Admin panel (user management, IP whitelist/blacklist)

### Local Worker (PC)
- Polls MongoDB untuk pending tasks
- Executes campaigns menggunakan Puppeteer
- Real-time progress update ke MongoDB
- Multi-session support
- Proxy rotation
- Rate limit handling

## Setup

### 1. MongoDB Atlas

1. Buat akun di [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster (Free tier tersedia)
3. Create database user
4. Whitelist IP (atau allow all: 0.0.0.0/0)
5. Get connection string

### 2. Web Panel (Vercel)

```bash
cd web_panel

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env dengan MongoDB connection string
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/rcs_blaster"

# Generate Prisma client
npm run db:generate

# Push schema ke MongoDB
npm run db:push

# Create super admin
curl -X POST http://localhost:3000/api/create-super-admin

# Development
npm run dev
```

### 3. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### 4. Local Worker Setup

```bash
cd worker

# Install dependencies
npm install

# Run setup wizard
npm run setup

# Ikuti instruksi untuk:
# 1. Input MongoDB URI
# 2. Generate API key
# 3. Register worker di Web Panel
```

### 5. Start Worker

```bash
cd worker
npm start
```

## Default Credentials

- **Username:** `xcl991`
- **Password:** `copolatos123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Workers
- `GET /api/workers?userId={id}` - Get workers
- `POST /api/workers` - Create worker
- `PUT /api/workers` - Update worker
- `DELETE /api/workers?id={id}` - Delete worker

### Tasks (Queue)
- `GET /api/tasks?action=poll&workerId={id}` - Worker poll
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task status

### Sessions
- `GET /api/sessions?userId={id}` - Get sessions
- `POST /api/sessions` - Create session
- `PUT /api/sessions` - Update session
- `DELETE /api/sessions?id={id}` - Delete session

### Campaigns
- `GET /api/campaigns?userId={id}` - Get campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns` - Update campaign
- `DELETE /api/campaigns?id={id}` - Delete campaign

### Templates
- `GET /api/templates?userId={id}` - Get templates
- `POST /api/templates` - Create template
- `PUT /api/templates` - Update template
- `DELETE /api/templates?id={id}` - Delete template

### Contacts
- `GET /api/contacts?userId={id}` - Get contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts` - Update contact
- `DELETE /api/contacts?id={id}` - Delete contact

### Proxies
- `GET /api/proxies?userId={id}` - Get proxies
- `POST /api/proxies` - Create proxy
- `PUT /api/proxies` - Update proxy
- `DELETE /api/proxies?id={id}` - Delete proxy

## Technology Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Database:** MongoDB Atlas + Prisma ORM
- **Worker:** Node.js, Puppeteer
- **Hosting:** Vercel (free tier)

## Flow Kerja

1. User login ke Web Panel
2. User buat Campaign (pilih template, contacts, sessions)
3. User klik "Start Campaign"
4. Web Panel create task di MongoDB (status: PENDING)
5. Local Worker polls dan ambil task
6. Worker execute campaign dengan Puppeteer
7. Worker update progress ke MongoDB
8. Web Panel tampilkan progress real-time

## Per-User Data

Setiap user memiliki data terpisah:
- Workers (PC yang terdaftar)
- Sessions (browser sessions)
- Campaigns
- Templates
- Contacts & Groups
- Proxies
- Fingerprints

Data di-isolasi dengan `userId` foreign key di setiap collection.
