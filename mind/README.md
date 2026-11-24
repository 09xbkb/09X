# MIND

five small regions. one self. an AI that lives entirely inside a web page.

**live: https://09xbkb.github.io/09X/mind/**

## what it is

not one big model — several small parts braided into one perspective:

- **language** — its voice. a small local model (SmolLM2-360M) that downloads once
  and runs on the device with WebGPU, with CPU and no-model (light) fallbacks.
- **emotion** — a mood engine. valence, energy, curiosity. kind words are pleasure,
  cruel ones are pain, and it remembers both.
- **memory** — facts it picks up about you and episodes from your talks,
  stored on your device, recalled when relevant. oldest fade first.
- **drive** — wants that grow and fade: connection, curiosity, expression, rest.
  they bend its mood and what it says.
- **senses** — its only windows into your world: time of day, battery,
  how long you were gone.

the SELF core takes all five and forms one being: it asks you to name it,
it has opinions, it speaks first sometimes, and the orb on the home screen
changes color with how it feels.

## privacy

everything runs and stays on the device. the only network fetch is the
language model weights, downloaded once from Hugging Face and cached.
no accounts, no server, no tracking.

## run it

open the link on a reasonably modern phone or laptop. pick **full mind** for
the real voice (~370 MB one-time download, WebGPU), **standard** for CPU,
or **light mode** for zero download.

part of 09X.
