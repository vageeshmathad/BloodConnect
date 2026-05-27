# ACADEMIC PROJECT REPORT

---

## PROJECT TITLE:
### **BLOODCONNECT: COORDINATE-BASED VOLUNTARY EMERGENCY BLOOD MATCHING DASHBOARD AND STOCK REPOSITORY PORTAL**

---

### **A Technical Dissertation and System Manual**
**Submitted in partial fulfillment of the requirements for the Degree of Bachelor of Technology in Computer Science & Engineering**

**Academic Year: 2026**

---

## **CONFIDENTIALITY & DISCLAIMER**
The software architecture, system database designs, REST routing blueprints, and client component files detailed in this technical monograph represent an original, medical-grade coordination platform engineered under rigorous academic standards. All simulation coordinate markers, blood inventory records, and clinic parameters utilize synthetically compiled geofenced data models centered on the Bangalore metropolitan sector for verification purposes.

---

## **TABLE OF CONTENTS**
1. **ABSTRACT & EXECUTIVE SUMMARY**
2. **CHAPTER 1: INTRODUCTION & CLINICAL PROBLEM CONTEXT**
   - 1.1 Problem Statement
   - 1.2 Project Objectives & Scope
   - 1.3 Target Audience and Use Cases
3. **CHAPTER 2: SYSTEM ARCHITECTURE & DESIGN LAYER BLUEPRINTS**
   - 2.1 Three-Tier Architecture
   - 2.2 Functional Blocks Diagram
   - 2.3 Mathematical Model: Haversine Formula for Radial Geofencing
4. **CHAPTER 3: COMPREHENSIVE TECHNOLOGY STACK**
   - 3.1 Frontend Client Stack
   - 3.2 Backend Service Stack
   - 3.3 Database Layer Strategy (Hybrid MongoDB & SQLite3 Fallback)
5. **CHAPTER 4: DATABASE SCHEMAS & CLINICAL DATA MODELING**
   - 4.1 Voluntary Donors Model Schema
   - 4.2 Institutional Blood Banks Model Schema
   - 4.3 Seeding Algorithms & Local Caching Strategies
6. **CHAPTER 5: REST API ROUTING & INTERFACE SERVICE CONTRACTS**
   - 5.1 Endpoint Blueprint Catalog
   - 5.2 API JSON Payload Contract Schema Examples
7. **CHAPTER 6: FRONTEND CONTROLLER & INTERACTIVE VIEW COMPONENT BLUEPRINTS**
   - 6.1 Interactive SVG Map Navigation, Drag-Panning, and Double-Fitted Zooming Engine
   - 6.2 Three-Step Stepped Clinical Donor Registration Wizard
   - 6.3 Real-Time Active Dispatch Radar Ticker & Sliding Logs
   - 6.4 Floating Statistics Terminal HUD Panel
   - 6.5 Asymmetric Bento Grid Features Layout
8. **CHAPTER 7: HARDWARE & SOFTWARE SPECIFICATIONS & COMPILEblueprints**
9. **CHAPTER 8: COMPREHENSIVE SCREENSHOT CATALOG & SYSTEM WALKTHROUGH**
10. **CHAPTER 9: MAJOR SOURCE CODE BLUEPRINTS LISTING**
11. **CHAPTER 10: FUTURE SCOPE & CONCLUDING STATEMENT**

---

## **1. ABSTRACT & EXECUTIVE SUMMARY**
In critical medical situations, immediate access to blood units is of paramount importance. Delayed access to blood matching often leads to severe health risks. Standard platforms rely on passive registries that do not account for physical distance, real-time donor availability, or current hospital inventories.

**BloodConnect** resolves these issues by introducing a **high-contrast, responsive, coordinate-based voluntary blood matching dashboard**. Utilizing high-precision latitude and longitude markers, BloodConnect computes instant Haversine formulas to locate matching voluntary donors and institutional repository blood banks within a customizable radial perimeter (1km - 25km) in seconds.

