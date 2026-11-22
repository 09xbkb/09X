# 09X

one name, everything i make.

**[enter the 09X hub](https://09xbkb.github.io/09X/)**

## the public projects

### [XYNXNET](https://09xbkb.github.io/09X/xynxnet/)

the dark network. posts, pics, vids, channels, communities and direct messages in one place. real accounts, custom profiles, four full themes and a home-screen app experience.

**live now** · [project README](xynxnet/README.md)

### Neon City Drive

a tilt-driving game concept: phone as the controller, neon city as the map. previewed on the hub, not playable from this repo yet.

## inside this repo

```text
index.html          the 09X hub
xynxnet/
  index.html        the social app
  manifest.json     home-screen app metadata
  sw.js             service worker
  README.md         features, local setup and deployment notes
```

## run the site locally

From the repository root, use a static server:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/` for the hub or `http://localhost:8000/xynxnet/` for the app. There is no build step. XYNXNET's account and social features still need its Supabase backend and an internet connection.

## deployment

The site is hosted on GitHub Pages at `/09X/`. Keep internal links relative so they work under that project path. Changes published to the Pages source are served as static files; see the [XYNXNET README](xynxnet/README.md) for app-specific backend requirements.

built by 09X.
