# Kampung Kucing

[Play the game](https://miruladzim.github.io/kampung-kucing/)

A playable 3D Malay village prototype. You control Oyen, a ginger cat, exploring stilt houses, coconut palms, a village stall, and a riverside kampung. Earn four fish by completing the learning stations, or simply wander. Meet five animated villagers and five roaming cats, explore flower gardens, and watch eighteen butterflies flutter among the blooms. Press E near villagers for a greeting and F near a numbered station to open a learning mission. Visit the southeastern koi pond to see jumping fish and splash ripples, meet Danish on the bank, and walk through the tall grass that bends around player and roaming cats.

## Misi Jejak Sejarah

The game now includes a Bahasa Melayu formative-assessment lesson for Form 2 Sejarah, Chapter 2.2, SP 5.2.2. Four stations cover agriculture, trade, forest/marine products, and mining/manufacturing. Twelve activities combine single-choice, two-answer reasoning and sorting, with original visual diagrams, optional browser narration, feedback, hints and retries. Each completed station awards one fish.

First-attempt accuracy, hint use, retries and completion remain separate. Learners can enter an optional alias, write an exit reflection and export a CSV for the teacher. Sessions are saved only in the current browser; there is no central classroom dashboard. Export results before changing learners on a shared device. Written reflections require teacher assessment.

All activities are accessible from the mission book without navigating the cat. [Activity mode without 3D](https://miruladzim.github.io/kampung-kucing/?mode=ringan) shares the same assessment state and is also used when WebGL is unavailable.

- [Public teacher guide](https://miruladzim.github.io/kampung-kucing/panduan-guru.html)
- [40-minute lesson blueprint](docs/lesson-blueprint.md)
- [Development evidence](docs/evidence/README.md)

The village is a fictional learning hub; conceptual illustrations are not historical reconstructions. Content sources are linked in the game and teacher guide. The blueprint is not the final assignment report, and lecturer acceptance of a custom-developed tool remains to be confirmed.

## Run locally
From this directory run `python3 -m http.server 5173 --directory dist`, then open http://localhost:5173.

Use the Day / Sunset buttons above the quest card for a smooth transition between afternoon and golden evening light.

Oyen and the village cats share a stride-based movement system. Planted paws stay fixed on the ground while the body advances, and only swinging paws move forward. Cats take pivot steps to turn, settle their paws when standing, and stop the walking cycle at obstacles. Running blends into a diagonal trot; jumping tucks Oyen's legs. Village cats stroll, occasionally trot, yield to nearby characters, and pause to look at Oyen after a meow.

## Controls
- WASD / arrow keys: move relative to the camera
- Shift: run
- Space: jump
- E: meow
- F: open the nearby learning station
- Drag: orbit the camera
- Scroll: zoom
- Touch controls are available on small screens

Built with Three.js (vendored, MIT licensed). No build step or server data storage required.

## GitHub Pages

The game is published at https://miruladzim.github.io/kampung-kucing/.
Pushing to `main` runs the game tests and deploys the `dist/` directory through `.github/workflows/pages.yml`. You can also run the workflow manually from the repository's Actions tab. Assets use relative paths so the game works under the repository's Pages URL.

## Verify village life
Run `npm test` to simulate two minutes of roaming and verify obstacle avoidance, smooth acceleration and turns, forward-facing movement, rendered paw contact locks, stride/distance synchronization, idle and blocked movement, walk/trot transitions, jumping and landing, rest/resume, greetings, butterflies, pond jump/splash cycles, grass bending and recovery, and assessment state, first-attempt records, hints, rewards, persistence and CSV export.
