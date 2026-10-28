"""Stage only tracked public files, excluding tooling and internal build reports."""
from pathlib import Path
import subprocess, shutil
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'release-site'
if DEST.exists(): raise SystemExit('Use a clean release-site directory for packaging.')
files=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode('utf8').split('\0')
excluded={'.github','scripts','tests','outputs','node_modules','test-results','playwright-report','release-site'}
root_allowed={'.nojekyll','CNAME','robots.txt','sitemap.xml'}
count=0
for name in filter(None,files):
    path=Path(name)
    if path.parts[0] in excluded: continue
    if len(path.parts)==1 and path.suffix not in {'.html','.css','.js','.json','.xml','.txt','.ico','.webmanifest'} and name not in root_allowed: continue
    if name in {'package.json','package-lock.json','playwright.config.cjs'}: continue
    target=DEST/path; target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(ROOT/path,target); count+=1
(DEST/'.nojekyll').touch()
if not (DEST/'index.html').exists() or not (DEST/'assets/search-index.json').exists(): raise SystemExit('Incomplete release')
print(f'Packaged {count} tracked public files.')
