# Data guide

Prepared on 10 September 2026 from the local archive `../Local Tourism Attractions Data`. This is a selected evidence base for the proposed story, not every available Australian tourism dataset. Original file URLs and hashes are in [source_manifest.json](source_manifest.json); output hashes, exclusions and checks are in [data_audit.json](data_audit.json).

## Prepared datasets

| File in `data/` | Grain / key | Fields and units | Source |
|---|---|---|---|
| `mapped_attractions.json` | One accepted OSM object; `id` = type/ID | `lon`, `lat` in degrees; `region_code`; `categories`; optional `name`, `access`; `coordinate_type` | OpenStreetMap snapshot, 9 Sep 2026 |
| `listed_national_heritage.json` | One distinct listed `place_id` | Name, class, state memberships, one `state_group`, official URL | DCCEEW public National Heritage List |
| `tourism_regions_2024.geojson` | One region feature; `properties.region_code` | Region name, state, simplified polygon geometry | TRA 2024 geography |
| `regional_population.json` | One `region_code` | Population at 30 June 2024 and 2025, people | ABS SA2 estimates aggregated through TRA allocations |
| `regional_economy.json` | State + region name + financial year | GVA/GRP/consumption in AUD millions; filled jobs in thousands; population; consumption AUD per resident; join/sample status | TRA 2024–25 regional workbooks, including revised 2023–24 |
| `regional_jobs_by_industry.json` | State + region + year + industry | Full-time, part-time and total direct tourism filled jobs, thousands | TRA regional `Filled jobs` sheets |
| `domestic_state_quarters.json` | State/Australia + quarter + trip type | Trips/nights in thousands; expenditure AUD millions; source cells | TRA DoTS, March 2025–March 2026 |
| `community_case_studies.json` | Case + site + metric + year | Actual/target, units, interpretation note, PDF and printed page numbers | PAHSMA and RBG Victoria annual reports |
| `regional_sample_sizes.json` | State + appendix region name | Domestic day, overnight and international sample counts; source-threshold flag | TRA Appendix 1, 2024–25 |

Arrays contain records rather than presentation labels. Numeric zero, null, an omitted field and an absent record are different states. Null economy geography is unresolved. Null `sample_caution` means the appendix name did not exact-match, not that there is no caution. Null nights for day trips is not applicable. Omitted OSM access means unknown. Never coerce unavailable/suppressed values to zero.

## Sources and transformations

### Mapped places

[OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright) · [Overpass endpoint](https://overpass-api.de/api/interpreter)

Three successful bounding-box extracts used south −44°, west 112°, north −10°, east 154°: `tourism=viewpoint`; `leisure=garden` with a name; and `information=office`. The last was filtered in preparation to also require `tourism=information`. These source predicates are asymmetric: a named-garden inventory is not directly comparable to a complete inventory of all gardens. OpenStreetMap contribution and tagging coverage also varies by place.

Original candidates: 8,100 lookouts, 1,279 gardens, 771 offices. After removing explicit private/no access and non-tourism offices, and requiring an unambiguous intersection with a 2024 region polygon, the outputs contain 7,945 lookout, 1,214 garden and 753 visitor-centre records: **9,912 OSM objects**. There are no cross-category repeated object IDs in this snapshot. These are not certified unique physical attractions.

The spatial screen leaves 199 objects outside the region polygons for review. Coastal positions, the bounding box and map geometry can all cause this; outside does not mean fictitious or foreign. Nothing was snapped onto land. The review file also flags 75 same-name pairs within approximately 100 metres. Distinct OSM objects may represent entrances or parts of one place, so names/proximity alone do not justify deleting them.

Nodes retain their point coordinates. Ways/relations use the query's bounding-box centre, not an entrance or true geographic centroid. Unknown access stays unknown; permissive, permit and customer access tags are retained when present. These records do not establish public access or visitation. Display the OSM attribution on maps and preserve the ODbL notice with the derived OSM data.

### Heritage

[DCCEEW catalogue](https://data.gov.au/data/dataset/national-heritage-list-spatial-database-nhl-public) · [Public service](https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/National_Heritage_List/MapServer/0)

Retain only `STATUS = Listed place`, then group polygons by `PLACE_ID`: 151 original features become 126 distinct listed places. Exclude nominations and records described as within a listed place. Preserve Historic, Natural and Indigenous classes as recorded. A place with multiple state memberships appears once in a “Multiple states” group when making an additive state comparison. External territories remain visible as their own source category.

This is a register of nationally significant places, not all local heritage attractions. It can overlap the OSM categories and must not be summed with them. Some source geometry is generalised for confidentiality; the prepared file therefore contains attributes rather than detailed heritage locations. The catalogue identifies CC BY 3.0 Australia; retain source credit and indicate the transformation.

### Regional tourism and population

[TRA economic statistics](https://www.tra.gov.au/en/tourism-industry-analysis/state-and-regional-sta) · [TRA geography](https://www.tra.gov.au/en/profiles/tourism-regions-maps) · [ABS regional population 2024–25](https://www.abs.gov.au/statistics/people/population/regional-population/2024-25)

Read all 76 regional workbooks from the same 2024–25 release. Their 2023–24 comparison uses the revised model. Do not append older-release regional results as a continuous series. Filled jobs count jobs, not unique workers. Direct plus indirect figures reconcile with each published total; do not add a total to its components.

Working geography is TRA 2024, which matches 74 economic region names exactly. The 2026 allocation contains actual geographic changes, so substituting it would change denominators. Exact names are join evidence, not proof that the economic model uses identical geographic definitions; final mapping still needs that vintage confirmation. Capricorn/Capricorn Coast and Mackay Isaac/Mackay remain unresolved. Their economic records are retained with null geographic and per-resident fields.

The ABS historical SA2 workbook supplies the June 2024 and June 2025 populations. All 2,452 SA2s in TRA's 2024 allocation match; two additional ABS SA2 rows are outside that allocation. Population aggregation and the attraction joins both use the 2024 region codes.

`consumption_aud_per_resident = tourism_consumption_aud_million × 1,000,000 / population_at_financial_year_end`. It describes tourism's scale relative to population. It is not spending received by each resident, attraction revenue, or tourism's share of local employment. Use the date of the denominator explicitly. Monetary comparisons are nominal; no inflation adjustment has been applied.

The original shapefile uses GDA2020 geographic coordinates. For national display and these broad region joins, OSM longitude/latitude is treated as approximately aligned; no survey-precision datum conversion is claimed. Display polygons are simplified separately at 0.01 degrees with topology preservation and rounded to five decimals. Point assignment uses the full-resolution polygons. All original and output polygons pass geometric validity checks; visual map QA remains pending.

[TRA's sample-size appendix](https://www.tra.gov.au/content/dam/austrade-assets/global/wip/tra/documents/tsa/2025/appendix-1-change-in-direct-tourism-output.docx) gives component sample sizes. Its thresholds are 1,000 domestic day, 500 domestic overnight and 40 international observations. The prepared boolean marks any component below its threshold. This flags uncertainty rather than automatically invalidating the whole estimate; no confidence intervals are invented. The appendix uses Mornington Peninsula while the economic workbook uses Peninsula, so that particular sample join is left null.

### Domestic travel

[TRA domestic tourism results](https://www.tra.gov.au/en/tourism-statistics/domestic-tourism-statistics-results)

Tables 1b and 5b supply five quarters for eight states/territories plus Australia, and two trip types: 90 records. These estimates concern Australian residents aged 14 and over. A trip may visit more than one state and the national total can include unspecified/offshore destinations, so use the published Australia total instead of summing states. These are regional travel estimates, not attraction admissions.

The original Table 1b cell F4 repeats March Quarter 2025. Preparation labels its data 2026-Q1 only after checking that all 27 final-column observations match Table 1a's explicitly labelled March 2026 column. The original file stays unchanged; this correction is in the audit. Five quarters support recent discrete comparisons; they do not establish a long-term trend or recurring seasonality. Historic NVS results should not be spliced into DoTS.

### Community cases

[PAHSMA annual report 2024–25](https://portarthur.org.au/wp-content/uploads/2025/11/PAHSMA-Annual-Report-2024-25.pdf), printed page 6 / PDF page 8: Port Arthur 333,322 day visitors; Cascades Female Factory 33,239 visitors; Coal Mines 16,022 visitors. The three labels reflect the source's venue-specific reporting. Port Arthur day visitors include cruise passengers/crew; Ghost Tour participants are not an extra visitor total.

[Royal Botanic Gardens Victoria annual report 2024–25](https://cdn.rbg.vic.gov.au/media/jc0jkbhl/rbg535-annual-report-2024-25-fa-web.pdf), printed page 23 / PDF page 25: overall visits 2.0 million against 2.3 million target; school student attendances 42,978 against 35,000; programming attendances 708,909 against 400,000. Overall visits are rounded in the source. Participation counts can overlap visits and each other. They show reported use, not a measured improvement in wellbeing or educational attainment.

The transcription is held in `scripts/case_study_extract.json`. Both source pages were visually checked. These are two illustrative management organisations, not a representative statistical sample of Australian communities. Link to the reports and present attributed factual measures; do not reuse report photographs or layouts without checking their separate permissions.

## Validation and publication boundaries

The preparation script checks unique keys, expected source structure, finite numeric values, all SA2 matches, industry totals, direct/indirect totals, polygon validity, point-join ambiguity, source-header consistency and output JSON validity. SHA-256 hashes make inputs and outputs traceable. Browser-level performance, visual map quality, accessibility and final chart calculations will be checked when the website exists.

Keep the large original archive out of GitHub Pages. The selected data files can be shared in the repository with attribution; preserve publisher licence conditions, particularly the OSM-derived database licence. Refresh the release check before submission and document any changes to the snapshot rather than silently mixing vintages.
