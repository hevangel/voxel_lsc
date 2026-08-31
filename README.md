# La Salle College · Voxel Campus — 喇沙書院

A fan-made **voxel world of La Salle College** (18 La Salle Road, Kowloon Tong, Hong Kong) that
runs entirely in your browser. Roam the campus on foot, fly over the sports ground, swim-side at
the 50 m pool, watch the floodlights come on at night, or sit back for a guided cinematic tour —
with Lion Rock on the horizon.

> *Fides et Opera* — founded 1932 by the De La Salle Brothers.
> This is an unofficial, fan-made tribute and is not affiliated with La Salle College.

![mode](https://img.shields.io/badge/engine-Three.js%20r149-blue) ![deps](https://img.shields.io/badge/dependencies-zero-brightgreen) ![offline](https://img.shields.io/badge/runs-offline-success)

## Quick start

**Option A — just open it**

Double-click `index.html`. That's it — everything (including Three.js) is local, no internet
needed.

**Option B — tiny local server** (nicer URLs, no caching surprises)

```bash
node tools/dev-server.js .        # http://localhost:8137
# or
python -m http.server 8000        # http://localhost:8000
```

## Controls

| Input | Action |
|---|---|
| `W A S D` / arrows | walk (click the view once to capture the mouse) |
| `Shift` | sprint / fly fast |
| `Space` | jump · fly up |
| `C` / `Ctrl` | fly down |
| `F` | switch walk ⇄ fly |
| `T` | guided tour (press any move key to take over) |
| `M` | campus map — click anywhere to teleport |
| `P` | photo mode (hide the UI) |
| `H` | help |
| `Esc` | release the mouse / close panels |

The **time-of-day slider** (bottom centre) and the *time flows* checkbox drive a full 24 h cycle —
try ~19:30 for golden windows and ~22:00 for floodlit night matches on the scoreboard.

## What to see

- **The main building** — cream classroom slab with window bands, the white crest tower
  (*Fides et Opera* crest painted on it), green ground-floor colonnade, and the De La Salle mural
  on the north face.
- **Sports ground** — red tartan track, full-size football pitch, long-jump sand, high-jump mats,
  a working scoreboard and floodlight masts that light up at night.
- **Swimming pool** in the courtyard quadrangle, with animated water.
- **Statue plaza** — St. John Baptist de La Salle, school flags, flowerbeds, the main gate on
  La Salle Road.
- **Campus life** — 50 m pool deck, basketball court, tennis courts, the grotto, the Brothers'
  House, gardens, wandering students, birds, KMB bus stops.
- **The neighbourhood** — La Salle Primary School across the road, Kowloon Tsai Park, the public
  sports ground, and Lion Rock watching over it all from the north.

## Project layout

```
index.html          front page (UI markup + script order)
css/style.css       UI theme
js/lib/three.min.js Three.js r149 (vendored)
js/*.js             voxel engine, world data, sky, entities, controls, UI (see AGENTS.md)
tools/dev-server.js dev static server (no caching)
reference/          photos, articles and OSM data the model was built from
```

`AGENTS.md` contains deep technical documentation (coordinate system, mesher, layout tables,
sharp edges) for maintainers and AI agents.

## Credits & sources

- Built with [Three.js](https://threejs.org) (vendored, MIT).
- Campus layout derived from OpenStreetMap footprint data (ODbL) and public photographs —
  all downloaded material is preserved in [`reference/`](reference/), with links and research
  notes (`reference/links.md`, `reference/articles/RESEARCH_NOTES.md`).
- History facts from the school's public history page and Wikipedia.

*Fides et Opera.* 🏫