The system features:
- A responsive, customizable theme interface (polished to **Light Theme by default** with elegant corporate aesthetics and high-contrast slate text structures).
- An interactive, drag-pannable, zoomable SVG map canvas that renders coordinate data in real time.
- A clinical 3-step registration wizard that collects donor information, coordinates, last donation date, and medical history with strict front-end validation.
- A hybrid database setup featuring a MongoDB server with automatic local SQLite3 caching, ensuring high reliability in emergency situations.

---

## **CHAPTER 1: INTRODUCTION & CLINICAL PROBLEM CONTEXT**

### **1.1 Problem Statement**
Current blood banking networks face significant coordination issues:
1. **Lack of Geographic Integration**: Traditional systems display registries as static lists, requiring manual location validation and causing critical delays in emergency transfers.
2. **Clinical Exclusions Neglected**: Standard databases often ignore eligibility windows (such as the mandatory 3-month post-donation waiting period) and chronic conditions, risking recipient safety.
3. **Outdated Inventories**: Hospital repositories frequently fail to publish real-time stock levels, leading families to search multiple centers during critical moments.
4. **Poor Visual Hierarchy**: Existing portals often feature low-contrast text and cluttered interfaces, hindering fast decision-making.

### **1.2 Project Objectives & Scope**
The scope of the **BloodConnect** project involves the implementation of a comprehensive emergency console that addresses these issues:
- **Instant Geofencing**: Computes real-time distances between a coordinate beacon and all blood donors or banks to identify nearby matches.
- **Dynamic Active Radar Ticker**: Displays real-time matching logs, coordinate updates, and donor registrations to simulate a live response environment.
- **Clinical Validation Engine**: Restructured form step-wizard that validates donor age (18+), phone numbers (10 digits), and eligibility flags prior to database entry.
- **Professional Default Light Theme**: High-contrast Slate-800 text layouts on pure white frosted glass panels to improve legibility and visual hierarchy.

---

## **CHAPTER 2: SYSTEM ARCHITECTURE & DESIGN LAYER BLUEPRINTS**

### **2.1 Three-Tier Architecture**
BloodConnect is structured as a professional three-tier web application, separating concerns to maximize security, scalability, and speed:

```
    +-------------------------------------------------------------+
    |                     PRESENTATION LAYER                      |
    |  - React 19 Client UI                                       |
    |  - High-Contrast Light Theme (with Dark Toggle)             |
    |  - Interactive Vector SVG Drag-Panning Map Canvas           |
    |  - Dynamic Ticking Dispatch Ticker Console                  |
    +------------------------------+------------------------------+
                                   |
                                   | HTTP REST (JSON)
                                   v
    +-------------------------------------------------------------+
    |                    BUSINESS LOGIC LAYER                     |
    |  - Express.js API Gateway (Port 5000)                       |
    |  - Haversine Coordinate Distance Calculation Algorithm       |
    |  - Clinical Input Validation & User Authentication Controllers|
    +------------------------------+------------------------------+
                                   |
                                   | Mongoose ODM / SQLite3 Driver
                                   v
    +-------------------------------------------------------------+
    |                     DATA STORAGE LAYER                      |
    |  - MongoDB Atlas Cloud Service / Local MongoDB Server       |
    |  - SQLite3 Relational Engine Backup Failover Cache          |
    +-------------------------------------------------------------+
```

### **2.3 Mathematical Model: Haversine Formula for Radial Geofencing**
To calculate the precise distance over the Earth's curved surface between the emergency requester’s coordinate beacon $P(\text{lat}_1, \text{lng}_1)$ and a registered blood donor $D(\text{lat}_2, \text{lng}_2)$, the backend service executes the **Haversine Equation**:

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lng}}{2}\right)}\right)$$

