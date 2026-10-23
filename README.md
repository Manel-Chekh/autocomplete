# Country Autocomplete Search Box

Client-side autocomplete built with vanilla HTML, CSS and JavaScript (no framework, no library).

## Features
- Mid-word matches: "land" finds Iceland, Ireland, Finland...
- Accents and apostrophes ignored: "cote d'ivoire" finds "Cote d'Ivoire"
- Results ranked: starts with query, then word starts, then mid-word
- Match highlighting and keyboard navigation (Up/Down, Enter, Esc)
- Dataset: data.js (unchanged)

## Performance
Data is normalized once at load into an index, so each keystroke only scans precomputed strings.

## Run
ES modules need a server: run `python -m http.server 8000` and open http://localhost:8000