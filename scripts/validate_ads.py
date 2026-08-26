"""Validate optional AdSense markup and central tag-loader integration."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []
html_files = sorted(path for path in ROOT.glob("*.html") if not path.name.startswith("google"))
loader_ref = 'js/site-tags.js?v=20260826'
legacy_publisher = 'ca-pub-' + '5656416032906373'

for path in html_files:
    text = path.read_text(encoding="utf-8")
    if text.count(loader_ref) != 1:
        errors.append(f"{path.name}: expected one central site-tags.js reference")
    if 'googletagmanager.com/gtag/js' in text or "gtag('config'" in text:
        errors.append(f"{path.name}: legacy direct GA4 block remains")
    slots = re.findall(r'data-ad-slot="([^"]+)"', text)
    units = re.findall(r'<ins\b[^>]*class="adsbygoogle"[^>]*>\s*</ins>', text, flags=re.S)
    containers = re.findall(r'<div class="ad-slot[^>]*>(.*?)</div>', text, flags=re.S)
    if len(containers) != len(units) or len(units) != len(slots):
        errors.append(f"{path.name}: ad-slot/container/unit count mismatch")
    for index, container in enumerate(containers, start=1):
        if 'class="adsbygoogle"' not in container:
            errors.append(f"{path.name}: ad-slot {index} has no AdSense ins element")
        if 'data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"' not in container:
            errors.append(f"{path.name}: ad-slot {index} must keep the documented publisher placeholder")
        if 'data-ad-slot="xxxxxxxx"' not in container:
            errors.append(f"{path.name}: ad-slot {index} must keep the documented slot placeholder")
    first_mobile = min(
        [i for i in (text.find('<div class="mobile-overlay"'), text.find('<nav class="mobile-nav"')) if i >= 0],
        default=-1,
    )
    if first_mobile >= 0 and '<div class="ad-slot' in text[:first_mobile]:
        errors.append(f"{path.name}: intrusive pre-navigation ad remains")
    legacy_class = 'ad-' + 'container'
    legacy_manager = 'js/' + 'ads.js'
    if legacy_publisher in text or legacy_class in text or legacy_manager in text:
        errors.append(f"{path.name}: legacy ad integration remains")

site_tags = (ROOT / "js" / "site-tags.js").read_text(encoding="utf-8")
for required in ("ga4Id", "gtmId", "adsenseClient", "clarityId", "loadGTM", "loadAdSense"):
    if required not in site_tags:
        errors.append(f"js/site-tags.js: missing {required}")
if legacy_publisher in site_tags or ('ads/' + 'js') in site_tags:
    errors.append("js/site-tags.js: legacy publisher or manager reference remains")

sw = (ROOT / "service-worker.js").read_text(encoding="utf-8")
if "hvac-guide-v4-tags" not in sw or "'./js/site-tags.js'" not in sw:
    errors.append("service-worker.js: central loader cache entry/version is missing")

if errors:
    print("VALIDATION FAILED")
    print("\n".join(f"- {error}" for error in errors))
    raise SystemExit(1)

print(f"VALIDATION PASSED: {len(html_files)} HTML files scanned")
print("All content pages use one central loader and optional placeholder-backed ad slots.")
