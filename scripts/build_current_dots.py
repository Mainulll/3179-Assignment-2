"""Extract the current official quarterly comparison without joining it to NVS."""
import hashlib,json,sys
from pathlib import Path
import openpyxl
ROOT=Path(__file__).resolve().parents[1]
p=Path(sys.argv[1]);w=openpyxl.load_workbook(p,data_only=True)
url='https://www.tra.gov.au/content/dam/austrade-assets/global/wip/tra/documents/dots/tra-dots-june-quarter-2026-compared-to-june-quarter-2025.xlsx'
metrics=[('overnight_trips','Overnight trips','million trips','Table 1a',7,14),('nights','Overnight nights','million nights','Table 1a',17,24),('spend','Overnight regional spend','A$ billion','Table 1a',27,34),('day_trips','Day trips','million trips','Table 5a',7,14)]
rows=[]
for geo,colrow in [('Victoria',4),('Australia',5)]:
 for metric,title,unit,sheet,vic,aus in metrics:
  row=vic if geo=='Victoria' else aus
  assert w[sheet][f'A{row}'].value in ['Victoria','Australiab']
  previous=float(w[sheet][f'B{row}'].value);current=float(w[sheet][f'C{row}'].value)
  for year,column,raw in [(2025,'B',previous),(2026,'C',current)]:
   rows.append({'geography':geo,'metric':metric,'metric_label':title,'unit':unit,'year':year,'period':f'June quarter {year}','value':raw/1000,'raw_value':raw,'raw_unit':'A$ million' if metric=='spend' else 'thousand','change_pct':(current/previous-1)*100,'cell':f"'{sheet}'!{column}{row}"})
(ROOT/'data/dv2/dots-quarter.json').write_text(json.dumps(rows,indent=2)+'\n')
(ROOT/'docs/dv2/dots_current_source.json').write_text(json.dumps({'publisher':'Tourism Research Australia','collection':'Domestic Tourism Statistics (DoTS)','period':'April–June 2026 versus April–June 2025','checked_on':'2026-10-21','release_date':'not verified; not inferred','population':'Australian residents aged 14 years and over (workbook footnotes)','results_page':'https://www.tra.gov.au/en/tourism-statistics/domestic-tourism-statistics-results','workbook_url':url,'workbook_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'methodology_note':'DoTS replaced NVS from January 2025. This quarter comparison is kept separate from original annual NVS2019–2024 figures. Revised comparable backcasts are a distinct source, not the old NVS observations.','records':rows},indent=2)+'\n')
print('Extracted 16 source-cell comparisons for Victoria/Australia; raw units retained')
