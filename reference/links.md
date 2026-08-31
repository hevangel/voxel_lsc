# Reference links (La Salle College, HK)

## Articles / data
- Wikipedia — La Salle College: https://en.wikipedia.org/wiki/La_Salle_College
  (saved summary: articles/wikipedia_summary.md)
- Official site, College History: https://www.lasalle.edu.hk/our-college/college-history/
  (saved summary: articles/official_site_history.md)
- Official site, Heritage: https://www.lasalle.edu.hk/our-college/heritage/?type=8
- LSCOBA history: https://www.lscoba.com/history-of-la-salle-college
- Lasallian schools HK: https://www.lasalle.org.hk/wordpress/en/the-birth-of-the-lasallian-schools-in-hong-kong/
- OpenStreetMap campus footprints (Overpass API query, saved): data/osm_campus_overpass.json
  query: ways with building/leisure/highway within 420 m of 22.32920,114.18248
- Overpass endpoints used: https://overpass-api.de/api/interpreter (works with default curl UA)

## Photos (downloaded in photos/)
- photos/lsc_aerial_2006_wikimedia.jpg — Wikimedia Commons “Lsc-2006.jpg” (Canon EOS 350D, 2006-12-05)
  https://commons.wikimedia.org/wiki/File:Lsc-2006.jpg
- photos/lsc_birdseye_rendering.jpg — Commons “3D Rendering of Bird's eye view of La Salle College.jpg”
- photos/lsc_crest.png — Commons “20171013La Salle7608588270621.png” (crest, 249×169)
- photos/lsc_street_2020_01.jpg, _02.jpg — Commons SS2 series, north side on Lancashire Rd (De La Salle mural)
  https://commons.wikimedia.org/wiki/Category:La_Salle_College
  (SS2 03–07 in that category exist but failed to download here — HTML error stubs, removed)
- photos/lsc_facade_track_edb.jpg — EDB CHSC school profile photo (south facade + track)
- photos/lsc_photo2.jpg — Dotnews 點新聞 (crest close-up, De La Salle portrait)
- photos/lsc_photo3.jpg — SingTao/親子王 (old 1932 domed building left; La Salle Primary School right)

## Video (not downloaded; no yt-dlp in environment — save URLs only)
- Search: “La Salle College campus drone”, “喇沙書院 航拍” on YouTube.
- Suggested channel: LSCOBA / La Salle College media. (If a maintainer has yt-dlp:
  `yt-dlp -o "reference/video/%(title)s.%(ext)s" "<URL>"`)

## Notes on downloading from Wikimedia Commons
- Special:FilePath redirects + `?width=` may return HTML; instead use the API:
  `.../w/api.php?action=query&titles=File:<NAME>&prop=imageinfo&iiprop=url&iiurlwidth=1600`
  then curl the `thumburl`.
- overpass-api.de returns 406 with a Mozilla UA; use curl’s default UA.