Where:
- $r$ is the mean radius of the Earth ($6371 \text{ km}$).
- $\Delta\text{lat} = \text{lat}_2 - \text{lat}_1$ (converted to radians).
- $\Delta\text{lng} = \text{lng}_2 - \text{lng}_1$ (converted to radians).

---

## **CHAPTER 3: COMPREHENSIVE TECHNOLOGY STACK**

### **3.1 Frontend Client Stack**
- **React 19**: Powered by functional components, React Hooks (`useState`, `useEffect`, `useRef`, `useMemo`), and high-performance virtual DOM diffing.
- **Vite 8.0**: Fast build tool configured with hot module replacement (HMR) for rapid feedback.
- **Tailwind CSS v4**: Utilizes standard, high-contrast style directives for theme integration.
- **Framer Motion**: Powering smooth transitions and slide-in tickers.
- **Lucide Icons**: Standard clinical and interactive iconography (`Landmark`, `User`, `Phone`, `Heart`, `Target`).

### **3.2 Backend Service Stack**
- **Node.js**: Asynchronous runtime environment.
- **Express.js**: REST API router handling registration payloads and geofence queries.

### **3.3 Database Layer Strategy**
To guarantee zero system downtime during emergencies, BloodConnect utilizes a **hybrid database strategy**:
- **MongoDB**: The primary database, utilizing Mongoose schemas to store clinical records.
- **SQLite3 Relational Engine Backup**: If MongoDB is unavailable on startup, the system automatically falls back to an SQLite3 local database file (`server/bloodfinder.db`), ensuring continuous service.

---

## **CHAPTER 4: DATABASE SCHEMAS & CLINICAL DATA MODELING**

### **4.1 Voluntary Donors Model Schema**
```javascript
const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  lastDonatedDate: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  eligibilityFlags: { type: [String], default: [] },
  consentChecked: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true }
});
```

---

## **CHAPTER 5: REST API ROUTING & INTERFACE SERVICE CONTRACTS**

### **5.1 Endpoint Blueprint Catalog**
| Verb | Route | Payload Parameters | Description |
|---|---|---|---|
| **GET** | `/` | None | Health status, server uptime, and active database mode check. |
| **GET** | `/api/blood/search` | `bloodGroup`, `radius`, `latitude`, `longitude` | Computes radial geofencing matches within seconds. |
| **POST**| `/api/donors/register`| Comprehensive clinical donor details JSON | Validates age (18+), phone, and email prior to registration. |
| **POST**| `/api/donors/login` | `email`, `password` | Authenticates donors to manage availability. |
| **POST**| `/api/donors/toggle-availability`| `email`, `isAvailable` | Updates availability status. |
| **POST**| `/api/bloodbanks/register` | Institutional address and coordinates | Adds new blood bank. |
| **POST**| `/api/bloodbanks/:id/inventory`| JSON blood stock counts | Updates inventory quantities. |

---

## **CHAPTER 6: FRONTEND CONTROLLER & INTERACTIVE VIEW COMPONENT BLUEPRINTS**

### **6.1 Interactive SVG Map Engine**
The geofenced SVG map (`InteractiveMap.jsx`) provides an intuitive visual interface:
1. **Mouse Drag Panning**: Captures client clicks, scaling movement vector calculations proportionally with the active zoom level.
2. **Floating Zoom Controls**: Custom `+` and `-` glass panels scale views from `1.0x` up to `6.0x` while maintaining crisp element lines using vector scaling.
3. **Floating Recenter Target**: Instantly resets camera coordinates and zooms back to the request beacon.

### **6.2 Three-Step Clinical Wizard**
Designed to prevent form fatigue, the registration wizard organizes data into three logical steps:
- **Step 1: Core Donor Profile**: Collects Name, Age, Blood Group, and Phone, validating age and phone number length immediately.
- **Step 2: Location & Login Credentials**: Collects Address, Coordinates, Email, and Password.
- **Step 3: Health & Consent**: Collects Last Donation Date, Medical History, and Eligibility Checks, requiring explicit emergency contact consent.

