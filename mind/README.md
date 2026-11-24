# MIND

five small regions. one self. an AI that lives entirely inside a web page.

**live: https://09xbkb.github.io/09X/mind/**

## what it is

not one big model — several small parts braided into one perspective:

- **language** — its voice. a small local model (SmolLM2-135M, ~120-140 MB) that downloads once
  and runs on the device (CPU by default on iPhone, WebGPU where it is safe), with a no-model (light) fallback.
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

open the link and tap **Wake it up**. it picks the safest voice for the device.
under "choose how it thinks": **full mind** (graphics chip, experimental), **standard**
(processor), or **light** (zero download).

crash guard: if loading the model ever kills the page, the next visit skips that
mode and steps down (full, then standard, then light) on its own.

## install as an app (PWA)

iPhone: open in Safari, tap Share, then **Add to Home Screen**. It opens full screen
and works offline after the first load. Settings (gear on the home screen) has
change voice, rename and erase.

part of 09X.
