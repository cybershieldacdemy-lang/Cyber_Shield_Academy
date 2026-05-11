import re
import json
import os
import ast

file_path = r"d:\new\cyber-chell\src\data\terms-data.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the array part
match = re.search(r"export const terms:\s*Term\[\]\s*=\s*\[(.*?)\];", content, re.DOTALL)
if not match:
    print("Could not find terms array")
    exit()

array_content = match.group(1)

# We can parse the objects using a simple state machine or regex since it's JS objects
# Alternatively, since the file seems to have JSON-like objects (mostly string keys or unquoted keys)
# Let's clean it up to be valid JSON
import js2py # wait, we might not have js2py. 
# Let's just use regex to extract objects
objects_raw = re.findall(r"\{.*?\}", array_content, re.DOTALL)

terms = []
for obj_str in objects_raw:
    # Extract keys and values
    # e.g., { id: 1, termEn: "Access Control", ... }
    obj = {}
    id_m = re.search(r'(?:"id"|id):\s*(\d+)', obj_str)
    en_m = re.search(r'(?:"termEn"|termEn):\s*"([^"]+)"', obj_str)
    ar_m = re.search(r'(?:"termAr"|termAr):\s*"([^"]+)"', obj_str)
    def_ar_m = re.search(r'(?:"definitionAr"|definitionAr):\s*"([^"]+)"', obj_str)
    def_en_m = re.search(r'(?:"definitionEn"|definitionEn):\s*"([^"]+)"', obj_str)
    ex_m = re.search(r'(?:"example"|example):\s*"([^"]+)"', obj_str)
    lvl_m = re.search(r'(?:"level"|level):\s*"([^"]+)"', obj_str)
    cat_m = re.search(r'(?:"categoryId"|categoryId):\s*(\d+)', obj_str)
    
    if id_m and en_m and ar_m:
        obj['id'] = int(id_m.group(1))
        obj['termEn'] = en_m.group(1)
        obj['termAr'] = ar_m.group(1)
        if def_ar_m: obj['definitionAr'] = def_ar_m.group(1)
        if def_en_m: obj['definitionEn'] = def_en_m.group(1)
        if ex_m: obj['example'] = ex_m.group(1)
        if lvl_m: obj['level'] = lvl_m.group(1)
        if cat_m: obj['categoryId'] = int(cat_m.group(1))
        
        # also store original string for replacement
        obj['_raw'] = obj_str
        terms.append(obj)

print(f"Total terms extracted: {len(terms)}")

# Deduplication logic
def normalize(text):
    text = text.strip().lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text

unique_terms = {}
duplicates = []

for term in terms:
    norm_en = normalize(term['termEn'])
    
    if norm_en in unique_terms:
        duplicates.append((term, unique_terms[norm_en]))
    else:
        unique_terms[norm_en] = term

print(f"Duplicates found: {len(duplicates)}")

# Output summary to a json file
out_data = {
    "total_before": len(terms),
    "total_after": len(unique_terms),
    "duplicates_removed": len(duplicates),
    "removed_list": [{"removed": d[0]['termEn'], "kept": d[1]['termEn']} for d in duplicates]
}

with open("dedup_summary.json", "w", encoding="utf-8") as f:
    json.dump(out_data, f, ensure_ascii=False, indent=2)

print("Summary saved to dedup_summary.json")
