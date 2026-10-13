# Kampung Kucing
A playable 3D Malay village prototype. You control Oyen, a ginger cat, exploring stilt houses, coconut palms, a village stall, and a riverside kampung. Find six floating fish or simply wander. Meet five animated villagers and five roaming cats, explore flower gardens, and watch eighteen butterflies flutter among the blooms. Press E near villagers for a greeting. Visit the southeastern koi pond to see jumping fish and splash ripples, meet Danish on the bank, and walk through the tall grass that bends around player and roaming cats.

## Run locally
From this directory run `python3 -m http.server 5173 --directory dist`, then open http://localhost:5173.

Use the Day / Sunset buttons above the quest card for a smooth transition between afternoon and golden evening light.

Oyen and the village cats share a stride-based movement system. Planted paws stay fixed on the ground while the body advances, and only swinging paws move forward. Cats take pivot steps to turn, settle their paws when standing, and stop the walking cycle at obstacles. Running blends into a diagonal trot; jumping tucks Oyen's legs. Village cats stroll, occasionally trot, yield to nearby characters, and pause to look at Oyen after a meow.

## Controls
- WASD / arrow keys: move relative to the camera
- Shift: run
- Space: jump
- E: meow
- Drag: orbit the camera
- Scroll: zoom
- Touch controls are available on small screens

Built with Three.js (vendored, MIT licensed). No build step or server data storage required.

## Verify village life
Run `npm test` to simulate two minutes of roaming and verify obstacle avoidance, smooth acceleration and turns, forward-facing movement, rendered paw contact locks, stride/distance synchronization, idle and blocked movement, walk/trot transitions, jumping and landing, rest/resume, greetings, butterflies, pond jump/splash cycles, and grass bending and recovery.
