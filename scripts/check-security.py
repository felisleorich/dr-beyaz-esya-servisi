"""Release guardrails. Findings report filenames only, never credential values."""
from pathlib import Path
import subprocess,re,json,importlib.util
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('policy',ROOT/'scripts/security-policy.py')
policy=importlib.util.module_from_spec(spec);spec.loader.exec_module(policy)
errors=[]; scanned=0
patterns={
 'GitHub token':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b',
 'AWS access key':r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
 'Private key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'Live payment secret':r'\bsk_live_[A-Za-z0-9]{20,}\b',
 'Google API key':r'\bAIza[A-Za-z0-9_-]{35}\b'
}
names=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode('utf8').split('\0')
for name in filter(None,names):
 p=ROOT/name
 if p.suffix.lower() not in {'.html','.js','.cjs','.py','.json','.yml','.yaml','.md','.txt','.csv','.css'}:continue
 try:s=p.read_text('utf8')
 except (UnicodeDecodeError,FileNotFoundError):continue
 scanned+=1
 for label,pattern in patterns.items():
  if re.search(pattern,s):errors.append([name,label+' pattern found'])
for p in policy.public_pages():
 s=p.read_text('utf8');name=p.relative_to(ROOT).as_posix()
 if s!=policy.expected(s):errors.append([name,'security policy is stale'])
 if re.search(r'<[^>]+\son[a-z]+\s*=',s,re.I):errors.append([name,'inline event handler'])
 if re.search(r'(?:src|action)=["\']http://',s,re.I):errors.append([name,'insecure resource'])
for p in (ROOT/'.github/workflows').glob('*.yml'):
 s=p.read_text('utf8')
 for action in re.findall(r'uses:\s*([^\s#]+)',s):
  if not re.fullmatch(r'[\w.-]+/[\w./-]+@[a-f0-9]{40}',action):errors.append([p.name,'action is not pinned to a commit',action])
 if 'pull_request_target:' in s:errors.append([p.name,'privileged pull request trigger requires review'])
config=(ROOT/'_config.yml').read_text('utf8')
for path in ['site-editor.html','scripts','tests','outputs','package.json','package-lock.json']:
 if not re.search(r'^  - '+re.escape(path)+r'$',config,re.M):errors.append(['_config.yml','missing publication exclusion',path])
report={'text_files_scanned':scanned,'public_security_policies':len(policy.public_pages()),'errors':errors}
(ROOT/'test-results').mkdir(exist_ok=True)
(ROOT/'test-results/security-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False));raise SystemExit(bool(errors))
