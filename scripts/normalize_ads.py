from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLISHER = "ca-pub-5656416032906373"

AD_BLOCK = re.compile(
    r"\s*<div class=\"ad-container\">\s*"
    r"(?:<!--.*?-->\s*)?"
    r"<ins\b[^>]*class=\"adsbygoogle\"[^>]*>\s*</ins>\s*"
    r"</div>\s*",
    re.IGNORECASE | re.DOTALL,
)

for path in sorted(ROOT.glob("*.html")):
    text = path.read_text(encoding="utf-8")
    original = text

    # A first ad immediately below the header creates an intrusive first viewport.
    # Remove only that first pre-navigation ad; keep contextual units elsewhere.
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

    # Mark every remaining unit for the unified lazy loader and shared CSS.
    text = text.replace(
        '<div class="ad-container">',
        '<div class="ad-container" data-ad-managed="true">',
    )

    # Keep the publisher declaration explicit on every page that serves ads.
    if 'name="google-adsense-account"' not in text and 'data-ad-slot=' in text:
        text = text.replace(
            '  <!-- Google AdSense -->',
            '  <!-- Google AdSense -->\n'
            f'  <meta name="google-adsense-account" content="{PUBLISHER}">',
            1,
        )

    # One deferred manager is shared by all pages; no duplicate inline push calls.
    if 'src="js/ads.js"' not in text and 'data-ad-slot=' in text:
        text = text.replace(
            '  <!-- Google AdSense -->',
            '  <script defer src="js/ads.js"></script>\n\n  <!-- Google AdSense -->',
            1,
        )

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")
    else:
        print(f"unchanged {path.name}")
