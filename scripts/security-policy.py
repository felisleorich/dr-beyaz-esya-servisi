"""Generate a reproducible CSP for the public static pages; never use a static nonce.

GitHub Pages cannot set custom response headers. This meta policy deliberately
does not pretend to provide frame-ancestors, HSTS or Permissions-Policy headers.
"""
from pathlib import Path
import argparse, base64, hashlib, re

ROOT=Path(__file__).resolve().parents[1]
POLICY=re.compile(r'<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*',re.I)
REFERRER=re.compile(r'<meta\s+name="referrer"[^>]*>\s*',re.I)
GOOGLE="https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://*.google.com.tr https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://www.googleadservices.com https://ad.doubleclick.net"

def public_pages():
    return sorted(p for p in [*ROOT.glob('*.html'),*(ROOT/'en').glob('*.html'),*(ROOT/'blog').glob('*.html')] if p.name!='site-editor.html')

def policy_for(source):
    hashes=[]
    for attrs,body in re.findall(r'<script\b([^>]*)>(.*?)</script>',source,re.S|re.I):
        if re.search(r'\bsrc\s*=',attrs,re.I) or re.search(r'type=["\']application/(?:ld\+)?json',attrs,re.I) or not body.strip():continue
        digest=base64.b64encode(hashlib.sha256(body.replace('\r\n','\n').encode('utf8')).digest()).decode()
        hashes.append("'sha256-"+digest+"'")
    # External script allowlist is limited to the existing Google measurement platform.
    return '; '.join([
        "default-src 'self'", "base-uri 'none'", "object-src 'none'", "form-action 'none'",
        "script-src 'self' https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com "+' '.join(sorted(set(hashes))),
        "script-src-attr 'none'", "style-src 'self' 'unsafe-inline'", "font-src 'self' data:",
        "img-src 'self' data: https://images.pexels.com "+GOOGLE,
        "connect-src 'self' "+GOOGLE,
        "frame-src https://www.google.com https://www.googletagmanager.com",
        # HTTPS is enforced by the host's HTTP-to-HTTPS redirect. All external
        # sources here are HTTPS. An upgrade directive also rewrites loopback
        # asset URLs in WebKit, breaking the otherwise identical local preview.
        "media-src 'self'", "worker-src 'none'"
    ])

def expected(source):
    clean=REFERRER.sub('',POLICY.sub('',source))
    policy='<meta http-equiv="Content-Security-Policy" content="'+policy_for(clean)+'">\n<meta name="referrer" content="strict-origin-when-cross-origin">\n'
    # Enforce before any executable content while preserving the first charset declaration.
    charset=re.search(r'<meta[^>]*charset=[^>]+>',clean,re.I)
    if not charset:raise ValueError('Missing charset')
    return clean[:charset.end()]+'\n'+policy+clean[charset.end():].lstrip('\r\n')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    changed=[]
    for page in public_pages():
        source=page.read_text('utf8');result=expected(source)
        if result!=source:
            changed.append(page.name)
            if not args.check:page.write_text(result,encoding='utf8')
    if args.check and changed:raise SystemExit('Security policies need regeneration: '+', '.join(changed[:12]))
    print(f'Checked {len(public_pages())} public security policies; updated {len(changed) if not args.check else 0}.')
