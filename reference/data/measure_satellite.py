# Finds the LARGEST connected blue (pool) and red (track) regions inside the
# campus crop of the satellite mosaic; prints their lat/lon bboxes and sizes.
import math, os, sys
from PIL import Image

HERE = os.path.dirname(__file__)
sys.setrecursionlimit(10000)
im = Image.open(os.path.join(HERE, '..', 'photos', 'satellite_lsc_z19.jpg')).convert('RGB')
W, H = im.size
MIN_LON, MAX_LON = 114.1806, 114.1848
MIN_LAT, MAX_LAT = 22.3260, 22.3304
MLAT = 110970.0
MLON = 111320.0 * math.cos(math.radians(22.32))

# campus interior crop (exclude streets/neighbors)
cx0 = int((114.18160 - MIN_LON) / (MAX_LON - MIN_LON) * W)
cx1 = int((114.18405 - MIN_LON) / (MAX_LON - MIN_LON) * W)
cy0 = int((MAX_LAT - 22.32990) / (MAX_LAT - MIN_LAT) * H)
cy1 = int((MAX_LAT - 22.32650) / (MAX_LAT - MIN_LAT) * H)

S = 2  # subsample
w2, h2 = (cx1 - cx0) // S, (cy1 - cy0) // S
crop = im.crop((cx0, cy0, cx1, cy1)).resize((w2, h2))
cp = crop.load()

def build_mask(kind):
    m = bytearray(w2 * h2)
    for y in range(h2):
        for x in range(w2):
            r, g, b = cp[x, y]
            if kind == 'pool':
                ok = b > 140 and b - r > 45 and b - g > 30
            else:  # track red
                ok = r > 125 and r - g > 60 and r - b > 60
            if ok:
                m[y * w2 + x] = 1
    return m

def largest(mask):
    seen = bytearray(w2 * h2)
    best = (0, 0, 0, 0, 0)
    for i in range(w2 * h2):
        if mask[i] and not seen[i]:
            stack = [i]; seen[i] = 1
            n = 0; x0 = y0 = x1 = y1 = 0
            while stack:
                j = stack.pop()
                n += 1
                x = j % w2; y = j // w2
                x0 = min(x0, x); x1 = max(x1, x)
                y0 = min(y0, y); y1 = max(y1, y)
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w2 and 0 <= ny < h2:
                        k = ny * w2 + nx
                        if mask[k] and not seen[k]:
                            seen[k] = 1
                            stack.append(k)
            if n > best[0]:
                best = (n, x0, y0, x1, y1)
    return best

def to_latlon(x0, y0, x1, y1):
    lx0 = cx0 + x0 * S; lx1 = cx0 + x1 * S
    ly0 = cy0 + y0 * S; ly1 = cy0 + y1 * S
    lon0 = MIN_LON + lx0 / W * (MAX_LON - MIN_LON)
    lon1 = MIN_LON + lx1 / W * (MAX_LON - MIN_LON)
    lat0 = MAX_LAT - ly0 / H * (MAX_LAT - MIN_LAT)
    lat1 = MAX_LAT - ly1 / H * (MAX_LAT - MIN_LAT)
    return min(lon0, lon1), max(lon0, lon1), min(lat0, lat1), max(lat0, lat1)

for kind in ('pool', 'track'):
    m = build_mask(kind)
    n, x0, y0, x1, y1 = largest(m)
    lo0, lo1, la0, la1 = to_latlon(x0, y0, x1, y1)
    wm = (lo1 - lo0) * MLON; hm = (la1 - la0) * MLAT
    print('%-5s n=%6d lon %.6f..%.6f lat %.6f..%.6f  = %.0f m E-W x %.0f m N-S'
          % (kind, n, lo0, lo1, la0, la1, wm, hm))
