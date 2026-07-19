# Graph Report - .  (2026-07-16)

## Corpus Check
- 147 files · ~153,358 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 660 nodes · 744 edges · 105 communities (95 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- schema.js
- $lib/utils/constants.js
- +page.svelte
- dependencies
- +layout.svelte
- ConnectionManager
- +page.svelte
- pdfGenerator.js
- constants.js
- devDependencies
- formatters.js
- +page.svelte
- realtimeConnection.js
- +page.svelte
- wilayah.js
- satusehat.js
- snowstorm.js
- +server.js
- validators.js
- wilayah.js
- auth.js
- pdf.js
- auth.js
- layout.js
- Deploy Job
- app.html Template
- encounter_items DB table
- hooks.server.js
- chat.js
- notifications.js
- toast.js
- +layout.svelte
- index.js
- Klinik Utama Oratio Logo
- Svelte auth.js await Build Failure
- Svelte const Tag Build Failure
- pdfmake Import Build Failure
- svelte.config.js
- terminologyService.js

## God Nodes (most connected - your core abstractions)
1. `$lib/utils/constants.js` - 17 edges
2. `$lib/utils/formatters.js` - 13 edges
3. `generatePatientProfilePdf()` - 12 edges
4. `$lib/stores/toast.js` - 11 edges
5. `ConnectionManager` - 10 edges
6. `$lib/components/Forms/RichSelect.svelte` - 10 edges
7. `$lib/stores/layout.js` - 9 edges
8. `generateSoapWhoFormPdf()` - 9 edges
9. `$lib/components/Forms/SearchableSelect.svelte` - 8 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `app.html Template` --conceptually_related_to--> `admin/+layout.svelte`  [INFERRED]
  src/app.html → build_output.txt
- `Encounter query logs` --conceptually_related_to--> `encounter_items DB table`  [INFERRED]
  query.txt → logs.txt
- `Test average query result` --conceptually_related_to--> `Encounter query logs`  [INFERRED]
  test_avg.txt → query.txt
- `Deploy Job` --references--> `App Service (oratio-app)`  [EXTRACTED]
  .github/workflows/deploy.yml → docker-compose.yml
- `Deploy Job` --references--> `DB Service (oratio-db)`  [EXTRACTED]
  .github/workflows/deploy.yml → docker-compose.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **NAS Docker Deployment Architecture** — _github_workflows_deploy_job_deploy, docker_compose_db_service, docker_compose_app_service [INFERRED 0.95]
- **Oratio Compilation and Build Failures** — build_logs_pdfmake_error, build_log_const_tag_error, build_log2_await_error, build_output_app_css_error [INFERRED 0.85]

## Communities (105 total, 10 thin omitted)

### Community 0 - "schema.js"
Cohesion: 0.03
Nodes (65): bloodTypeEnum, chatConversations, chatConversationsRelations, chatMessages, chatMessagesRelations, citizenshipEnum, doctorItems, doctorItemsRelations (+57 more)

### Community 1 - "$lib/utils/constants.js"
Cohesion: 0.05
Nodes (20): $lib/components/Tables/AdminDataTable.svelte, $lib/components/UI/AdminModal.svelte, $lib/utils/constants.js, $lib/components/Tables/DataTable.svelte, $lib/components/UI/FileUpload.svelte, $lib/utils/formatters.js, $lib/api/geonames, $app/navigation (+12 more)

### Community 2 - "+page.svelte"
Cohesion: 0.05
Nodes (12): allergies, birthplaceSuggestions, CITIZENSHIP_OPTIONS, DISEASE_TYPE_OPTIONS, diseaseHistory, doctorOptions, GENDER_OPTIONS, MARITAL_OPTIONS (+4 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (32): argon2, drizzle-orm, flag-icons, jose, dependencies, argon2, chart.js, drizzle-orm (+24 more)

### Community 4 - "+layout.svelte"
Cohesion: 0.13
Nodes (17): $lib/components/Layout/AppShell.svelte, $lib/stores/auth.js, $lib/stores/chat.js, $lib/components/Chat/ChatPanel.svelte, $lib/components/Realtime/ConnectionStatus.svelte, $lib/stores/layout.js, $lib/components/Notifications/NotificationPanel.svelte, $lib/stores/notifications.js (+9 more)

### Community 5 - "ConnectionManager"
Cohesion: 0.10
Nodes (4): canSubscribe(), ConnectionManager, eventBus, RealtimeEventBus

### Community 6 - "+page.svelte"
Cohesion: 0.08
Nodes (5): $lib/components/UI/Modal.svelte, $lib/components/Odontogram/OdontogramChart.svelte, calculateAge(), formatDate(), $lib/components/Odontogram/ToothDetailPanel.svelte

### Community 7 - "pdfGenerator.js"
Cohesion: 0.18
Nodes (23): buildOdontogramMap(), calculateAge(), CITIZEN_MAP, fmt(), fmtAddress(), fmtBpStatus(), fmtCitizen(), fmtDate() (+15 more)

### Community 8 - "constants.js"
Cohesion: 0.08
Nodes (23): ADMIN_TABLES, ALLERGY_REACTIONS, BAHAN_PROTESA, BAHAN_RESTORASI, BLOOD_TYPES, COUNTRY_CALLING_CODES, DAYS_OF_WEEK, DECIDUOUS_TEETH (+15 more)

### Community 9 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, drizzle-kit, devDependencies, autoprefixer, drizzle-kit, postcss, svelte, @sveltejs/adapter-node (+15 more)

### Community 10 - "formatters.js"
Cohesion: 0.14
Nodes (3): getJakartaDateString(), getJakartaDateStringFromDate(), getJakartaMonthString()

### Community 11 - "+page.svelte"
Cohesion: 0.17
Nodes (9): loadEncounters(), loadReferrals(), loadShifts(), loadStats(), selectEncounter(), selectReferral(), setupEncountersRealtime(), setupReferralsRealtime() (+1 more)

### Community 12 - "realtimeConnection.js"
Cohesion: 0.24
Nodes (12): connect(), connectionId, connectionStatus, eventHandlers, handleSseEvent(), onEvent(), scheduleReconnect(), subscribe() (+4 more)

### Community 13 - "+page.svelte"
Cohesion: 0.16
Nodes (6): $lib/components/UI/AdminFileUpload.svelte, validateCSVData(), getM2mDisplayLabels(), handleFile(), parsePreview(), field()

### Community 14 - "wilayah.js"
Cohesion: 0.22
Nodes (8): districts, loadingDistrict, loadingProvince, loadingRegency, loadingVillage, provinces, regencies, villages

### Community 15 - "satusehat.js"
Cohesion: 0.46
Nodes (7): getBaseUrl(), getConfig(), getEnv(), getToken(), SATUSEHAT_CONFIG, searchKFA(), validateEnv()

### Community 16 - "snowstorm.js"
Cohesion: 0.50
Nodes (7): expandValueSet(), searchAllergySubstances(), searchChiefComplaint(), searchConcepts(), searchFamilyDiseaseHistory(), searchPersonalDiseaseHistory(), searchReasonByCategory()

### Community 17 - "+server.js"
Cohesion: 0.36
Nodes (5): AUTO_MANAGED_FIELDS, cleanBody(), POST(), PUT(), schemaMap

### Community 18 - "validators.js"
Cohesion: 0.52
Nodes (6): validateBloodPressure(), validateEmail(), validateNIK(), validatePatientForm(), validatePhone(), validateRequired()

### Community 19 - "wilayah.js"
Cohesion: 0.60
Nodes (5): fetchDistricts(), fetchProvinces(), fetchRegencies(), fetchVillages(), wilayahFetch()

### Community 22 - "auth.js"
Cohesion: 0.33
Nodes (3): currentUser, isAuthenticated, userRole

### Community 23 - "layout.js"
Cohesion: 0.33
Nodes (5): headerTitle, isPatientProfileOpen, isProfileModalOpen, isSidebarHidden, isSidebarOpen

### Community 24 - "Deploy Job"
Cohesion: 0.50
Nodes (5): Build Job, Deploy Job, Build & Deploy Workflow, App Service (oratio-app), DB Service (oratio-db)

### Community 25 - "app.html Template"
Cohesion: 0.50
Nodes (4): Rollup app.css Resolve Build Failure, app.html Template, Tailwind Theme Configuration, admin/+layout.svelte

### Community 26 - "encounter_items DB table"
Cohesion: 0.50
Nodes (4): encounter_items DB table, Postgres duplicate key error log, Encounter query logs, Test average query result

### Community 27 - "hooks.server.js"
Cohesion: 0.67
Nodes (3): handle(), PUBLIC_PATHS, ROLE_PATHS

### Community 28 - "chat.js"
Cohesion: 0.50
Nodes (3): chatView, isChatOpen, unreadCount

### Community 29 - "notifications.js"
Cohesion: 0.50
Nodes (3): isNotificationOpen, notifications, unreadNotificationCount

### Community 43 - "Klinik Utama Oratio Logo"
Cohesion: 0.67
Nodes (3): Klinik Utama (Main Clinic) Status, Oratio Brand Identity, Klinik Utama Oratio Logo

## Knowledge Gaps
- **197 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `$lib/utils/constants.js` connect `$lib/utils/constants.js` to `+page.svelte`, `+layout.svelte`, `+page.svelte`, `+page.svelte`, `+page.svelte`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `$lib/stores/toast.js` connect `$lib/utils/constants.js` to `+page.svelte`, `+page.svelte`, `+page.svelte`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `$lib/stores/layout.js` connect `+layout.svelte` to `$lib/utils/constants.js`, `+page.svelte`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.js` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._
- **Should `$lib/utils/constants.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05009920634920635 - nodes in this community are weakly interconnected._
- **Should `+page.svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._