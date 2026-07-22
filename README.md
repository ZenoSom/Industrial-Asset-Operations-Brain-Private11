## API overview

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/ingest` | Accepts a document (PDF, spreadsheet, text), runs Gemini extraction, updates the graph |
| `POST` | `/api/chat` | Answers a question grounded in ingested documents, with structured citations |
| `GET` | `/api/graph` | Returns the current entity/relationship graph |
| `GET` | `/api/gaps` | Returns current compliance gaps and flagged anomalies |

## How this maps to the judging rubric

| Criterion | Weight | What we show |
|---|---|---|
| Innovation | 25% | Automatic knowledge graph + gap detection, not just a chatbot over PDFs |
| Business Impact | 25% | Manual search time vs. copilot answer time, measured live in the demo |
| Technical Excellence | 20% | Real, structured citations on every answer — no mocked or fallback responses |
| Scalability | 15% | Ingestion pipeline designed to extend past a handful of documents to a full plant archive |
| User Experience | 15% | Copilot usable on a phone; visual design grounded in the actual subject, not generic AI styling |

## Known limitations

- The document store is **in-memory** for this prototype and resets on server restart. A production version would move this to persistent storage (e.g. Postgres) as outlined in the architecture.
- Entity extraction and graph linking are only as good as the documents ingested — tested against a small, hand-built sample set (a pump spec, a maintenance log, a permit, and an inspection report).

## Roadmap

- Formal ontology (equipment → system → area hierarchy) instead of flat entity tags
- Real QMS integration for corrective-action workflows
- Ingestion queue to scale from a handful of documents to a full plant archive

## Acknowledgments

Problem context and statistics (McKinsey, BIS Research, NASSCOM-EY) drawn from the ET AI Hackathon 2026 PS8 problem brief.

## License

MIT — see LICENSE.
