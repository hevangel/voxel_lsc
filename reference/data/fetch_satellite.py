# Fetches Esri World Imagery tiles for the La Salle College campus and stitches
# a north-up satellite mosaic. Output: reference/photos/satellite_lsc_z<z>.jpg
import math, io, os, urllib.request

MIN_LON, MAX_LON = 114.1806, 114.1848
MIN_LAT, MAX_LAT = 22.3260, 22.3304

def deg2tile(lon, lat, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    lat_r = math.radians(lat)
    y = (1.0 - math.log(math.tan(lat_r) + 1 / math.cos(lat_r)) / math.pi) / 2.0 * n
    return x, y

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    try:
        with opener.open(req, timeout=30) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307, 308):
            loc = e.headers.get('Location', '')
            if loc:
                return fetch(loc)
        raise

for z in (18, 19):
    x0, y1 = deg2tile(MIN_LON, MIN_LAT, z)  # y grows south
    x1, y0 = deg2tile(MAX_LON, MAX_LAT, z)
    tx0, tx1 = int(math.floor(x0)), int(math.floor(x1))
    ty0, ty1 = int(math.floor(y0)), int(math.floor(y1))
    W = (tx1 - tx0 + 1) * 256
    H = (ty1 - ty0 + 1) * 256
    canvas = Image.new('RGB', (W, H), (30, 30, 30)) if False else None
    from PIL import Image
    canvas = Image.new('RGB', (W, H), (30, 30, 30))
    got = 0
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/%d/%d/%d' % (z, ty, tx)
            try:
                data = fetch(url)
                im = Image.open(io.BytesIO(data)).convert('RGB')
                canvas.paste(im, ((tx - tx0) * 256, (ty - ty0) * 256))
                got += 1
            except Exception as ex:
                print('miss z%d %d/%d: %s' % (z, ty, tx, ex))
    # crop to bbox
    px_per_deg_lon = W / ((tx1 - tx0 + 1) * 256 * (360.0 / (2 ** z)))
    left = (x0 - tx0) * 256
    right = (x1 - tx0) * 256
    top = (y0 - ty0) * 256
    bottom = (y1 - ty0) * 256
    canvas = canvas.crop((int(left), int(top), int(right), int(bottom)))
    out = os.path.join(os.path.dirname(__file__), '..', 'photos', 'satellite_lsc_z%d.jpg' % z)
    canvas.save(out, quality=92)
    print('z=%d tiles=%d size=%s -> %s' % (z, got, canvas.size, os.path.normpath(out)))
