# Maharashtra Sugarcane Supply Chain Tracker (`MahaCaneGrid`) — Java Mini Project

A full-stack, enterprise-grade Java web application tailored to the **Maharashtra Sugarcane & Biofuel Ecosystem**. Developed in pure **Java (OpenJDK 17/21/25)** with an embedded zero-dependency HTTP server, a layered MVC/Service-Repository architecture, and a modern responsive user interface for Farmers, Logistics Transporters, and Sugar Mill Chemists.

---

## ☕ Java Architecture & OOP Design

The core computation, state management, and algorithmic processing have been fully implemented in Java:

```text
maharashtra_sugarcane_tracker/
├── pom.xml                                      # Standard Maven Build Configuration
├── run.bat                                      # 1-Click Windows Command Prompt launcher
├── run.ps1                                      # 1-Click PowerShell launcher
├── README.md                                    # Comprehensive Documentation
├── index.html                                   # Web App entry point (Served by Java Backend)
│
├── src/main/java/com/mahacane/
│   ├── Main.java                                # Application Entry Point, Embedded HTTP Server & REST Router
│   │
│   ├── model/                                   # Domain Entities & Data Transfer Objects (POJOs)
│   │   ├── User.java                            # RBAC User profile (Farmer / Logistics / Mill Chemist)
│   │   ├── Trip.java                            # Cane harvest & dispatch logistics trip request
│   │   ├── Bid.java                             # Carrier transportation quote & vehicle specs
│   │   ├── WeighbridgeBatch.java                # Gross/Tare weight receipt, Pol/Brix & Net FRP payout
│   │   ├── MassBalanceRecord.java               # Yearly Cane Crushed, Sugar, Ethanol, Bagasse & Molasses
│   │   ├── SugarMill.java                       # Cooperative/Private Sugar Mill directory & capacities
│   │   ├── EnsoRecord.java                      # Pacific Ocean ONI anomalies (2015-2026)
│   │   ├── RainfallRecord.java                  # Maharashtra annual monsoon precipitation records
│   │   └── RouteMetrics.java                    # Calculated GIS road distance, transit ETA & corridor
│   │
│   ├── service/                                 # Business Logic & Core Algorithms Layer
│   │   ├── FrpCalculatorService.java            # Statutory FRP, VSI CCS Recovery % & Quality Adjustments
│   │   ├── RouteService.java                    # Haversine Great-Circle & Road Winding Distance Engine
│   │   ├── TripService.java                     # Farmer trip lifecycle, Bidding & Gate Pass generation
│   │   ├── MillService.java                     # Weighbridge logger & Mass Balance CRUD operations
│   │   ├── ClimateService.java                  # Regional agro-climate datasets & correlation engine
│   │   └── AuthService.java                     # RBAC authentication & session token manager
│   │
│   ├── repository/                              # Data Persistence Layer
│   │   └── DataStore.java                       # Thread-safe in-memory store with full seed data
│   │
│   └── util/                                    # Utilities
│       └── JsonUtil.java                        # Zero-dependency JSON serializer & parser
│
└── src/                                         # Frontend Presentation Layer (Served by Java)
    ├── styles/main.css                          # Custom CSS styling, sticky tables, GIS animations
    ├── db/schema.sql                            # Relational PostgreSQL/PostGIS database schema
    ├── state/store.js                           # Frontend state client (Syncs with Java REST APIs)
    ├── router/router.js                         # Role-based route guard
    ├── components/
    │   ├── landing_portal.js                    # Macro-climate & production analytical tables
    │   ├── auth_portal.js                       # Role selection & authentication
    │   ├── farmer_portal.js                     # Plot GPS registration & logistics bid comparison
    │   ├── logistics_portal.js                  # Transporter trip queue & fare bidding
    │   ├── mill_portal.js                       # Weighbridge lab FRP calculator & 5-graph dashboard
    │   ├── map_engine.js                        # Maharashtra GIS corridor map
    │   └── architecture_modal.js                # System architecture & Java class inspector
    └── app.js                                   # Shared header with Java Status Badge & toasts
```

---

## ⚡ Key Java Features Implemented

