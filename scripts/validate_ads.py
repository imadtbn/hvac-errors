from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []
html_files = sorted(ROOT.glob("*.html"))

for path in html_files:
    text = path.read_text(encoding="utf-8")
    slots = re.findall(r'data-ad-slot="([^"]+)"', text)
    if not slots:
        continue
    if text.count('src="js/ads.js"') != 1:
        errors.append(f"{path.name}: expected one deferred ads.js reference")
    if text.count('name="google-adsense-account"') != 1:
        errors.append(f"{path.name}: expected one AdSense account meta")
    containers = re.findall(r'<div class="ad-container"[^>]*>(.*?)</div>', text, flags=re.S)
    if len(containers) != len(slots):
        errors.append(f"{path.name}: {len(containers)} containers for {len(slots)} slots")
    for index, container in enumerate(containers, start=1):
        if 'data-ad-managed="true"' not in text:
            errors.append(f"{path.name}: missing managed container marker")
            break
        if 'class="adsbygoogle"' not in container:
            errors.append(f"{path.name}: container {index} has no AdSense ins element")
    first_mobile = min([i for i in (text.find('<div class="mobile-overlay"'), text.find('<nav class="mobile-nav"')) if i >= 0], default=-1)
    if first_mobile >= 0 and '<div class="ad-container"' in text[:first_mobile]:
        errors.append(f"{path.name}: intrusive pre-navigation ad remains")

ads_js = (ROOT / "js" / "ads.js").read_text(encoding="utf-8")
if ads_js.count('window.adsbygoogle.push({});') != 1:
    errors.append("js/ads.js: expected one guarded AdSense push call")
if 'IntersectionObserver' not in ads_js:
    errors.append("js/ads.js: lazy observer is missing")
if 'MutationObserver' not in ads_js:
    errors.append("js/ads.js: dynamic ad observer is missing")

sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
if "hvac-guide-v3" not in sw or "'./js/ads.js'" not in sw:
    errors.append("service-worker.js: cache version or ads.js asset is missing")

if errors:
    print("VALIDATION FAILED")
    print("\n".join(f"- {error}" for error in errors))
    raise SystemExit(1)

print(f"VALIDATION PASSED: {len(html_files)} HTML files scanned")
print("All AdSense pages use one deferred manager, managed containers, and no pre-navigation ad.")
