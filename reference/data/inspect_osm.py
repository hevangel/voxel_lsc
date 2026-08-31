# Prints a summary of named/typed features in the campus Overpass export.
import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

d = json.load(open(__file__.replace('inspect_osm.py', 'osm_campus_overpass.json'), encoding='utf-8'))
els = d['elements']
print('elements:', len(els))
kinds = {}
for e in els:
    kinds[e['type']] = kinds.get(e['type'], 0) + 1
print('kinds:', kinds)
print('first element keys:', json.dumps(els[0])[:300])

# Overpass 'out geom' exports give ways with inline geometry and no node table.
nodes = {}
for e in els:
    if e['type'] == 'node':
        nodes[e['id']] = (e['lon'], e['lat'])
for e in els:
    if e['type'] == 'way' and 'geometry' in e:
        for i, g in enumerate(e['geometry']):
            pass
def ring(e):
    if 'geometry' in e:
        return [(g['lon'], g['lat']) for g in e['geometry']]
    ids = e.get('nodes') or [m['ref'] for m in e.get('members', []) if m.get('type') == 'way']
    out = []
    for i in ids:
        if i in nodes:
            out.append(nodes[i])
        else:
            return []
    return out

for e in els:
    if e['type'] not in ('way', 'relation'):
        continue
    tags = e.get('tags', {})
    name = tags.get('name', '')
    t = tags.get('building') or tags.get('leisure') or tags.get('amenity') or \
        tags.get('landuse') or tags.get('natural') or tags.get('sport') or ''
    pts = ring(e)
    if not pts:
        continue
    lons2 = [p[0] for p in pts]; lats2 = [p[1] for p in pts]
    # campus bbox only; include unnamed building=yes / / any tagged way
    if not (114.1813 <= min(lons2) and max(lons2) <= 114.1842 and 22.3258 <= min(lats2) and max(lats2) <= 22.3300):
        continue
    if not (name or t):
        continue
    print('%s %s name=%r type=%s pts=%d lon %.6f..%.6f lat %.6f..%.6f' % (
        e['type'], e['id'], name, t, len(pts), min(lons2), max(lons2), min(lats2), max(lats2)))
