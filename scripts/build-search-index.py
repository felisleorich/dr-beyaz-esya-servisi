"""Build the public search catalogue exclusively from indexable sitemap pages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import argparse, json, re, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.heading = []; self.inside_h1 = False
        self.description = ''; self.lang = 'tr'; self.noindex = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html': self.lang = attrs.get('lang', 'tr')
        if tag == 'h1': self.inside_h1 = True
        if tag == 'br' and self.inside_h1: self.heading.append(' ')
        if tag == 'meta':
            if attrs.get('name') == 'description': self.description = attrs.get('content', '')
            if attrs.get('name') == 'robots' and 'noindex' in attrs.get('content', ''): self.noindex = True
    def handle_endtag(self, tag):
        if tag == 'h1': self.inside_h1 = False
    def handle_data(self, text):
        if self.inside_h1: self.heading.append(text)

def generate():
    urls = [node.text for node in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
    areas = set(re.findall(r'href="([a-z-]+)-beyaz-esya-servisi.html"', (ROOT/'pendik-mahalleleri.html').read_text('utf8')))
    areas.update(['pendik', 'kurtkoy', 'tuzla', 'kartal'])
    brands = {p.name.removesuffix('-ozel-servis.html') for p in ROOT.glob('*-ozel-servis.html')}
    services = {f'{device}-servisi.html' for device in ['buzdolabi','camasir-makinesi','bulasik-makinesi','kurutma-makinesi','derin-dondurucu','firin-ocak','klima','kombi']}
    records = []
    for url in sorted(set(urls)):
        path = urlsplit(url).path.lstrip('/') or 'index.html'
        if path.endswith('/'): path += 'index.html'
        # Never index admin, exports, redirects, or a user-supplied path.
        if not re.fullmatch(r'(?:en/|blog/)?[a-z0-9-]+\.html', path): continue
        source = (ROOT/path).read_text('utf8'); page = Page(); page.feed(source)
        if page.noindex or re.search(r'http-equiv=["\']refresh', source, re.I): continue
        title = re.sub(r'\s+', ' ', ''.join(page.heading)).strip().rstrip('.')
        if not title: raise ValueError('Missing heading: ' + path)
        category = 'info'
        if path in services or path == 'hizmetler.html': category = 'service'
        elif any(path.startswith(area+'-') for area in areas) or path == 'pendik-mahalleleri.html': category = 'area'
        elif any(path.startswith(brand+'-') for brand in brands) or path == 'markalar.html': category = 'brand'
        if any(word in path for word in ['ariza-rehberi','hata-kod','sogutmuyor','isitmiyor','su-almiyor','su-bosaltmiyor','su-akitiyor','sikmiyor','buzlaniyor','ses-yapiyor','temiz-yikamiyor','donmuyor','calismiyor','kapanmiyor','kurutmuyor']): category = 'guide'
        description = re.sub(r'\s+', ' ', page.description).strip()
        if len(description) > 170: description = description[:167].rsplit(' ',1)[0] + '…'
        records.append(dict(url=path,title=title,description=description,category=category,lang=page.lang))
    return json.dumps(records, ensure_ascii=False, separators=(',',':')) + '\n'

if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--check',action='store_true'); args=parser.parse_args()
    output=ROOT/'assets/search-index.json'; content=generate()
    if args.check:
        if not output.exists() or output.read_text('utf8') != content:
            raise SystemExit('Search index is out of date. Run python scripts/build-search-index.py')
    else: output.write_text(content,encoding='utf8')
    print(json.dumps({'search_pages':len(json.loads(content)),'bytes':len(content.encode('utf8'))}))
