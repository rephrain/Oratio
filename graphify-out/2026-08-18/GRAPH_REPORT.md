# Graph Report - Oratio  (2026-08-14)

## Corpus Check
- 155 files · ~177,223 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 744 nodes · 822 edges · 119 communities (106 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c11fcbf1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.js
- +page.svelte
- dependencies
- ConnectionManager
- pdfGenerator.js
- constants.js
- devDependencies
- +page.svelte
- formatters.js
- +page.svelte
- +page.svelte
- realtimeConnection.js
- auth.js
- wilayah.js
- $lib/utils/constants.js
- What You Must Do When Invoked
- +layout.svelte
- satusehat.js
- snowstorm.js
- +server.js
- graphify reference: extra exports and benchmark
- validators.js
- wilayah.js
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
- graphify reference: query, path, explain
- index.js
- Q: Review replacing doctor-item ownership with specialization ownership. Analyze database, backend, API, authorization impact, migration plan, and historical encounter safety.
- Klinik Utama Oratio Logo
- Svelte auth.js await Build Failure
- Svelte const Tag Build Failure
- pdfmake Import Build Failure
- +layout.svelte
- graphify reference: add a URL and watch a folder
- svelte.config.js
- terminologyService.js
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `$lib/utils/constants.js` - 17 edges
2. `$lib/utils/formatters.js` - 13 edges
3. `generatePatientProfilePdf()` - 12 edges
4. `What You Must Do When Invoked` - 12 edges
5. `$lib/stores/toast.js` - 11 edges
6. `ConnectionManager` - 10 edges
7. `$lib/components/Forms/RichSelect.svelte` - 10 edges
8. `/graphify` - 10 edges
9. `$lib/stores/layout.js` - 9 edges
10. `generateSoapWhoFormPdf()` - 9 edges

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

## Communities (119 total, 13 thin omitted)

### Community 0 - "schema.js"
Cohesion: 0.03
Nodes (71): authAuditLogs, authAuditLogsRelations, bloodTypeEnum, chatConversations, chatConversationsRelations, chatMessages, chatMessagesRelations, citizenshipEnum (+63 more)

### Community 1 - "+page.svelte"
Cohesion: 0.05
Nodes (12): allergies, birthplaceSuggestions, CITIZENSHIP_OPTIONS, DISEASE_TYPE_OPTIONS, diseaseHistory, doctorOptions, GENDER_OPTIONS, MARITAL_OPTIONS (+4 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (32): argon2, drizzle-orm, flag-icons, jose, dependencies, argon2, chart.js, drizzle-orm (+24 more)

### Community 3 - "ConnectionManager"
Cohesion: 0.10
Nodes (4): canSubscribe(), ConnectionManager, eventBus, RealtimeEventBus

### Community 4 - "pdfGenerator.js"
Cohesion: 0.17
Nodes (24): buildOdontogramMap(), calculateAge(), CITIZEN_MAP, fmt(), fmtAddress(), fmtBpStatus(), fmtCitizen(), fmtDate() (+16 more)

### Community 5 - "constants.js"
Cohesion: 0.08
Nodes (23): ADMIN_TABLES, ALLERGY_REACTIONS, BAHAN_PROTESA, BAHAN_RESTORASI, BLOOD_TYPES, COUNTRY_CALLING_CODES, DAYS_OF_WEEK, DECIDUOUS_TEETH (+15 more)

### Community 6 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, drizzle-kit, devDependencies, autoprefixer, drizzle-kit, postcss, svelte, @sveltejs/adapter-node (+15 more)

### Community 7 - "+page.svelte"
Cohesion: 0.08
Nodes (5): $lib/components/UI/Modal.svelte, $lib/components/Odontogram/OdontogramChart.svelte, calculateAge(), formatDate(), $lib/components/Odontogram/ToothDetailPanel.svelte

### Community 8 - "formatters.js"
Cohesion: 0.14
Nodes (3): getJakartaDateString(), getJakartaDateStringFromDate(), getJakartaMonthString()

### Community 9 - "+page.svelte"
Cohesion: 0.17
Nodes (9): loadEncounters(), loadReferrals(), loadShifts(), loadStats(), selectEncounter(), selectReferral(), setupEncountersRealtime(), setupReferralsRealtime() (+1 more)

### Community 10 - "+page.svelte"
Cohesion: 0.16
Nodes (6): $lib/components/UI/AdminFileUpload.svelte, validateCSVData(), getM2mDisplayLabels(), handleFile(), parsePreview(), field()

### Community 11 - "realtimeConnection.js"
Cohesion: 0.24
Nodes (12): connect(), connectionId, connectionStatus, eventHandlers, handleSseEvent(), onEvent(), scheduleReconnect(), subscribe() (+4 more)

### Community 12 - "auth.js"
Cohesion: 0.27
Nodes (9): createRefreshToken(), createToken(), getJwtSecret(), hashToken(), logAuthEvent(), revokeAllUserSessions(), revokeFamily(), rotateRefreshToken() (+1 more)

### Community 13 - "wilayah.js"
Cohesion: 0.22
Nodes (8): districts, loadingDistrict, loadingProvince, loadingRegency, loadingVillage, provinces, regencies, villages

### Community 14 - "$lib/utils/constants.js"
Cohesion: 0.05
Nodes (17): $lib/components/Tables/AdminDataTable.svelte, $lib/components/UI/AdminModal.svelte, $lib/utils/constants.js, $lib/components/Tables/DataTable.svelte, $lib/components/UI/FileUpload.svelte, $lib/utils/formatters.js, $lib/api/geonames, $app/navigation (+9 more)

### Community 15 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 16 - "+layout.svelte"
Cohesion: 0.13
Nodes (17): $lib/components/Layout/AppShell.svelte, $lib/stores/auth.js, $lib/stores/chat.js, $lib/components/Chat/ChatPanel.svelte, $lib/components/Realtime/ConnectionStatus.svelte, $lib/stores/layout.js, $lib/components/Notifications/NotificationPanel.svelte, $lib/stores/notifications.js (+9 more)

### Community 17 - "satusehat.js"
Cohesion: 0.46
Nodes (7): getBaseUrl(), getConfig(), getEnv(), getToken(), SATUSEHAT_CONFIG, searchKFA(), validateEnv()

### Community 18 - "snowstorm.js"
Cohesion: 0.50
Nodes (7): expandValueSet(), searchAllergySubstances(), searchChiefComplaint(), searchConcepts(), searchFamilyDiseaseHistory(), searchPersonalDiseaseHistory(), searchReasonByCategory()

### Community 19 - "+server.js"
Cohesion: 0.36
Nodes (5): AUTO_MANAGED_FIELDS, cleanBody(), POST(), PUT(), schemaMap

### Community 20 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 21 - "validators.js"
Cohesion: 0.52
Nodes (6): validateBloodPressure(), validateEmail(), validateNIK(), validatePatientForm(), validatePhone(), validateRequired()

### Community 22 - "wilayah.js"
Cohesion: 0.60
Nodes (5): fetchDistricts(), fetchProvinces(), fetchRegencies(), fetchVillages(), wilayahFetch()

### Community 24 - "auth.js"
Cohesion: 0.33
Nodes (3): currentUser, isAuthenticated, userRole

### Community 25 - "layout.js"
Cohesion: 0.33
Nodes (5): headerTitle, isPatientProfileOpen, isProfileModalOpen, isSidebarHidden, isSidebarOpen

### Community 26 - "Deploy Job"
Cohesion: 0.50
Nodes (5): Build Job, Deploy Job, Build & Deploy Workflow, App Service (oratio-app), DB Service (oratio-db)

### Community 27 - "app.html Template"
Cohesion: 0.50
Nodes (4): Rollup app.css Resolve Build Failure, app.html Template, Tailwind Theme Configuration, admin/+layout.svelte

### Community 28 - "encounter_items DB table"
Cohesion: 0.50
Nodes (4): encounter_items DB table, Postgres duplicate key error log, Encounter query logs, Test average query result

### Community 29 - "hooks.server.js"
Cohesion: 0.67
Nodes (3): handle(), PUBLIC_PATHS, ROLE_PATHS

### Community 30 - "chat.js"
Cohesion: 0.50
Nodes (3): chatView, isChatOpen, unreadCount

### Community 31 - "notifications.js"
Cohesion: 0.50
Nodes (3): isNotificationOpen, notifications, unreadNotificationCount

### Community 34 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 45 - "Q: Review replacing doctor-item ownership with specialization ownership. Analyze database, backend, API, authorization impact, migration plan, and historical encounter safety."
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Review replacing doctor-item ownership with specialization ownership. Analyze database, backend, API, authorization impact, migration plan, and historical encounter safety., Source Nodes

### Community 46 - "Klinik Utama Oratio Logo"
Cohesion: 0.67
Nodes (3): Klinik Utama (Main Clinic) Status, Oratio Brand Identity, Klinik Utama Oratio Logo

### Community 60 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 101 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 102 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **247 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+242 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `$lib/utils/constants.js` connect `$lib/utils/constants.js` to `+page.svelte`, `+page.svelte`, `+page.svelte`, `+page.svelte`, `+layout.svelte`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `$lib/stores/toast.js` connect `$lib/utils/constants.js` to `+page.svelte`, `+page.svelte`, `+page.svelte`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `$lib/stores/layout.js` connect `+layout.svelte` to `$lib/utils/constants.js`, `+page.svelte`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _247 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.js` be split into smaller, more focused modules?**
  _Cohesion score 0.027777777777777776 - nodes in this community are weakly interconnected._
- **Should `+page.svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._