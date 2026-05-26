# Medicaplanet - Peptide Product Update Package

Pulled from **purechainresearch.com** per the client's spreadsheet instructions.

## What's in this folder

| File | What it does |
|---|---|
| `descriptions.txt` | Human-readable list: product name, image filename, first-line description, source URL, and mapping notes. |
| `manifest.csv` | Same data as above but in CSV format - good for importing into Excel or a script. |
| `download_images.ps1` | PowerShell script that downloads all images from purechain into the `images/` folder. |
| `images/` | Empty folder. Will be filled with images after running the PowerShell script. |

## How to use

### Step 1: Drop this folder into your project
Extract or copy the contents into:
`C:\Users\63950\Desktop\gabby\medicaplanet`

### Step 2: Download the images
1. Open the folder in File Explorer
2. Hold **Shift + Right-click** in empty space -> "Open PowerShell window here" (or "Open in Terminal")
3. Run:
   ```powershell
   .\download_images.ps1
   ```
   If you get an execution-policy error, run this first:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   Then run the script again.

The script will download all images to the `images/` subfolder, named after each medica product.

### Step 3: Review descriptions.txt
Open `descriptions.txt` to see, for each product:
- Which image to use (filename)
- The first-line description to paste in your product page
- Any mapping notes (dosage mismatches, items not found, etc.)

## Important notes

- **Items not found on purechain**: `2X Blend Tesamorelin+Ipamorelin`, `KPV 10mg`, `Tesofensine 500mcg`. You'll need to source these elsewhere.
- **Dosage mismatches** (purechain uses closest available):
  - `ARA-290 14mg` -> purechain has 10mg
  - `CJC-1295 With DAC 10mg` -> purechain has 5mg
  - `Retatrutide 20mg` -> purechain has 24mg
- **Purechain code names**:
  - `GLP-1 S` = Semaglutide
  - `GLP-1 T` = Tirzepatide
  - `GLP-1 R` = Retatrutide
- **Generic images**: BPC-157, Cagrilintide, GLP-1 (S/T/R), CJC-1295, and a few others use the SAME image across all dosages on purechain. So Semaglutide 5/10/20mg will all have the identical `GLP-1-S.png` image, just renamed for clarity.

## Description format

Every purechain product uses the same templated first sentence:

> "[Product Name]" (X mg) is a research-grade peptide supplied in lyophilized powder form for laboratory and investigational use.

You may want to rewrite these in your own voice for the medicaplanet pages instead of pasting verbatim.
