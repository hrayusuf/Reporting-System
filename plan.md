
act as top 0.1% of senior software engineer and full stack developer and AI engineer with a great background of report making 
 

# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name**
Financial \& Operations Performance Dashboard for Service Company

**Product Summary**
A web-based dashboard application for a service company that consolidates financial performance, sales performance, and operational (fleet) costs into interactive visual dashboards. Data is ingested via Excel uploads and through manual data entry forms, then transformed into KPIs, charts, and tables for management decision-making.

***

## 2. Goals \& Objectives

**Primary Goals**

1. Provide management with a single dashboard to view:
    - Monthly, quarterly, and yearly financial performance (revenue, expenses, profit/loss, profit margins).
    - Sales performance by sales representatives.
    - Top 10 revenue items and Top 10 expense items.
    - Fuel consumption and vehicle-related costs (maintenance and other operating costs) for the company fleet.
2. Enable non-technical users (Admin/Finance) to upload data from Excel templates or enter data manually.
3. Present data using rich visualizations (cards, bar charts, line charts, pie/donut charts, waterfall, heatmaps, etc.) to quickly understand trends and anomalies.

**Non-Goals (for current version)**

- Complex user-role management (beyond a simple Admin user).
- Real-time integration with ERP/Accounting systems.
- Advanced forecasting or predictive analytics (can be future phase).

***

## 3. Target Users \& Use Cases

**User Roles**

1. General Manager / CEO
    - Quick overview of company performance and key KPIs.
2. Finance Manager / Accountant
    - Track financial performance (P\&L), margins, and cost structure.
3. Sales Manager
    - Monitor sales performance by sales representative and top customers/services.
4. Operations / Fleet Manager
    - Monitor fuel, maintenance, and total operating cost per vehicle and per period.

**Main Use Cases**

- View a high-level financial summary for this month, this quarter, and this year.
- Identify top-performing and low-performing sales reps.
- Identify top 10 revenue sources (customers or services) and top 10 expense items.
- Monitor fleet costs: fuel, maintenance, and other operating expenses.
- Upload new period data from Excel templates on a regular basis (monthly/quarterly).

***

## 4. Scope of the First Release (MVP)

The MVP must support:

1. Single company profile (name, logo, base currency).
2. Data ingestion:
    - Upload Excel files for Financials, Sales, and Fleet data.
    - Basic validation and error feedback.
3. Data storage:
    - Structured database with tables for financial, sales, and fleet data.
4. Dashboards:
    - Overview (financial performance).
    - Sales Performance.
    - Top 10 Revenue / Top 10 Expenses.
    - Fleet \& Operations Costs.
5. Authentication:
    - Simple Admin login (username/password or single admin credential file).

***

## 5. Functional Requirements

### 5.1 Authentication \& Access

- Simple login page for Admin user.
- Session-based authentication (basic) is sufficient.
- No complex role management required in MVP.


### 5.2 Company Profile

**Features**

- Admin can configure:
    - Company Name (displayed at top of all dashboards).
    - Company Logo (image file).
    - Base Currency (e.g., SAR, USD).

**Behavior**

- On all dashboard pages:
    - Show company name (top center or top left).
    - Show company logo (optional, top-left corner).
    - Show currency next to monetary values or in legend/notes.


### 5.3 Data Import (Excel Upload)

There will be a “Data Upload” section with separate upload flows for:

- Financials
- Sales
- Fleet (Vehicles, Fuel, Maintenance)


#### 5.3.1 Supported File Types

- .xlsx (primary)
- .csv


#### 5.3.2 Data Upload Flow (General)

1. Admin chooses data type (Financials / Sales / Fleet).
2. Admin selects a file to upload.
3. System parses the file and displays:
    - First 20 rows for preview.
    - Column names detected.
4. Validation step:
    - Check mandatory columns.
    - Check data types (dates, numbers).
    - Check for obvious issues (empty key fields, invalid date format, etc.).
5. If errors:
    - Show list of errors with row numbers and messages.
    - Optionally allow downloading an “error report” (CSV).
