#!/usr/bin/env python3
"""N.2.4 — Extract launch banis from the Shabad OS database (MIT) into raw JSON.
Usage: npm pack @shabados/database && tar xzf *.tgz
       python3 scripts/extract-banis.py package/dist/master.sqlite
Then:  node scripts/build-banis.mjs   (adds transliteration, writes src/content/banis/*.json)
Never hand-edit Gurbani text; re-run this script instead."""
import json, re, sqlite3, sys

db = sqlite3.connect(sys.argv[1])
EN, PA = "DSSK", "PSST"  # English: Sant Singh Khalsa · Punjabi: Prof. Sahib Singh

def lines(bani):
    q = """select bl.line_order, bl.line_id, p.data,
           (select data from asset_lines where line_id=bl.line_id and asset_id=? and type='translation' limit 1),
           (select data from asset_lines where line_id=bl.line_id and asset_id=? and type='translation' limit 1)
           from bani_lines bl join asset_lines p on p.line_id=bl.line_id and p.type='primary'
           where bl.bani_id=? order by bl.section_order, bl.line_order"""
    out = []
    for order, lid, gur, en, pa in db.execute(q, (EN, PA, bani)):
        out.append({"id": lid, "gurmukhiVishraam": gur, "en": en, "pa": pa})
    return out

GNUM = str.maketrans("੦੧੨੩੪੫੬੭੮੯", "0123456789")
def ends_pauri(text):
    m = re.search(r"॥([੦-੯]+)॥\s*$", text)
    return int(m.group(1).translate(GNUM)) if m else None

japji = lines("JAPJ")
# Mool Mantar = first line. Japji pauris 1–5 = intro (Mool Mantar, Jap, Salok) + pauris up to ॥੫॥.
intro_end = next(i for i, l in enumerate(japji) if ends_pauri(l["gurmukhiVishraam"]) == 1)  # salok ॥੧॥
end5, seen = None, 0
for i, l in enumerate(japji[intro_end + 1 :], start=intro_end + 1):
    if ends_pauri(l["gurmukhiVishraam"]):
        seen += 1
        if seen == 5:
            end5 = i
            break

raw = {
    "mool-mantar": japji[:1],
    "japji-1-5": japji[: end5 + 1],
    "kirtan-sohila": lines("SHLA"),
    "sukhmani": lines("SKMI"),
}
json.dump(raw, open("scripts/banis.raw.json", "w"), ensure_ascii=False)
print({k: len(v) for k, v in raw.items()})
