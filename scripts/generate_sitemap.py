#!/usr/bin/env python3
"""Generate a complete, professional sitemap.xml including all dynamic
error detail pages and brand/category listing variants."""
import json
from datetime import date

BASE = "/home/ubuntu/hvac-errors"
SITE = "https://imadtbn.github.io/hvac-errors/"
TODAY = date.today().isoformat()

with open(f"{BASE}/data/brands.json") as f:
    BRANDS = json.load(f)
with open(f"{BASE}/data/errors.json") as f:
    ERRORS = json.load(f)

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]


def url(loc, priority, changefreq, lastmod=TODAY):
    return (
        f"  <url>\n"
        f"    <loc>{SITE}{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        f"  </url>"
    )


# Static pages
lines.append(url("", "1.0", "weekly"))
lines.append(url("index.html", "1.0", "weekly"))
lines.append(url("errors.html", "0.9", "weekly"))
lines.append(url("brands.html", "0.8", "monthly"))
lines.append(url("articles.html", "0.8", "weekly"))
lines.append(url("search.html", "0.7", "monthly"))
lines.append(url("about.html", "0.6", "monthly"))
lines.append(url("contact.html", "0.6", "monthly"))
lines.append(url("faq.html", "0.6", "monthly"))
lines.append(url("privacy.html", "0.4", "yearly"))
lines.append(url("disclaimer.html", "0.4", "yearly"))

# Dynamic error detail pages (canonical, self-contained content)
for err in ERRORS:
    loc = f"error.html?id={err['id']}"
    lines.append(url(loc, "0.8", "monthly"))

# Brand listing variants (curated entry points, high value for long-tail)
for b in BRANDS:
    lines.append(url(f"errors.html?brand={b['id']}", "0.8", "monthly"))

# Category listing variants
categories = sorted({e["category"] for e in ERRORS})
for cat in categories:
    lines.append(url(f"errors.html?category={cat}", "0.8", "monthly"))

lines.append("</urlset>")

with open(f"{BASE}/sitemap.xml", "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"sitemap.xml generated: {len(ERRORS)} errors, {len(BRANDS)} brands, {len(categories)} categories")