6. If valid:
    - Confirm and import:
        - Insert rows into database tables.
        - If period data already exists, define a strategy (e.g., overwrite or append) – for MVP: overwrite by period and source (configurable later or fixed logic).

### 5.4 Manual Data Entry (Optional / Basic)

- Simple forms for Admin to:
    - Add or edit a single financial record.
    - Add or edit a single sales record.
    - Add or edit a fuel or maintenance record.
- This is secondary to Excel upload but useful for small corrections.

***

## 6. Data Model \& Excel Template Definitions

### 6.1 Financials

**Purpose**
Track revenue and expenses by period (month, quarter, year) to compute profit and margins.

**Excel Sheet: “Financials”**

Required columns (MVP):

- `Date` (or `PeriodDate`): Date representing the transaction or period end.
- `PeriodType`: Enum (Month / Quarter / Year).
- `AccountType`: Enum (Revenue / Expense).
- `Category`: High-level category (e.g., Service Revenue, Salaries, Rent).
- `SubCategory` (optional): More detailed item (e.g., Pest Control Revenue, Maintenance Service Revenue).
- `Amount`: Numeric value (positive number; sign determined by AccountType).
- `CostCenter` (optional): Department, branch, or project.

**Database Table Example: `financial_entries`**

- id
- date
- period_type (month/quarter/year)
- account_type (revenue/expense)
- category
- sub_category (nullable)
- amount
- cost_center (nullable)
- created_at
- updated_at


### 6.2 Sales

**Purpose**
Track sales by sales representative, customer, and service.

**Excel Sheet: “Sales”**

Required columns:

- `Date`: Date of the sale or contract closing.
- `SalesRep`: Name or ID of the sales representative.
- `Customer`: Customer name or identifier.
- `Service`: Type of service sold.
- `ContractValue`: Total value of the contract (revenue).
- `Cost` (optional but recommended): Estimated or actual cost of delivering the service.
- `ProfitMargin` (optional if not provided, can be calculated as (ContractValue - Cost) / ContractValue).

**Database Table Example: `sales_entries`**

- id
- date
- sales_rep
- customer
- service
- contract_value
- cost (nullable)
- calculated_profit (nullable)
- calculated_margin_percent (nullable)
- created_at
- updated_at


### 6.3 Fleet \& Operations (Vehicles, Fuel, Maintenance)

**Purpose**
Track vehicle-related operational costs for a service company (fuel, maintenance, etc.).

**Excel Sheets:**

1. Sheet “Vehicles”
    - `VehicleID`: Unique ID.
    - `PlateNumber`: License plate.
    - `VehicleType`: e.g., Van, Truck, Car.
    - `Branch`: Branch or location.
2. Sheet “Fuel”
    - `Date`
    - `VehicleID` (must match Vehicles)
    - `Liters`
    - `FuelCost`
    - `Odometer` (km reading).
3. Sheet “Maintenance”
    - `Date`
    - `VehicleID`
    - `Type` (e.g., Routine, Repair, Tires).
    - `MaintenanceCost`
    - `DowntimeDays` (number of days vehicle was out of service).

**Suggested Tables**

- `vehicles`
    - id
    - vehicle_id (business key)
    - plate_number
    - vehicle_type
    - branch
    - created_at
    - updated_at
- `fuel_entries`
    - id
    - date
    - vehicle_id (foreign key to vehicles.vehicle_id or vehicles.id)
    - liters
    - fuel_cost
    - odometer
    - created_at
    - updated_at
- `maintenance_entries`
    - id
    - date
    - vehicle_id (foreign key)
    - type
    - maintenance_cost
    - downtime_days
    - created_at
    - updated_at

***

## 7. Calculations \& KPIs

### 7.1 Financial KPIs

For selected context (company-wide, and optionally cost center):

- Total Revenue (per month/quarter/year).
- Total Expenses (per month/quarter/year).
- Profit (per period) = Revenue - Expenses.
- Profit Margin (%) = Profit / Revenue * 100.
- Year-to-date (YTD) Revenue, Expenses, Profit, Margin.


### 7.2 Sales KPIs

