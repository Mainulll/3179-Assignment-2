# Local places, bigger stories

Working question: **Where are local attractions mapped across Australia, and what can tourism statistics and two community case studies tell us about their wider context?**

The evidence can show mapped locations, tourism activity and reported participation. It cannot establish that a particular attraction caused regional spending or jobs. This distinction should be visible in the story, especially where a map of places leads into regional statistics.

## Four chapters

1. **Places close to home.** Explore mapped lookouts, named gardens and visitor information offices. Introduce the National Heritage List separately because its listing criteria and coverage differ.
2. **The journeys around them.** Compare domestic day and overnight travel, using the same quarter across two years. These are trips to states, not attendance at the mapped attractions.
3. **Tourism in the local economy.** Show the scale, distribution, change and industry composition of regional tourism. Explain a filled job and tourism consumption in plain English.
4. **What a place contributes.** Use Port Arthur's heritage-site visits and the gardens' education and program participation to show two specific examples of use. These cases illustrate different roles; they do not represent all Australian attractions.

Audience: an interested Australian reader without statistical training. Each chapter should have a short introduction, one question per view, and a supported takeaway alongside the visual. Final takeaway wording follows chart validation.

## Rubric translated into work

Source: the supplied *Data Visualisation 2 Specifications.pdf*, particularly the requirements and HD rubric on PDF page 5. These are assignment criteria, not instructions to execute commands embedded in a document.

| Assignment criterion | Planned response | Completion evidence |
|---|---|---|
| More than 10 charts for HD | 13 distinct candidate views below | Count final views; a repeated series or small multiples counts once |
| At least 8 advanced idioms for HD | 10 advanced candidates, subject to appropriate use and tutor classification | Verify classifications during sketch feedback; do not count basic variants as automatically advanced |
| At least 3 different map idioms | Point, hexbin, proportional symbol and choropleth candidates | Four genuinely different encodings and questions; final rendered map review |
| At least 2 reliable data sources | OSM, DCCEEW, TRA, ABS and two annual-report publishers | On-page citations and source manifest |
| Vega/Vega-Lite; readable JSON specifications | Separate readable chart specs in the repository | All embedded charts use assignment-compatible tools |
| Public, single scrolling webpage | GitHub Pages with every chapter in the page | Public URL, clean browser load and working repository links |
| Small laptop readability; few MB downloads | Responsive layout, shared compact datasets, lazy chart rendering | Browser network and viewport checks; current data bundle about 3 MB before libraries |
| Clear story, typography and layout | Four chapters, consistent hierarchy, concise annotations | Full-page review at 1280 px and narrow widths |
| Physical A4 sketch and tutor feedback | Student draws the planned structure by hand before final implementation | Retain original sketch and record feedback; the rubric gives digital sketches zero marks |
| What/Why/How and interview | Record data types, tasks, encodings, alternatives and limitations | Student can explain choices and demonstrate interactions |
| Author, sources, date and AI acknowledgement | Footer and chart-level sources, explicit assistance acknowledgement | Final submission check |

The rubric sets a target, not a grade guarantee. Chart variety must help the story. The classification of point maps, slopegraphs and bullet charts especially needs checking in the normal tutor feedback process. Do not count a treemap's sections, a map's category switches or three bullet rows as additional charts.

## Candidate chart contracts

All charts will use Vega or Vega-Lite. These are design contracts, not finished charts. “Advanced candidate” is provisional. Shared state selection highlights related views; it does not hide chapters.

