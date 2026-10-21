FINAL LATEST TOURISM EVIDENCE: ALL EIGHT STATES + FOUR CITIES
Retrieved 21 October 2026. Period: YEAR ENDING 30 June 2026 (1 July 2025 to 30 June 2026).
Survey: Domestic Tourism Statistics (DoTS). Visitor type: domestic overnight trips.

READY-TO-USE FILES
- states_holiday_nights_YEJune2026.json: 16 rows, Holiday and Total for all eight states/territories. Use for the current annual state holiday-night-share map. This supersedes the earlier June-QUARTER map for a consistent annual comparison with the heatmap. The earlier quarterly data remain valid for a quarterly presentation, not as year-ending data.
- cities_purpose_nights_YEJune2026.json: 20 rows, Business, Holiday, VFR, Other, Total for Sydney, Melbourne, Brisbane, Adelaide TRA tourism regions.
- all_returned_purpose_rows.json: all queried category rows, including unavailable/suppressed cells and overlapping categories, for audit only. Do not indiscriminately add these rows.
- values_summary.txt: concise values and calculated percentage shares.
- qld_dom_cities_states_YEJune2026.json: untouched public API response.
- teq_query_payload.json: exact read-only semantic query.
- extract_current.py, teq_query.py, clean_records.py: reproducible extraction and cleaning.
- qld_dom_modelsAndExploration.json, qld_dom_conceptualschema.json, qld_dom_report.json: published model metadata, schema, report layout.
- domestic-visitation-tourism-data-explorer.json: official TEQ page content linking the report.

VERIFIED PUBLIC SOURCE
Official agency page:
https://teq.queensland.com/au/en/industry/research-and-insights/tourism-data-explorer/domestic-visitation-tourism-data-explorer
Public report linked by the page:
https://app.powerbi.com/view?r=eyJrIjoiM2FlYjEyNWItNjQ2YS00ZWFjLTliY2YtNTdiNTI1YjJmY2QxIiwidCI6IjU1MDhkNmMwLTBjYjYtNDM5MC05NTg5LWM3NzAyZjRjYzM3YSIsImMiOjEwfQ%3D%3D
Public resource key: 3aeb125b-646a-4eac-9bcf-57b525b2fcd1
API base: https://wabi-south-east-asia-c-primary-api.analysis.windows.net
Model ID 2854577. Model refresh metadata: 16 October 2026 03:29:07.99 UTC.
Entity: T2000_Region. Date key: datetime'2026-06-01T00:00:00'.
Filters: Type='Overnight trips'; Criteria='Purpose'; Region in Brisbane, Adelaide, Sydney, Melbourne, Total.
State identities: ACT, NSW, NT, QLD, SA, TAS, VIC, WA; Region='Total' means the whole state/territory.
For cities, use the actual Region labels, NOT council/LGA or Greater Capital City geography. The report uses the TRA tourism-region set; names match the independently sourced Sydney Tourism Region and DJSIR Melbourne TRA region.
Period is YEAR ENDING, not June quarter: the report date slicer is titled 'Year Ending'. Its current values reconcile to official year-ending regional and national releases below.

VALUES, PRECISION AND SUPPRESSION
NightS is the published model's suppression-aware, whole-individual-night estimate. NightSR is the same published display series rounded to the nearest 1,000 nights; report visuals use NightSR. Both are preserved. These are survey estimates, not exact census counts. Shares are calculated as NightS / published Total NightS * 100; do not claim more precision than survey estimates warrant.
The query does NOT use raw unsuppressed Night.
Report's exact suppression note: "Data with sample sizes below publishable thresholds will not show in dashboard."
The report also advises caution for small estimates, including nights below 500,000.
All requested Holiday/Total state cells and all four requested purpose categories and Total for each city are non-null published numeric cells. Nulls elsewhere remain null and are labelled suppressed_or_not_available, never zero. Sample zero with null does not establish a numeric zero estimate.

PURPOSE RECONCILIATION
The four-purpose presentation is Business, Holiday, VFR and Other. All four values are directly published; Other was NOT computed as a residual.
Their sums reconcile to each city Total with at most one night difference. Sydney and Melbourne sum exactly; Brisbane sum is one night above Total; Adelaide sums exactly. These are independently rounded whole-night estimates. Preserve published Total and do not alter any category to force an exact sum.
Additional C1 categories are not an alternative list to sum wholesale: Leisure overlaps Holiday and VFR (their sum matches Leisure to rounding); Education must not be added to the four-purpose presentation because those four already reconcile to Total. The extraction preserves these audit categories without claiming a more detailed additive partition. Employment and Not allocated are null with sample 0 in these current rows; do not infer unreported residuals.

INDEPENDENT CROSSCHECKS
1. Parent independently decoded this response. All eight state totals and Australia total exactly equal the current YE June 2026 nights in official TRA workbook Table 1c multiplied by 1,000. National total is 380,189,465 nights; do not invent a national total by adding selected regional records.
Official TRA release page: https://www.tra.gov.au/en/tourism-statistics/domestic-tourism-statistics-results
2. Melbourne NightS values match the separate DJSIR suppression-aware VisitorNightsNP measure (in thousands) after conversion and whole-night rounding. The earlier DJSIR precision remains valid, but this single TEQ source is internally consistent for all four cities.
3. Sydney NightSR / 1,000 equals all five published domestic night-purpose values in Destination NSW's YE June 2026 Sydney Tourism Region timeseries PDF. Official page: https://www.destinationnsw.com.au/insights/sydney-statistics
PDF: https://cdn.sanity.io/files/faycjvmy/production/b37941515f12732980f35620260570c072f89670.pdf
4. Brisbane Total 27,272,598 rounds to the official BEDA release's 27.3 million domestic nights; do not confuse its international holiday nights with domestic holiday nights.
https://beda.brisbane.qld.au/news-and-events/record-international-growth-drives-brisbane-visitor-economy
5. Adelaide Total 10,148,392 rounds to 10,148 thousand, matching SATC's domestic interstate plus intrastate nights in its June 2026 regional report.

HISTORICAL COMPARABILITY: DO NOT SPLICE
Do not join original pre-2025 NVS regional values to DoTS as one comparable series. DJSIR states:
"Please note sub-state (region or LGA) DoTS data are not backcast, so comparisons with periods prior to 2025 are not supported."
Source: https://djsir.vic.gov.au/tourism-industry-support/research/domestic-and-regional-research
This bundle extracts only the current year-ending period. Presence of older rows in a public semantic model does NOT prove their methodology is comparable at region level. Use a clearly labelled series break and separate survey identity for historical regional NVS and current DoTS. State/national revised backcast is a separate, explicitly supported series when supplied by the official national release.

REPRODUCTION
From this folder, run: python extract_current.py
Then run: python clean_records.py
Only public read-only requests are used. Null decoding respects the PowerBI row repeat and null masks and dictionary values. No logged-in data, credentials or write operations are used.
