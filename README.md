# FoodLink Platform — Zero Food Waste, Zero Hunger

FoodLink is a production-grade full-stack food redistribution platform built to connect **Donors** (restaurants, hotels, events, households), **Receivers** (NGOs, orphanages, shelters, community centers), **Volunteers** (delivery taskforce), and **Admins** (central platform operators).

---

## 🌟 Key Features & Highlights

- **4 Dedicated Portals**:
  - 👑 **Admin Control Center**: KPI metrics, user directory, verification/suspension controls, all listings oversight, volunteer task pipeline, system settings, and an explicit **"View / Act as Role"** preview mode.
  - 🍲 **Donor Portal**: Create food donations with preparation & expiry date validation, storage temp, dietary tags, hygiene declaration, address & map links, listing cancellation, and claim tracking.
  - 🤝 **Receiver Portal**: Search & filter available food by city, category, or donor. Claim food to generate secure **Verification Claim Codes** (`FL-CLM-XXXX`). Strict data isolation ensures receivers view only their own claims.
  - 🚴 **Volunteer Portal**: Step-by-step delivery lifecycle controller (`ACCEPTED` &rarr; `PICKUP_IN_PROGRESS` &rarr; `PICKED_UP` &rarr; `DELIVERY_IN_PROGRESS` &rarr; `COMPLETED`) with claim code verification upon handover.
- **15 Supported Languages**:
  English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Urdu (اردو), Odia (ଓଡ଼ିଆ), Assamese (অসমীয়া), Spanish (Español), and French (Français).
- **6 Theme Color Presets + Light/Dark Modes**:
  Food Green, Ocean Blue, Royal Purple, Sunset, Teal, and Midnight.
- **Real RBAC Security & Audit Trails**:
  bcrypt password hashing, JWT session authorization, suspended user blocking, and automated immutable audit logging for all critical operations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS with dynamic CSS variables, React Router v6, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS, dotenv.
- **Database Abstraction**: Pure TypeScript thread-safe atomic JSON file database engine (`data/foodlink_db.json`). Clean repository interface ready to connect to Supabase, PostgreSQL, Firebase, or Google Sheets in production without modifying frontend code.

---

## 🔑 Development Seed Accounts

The platform comes preloaded with realistic development seed data. Default password for all seed accounts is `FoodLink@2026`.

| Role | Name / Entity | Email | Default Password |
| :--- | :--- | :--- | :--- |
| **ADMIN** | System Administrator | `admin@foodlink.org` | `FoodLink@2026` |
| **DONOR** | Annapurna Spices & Catering | `donor.spice@foodlink.org` | `FoodLink@2026` |
| **DONOR** | Grand Horizon Hotel | `donor.green@foodlink.org` | `FoodLink@2026` |
| **RECEIVER** | Hope Orphanage & Shelter | `receiver.hope@foodlink.org` | `FoodLink@2026` |
| **RECEIVER** | Sneha Community Kitchen | `receiver.care@foodlink.org` | `FoodLink@2026` |
| **VOLUNTEER** | Rahul Sharma | `volunteer.rahul@foodlink.org` | `FoodLink@2026` |
| **VOLUNTEER** | Priya Patel | `volunteer.priya@foodlink.org` | `FoodLink@2026` |

*Note: You can also use the **Quick Demo Sign In (1-Click)** button on the login screen for instant evaluator testing.*

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Run Development Server (Backend API + Frontend Vite)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📋 Role Permission Matrix

| Action / Resource | Admin | Donor | Receiver | Volunteer |
| :--- | :---: | :---: | :---: | :---: |
| Access Admin Center & System Settings | ✅ | ❌ | ❌ | ❌ |
| Verify / Suspend User Accounts | ✅ | ❌ | ❌ | ❌ |
| View System Audit Logs | ✅ | ❌ | ❌ | ❌ |
| Create Food Donation Listing | ✅ | ✅ | ❌ | ❌ |
| View / Cancel Own Active Listings | ✅ | ✅ | ❌ | ❌ |
| Browse & Search Available Food | ✅ | ❌ | ✅ | ❌ |
| Claim Surplus Food & Get Claim Code | ✅ | ❌ | ✅ | ❌ |
| View Own Claims (Private) | ✅ | ❌ | ✅ | ❌ |
| Accept Delivery Task & Update Progress | ✅ | ❌ | ❌ | ✅ |
| Complete Delivery with Verification Code | ✅ | ❌ | ❌ | ✅ |

---

## 📄 License & Verification

FoodLink is open source under the MIT License. Fully tested and verified. See [`TEST_REPORT.md`](file:///c:/Users/hp/OneDrive/Desktop/Food%20Link/TEST_REPORT.md) for full test details.
