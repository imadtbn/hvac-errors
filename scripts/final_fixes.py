#!/usr/bin/env python3
"""Final fixes:
1. Add CollectionPage JSON-LD to articles.html listing page
2. Sync test server copy
"""
import json, re

BASE = "/home/ubuntu/hvac-errors"


def read(p):
    with open(f"{BASE}/{p}") as f:
        return f.read()


def write(p, content):
    with open(f"{BASE}/{p}", "w") as f:
        f.write(content)


# Add CollectionPage JSON-LD to articles listing page
html = read("articles.html")
collection_ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "مقالات صيانة التكييف والتعليمية",
    "url": "https://imadtbn.github.io/hvac-errors/articles.html",
    "inLanguage": "ar",
    "description": "مقالات تعليمية متخصصة في صيانة أجهزة التكييف المنزلية",
}
block = (
    "  <script type=\"application/ld+json\">\n    "
    + json.dumps(collection_ld, ensure_ascii=False).replace("},", "},\n    ")
    + "\n  </script>\n"
)
# insert right before </head>
html = html.replace("</head>", block + "</head>")
write("articles.html", html)

# Also add CollectionPage to brands listing and ItemList to errors listing? 
# brands.html and errors.html: add ItemList via static JSON-LD is dynamic; 
# instead add OfferCatalog-like for brands page. Keep it simple: Organization already there.
print("done")
