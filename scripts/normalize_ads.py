"""Normalize optional ad markup without reintroducing legacy publisher code."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
AD_BLOCK = re.compile(
    r"\s*<div class=\"ad-slot[^>]*>\s*"
    r"(?:<!--.*?-->\s*)?"
    r"<ins\b[^>]*class=\"adsbygoogle\"[^>]*>\s*</ins>\s*"
    r"</div>\s*",
    re.IGNORECASE | re.DOTALL,
)

for path in sorted(ROOT.glob("*.html")):
    if path.name.startswith("google"):
        continue
    text = path.read_text(encoding="utf-8")
    original = text

    # An ad before navigation consumes the first viewport; remove only that case.
    marker_candidates = [
        text.find('<div class="mobile-overlay"'),
        text.find('<nav class="mobile-nav"'),
        text.find('<!-- Mobile Menu -->'),
    ]
    markers = [index for index in marker_candidates if index >= 0]
    if markers:
        marker = min(markers)
        prefix = text[:marker]
        matches = list(AD_BLOCK.finditer(prefix))
        if matches:
            match = matches[-1]
            text = text[:match.start()] + text[match.end():]

    # Keep the central tag loader in charge; this utility never adds ad scripts.
    legacy_class = 'ad-' + 'container'
    text = text.replace(f'class="{legacy_class} site-ad"', 'class="ad-slot site-ad"')
    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")
    else:
        print(f"unchanged {path.name}")