- Total Sales (Contract Value) per period.
- Total Sales per SalesRep (month/quarter/year).
- Number of deals per SalesRep.
- Average Deal Size per SalesRep.
- Quota Attainment % per SalesRep (if targets are provided later; for MVP, this can be optional).
- Top Customers by total sales.
- Top Services by total sales.
- Profit and Margin per SalesRep if cost data is available.


### 7.3 Top 10 Revenue \& Top 10 Expenses

**Top 10 Revenue**

- By customer or by service (configurable or two separate charts):
    - Sum revenue per customer/service.
    - Rank descending and take top 10.

**Top 10 Expenses**

- By expense category or subcategory:
    - Sum expenses per category/subcategory.
    - Rank descending and take top 10.


### 7.4 Fleet \& Operations KPIs

- Total Fuel Cost per period (month/quarter/year).
- Total Maintenance Cost per period.
- Total Operating Cost per vehicle = Fuel + Maintenance.
- Cost per Kilometer per vehicle:
    - (FuelCost + MaintenanceCost for vehicle) / distance driven.
    - Distance can be approximated from Odometer differences per vehicle if needed.
- Top 5 or Top 10 vehicles by total operating cost.
- Total DowntimeDays per vehicle.

***

## 8. User Interface \& Pages

### 8.1 Global Layout

Common elements:

- Top bar:
    - Company name and logo.
    - Period filter (Month/Quarter/Year and specific period selection).
    - Optional filters (Cost Center, Branch, etc. in future).
- Left navigation menu (or top tabs):
    - Overview
    - Sales
    - Top 10
    - Fleet \& Operations
    - Data Upload
    - Settings (Company Profile)


### 8.2 Overview Dashboard

**Purpose**
High-level financial and profitability view.

**Components**

1. **Header**
    - Company name.
    - Period selector:
        - Quick filters:
            - “This Month”
            - “This Quarter”
            - “This Year”
2. **KPI Cards (Row 1)**
    - Card: This Month
        - Revenue
        - Expenses
        - Profit / Loss
        - Profit Margin %
    - Card: This Quarter
        - Same metrics.
    - Card: This Year
        - Same metrics.
    - Visual indicators:
        - Positive margin: green.
        - Negative profit: red.
3. **Charts (Row 2)**
    - Clustered Bar Chart:
        - X-axis: Periods (e.g., months in current year).
        - Series: Revenue, Expenses, Profit.
    - Line Chart:
        - X-axis: Months.
        - Y-axis: Profit.
        - Shows trend over the year.
4. **Charts (Row 3)**
    - Pie/Donut Chart (Revenue Distribution):
        - Revenue by Category or Service.
    - Pie/Donut Chart (Expense Distribution):
        - Expenses by Category (Salaries, Rent, Fuel, Maintenance, etc.).
5. **Table (Row 4)**
    - Simplified P\&L:
        - Revenue
        - Cost of Services (if available)
        - Operating Expenses
        - Net Profit
        - Profit Margin %

### 8.3 Sales Dashboard

**Purpose**
Monitor performance of sales representatives and sales composition.

**Components**

1. **KPI Cards**
    - Total Sales (selected period).
    - Number of Deals.
    - Average Deal Size.
    - (Optional) Best performing SalesRep (by revenue).
2. **Bar Chart – Sales by SalesRep**
    - X-axis: SalesReps (names).
    - Y-axis: Total ContractValue.
    - Optionally show margin or number of deals via tooltips or secondary labels.
3. **Line/Small Multiple Charts**
    - One small line chart per SalesRep showing sales over months (optional if complexity is too high).
    - Alternatively, a stacked line chart or filterable line chart by SalesRep.
4. **Table – Detailed Sales List**
    - Columns:
        - Date
        - SalesRep
        - Customer
        - Service
        - ContractValue
        - Cost (if available)
        - Profit
        - Margin %
5. **Optional**
    - Funnel Chart (Lead → Proposal → Closed Won) if such data is provided later.

### 8.4 Top 10 Dashboard

**Purpose**
Highlight concentration of revenue and expenses.

**Components**

1. **Top 10 Revenue (Customers or Services)**
    - Horizontal Bar Chart:
        - Y-axis: Customer or Service (name).
        - X-axis: Total Revenue.
    - Table:
        - Name (Customer/Service)
        - Total Revenue
        - Margin %
        - Contribution % to total revenue.
