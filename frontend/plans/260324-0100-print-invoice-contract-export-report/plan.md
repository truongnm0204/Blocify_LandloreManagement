# Print Invoice, Print Contract, Export Report

**Date:** 2026-03-24
**Status:** Planning
**Priority:** High

## Overview

Implement 3 features:
1. **Print/Export Invoice** - from invoice detail page
2. **Print/Export Contract** - wire existing buttons on contract detail page
3. **Export Financial Report** - CSV export from financial report page

## Approach: Browser-Native Print (Zero Dependencies)

Use `window.open()` + `window.print()` with HTML templates. No new npm packages needed.

- Creates a clean print window with formatted HTML
- Browser "Save as PDF" provides PDF export
- Vietnamese text renders natively (no font embedding issues)
- Works across all modern browsers

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 1 | Print utility core | Pending | `src/lib/print-utils.ts` |
| 2 | Invoice print template + button | Pending | `src/pages/invoices/components/invoice-print-template.ts`, `invoice-detail-page.tsx` |
| 3 | Contract print template + wire buttons | Pending | `src/pages/contracts/components/contract-print-template.ts`, `contract-detail-page.tsx` |
| 4 | Financial report CSV export | Pending | `src/lib/csv-export.ts`, `financial-report-page.tsx` |

## Phase Details

See individual phase files for implementation steps.
