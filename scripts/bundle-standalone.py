"""Build the offline, double-clickable atlas from the exact static site sources."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
three = (dist / 'vendor/three.module.js').read_text()
match = re.search(r'export \{([^}]+)\};?\s*$', three)
if not match:
    raise RuntimeError('Unexpected Three.js export format')
exports = []
for item in match.group(1).split(','):
    names = item.strip().split(' as ')
    exports.append(f'{names[-1]}:{names[0]}')
three = three[:match.start()] + '\nreturn {' + ','.join(exports) + '};'
orbit = (dist / 'vendor/OrbitControls.js').read_text()
orbit = re.sub(r"import\s*\{([^}]+)\}\s*from 'three';", r'const {\1}=THREE;', orbit)
orbit = re.sub(r'export \{[^}]+\};?', 'return {OrbitControls};', orbit)
def module(name, returned):
    source = (dist / name).read_text()
    source = re.sub(r'^import .*?;\s*$', '', source, flags=re.M)
    source = source.replace('export class ', 'class ').replace('export function ', 'function ').replace('export const ', 'const ')
    return source + '\nreturn {' + returned + '};'
script = '\n'.join([
    '(()=>{ "use strict";',
    'const THREE=(()=>{' + three + '})();',
    'const {OrbitControls}=(()=>{' + orbit + '})();',
    'const DATA=(()=>{' + module('data.js','systems,organs,tours,reproductiveInteriors') + '})();',
    'const {systems,organs,tours,reproductiveInteriors}=DATA;',
    'const {SoftwareRenderer}=(()=>{' + module('software-renderer.js','SoftwareRenderer') + '})();',
    'const {buildReproductive}=(()=>{' + module('reproductive.js','buildReproductive') + '})();',
    'const {createAtlas}=(()=>{' + module('model.js','createAtlas') + '})();',
    re.sub(r'^import .*?;\s*$', '', (dist / 'app.js').read_text(), flags=re.M),
    '})();'
])
html = (dist / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="./style.css">', '<style>' + (dist / 'style.css').read_text() + '</style>')
html = re.sub(r'\s*<script type="importmap">.*?</script>', '', html)
html = html.replace('<script type="module" src="./app.js"></script>', '<script>' + script.replace('</script', '<\\/script') + '</script>')
(dist / 'Anatomy.html').write_text(html)
print(f'Standalone atlas: {dist / "Anatomy.html"} ({len(html.encode()):,} bytes)')
