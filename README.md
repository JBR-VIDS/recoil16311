# 16311 Recoil team website

A plain HTML, CSS, and JavaScript site. No installs, no build step, no accounts needed to edit it.

## The three things you will ever do

1. **Change words, names, results, links:** open `content.js` and edit. That is the only text file you need.
2. **Add photos:** drop image files into the `photos` folders using the names below.
3. **Publish:** upload the folder (steps further down).

To preview on your computer, double-click `index.html`.

## How the pages work

The site is a set of tabs: Home, Our team, Our robot, Our legacy, Expanding STEM, Play, and Contact us. Only one shows at a time, and each has its own link, for example `yoursite/#team` or `yoursite/#robot`, so you can share a link straight to a page. Which content sits on which tab is set in `script.js` under "Page assembly". You normally never touch that.

## Editing `content.js`

- Text goes inside "quote marks". Keep the comma at the end of each line.
- To use a quote mark inside text, put a backslash first: `\"like this\"`.
- Lines starting with `//` are notes. The site ignores them.
- If the site shows a red box saying content.js has a problem, a comma, quote, or bracket went missing in your last edit. Undo it.
- `settings.showEmptyPhotoSlots`: `true` shows dashed "add photo" boxes while you build. Set it to `false` before sharing publicly so empty spots disappear.
- `game.enabled`: `false` removes the game completely.

## Photo file names

Names are lowercase. JPG, PNG, JPEG, and WEBP all work. Export iPhone photos as JPG (not HEIC).

| Where it shows | File |
| --- | --- |
| Team logo | `photos/logo.png` (or .svg) |
| Top of the home page | `photos/hero-team.jpg` |
| Team page group photo | `photos/team-group.jpg` |
| Each team member | `photos/team/<first name>.jpg`, for example `photos/team/emily.jpg` |
| Current robot (up to 3) | `photos/robot/current-1.jpg`, `current-2.jpg`, `current-3.jpg` |
| An earlier robot | `photos/robot/<game>-<years>.jpg`, for example `photos/robot/decode-2025-2026.jpg` |
| Legacy section awards photo | `photos/legacy-awards.jpg` |
| Team moments gallery | `photos/gallery/1.jpg`, `2.jpg`, up to the `count` in content.js |
| Outreach cards | `photos/outreach/<id>.jpg`, where the id is in content.js |
| Sponsor logos | `photos/sponsors/<id>.png` |

If a photo does not show up, the file name is almost always the problem (capital letters, a space, or a different name than the table).

## Publishing for free

**GitHub Pages (recommended).** Free, keeps a history of every change, lets several people edit, and you can edit right in the browser.

1. Create a GitHub account for the team (use a shared team email, not one student's personal one, so it survives graduations).
2. Make a new repository, for example `recoil16311`, set to Public.
3. Click Add file, then Upload files, and drag in everything inside this folder (not the folder itself). Commit.
4. Go to Settings, then Pages. Under Build and deployment choose Deploy from a branch, branch `main`, folder `/ (root)`. Save.
5. After a minute the site is live at `https://<account>.github.io/<repository>/`.

Add people under Settings, then Collaborators. Anyone you add can open `content.js` on github.com, click the pencil icon, edit, and commit. The live site updates in about a minute. Every change is saved, so a mistake is easy to undo.

**Netlify Drop (no account on GitHub needed).** Go to app.netlify.com/drop and drag this folder onto the page. You get a link immediately. To update, drag the folder again. Simpler, but no change history and no multi-person editing.

**Custom domain.** Both services let you point your own domain (for example `recoil16311.org`) at the site in their settings.

## Starting a new season

1. In `content.js`, copy the current season block (`currentSeason`) into the top of `seasons`, add its events and awards.
2. Fill `currentSeason` with the new game name and years.
3. Rename or add the robot photos. The old robot photo becomes `photos/robot/<game>-<years>.jpg`.
4. Update the roster and titles in `roster`.

## The game

"Viper Recoil" is the game in the Play section. The robot fires a viper coiled like a spring into a snake charmer's basket, and snake springs on the floor bounce it back up. The number of launches is `game.launches` in content.js. The best score is saved only in each visitor's own browser.

## Files

- `content.js`: all text and data (edit this)
- `photos/`: all images (add to this)
- `index.html`, `styles.css`, `script.js`, `game.js`: the site itself (leave alone unless you know what you are changing)
- `fonts/`: fonts, hosted with the site so nothing loads from outside
- `404.html`: the page shown for a bad link