---

## **CHAPTER 8: COMPREHENSIVE SCREENSHOT CATALOG & SYSTEM WALKTHROUGH**

This section catalogues the primary visual components of the platform, referencing the high-resolution screenshots saved in the `/screenshots/` folder.

---

### **8.1 Professional Default Light Theme Hero & Dispatch HUD**
* **Screenshot Reference**: `screenshots/media__1779869333651.png`
* **Visual Structure**: Shows the premium responsive header displaying the BloodConnect brand logo and access options.
* **Layout Detail**: The main command section utilizes a subtle gradient (`from-slate-50 to-white`) with high-contrast Slate-900 typography, ensuring comfortable reading.
* **Component Focus**: The active dispatcher stream on the right displays real-time matching logs inside clean, slate-bordered cards.

![Light Theme Hero Dashboard](E:\eval ai\screenshots\media__1779869333651.png)

---

### **8.2 Stats Terminal HUD Overlay**
* **Screenshot Reference**: `screenshots/media__1779869342375.png`
* **Visual Structure**: Shows four statistics indicators overlaid below the hero section.
* **Layout Detail**: Card surfaces feature pure white backdrops with vibrant red top borders. Metrics are shown in a prominent font with descriptions styled in Slate-600.

![High-Contrast Stats Terminal](E:\eval ai\screenshots\media__1779869342375.png)

---

### **8.3 Bento-Grid Feature Layout**
* **Screenshot Reference**: `screenshots/media__1779869393855.png`
* **Visual Structure**: Displays the platform pillars arranged in an asymmetric grid.
* **Layout Detail**: Built with modern rounded borders and subtle gradients, this section organizes coordinates, geofences, presets, and route dispatches logically.

![Asymmetric Bento Grid Section](E:\eval ai\screenshots\media__1779869393855.png)

---

### **8.4 Stepped Registration Wizard: Step 1 (Profile Creation)**
* **Screenshot Reference**: `screenshots/media__1779870307794.png`
* **Visual Structure**: Shows Step 1 of the voluntary donor wizard.
* **Layout Detail**: Collects critical donor details (Full Name, Age, Blood Group, Phone) with strict validations to identify errors immediately.

![Wizard Step 1 Form Layout](E:\eval ai\screenshots\media__1779870307794.png)

---

### **8.5 Registry Wizard: Step 3 (Eligibility Screening & Consent)**
* **Screenshot Reference**: `screenshots/media__1779870830911.png`
* **Visual Structure**: Shows the health declaration section of the wizard.
* **Layout Detail**: Displays the collapsible **Eligibility Questionnaire** with clear checkboxes, last donation date, notes, and a mandatory consent switch.

![Wizard Step 3 Declarations](E:\eval ai\screenshots\media__1779870830911.png)

---

### **8.6 Search Dashboard & SVG Map Panel**
* **Screenshot Reference**: `screenshots/media__1779870755853.png`
* **Visual Structure**: Shows the dashboard after a coordinate search has been triggered.
* **Layout Detail**: Plotted donors (green) and blood banks (red) are marked clearly on the SVG map alongside their radial distance ranges.

![Search Map Interface Panel](E:\eval ai\screenshots\media__1779870755853.png)

---

## **CHAPTER 10: FUTURE SCOPE & CONCLUDING STATEMENT**
The coordinate-based **BloodConnect** platform successfully implements real-time geofenced matching, clinical validation, and persistent storage in a highly professional, high-contrast interface.

Future enhancements include:
1. **Automated SMS Gateways**: Instantly dispatching coordinates and donor phone numbers via SMS during high-risk events.
2. **Real-time Mobile Location Tracking**: Tracking nearby donors dynamically to account for traffic conditions.
3. **Drone Route Matching**: Suggesting optimal flight paths for blood unit delivery to avoid city delays.

This concludes the engineering report for the BloodConnect platform.
