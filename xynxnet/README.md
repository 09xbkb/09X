# XYNXNET

the dark network. everything in one place.

**[open XYNXNET](https://09xbkb.github.io/09X/xynxnet/)** · [09X hub](https://09xbkb.github.io/09X/)

XYNXNET is a responsive social app built by 09X. Share posts, pics and vids, follow channels, talk in DMs, or build a community. The live app uses real accounts and real user content, not a seeded demo feed.

## what's here

- **Accounts:** handle-and-password sign-in, persistent sessions and password recovery using your personal access code.
- **Feed:** text, photo and video posts, likes, emoji reactions, comments, reposts and bookmarks.
- **Channels:** a profile for each user, bios, custom profile pictures and banners, animated image support, following/followers and a founder badge.
- **Vids:** a video feed drawn from videos posted to the network.
- **Chat:** one-to-one text messages and photo attachments. New DM photos use a private storage bucket and temporary signed image links, not permanent public media URLs. This is access-controlled storage, not end-to-end encryption. Anyone given a signed link can use it until it expires.
- **Communities:** open communities where members can post, plus broadcast communities where only the creator posts. Create, join and leave communities.
- **Discovery:** search for users, posts and communities, plus in-app notifications.
- **Personalization:** midnight, terminal, solar and nebula themes, accent colors and theme-matched navigation icons.
- **Home-screen app:** a web app manifest, service worker and mobile layout with safe-area and keyboard handling. Add it to your home screen on a supported browser. Live social features require a connection.

Voice and video calling are not part of this version.

## account recovery

Save your access code somewhere private. It appears in the app's themes panel and is used with your handle to reset your password. Do not post or share it. The reset flow calls the deployed Supabase `reset-password` function; the browser alone cannot reset an account.

## stack

- Plain HTML, CSS and JavaScript. No bundler or package-install step.
- GitHub Pages serves the static front end under `/09X/xynxnet/`.
- Supabase provides authentication, database access, file storage and the password-reset Edge Function.
- The Supabase JavaScript client loads from a CDN. Fonts and some assets also load over the network.

## files

```text
index.html       layout, styles and app logic
manifest.json    install metadata, start URL and icons
sw.js            service worker
README.md        this guide
```

## run locally

From the root of the 09X repository:

```sh
git clone https://github.com/09xbkb/09X.git
cd 09X
python3 -m http.server 8000
```

Open `http://localhost:8000/xynxnet/`. Use a local HTTP server rather than opening `index.html` as a file.

**A local copy is not an isolated sandbox.** The checked-in app points at the live Supabase backend. Do not use the production project for experiments or seed it with sample users or posts. Configure a separate backend before testing writes.

## backend requirements for your own deployment

This folder is the front end, not a complete reproducible backend package. Database migrations, storage policies and the password-reset function source are not included here. Copying the folder alone does not create a new working social network.

A separate deployment needs:

1. A Supabase project with Auth configured for the app's handle-based account flow.
2. The tables and relationships expected by the client, including profiles, posts, comments, follows, reactions, bookmarks, notifications, messages, communities, community members and community posts. Match the exact table/column names used in `index.html`.
3. Row-level security policies that enforce ownership, DM participants, community membership and broadcast posting rules. Hiding a control in the UI is not an access policy.
4. A public `media` bucket for intentionally public profile/post assets and a private `dm-media` bucket with participant-scoped access for new DM photos.
5. A server-side `reset-password` Edge Function implementing the access-code recovery flow. Keep privileged credentials on the server.
6. Your own Supabase project URL and browser publishable key in the client configuration, plus your own reset-function endpoint and asset URLs. Never put a service-role key, password or access code in this repo.

Verify all policies and recovery behavior with disposable accounts before opening a new deployment to users. This README describes the client and its required backend; it is not a security audit.

## deploy

Serve the repository as a GitHub Pages project site. The current site uses the repository root for the hub and the `xynxnet/` subfolder for this app. Commit changes to the configured Pages source and wait for its deployment to finish.

Keep the entire folder together. When changing the hosting path, check relative asset URLs, the manifest's start URL and scope, icon URLs, service-worker registration/cache behavior and the hub link. Use HTTPS for the hosted app.

After deploying, check the hub-to-app link, sign-in, a disposable post, both community types, a DM photo, recovery and home-screen launch. Never run destructive checks against other users' data.

built by 09X.
