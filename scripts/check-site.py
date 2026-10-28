"""Offline release checks for every public page. Exit nonzero on a regression."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, re, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors, pages = [], {}
references = galleries = images = 0
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Page(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name=name; self.links=[]; self.ids=[]; self.h1=0; self.canonical=[]
        self.meta=[]; self.images=[]; self.stack=[]; self.controls=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('a','button') and any(t in self.stack for t in ('a','button')):
            errors.append([self.name,'nested interactive element',tag])
        if tag not in VOID: self.stack.append(tag)
        if tag=='h1': self.h1+=1
        if 'id' in a: self.ids.append(a['id'])
        if 'aria-controls' in a: self.controls.extend(a['aria-controls'].split())
        for key in ('href','src'):
            if key in a: self.links.append(a[key])
        if 'srcset' in a:
            self.links.extend(v.strip().split()[0] for v in a['srcset'].split(',') if v.strip())
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
        if tag=='meta' and a.get('name')=='description': self.meta.append(a.get('content'))
        if tag=='img': self.images.append(a)
    def handle_endtag(self, tag):
        if tag in self.stack: self.stack=self.stack[:len(self.stack)-1-self.stack[::-1].index(tag)]

files = list(ROOT.glob('*.html')) + list((ROOT/'en').glob('*.html')) + list((ROOT/'blog').glob('*.html'))
for p in sorted(files):
    if p.name=='site-editor.html': continue
    name=p.relative_to(ROOT).as_posix(); s=p.read_text('utf8'); d=Page(name); d.feed(s)
    pages[p.resolve()]=(d,s,name)
    if not re.search(r'http-equiv=["\']refresh',s,re.I):
        for bad, label in [(d.h1!=1,'one H1 required'),(len(d.canonical)!=1,'one canonical required'),
                           (len(d.meta)!=1 or not all(d.meta),'description required'),
                           ('ds-page' not in s,'missing shared design'),
                           (not re.search(r'1 yıl|1-year|1 year',s),'missing parts warranty'),
                           ('\ufffd' in s,'invalid text encoding')]:
            if bad: errors.append([name,label])
        for feature in ['data-site-search','site-search.css?v=20261028a','site-search.js?v=20261028a']:
            if s.count(feature)!=1: errors.append([name,'search must be included once',feature])
        for h in re.findall(r'<h[1-3]\b[^>]*>(.*?)</h[1-3]>',s,re.S):
            if 'beyaz eşya servisi' in h: errors.append([name,'service heading capitalization'])
        if 'Yeni Mahallesi' in s: errors.append([name,'use Yeni Mahalle'])
    for i,c in Counter(d.ids).items():
        if c>1: errors.append([name,'duplicate id',i])
    for control in d.controls:
        if control not in d.ids: errors.append([name,'missing aria-controls target',control])
    for a in d.images:
        images+=1
        if not a.get('alt'): errors.append([name,'missing image alt',a.get('src')])
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',s,re.S):
        try: json.loads(block)
        except ValueError: errors.append([name,'invalid JSON-LD'])
    if 'gx-gallery' in s and 'customer-experience.js?v=20261027d' not in s:
        errors.append([name,'missing gallery initialization'])
    for gallery in re.findall(r'<div class="gx-frames".*?</div>',s,re.S):
        galleries+=1; photos=re.findall(r'<img[^>]*src="([^"]+)',gallery)
        if len(photos)<2 or len(photos)!=len(set(photos)): errors.append([name,'missing/duplicate gallery photos'])

for p,(d,s,name) in pages.items():
    for u in d.links:
        x=urlsplit(u)
        if x.scheme or x.netloc: continue
        references+=1
        dest=((ROOT/unquote(x.path).lstrip('/') if x.path.startswith('/') else p.parent/unquote(x.path)).resolve() if x.path else p)
        if not dest.is_relative_to(ROOT): errors.append([name,'link leaves site',u]); continue
        if dest.is_dir(): dest=dest/'index.html'
        if not dest.exists(): errors.append([name,'missing local target',u])
        elif x.fragment and dest in pages and unquote(x.fragment) not in pages[dest][0].ids:
            errors.append([name,'missing fragment',u])

urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
if len(urls)!=len(set(urls)): errors.append(['sitemap','duplicate URLs'])
for u in urls:
    x=urlsplit(u); dest=(ROOT/(x.path.lstrip('/') or 'index.html')).resolve()
    if dest.is_dir(): dest=dest/'index.html'
    if dest not in pages: errors.append(['sitemap','missing public page',u]); continue
    d,s,name=pages[dest]
    if re.search(r'http-equiv=["\']refresh|name="robots" content="noindex',s,re.I): errors.append([name,'nonindexable sitemap page'])
    if d.canonical!=[u]: errors.append([name,'sitemap/canonical mismatch',u,d.canonical])

report=dict(public_pages=len(pages),local_references=references,images=images,galleries=galleries,sitemap_urls=len(urls),errors=errors)
(ROOT/'test-results').mkdir(exist_ok=True)
(ROOT/'test-results/site-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False)); raise SystemExit(bool(errors))
