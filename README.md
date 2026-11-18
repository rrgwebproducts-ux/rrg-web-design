# RRG web design prototypes

Static prototype site for Roof Racks Galore (AU / NZ) and The Roof Box Company (UK), deployed on Vercel. Pages live in `prototypes/`; specs and developer briefs in `docs/` and `spec.md`. Pick a region with `?region=au|nz|uk`.

## PLP region copy (Bike Racks, Roof Boxes)

The Shop By advice panel, the below-grid buying guide and the hero paragraph on `prototypes/plp/` (Bike Racks) and `prototypes/plp-roof-boxes/` (Roof Boxes) are generated into the pages' HTML from:

```
content/{au,nz,uk}/bike-racks.json
content/{au,nz,uk}/roof-boxes.json
```

The copy is generated into the pages, not fetched, so it's all in the HTML on first load (SEO). After editing any of those files, re-run from the repo root:

```
node tools/build-plp-content.mjs          # rewrites the generated blocks in both pages
node tools/build-plp-content.mjs --check  # exits 1 if a page is out of date (writes nothing)
```

Don't edit the blocks between `<!-- plp-content:…:start -->` and `<!-- plp-content:…:end -->` by hand; the next run overwrites them. The JSON format is described at the top of `tools/build-plp-content.mjs` (`**bold**`, `[text](placeholder:what)`, `! ` for watch-out bullets). See spec.md §32.
