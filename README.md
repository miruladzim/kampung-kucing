# Kampung Kucing
A playable 3D Malay village prototype. You control Oyen, a ginger cat, exploring stilt houses, coconut palms, a village stall, and a riverside kampung. Find six floating fish or simply wander. Meet five animated villagers and five roaming cats, explore flower gardens, and watch eighteen butterflies flutter among the blooms. Press E near villagers for a greeting. Visit the southeastern koi pond to see jumping fish and splash ripples, meet Danish on the bank, and walk through the tall grass that bends around player and roaming cats.

## Run locally
From this directory run `python3 -m http.server 5173 --directory dist`, then open http://localhost:5173.

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
Run `npm test` to simulate two minutes of roaming and verify obstacle avoidance, rest/resume, greetings, butterfly movement, pond jump/splash cycles, and grass bending and recovery.
