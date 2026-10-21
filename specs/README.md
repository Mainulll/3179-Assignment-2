# Readable chart specifications

Each JSON file defines its corresponding Vega or Vega-Lite visualisation.
Data files remain under `../data/dv2/`; run the website from the repository root.

- [01-city-sights](01-city-sights.json)
- [02-sight-treemap](02-sight-treemap.json)
- [03-art-histogram](03-art-histogram.json)
- [04-city-routes](04-city-routes.json)
- [05-art-toilets](05-art-toilets.json)
- [06-route-lengths](06-route-lengths.json)
- [07-forest-upset](07-forest-upset.json)
- [08-holiday-map](08-holiday-map.json)
- [09-city-heatmap](09-city-heatmap.json)
- [10-melbourne-trend](10-melbourne-trend.json)
- [11-state-scatter](11-state-scatter.json)


Current additions: `10-melbourne-current.json` (six DoTS quarters), `11-state-scatter-current.json` (like-for-like June quarters), `12-current-quarter.json` (2025/2026 quarter metrics), `13-state-history.json` (270 compatible state/national quarters). The map uses cached ABS geometry with the selected current or historical state properties; heatmap data switch between current year-ending and historical calendar-year files in app.js.
