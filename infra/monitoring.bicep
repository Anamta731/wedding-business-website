// ─────────────────────────────────────────────────────────────────────────────
// Vows & Vedas — Monitoring stack (analytics dashboard backend)
//
// Provisions the Application Insights resource the site's telemetry targets, its
// backing Log Analytics workspace, and deploys both analytics workbooks so no
// manual portal import is needed.
//
// MCI governance (Naming Convention V1.3 + Governance Framework V1.2):
//   • Names follow [type]-[workload]-[env]-[region]-[####].
//   • 7 mandatory resource tags applied (defaults mirror the mci-wedding-website RG).
//   • Region note: East US is an AME/non-EUR region. This whole app already runs
//     non-EUR (OpenAI/Search/Key Vault in East US, Cosmos in SE Asia), so this
//     matches its siblings; the data-residency exception is app-wide, not new here.
//   • App Insights ingestion is public — correct for this Online (public website)
//     workload. Private ingestion (AMPLS) would be a separate hardening exercise.
//
// Deploy:
//   az deployment group create -g mci-wedding-website -f infra/monitoring.bicep
// See infra/README.md for the full runbook (connection string + Static Web App wiring).
// ─────────────────────────────────────────────────────────────────────────────

targetScope = 'resourceGroup'

@description('Azure region. Matches the "eus" (East US) segment in the resource names and the app\'s existing resources.')
param location string = 'eastus'

@description('Log Analytics workspace name (V1.3 pattern).')
param workspaceName string = 'law-vows-prod-eus-001'

@description('Application Insights component name — MUST match the APPLICATIONINSIGHTS_CONNECTION_STRING consumers in the app.')
param appInsightsName string = 'appi-vows-prod-eus-001'

@description('Retention (days) for the workspace and App Insights.')
@minValue(30)
@maxValue(730)
param retentionInDays int = 90

@description('Mandatory MCI resource tags (Naming Convention V1.3). Defaults mirror the mci-wedding-website resource group.')
param tags object = {
  Owner: 'nikhil.arora@wearemci.com'
  DepartmentCode: 'BO_BOF_ITC'
  Category: 'Compute'
  ApplicationName: 'VowsVedas'
  Environment: 'Prod'
  OfficeCode: 'IND_DEL_MC1'
  Region: 'APC'
  Criticality: 'Medium'
  DataClassification: 'Internal'
}

// ── Log Analytics workspace (workspace-based App Insights requires one) ───────
resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: workspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionInDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ── Application Insights (workspace-based) ────────────────────────────────────
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: retentionInDays
  }
}

// ── Workbooks (deployed straight from the repo JSON — no manual import) ───────
resource comprehensiveWorkbook 'Microsoft.Insights/workbooks@2023-06-01' = {
  name: guid(resourceGroup().id, 'vows-vedas-comprehensive')
  location: location
  kind: 'shared'
  tags: tags
  properties: {
    displayName: 'Vows & Vedas — Whole-Site Analytics'
    category: 'workbook'
    sourceId: appInsights.id
    version: 'Notebook/1.0'
    serializedData: loadTextContent('../workbook/vows-vedas-comprehensive.workbook')
  }
}

resource enquiryWorkbook 'Microsoft.Insights/workbooks@2023-06-01' = {
  name: guid(resourceGroup().id, 'vows-vedas-enquiry')
  location: location
  kind: 'shared'
  tags: tags
  properties: {
    displayName: 'Vows & Vedas — Enquiry Analytics'
    category: 'workbook'
    sourceId: appInsights.id
    version: 'Notebook/1.0'
    serializedData: loadTextContent('../workbook/vows-vedas-analytics.workbook')
  }
}

// ── Outputs (connection string is intentionally NOT output — read it via the
//    az command in infra/README.md and store it as a Static Web App app setting) ─
@description('Application Insights resource name.')
output appInsightsName string = appInsights.name

@description('Application Insights resource id.')
output appInsightsId string = appInsights.id

@description('Log Analytics workspace resource id.')
output workspaceId string = workspace.id
