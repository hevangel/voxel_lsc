# Renders the campus satellite with a labeled metric grid (origin = campus SW
# corner at lon 114.18160, lat 22.32650; +x east, +y north) in halves.
import math, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(__file__)
im = Image.open(os.path.join(HERE, '..', 'photos', 'satellite_lsc_z19.jpg')).convert('RGB')
W, H = im.size
MIN_LON, MAX_LON = 114.1806, 114.1848
MIN_LAT, MAX_LAT = 22.3260, 22.3304
ORIG_LON, ORIG_LAT = 114.18160, 22.32650
MLAT = 110970.0
MLON = 111320.0 * math.cos(math.radians(22.32))

def lonlat2px(lon, lat):
    x = (lon - MIN_LON) / (MAX_LON - MIN_LON) * W
    y = (MAX_LAT - lat) / (MAX_LAT - MIN_LAT) * H
    return x, y

d = ImageDraw.Draw(im)
for m in range(0, 260, 25):
    lon = ORIG_LON + m / MLON
    x, _ = lonlat2px(lon, ORIG_LAT)
    d.line([(x, 0), (x, H)], fill=(255, 255, 0), width=1)
    for yy in (40, H - 60):
        d.text((x + 2, yy), str(m), fill=(255, 255, 0))
for m in range(0, 400, 25):
    lat = ORIG_LAT + m / MLAT
    _, y = lonlat2px(ORIG_LON, lat)
    d.line([(0, y), (W, y)], fill=(0, 255, 255), width=1)
    d.text((5, y + 2), str(m), fill=(0, 255, 255))
    d.text((W - 60, y + 2), str(m), fill=(0, 255, 255))

out_full = os.path.join(HERE, '..', 'photos', 'satellite_lsc_grid.jpg')
im.save(out_full, quality=92)
# halves: north half and south half of campus area
im.crop((int(W*0.30), int(H*0.05), W, int(H*0.60))).resize((1300, 731)).save(
    os.path.join(HERE, '..', 'photos', 'satellite_grid_north.jpg'), quality=92)
im.crop((int(W*0.30), int(H*0.45), W, int(H*0.99))).resize((1300, 745)).save(
    os.path.join(HERE, '..', 'photos', 'satellite_grid_south.jpg'), quality=92)
im.crop((0, int(H*0.05), int(W*0.55), int(H*0.75))).resize((1300, 1128)).save(
    os.path.join(HERE, '..', 'photos', 'satellite_grid_west.jpg'), quality=92)
print('saved grid images')