1. **VSI Commercial Cane Sugar (CCS / Recovery %) & FRP Calculator Engine (`FrpCalculatorService.java`)**:
   - Calculates Net Payable Tonnage from Gross and Tare weights with trash deductions.
   - Computes purity: `(Pol% / Brix%) * 100`.
   - Evaluates official VSI Recovery formula:
     $$\text{Recovery \%} = (\text{Pol\%} - 0.4 \times (\text{Brix\%} - \text{Pol\%})) \times 0.74$$
   - Computes recovery premium: Base FRP ₹3,400/MT at 10.25% recovery ($+₹33.20/\text{MT}$ per $+0.1\%$ recovery).
   - Applies freshness bonuses and staleness penalties based on Dextran (PPM) and Reducing Sugars (%).

2. **Haversine Geospatial Routing Engine (`RouteService.java`)**:
   - Uses the spherical Earth Haversine formula to compute Great-Circle distances from farmer plot coordinates to destination sugar mills.
   - Applies regional Maharashtra road winding factors and cane truck average velocity (28 km/h) to predict transit minutes and corridors (Panchganga, Krishna, Koyna, Bhima, Nira).

3. **Multi-Party Bidding & Trip Lifecycle Engine (`TripService.java`)**:
   - Tracks state machine transitions: `open` $\rightarrow$ `bidding` $\rightarrow$ `awarded` $\rightarrow$ `in_transit` $\rightarrow$ `delivered` $\rightarrow$ `settled`.
   - Generates digital Mill Gate Passes (e.g., `GP-MH-901-KOP01`) upon bid confirmation.

4. **Pure Embedded Java HTTP Server & RESTful API (`Main.java`)**:
   - Built on `com.sun.net.httpserver.HttpServer` with a 16-worker thread pool.
   - Completely standalone: requires **zero external third-party JARs**.
   - Serves endpoints:
     - `GET  /api/info` — JVM runtime and service diagnostics.
     - `GET  /api/state` — Full synchronized state.
     - `POST /api/auth/login` — Role-based authentication.
     - `GET  /api/trips`, `POST /api/trips` — Trip management.
     - `POST /api/trips/award` — Awards winning transporter bid.
     - `POST /api/bids` — Submits transporter freight quote.
     - `POST /api/frp/calculate` — Live FRP pricing computation.
     - `POST /api/weighbridge/log` — Records batch intake to factory ledger.
     - `POST /api/massbalance/upsert` — Updates annual factory production ledger.
     - `POST /api/massbalance/delete` — Removes annual factory production record.
     - `POST /api/route/calculate` — Live GIS corridor distance & ETA calculation.

---

## 🚀 How to Run the Java Project

### Option 1: 1-Click Double-Click (`run.bat`)
Simply double-click **`run.bat`** (or execute `.\run.bat` in Command Prompt). It will automatically:
1. Detect your Java installation.
2. Compile all Java source files into `bin/`.
3. Launch the Java HTTP Server on `http://localhost:8080`.

### Option 2: PowerShell (`run.ps1`)
```powershell
.\run.ps1
```

### Option 3: Standard Terminal (`javac` & `java`)
```bash
# 1. Compile Java files
javac -encoding UTF-8 -d bin src/main/java/com/mahacane/*.java src/main/java/com/mahacane/model/*.java src/main/java/com/mahacane/service/*.java src/main/java/com/mahacane/repository/*.java src/main/java/com/mahacane/util/*.java

# 2. Run Main application
java -cp bin com.mahacane.Main 8080
```

### Option 4: Apache Maven (if Maven is installed)
```bash
mvn clean compile exec:java
```

Once running, navigate to:
👉 **`http://localhost:8080`** in any web browser!

---

## 💻 Technical Specifications
- **Programming Language**: Java (OpenJDK 17 / 21 / 25 LTS)
- **Architecture**: Layered MVC (Model - Service - Repository - REST Controller)
- **Concurrency**: Thread-safe in-memory data structures (`CopyOnWriteArrayList`, `ConcurrentHashMap`)
- **Frontend**: HTML5, Tailwind CSS, Chart.js, Vanilla ES6+ client bridge
- **Database Schema**: PostgreSQL 15+ compatible DDL (`src/db/schema.sql`)
