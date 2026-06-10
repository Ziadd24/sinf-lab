# SINF-VET System - Option 1 Implementation Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQLite (included)

### Installation & Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Set Up Environment Variables
```bash
cp .env .env.local
# Edit .env.local with your configuration
```

**Required Environment Variables:**
```
DATABASE_URL=file:/path/to/db/custom.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### 3. Set Up Database

**Run Prisma migrations:**
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npx prisma db seed    # Seed with test data and default users
```

#### 4. Start Development Server
```bash
npm run dev
```

Access the app at: http://localhost:3000/login

---

## 👥 Default Test Accounts

After seeding, use these credentials:

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Admin** | admin@lab.sa | admin123 | User management, system settings |
| **Doctor** | doctor1@lab.sa | admin123 | Result approval, clinical review |
| **Technician** | tech1@lab.sa | admin123 | Result entry, sample processing |

⚠️ **Change these passwords in production!**

---

## 📋 What's Included in Option 1

### ✅ Core Features Implemented

1. **User Authentication & Authorization**
   - Login system with NextAuth
   - Role-based access control (DOCTOR, TECHNICIAN, ADMIN)
   - Session management
   - Middleware route protection

2. **Audit Trail**
   - All create/update/approve actions logged
   - Tracks: who, what, when, old/new values
   - Audit history view on sample results

3. **Result Validation**
   - Auto-detection of panic values
   - Duplicate test prevention
   - Invalid result rejection
   - Warning system for out-of-range values

4. **Lab Comments**
   - Doctors can add interpretation notes to results
   - Comments visible to all users
   - Searchable and filterable

5. **Doctor Dashboard**
   - Today's sample count
   - Pending approvals list
   - Performance metrics (avg TAT)
   - Quick action buttons

6. **Role-Based UI**
   - Doctor: See approvals, clinical features
   - Technician: Enter results, process samples
   - Admin: User management, system settings

---

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based sessions (24-hour expiry)
- ✅ Route middleware protection
- ✅ Role validation on all sensitive endpoints
- ✅ Audit logging of all changes

---

## 🗄️ Database Schema Changes

### New Models

**User**
```prisma
model User {
  id       String
  email    String (unique)
  password String (hashed)
  fullName String
  fullNameAr String
  role     String (DOCTOR, TECHNICIAN, ADMIN)
  active   Boolean
  auditLogs AuditLog[]
}
```

**AuditLog**
```prisma
model AuditLog {
  id        String
  userId    String → User
  action    String (create, update, delete, approve)
  tableName String
  recordId  String
  oldValue  JSON (optional)
  newValue  JSON (optional)
  createdAt DateTime
}
```

**ValidationRule**
```prisma
model ValidationRule {
  id                String
  catalogId         String → TestCatalog (unique)
  minValue          Float
  maxValue          Float
  panicLowValue     Float
  panicHighValue    Float
  allowDuplicateWithin Int (hours)
}
```

### Extended Models

**SampleResult** (added fields)
```prisma
  labComments    String?      // Doctor interpretation
  approvedBy     String?      // User ID of approver
  approvedAt     DateTime?    // Approval timestamp
```

**TestCatalog** (added relation)
```prisma
  validationRule ValidationRule?
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

### Results (With Validation)
- `GET /api/results` - List results (with filters)
- `POST /api/results` - Create result (validates value)
- `PUT /api/results/[id]` - Update/Approve result (logs audit)

### Audit Trail
- `GET /api/audit?tableName=X&recordId=Y` - Get audit history

---

## 📊 Dashboard Features

### For All Users
- ✅ Today's samples count
- ✅ In-progress samples
- ✅ Average turnaround time
- ✅ Recent activity feed

### For Doctors (Additional)
- ✅ Pending approvals count
- ✅ Pending approvals list
- ✅ One-click approve workflow
- ✅ Urgent samples highlighted

### For Admin (Additional)
- ✅ User management panel
- ✅ System statistics
- ✅ Audit log viewer

---

## 🧪 Testing the System

### Test Workflow

1. **Login as Technician**
   - Go to http://localhost:3000/login
   - Email: tech1@lab.sa | Password: admin123
   - Process samples and enter results

2. **Login as Doctor**
   - Email: doctor1@lab.sa | Password: admin123
   - View pending approvals on dashboard
   - Review results with comments
   - Approve or reject

3. **Login as Admin**
   - Email: admin@lab.sa | Password: admin123
   - Go to admin panel
   - Create/manage users
   - View audit logs

---

## 📝 Common Tasks

### Create a New User
```bash
# Via API
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor2@lab.sa",
    "password": "securepass123",
    "fullName": "Dr. Mohammed",
    "fullNameAr": "د. محمد",
    "role": "DOCTOR"
  }'
```

### View Audit Trail
- Navigate to any sample/result
- Click "Audit History" tab
- See all changes with timestamps and user info

### Set Validation Rules
- Edit TestCatalog
- Add minValue, maxValue, panicLowValue, panicHighValue
- System auto-validates future results

---

## 🐛 Troubleshooting

### "Unauthorized" on API calls
- Check session is valid: `GET /api/auth/session`
- Verify role has permission
- Check NEXTAUTH_SECRET is set correctly

### Results not being created
- Check browser console for validation errors
- Verify result value is numeric
- Check if test code exists in catalog

### Audit logs not appearing
- Ensure user is authenticated
- Check database permissions
- Verify AuditLog table exists

### Password hash issues
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Reseed: `npx prisma db seed`

---

## 📈 Next Steps (Future Phases)

**Phase 2 - QC Module** (if needed)
- Reagent expiry tracking
- Daily QC checks
- Calibration logs

**Phase 3 - Advanced Analytics**
- Trend analysis
- Performance dashboards
- Compliance reports

**Phase 4 - Integration**
- HL7/LIMS connectors
- EHR sync
- Clinic system integration

---

## 📞 Support

For issues or questions:
1. Check the audit logs (system records everything)
2. Review browser console for errors
3. Check server logs for backend errors
4. Verify all env variables are set correctly

---

## 🔑 Key Files

**Auth & Security**
- `src/lib/auth.ts` - Authentication config
- `src/middleware.ts` - Route protection
- `src/app/login/page.tsx` - Login UI

**Core Logic**
- `src/lib/audit.ts` - Audit logging
- `src/lib/validation.ts` - Result validation
- `src/app/api/results/route.ts` - Result endpoints

**UI Components**
- `src/components/lab-dashboard.tsx` - Doctor dashboard
- `src/components/app-layout.tsx` - Main layout (needs auth update)

**Database**
- `prisma/schema.prisma` - Data models
- `prisma/seed.ts` - Test data

---

**System Ready for Lab Doctors! ✅**
