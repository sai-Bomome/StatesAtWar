# States at War

A two-player, turn-based territory/card prototype. Vanilla JavaScript, CSS, Vite and PeerJS. No game backend or account required. The board uses primitives and the supplied icon sprite artwork.

## Run

    npm install
    npm run dev

Open the printed local URL. Choose **Local two-player** for pass-and-play, or **Create a room** and share the six-character code / invite link. The guest enters the code and joins; the match starts automatically. Both browsers must stay open. Online play uses the public PeerJS signaling service and WebRTC; some networks require a TURN relay that this prototype does not configure. Disconnection pauses play; reload/reconnect recovery and host migration are not implemented. No persistence. Host validates all commands; this is a friendly prototype, not an anti-cheat server.

## GitHub Pages

Push this folder's contents to a GitHub repository with a `main` branch. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included workflow tests, builds, and publishes `dist`. Vite uses relative asset URLs to support repository subpaths. Do not upload the raw source as a buildless Pages site. Alternatively run `npm run build` and host the contents of `dist` on any static HTTPS host.

## Play

- Each match creates a 6 × 6 board with exactly 10 randomly removed cells. All 26 playable states form one edge-connected landmass. Each player starts with exactly one state (12 troops); starts are placed at maximum walkable distance. Removed cells are water, cannot be occupied or targeted, and break troop adjacency.

- Select a card, select its target, then confirm. Gold cards need no state target.
- Attack: select an enemy/neutral target first, then up to the card's limit of owned source states. The order desk previews the result before commitment. Click a source again to deselect. Escape cancels targeting.
- Troops can attack only orthogonal neighbours, contributing floor(50%) of their troops. That force leaves the source. Combat is deterministic 1:1; survivors occupy. Ties leave the original owner with zero defenders.
- Towers fire within Manhattan range 3, instead of sending troops. Damage starts at 5, grows +1 each round, capped at 10. Tower damage resolves before troop combat. Towers alone cannot conquer or collect gold.
- 3 starting cards, draw 1 at turn start, up to 2 card actions, max 5 in hand. Discard excess free. Empty hands refill immediately with 3 without resetting actions. The randomly chosen opening player also draws 1 on their first turn.
- Once per turn, select a card and use **Replace card · 1 action** to discard it and draw one replacement. This uses one of the two actions, does not reset the action budget, and cannot bypass hand overflow.
- End a turn early at any time after resolving hand overflow. After both turns: all playable states, including neutral states, grow troops by 8% (floor, minimum +1). Round order remains fixed.
- Resource cards: +5/+10/+15/+20 troops at one owned state; +10/+20/+30/+50 global gold. Draws use weights: 60% resource, 25% attack, 15% build. The resource share is 40% troop cards and 20% gold cards (previously 30% each). Smaller resource values are more common. There are 14 distinct cards, including 8 resource variants. Tune probabilities in DRAW_WEIGHTS in game.js.
- One building per state. Barracks: cost 20 gold, instant +25% troops (ceil), +8 percentage points growth. Tower: cost 25 gold. Mine: cost 20 gold, instant +10 gold and +8 gold per round. Buildings survive conquest.
- Gold lives in the shared treasury. Neutral states additionally hold 5 unclaimed gold each, collected once on conquest. Enemy treasury gold is never looted.
- Eliminate all opponent-owned states to win.

All unspecified numbers, combat resolution, tower range, build costs, neutral gold, empty-hand refill and victory condition are provisional test defaults. Tune `RULES`, `CARD_TYPES`, and map generation in `game.js`.

## Game feel

Dark field-map presentation with Azure/Ember labels, troop counts and state coordinates. Eligible targets, selected sources, attack forecasts, action counts and persistent field reports provide readable feedback. Card hover/press/selection responses are brief and interruptible. Optional synthesized sound starts muted; Motion control and OS reduced-motion preference remove interaction transforms. Gameplay resolves independently of sound/animation. No screen shake or flashing. Keyboard: Tab/Enter to operate controls, Escape to cancel targeting. Hotseat handoff hides cards until the next player reveals them.

## Validation

    npm test
    npm run build

Rules tests cover opening deal, turns/rounds, stale/wrong-player commands, hand overflow/refill, attack range and source limits, troop conquest, combined/tower-only attacks, building costs, damage cap and private-hand redaction. Browser checks cover local handoff, tower construction and tower bombardment. Two-tab online checks verified room joining, turn authority, synchronized resource-card play, and round advancement. Cross-network connection quality and mobile-device performance require playtesting.

