# Prints run-length color profiles (in meters) along vertical/horizontal lines
# through the campus satellite, to nail the exact N-S and E-W arrangement.
import os
from PIL import Image

HERE = os.path.dirname(__file__)
im = Image.open(os.path.join(HERE, '..', 'photos', 'satellite_lsc_z19.jpg')).convert('RGB')
W, H = im.size
MIN_LON, MAX_LON = 114.1806, 114.1848
MIN_LAT, MAX_LAT = 22.3260, 22.3304
ORIG_LON, ORIG_LAT = 114.18160, 22.32650  # campus SW corner
MLAT = 110970.0
MLON = 111320.0 * math.cos(math.radians(22.32)) if False else 111320.0 * 0.92516
import math
MLON = 111320.0 * math.cos(math.radians(22.32))

def lon2px(lon): return int((lon - MIN_LON) / (MAX_LON - MIN_LON) * W)
def lat2px(lat): return int((MAX_LAT - lat) / (MAX_LAT - MIN_LAT) * H)
def m2px_x(m): return lon2px(ORIG_LON + m / MLON)
def m2px_y(m): return lat2px(ORIG_LAT + m / MLAT)

pix = im.load()

def classify(r, g, b):
    if b > 140 and b - r > 45 and b - g > 30: return 'WATER'
    if r > 125 and r - g > 60 and r - b > 60: return 'TRACK'
    if g > 55 and g - r > 12 and g - b > 12: return 'green'
    if r > 200 and g > 200 and b > 195: return 'white'
    if r < 60 and g < 60 and b < 60: return 'dark'
    if r > 170 and g > 150 and b > 130: return 'tan'
    return 'grey'

def profile_v(x_m, y0, y1, label):
    px = m2px_x(x_m)
    print('--- vertical at x=%dm (%s) ---' % (x_m, label))
    runs = []
    cur = None; start = y0
    for m10 in range(int(y0 * 10), int(y1 * 10), 5):  # 0.5 m steps
        m = m10 / 10.0
        py = m2px_y(m)
        c = classify(*pix[px, py]) if 0 <= py < H else '?'
        if c != cur:
            if cur is not None:
                runs.append((cur, start, m))
            cur = c; start = m
    runs.append((cur, start, y1))
    # merge tiny runs (<1m) into previous
    merged = []
    for r in runs:
        if merged and (r[2] - r[1]) < 1.0:
            merged[-1] = (merged[-1][0], merged[-1][1], r[2])
        else:
            merged.append(list(r))
    for c, a, bnd in merged:
        if bnd - a >= 1.0:
            print('  %5.1f..%5.1f m (%2d m) %s' % (a, bnd, bnd - a, c))

def profile_h(y_m, x0, x1, label):
    py = m2px_y(y_m)
    print('--- horizontal at y=%dm (%s) ---' % (y_m, label))
    runs = []
    cur = None; start = x0
    for m10 in range(int(x0 * 10), int(x1 * 10), 5):
        m = m10 / 10.0
        px = m2px_x(m)
        c = classify(*pix[px, py]) if 0 <= px < W else '?'
        if c != cur:
            if cur is not None:
                runs.append((cur, start, m))
            cur = c; start = m
    runs.append((cur, start, x1))
    merged = []
    for r in runs:
        if merged and (r[2] - r[1]) < 1.0:
            merged[-1] = (merged[-1][0], merged[-1][1], r[2])
        else:
            merged.append(list(r))
    for c, a, bnd in merged:
        if bnd - a >= 1.0:
            print('  %5.1f..%5.1f m (%2d m) %s' % (a, bnd, bnd - a, c))

# vertical line through pool + building + track (pool center x ~ 45m)
profile_v(45, 0, 300, 'through pool/west wing')
profile_v(120, 0, 300, 'through courtyard centre')
# horizontal lines through track centre, pitch, building
profile_h(60, 0, 240, 'through track/field')
profile_h(110, 0, 240, 'through field north')