2. **Top 10 Expenses**
    - Horizontal Bar Chart:
        - Y-axis: Expense Category/SubCategory.
        - X-axis: Total Expense.
    - Table:
        - Category/SubCategory
        - Total Expense
        - Percentage of total expenses.

### 8.5 Fleet \& Operations Dashboard

**Purpose**
Monitor fuel, maintenance, and operating costs of the company’s vehicles.

**Components**

1. **KPI Cards**
    - Total Fuel Cost (selected period).
    - Total Maintenance Cost.
    - Total Operating Cost (Fuel + Maintenance).
    - Average Cost per Vehicle.
2. **Clustered Column Chart – Fuel vs Maintenance by Vehicle**
    - X-axis: Vehicle (VehicleID or PlateNumber).
    - Series:
        - FuelCost
        - MaintenanceCost
3. **Line Chart – Monthly Fuel \& Maintenance Trend**
    - X-axis: Months.
    - Two lines:
        - FuelCost per month.
        - MaintenanceCost per month.
4. **Top 10 Vehicles by Total Cost**
    - Horizontal Bar Chart:
        - Y-axis: Vehicle.
        - X-axis: Total Operating Cost.
    - Table:
        - VehicleID / PlateNumber
        - Branch
        - FuelCost
        - MaintenanceCost
        - TotalCost
        - Cost per km (if computed).
5. **Heatmap (Optional but Recommended)**
    - X-axis: Months.
    - Y-axis: Vehicles or Branches.
    - Color: Total operating cost (darker = higher cost).
6. **Pie/Donut Chart – Operating Cost Breakdown**
    - Slices:
        - Fuel
        - Maintenance
        - Other (if categorized).

### 8.6 Data Upload Page

**Purpose**
Allow Admin to import/update data.

**Components \& Flow**

- Section tabs or dropdown:
    - Financials
    - Sales
    - Fleet (with sub-options or separate panels for Vehicles, Fuel, Maintenance).
- For each:
    - “Download Template” button (download sample Excel template).
    - “Upload File” button.
    - After upload:
        - Show preview table (first 20 rows).
        - Show “Validate” button.
    - If validation passes:
        - Show summary (number of rows, period range).
        - Show “Import” button.
    - If validation fails:
        - Show error list (row number, column, error message).
        - Optionally: “Download error report”.


### 8.7 Settings Page

- Company name input.
- Logo upload.
- Base currency selection.
- Save button.

***

## 9. Non-Functional Requirements

- **Performance**
    - The dashboard should load under ~3 seconds for typical data sizes (e.g., up to 100k records).
- **Security**
    - Protect Admin login credentials.
    - Files are not accessible publicly.
- **Scalability**
    - Database and backend designed so additional companies or users can be supported in future.
- **Usability**
    - Clean, modern UI, responsive where possible.
    - Clear labels and units (currency, dates).

***

## 10. Technology \& Integration (Guidance, Not Mandatory)

(Adjust according to the agent’s capabilities.)

- Backend:
    - REST API using Node.js (Express / NestJS) or Laravel.
    - Use a relational database (PostgreSQL or MySQL).
- Frontend:
    - React / Next.js.
    - Use a chart library (Recharts, Chart.js, ECharts, or similar).
- File Handling:
    - Parse Excel/CSV using a library (e.g., SheetJS/xlsx on server side).

***

## 11. Acceptance Criteria (Examples)

1. Admin can log in and see the main navigation.
2. Admin can upload a valid “Financials” Excel file and see financial charts in the Overview page updated accordingly.
3. Admin can upload a valid “Sales” Excel file and see:
    - Sales by SalesRep bar chart.
    - Sales table.
4. Admin can upload valid “Fleet” Excel files and see:
    - Fuel vs Maintenance by Vehicle chart.
    - Top 10 vehicles by cost.
5. Overview dashboard shows correct totals and margins for month/quarter/year given the data.
6. Top 10 dashboard correctly shows top 10 revenue and expense items ranked by value.
7. All charts and tables respect the selected period filter.

***

