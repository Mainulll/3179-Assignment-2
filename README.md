# Local places, bigger stories

FIT3179 Assignment 2 · Topic 23: Local Tourism Attractions · Minul Lokuliyana

An Australian data story connecting mapped lookouts, gardens and visitor centres with regional tourism context, then examining Port Arthur and Royal Botanic Gardens Victoria. Attraction attendance, regional trips, economic estimates and community participation remain separate measures.

The repository currently contains the **data foundation and project plan**. The Vega/Vega-Lite website has not been built or deployed.

- [HD project and chart plan](docs/PROJECT_PLAN.md)
- [Data sources, definitions and limitations](docs/DATA_GUIDE.md)
- [Automated checks and unresolved issues](docs/data_audit.json)
- [Original-source URLs and SHA-256 hashes](docs/source_manifest.json)
- [Mapped-record review queue](docs/attraction_review.json)

## Rebuild the prepared data

Use Python 3.12 and the original download archive. Original spreadsheets, PDFs and full-resolution polygons stay outside this repository; compact prepared datasets are in `data/`.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python scripts/prepare_data.py --source-dir '../Local Tourism Attractions Data'
```

The script reads original files, validates joins and arithmetic, builds display geometry, and writes an audit. It does not download sources or alter the original archive. Exact rebuilding requires the archived snapshots identified in the source manifest; live OSM queries will change over time. The case-study transcription is versioned in `scripts/case_study_extract.json` with PDF page references.

## Attribution

Mapped records: © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). Heritage: DCCEEW National Heritage List. Tourism: Tourism Research Australia. Population: Australian Bureau of Statistics. Case-study measures: PAHSMA and Royal Botanic Gardens Victoria annual reports. See the data guide for direct links, coverage and reuse notes.

AI assistance has been used for source discovery, preparation code and planning. The final submission must acknowledge the actual assistance used. The student must understand and be able to explain the final design, data and implementation.


## Melbourne and beyond — V2 local website

A new one-page editorial website is now implemented in `index.html`, `styles.css` and `app.js`, using only `data/dv2/` and eleven readable Vega/Vega-Lite specifications in `specs/`. The earlier research foundation above is preserved for reference.

Run `npm start` and open http://127.0.0.1:8000/. Run `npm ci` first if restoring development dependencies, then `npm run check` to validate data, provenance and all eleven chart specifications. The static page itself has no remote runtime dependencies.

See [V2 implementation and submission limitations](docs/dv2/IMPLEMENTATION.md), [data checks](docs/dv2/validation.json) and [browser QA](docs/dv2/BROWSER_QA.md). No push or deployment is authorised yet; pushing may trigger the connected Vercel project.
