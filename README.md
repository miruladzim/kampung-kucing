# Kampung Kucing

[Play the game](https://miruladzim.github.io/kampung-kucing/)

A playable 3D Malay village prototype. You control Oyen, a ginger cat, exploring stilt houses, coconut palms, a village stall, and a riverside kampung. Earn four fish by completing the learning stations, or simply wander. Meet five animated villagers and five roaming cats, explore flower gardens, and watch eighteen butterflies flutter among the blooms. Press E near villagers for a greeting and F near an object to pick up, deliver or operate it. Learning happens inside the playable village. Visit the southeastern koi pond to see jumping fish and splash ripples, meet Danish on the bank, and walk through the tall grass that bends around player and roaming cats.

## Misi Jejak Sejarah

The game now includes a Bahasa Melayu formative-assessment lesson for Form 2 Sejarah, Chapter 2.2, SP 5.2.2. Four stations cover agriculture, trade, forest/marine products, and mining/manufacturing. Twelve tasks use physical interactions: carry water to an irrigation gate, carry and sort goods into baskets, operate two facilities, and deliver mineral materials and finished pots along an economic chain. Walk Oyen to an object, press F (or the touch interaction button), carry it to its destination and press F again. A gong checks a completed sorting arrangement or two selected operations. Water and crops change as irrigation is restored; deliveries and crafting leave visible rewards. Each completed station awards one fish. The mission book contains progress and directions, with no quiz opening in the main 3D flow.

First-attempt accuracy, hint use, retries and completion remain separate. Learners can enter an optional alias, write an exit reflection and export a CSV for the teacher. Completed tasks and checked attempts are saved in the current browser. Unchecked arrangements restart after reloading; there is no central classroom dashboard. Export results before changing learners on a shared device. Written reflections require teacher assessment.

An optional alternative presents the same assessment concepts as visual questions without navigating the cat. [Activity mode without 3D](https://miruladzim.github.io/kampung-kucing/?mode=ringan) uses separate progress records and is also used when WebGL is unavailable.

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
- F / touch interaction: pick up, place, operate or check the nearby object
- ⌖: progress and station directions; ▥: assessment report
- Drag: orbit the camera
- Scroll: zoom
- Touch controls are available on small screens

Built with Three.js (vendored, MIT licensed). No build step or server data storage required.

## GitHub Pages

The game is published at https://miruladzim.github.io/kampung-kucing/.
Pushing to `main` runs the game tests and deploys the `dist/` directory through `.github/workflows/pages.yml`. You can also run the workflow manually from the repository's Actions tab. Assets use relative paths so the game works under the repository's Pages URL.

## Verify village life
Run `npm test` to simulate two minutes of roaming and verify obstacle avoidance, smooth acceleration and turns, forward-facing movement, rendered paw contact locks, stride/distance synchronization, idle and blocked movement, walk/trot transitions, jumping and landing, rest/resume, greetings, butterflies, pond jump/splash cycles, grass bending and recovery, assessment state, first-attempt records, hints, rewards, persistence and CSV export, plus physical mission progression, complete sorting before checking, reversible operations and two-delivery chains.
