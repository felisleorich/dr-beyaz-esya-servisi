"""Regression cases for browser-compatible inline-script hash collection."""
from pathlib import Path
import base64
import hashlib
import importlib.util
import unittest

spec=importlib.util.spec_from_file_location('security_policy',Path(__file__).resolve().parents[1]/'scripts/security-policy.py')
policy=importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)

def digest(body):
    return "'sha256-"+base64.b64encode(hashlib.sha256(body.encode()).digest()).decode()+"'"

class SecurityPolicyTests(unittest.TestCase):
    def hashes(self,html):
        directive=next(part for part in policy.policy_for(html).split('; ') if part.startswith('script-src '))
        return {part for part in directive.split() if part.startswith("'sha256-")}

    def test_closing_tag_whitespace_and_case(self):
        for end in ['</script >','</script\t>','</SCRIPT\n>','</script>']:
            with self.subTest(end=end):
                self.assertEqual(self.hashes('<SCRIPT>window.ok = true;'+end),{digest('window.ok = true;')})

    def test_quoted_angle_bracket_and_data_src_are_not_script_boundaries(self):
        self.assertEqual(self.hashes('<script data-label="a > b" data-src="note">window.ok = true;</script>'),{digest('window.ok = true;')})

    def test_external_scripts_and_json_data_do_not_receive_hashes(self):
        html='<script SRC = "app.js">external</script><script type = "application/ld+json">{}</script><script TYPE="APPLICATION/JSON">{}</script>'
        self.assertEqual(self.hashes(html),set())

    def test_html_comments_do_not_authorize_fake_scripts(self):
        self.assertEqual(self.hashes('<!-- <script>fake()</script> --><script>real()</script>'),{digest('real()')})

    def test_script_raw_text_and_line_endings(self):
        self.assertEqual(self.hashes('<script>const s = "&amp;";\r\nrun();\rdone();</script>'),{digest('const s = "&amp;";\nrun();\ndone();')})

    def test_multiple_scripts_are_separate_and_deduplicated(self):
        self.assertEqual(self.hashes('<script>a()</script><script>b()</script><script>a()</script>'),{digest('a()'),digest('b()')})

    def test_unclosed_or_empty_script_does_not_receive_hash(self):
        self.assertEqual(self.hashes('<script>unfinished()'),set())
        self.assertEqual(self.hashes('<script> \n </script>'),set())

if __name__=='__main__':
    unittest.main()