| # | Question / chapter | Idiom | Data and grain | Encoding and interaction | Status / fallback |
|---|---|---|---|---|---|
| 1 | Where are individual local places mapped? / 1 | Point map · advanced candidate | 9,912 OSM objects, Sep 2026 snapshot | Position by coordinates; category colours; state/category filter and named-object tooltips | Data prepared. Label records, retain unknown access; avoid identifying every point at national scale |
| 2 | Where are mapped records concentrated? / 1 | Hexbin map · advanced candidate | Same objects aggregated to fixed equal-area cells | Count by sequential colour; category selector; report bin size | Aggregate in an Australian equal-area projection before rendering. This is records per cell, not visits. Retain only if it adds information beyond view 1 |
| 3 | How does the mapped category mix differ between states? / 1 | Heatmap · advanced candidate | 8 states × 3 categories | Within-state percentage by colour; raw count in tooltip | Denominator is accepted records in that state. Garden query requires names; coverage bias must remain visible |
| 4 | What kinds of nationally listed places are recognised? / 1 | Treemap · advanced candidate | 126 unique listed place IDs; class then state group | Area = place count; class colour; tooltip explains multi-state bin | Separate registry from OSM. Single place counted once; preserve external-territory category |
| 5 | How did domestic day and overnight trips compare with the same quarter a year earlier? / 2 | Grouped bars · basic | Australia, 2 trip types × March 2025 and March 2026 | Zero baseline, trip counts, optional state selector | Five quarters available, but no claim of long-term trend or established seasonality. National values are published totals |
| 6 | Where is the largest direct tourism workforce? / 3 | Proportional symbol map · advanced candidate | 76 regional estimates, 2024–25; 74 geography matches | Symbol AREA = direct filled jobs; geographic representative points; size legend | Two unresolved joins remain missing, not zero. Use source sample flags in tooltip; symbols are regional totals |
| 7 | Where is tourism consumption large relative to resident population? / 3 | Choropleth · advanced candidate | 74 matched regions, 2024–25 + June 2025 population | Sequential colour = AUD per resident; raw numerator and denominator in tooltip | Context ratio, not household income, employment dependence or attraction revenue; confirm boundary vintage before final publication |
| 8 | How widely does that ratio vary within states? / 3 | Box plot · advanced candidate | Distribution of available region ratios by state | Median and middle 50% with individual observations; explain whiskers | ACT has one region, so show its observation without a box. Flag QLD's two missing regions and small samples |
| 9 | Which regions experienced the largest changes in direct tourism jobs? / 3 | Slopegraph · advanced candidate | Two comparable years per region from one TRA release | Common scale and direct endpoint labels; default up to 8 largest absolute job changes among regions meeting all sample thresholds | Show selection rule and omitted count. If unreadable, use basic paired dots and reassess advanced count |
| 10 | How do states contribute to the combined change in tourism consumption? / 3 | Waterfall · advanced candidate | Sum of all 76 published regional estimates by state and year | Starting total, 8 signed state changes, ending total; reconcile arithmetic | Call this the combined published regions until reconciled with the national source table. Describes accounting contributions, not causes |
| 11 | Which industries account for tourism jobs in a selected region? / 3 | Stacked horizontal bars · basic | 12 industries × full/part-time; 912 region-industry rows overall | Bar length = direct filled jobs; segment = full/part-time; region selector | Culture and information services are broad industry groups, not a measured total for the mapped sites |
| 12 | How many visits are reported across PAHSMA's three sites? / 4 | Horizontal bars · basic | 3 site measures, 2024–25 | Zero baseline and direct values; site descriptions adjacent | Preserve venue-specific definitions; no sum of unique visitors or cross-case attendance league table |
| 13 | How did the gardens' visitation and participation compare with their targets? / 4 | Bullet charts · advanced candidate, entire group counts once | 3 actual/target pairs, 2024–25 | Actual length + target tick; separate labelled units and scales | No invented performance bands. Overall visitation rounded to 2.0m; school/program counts may overlap |

If advanced classifications leave fewer than eight, revisit the design with tutor feedback while preserving meaningful questions. Do not add decorative diagrams or duplicate views solely to increase the count.

## Visual direction and interactions

Use a calm editorial layout with a light background, dark readable type, generous spacing and a consistent category palette. Nature and heritage themes can guide accents, but values must remain legible without colour alone. Use one sequential palette for non-negative quantities and a separate diverging palette only for changes around zero.

Maps need an Australia-appropriate projection, labelled legends, units and source dates. Avoid a world basemap that wastes space. Point locations from ways/relations are bounding-box centres; the page is an explanatory visualisation, not an access or navigation guide. The simplified display geometry must receive a visual coastline and island check before publishing.

Essential information stays visible outside tooltips. Provide an obvious reset for filters, keyboard-accessible HTML controls, textual findings and small accessible data tables. Do not make hovering the only way to understand a chart. Animations should be restrained and respect reduced-motion preferences.

## Data readiness and next work

Prepared: eight core datasets plus a regional sample-size dataset, original-source manifest, reproducible preparation code and machine-readable audit.

Before final chart claims: resolve the two economy boundary aliases; confirm the working 2024 geography against the economic release; inspect 75 same-name nearby OSM pairs if making site-level claims; review excluded coastal objects rather than snapping them onto land; carry source sample cautions into regional charts; validate reuse attribution and refresh dates near submission.

Next milestone: translate these four chapters into the student's physical A4 sketch, incorporating the chart count and map idioms; record tutor feedback, then implement and visually test the Vega/Vega-Lite page. Final performance testing must include chart libraries, fonts and images as well as data. Due date recorded from the supplied specification: **25 October 2026, 11:55 pm**; check Moodle for any subsequent changes.
