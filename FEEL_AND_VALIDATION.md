# Prototype validation and feel notes

## Discovery
Empty project at start. Browser platform, vanilla JS + CSS, Vite build, PeerJS transport. Fixed grid camera, pointer/touch selection and semantic HTML button keyboard input. Loop: draw → select card → target → preview → commit → end turn → round updates. Intended feel: deliberate, readable, responsive, restrained.

## Critical information
Active player, action budget, private hand, legal targets and sources, troop/gold totals, attack outcome. Ownership uses AZ/EM labels and colours. Audio is supplemental and muted by default. Troop counts and logs persist without presentation effects.

## Feedback contract
Selection highlights are immediate and reversible; commitment uses a separate button. Host validates commands before state updates. Remote commands show pending status. Card hover/press transitions are 150 ms, never block commands. OS reduced motion and in-game Motion off remove interaction transforms. No camera effects, flashes, or particle loops. Authoritative simulation in game.js has no dependency on presentation or timers.

## Checks performed
- 10 Node rules tests passed.
- Vite production build passed.
- Browser: reviewed full grid and hand layout; local handoff hides/reveals cards.
- Browser: built a tower, verified cost/action feedback, previewed 5 damage, fired it, confirmed neutral defender remained with 1 troop and ownership retained.
- Two browser tabs: created and joined a room using public PeerJS service, verified random opening and mutually exclusive turn controls.
- Guest ended turn; host received authority. Host played +5 troops on B1; guest saw 12 → 17. Host ended turn; guest saw round 2, troop growth report, next turn and card draw.

## Limits
Two tabs in one browser environment are not proof of cross-network WebRTC connectivity. No TURN relay, reconnect, host migration, save, or competitive anti-cheat. Mobile layout has CSS breakpoints but physical mobile and screen-reader testing remain unverified. No measured FPS/input latency or subjective player-feel claims. Balance values, win condition, tower range, building cost, neutral gold and refill size remain test assumptions.

## 6 × 6 board revision
- Raised land tiles, subtle water gaps, six column coordinates, and stronger ownership accents. Existing reduced-motion handling covers tile hover.
- 13 tests pass, including 500 seeds checked for exactly 26 edge-connected states, one home per player, varied maps, repeatable seeds, and rejection of removed targets/sources.
- Browser confirmed 26 state buttons and 10 noninteractive gaps; visually inspected the new map. Production build passes.

## Icons, legibility and global growth
- Supplied Third Batch Silhouette Icon Grid.png is used as a CSS sprite for card, building and resource icons. Original artwork is preserved. Card categories are now large ATTACK / BUILD / RESOURCE labels; building icons occupy 45% of tile width beside troop totals.
- Corrected round growth to include neutral states, skipping only removed cells. Growth runs once after both players end; barracks growth remains local, gold remains in owner treasuries.
- 14 tests and production build passed. New test checks every active state, first-turn no-growth, full-round 8% growth, 16% barracks growth, owner mine income, removed-cell exclusion, and no duplicate growth on the following first turn.
- Browser verified supplied icons and headings, built enlarged tower, then ended both turns: neutral 7 → 8, player tower state 12 → 13, tower damage 5 → 6.
