# Industrial Knowledge Intelligence — Unified Asset & Operations Brain

**PS8 — ET AI Hackathon 2026 (The Economic Times)**
*"AI for Industrial Knowledge Intelligence: Unified Asset & Operations Brain"*

Plants generate thousands of scattered documents — equipment specs, permits, maintenance logs, inspection reports — spread across 7–12 disconnected systems in a typical large facility. When something breaks or a technician needs an answer, someone digs through all of it by hand. This project turns that pile of documents into one connected, queryable knowledge graph with a cited AI copilot, so the answer takes seconds instead of an afternoon.

Team **singhsomnath2006** — Somnath Singh · Meet Tomar

---

## The problem

- **35%** of working hours in asset-intensive industries go to searching for information that already exists somewhere (McKinsey, 2024)
- **18–22%** of unplanned downtime in Indian heavy industry traces back to fragmented documentation (BIS Research)
- **25%** of India's experienced industrial engineers retire within the next decade, taking undocumented operational knowledge with them

The data isn't missing. The intelligence layer connecting it is.

## What it does

| | |
|---|---|
| **Ingest & extract** | Drag in PDFs, spreadsheets, and scanned forms. Gemini 3.5 Flash pulls out equipment tags, personnel, regulatory references, and operating limits — no separate OCR or CV pipeline needed, it reads documents and drawings natively. |
| **Ask in plain English** | The copilot answers questions grounded in the ingested corpus, with a structured citation (source document, page/section) and a confidence score on every response. |
| **See the connections** | A live D3 knowledge graph links documents, equipment, personnel, and regulations — edges like `maintained_by`, `governed_by`, and `located_in` are built automatically as documents arrive. |
| **Catch what's missing** | Compliance and anomaly checks run against the graph automatically — flagging equipment with no spec on file, or readings that exceed a documented limit. |

## Architecture

Documents come in through `UploadIngest.tsx`, get processed server-side by Gemini 3.5 Flash against a strict `responseSchema` for structured extraction, and land in the document store as typed entities and relationships. Three views read from that same store: the graph explorer, the copilot (retrieval-grounded, cited), and the gaps dashboard (automatic compliance/anomaly audit).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS |
| Backend | Express (Node.js / TypeScript) |
| AI | Gemini 3.5 Flash (`@google/genai`) — structured extraction, grounded chat, native PDF/image input |
| Graph visualization | D3.js |
| Charts | Recharts |

## Getting started

### Prerequisites

- Node.js 18+
- A Gemini API key ([Google AI Studio](https://aistudio.google.com))

### Installation

```bash
git clone https://github.com/singhsomnath2006/industrial-knowledge-intelligence.git
cd industrial-knowledge-intelligence
npm install
cp .env.example .env
```

Add your key to `.env`:
