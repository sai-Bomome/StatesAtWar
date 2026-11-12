# States at War — Open Command (0.2)

A card-free, two-player, turn-based browser strategy prototype. Build, Attack, Move Troops, Buy Troops and Upgrade are always available; each costs one action. The earlier card prototype remains in Git history.

## Run

    npm install
    npm run dev

Open the printed local URL. Choose **Host a game** or **Local two-player**, customize settings, then create the room / start the match. Defaults are preloaded. Every field has a reset arrow; **Reset all** restores all defaults. Advanced settings are under **More settings**. Joining guests use the host's frozen configuration, visible in the match's Field manual & match settings.

## Defaults and rules

- Board size picker: 4 × 4, 6 × 6 (default), 8 × 8 or 10 × 10. Random removal defaults to 10 cells while preserving edge-connected land. Enter 0 removed cells or disable removal for a complete grid. Removal maximum adapts to leave at least 2 playable states. Wide boards scroll horizontally when needed. Each player starts with one state, placed far apart, with 12 troops and 50 treasury gold. Neutral states start with 8 troops and 5 claimable gold.
- First player is random. 2 actions per turn. End early whenever desired. After both players finish, one round update occurs: 8% growth on all playable states (floor, minimum +1 when rate is positive), +5 treasury gold per player, plus mine income. Base growth can be zero; neutral growth can be disabled.
- **Build:** select Barracks, Attack tower or Gold mine; target an empty owned state; confirm. One building per state. Barracks cost 20: +25% troops immediately and +8 percentage points of growth per round. Tower costs 25: damage equals 25% of current garrison (floor, minimum 1 when occupied), range 3 Manhattan tiles. Mine costs 20: +10 treasury gold immediately and +8 per round. Buildings survive conquest.
- **Attack:** choose an enemy/neutral target, then any number of eligible owned source states. **Select all eligible states** is available. Troops attack all 8 neighbours, committing 50% (floor). Diagonals and commitment percentage are configurable. Towers fire instead of sending troops and consume no troops. Tower damage resolves first, then troop combat is 1:1; surviving attackers occupy. Ties retain the original owner at zero troops. Tower-only attacks cannot conquer or claim gold. Occupation claims the state's unclaimed gold; enemy treasury is never looted.
- **Move troops:** choose a source, then any other owned destination, at any distance with no path requirement. Pick 25%, 50%, all but 1, or enter an exact whole number. Leave at least 1 troop behind. One source/destination pair costs one action. Moving troops changes a tower's damage immediately.
- **Buy troops:** target any owned state. Squad: +5 for 10 gold; Company: +15 for 25 gold; Battalion: +40 for 60 gold. Each purchase costs one action. Troops appear immediately and improve tower damage when purchased at a tower.
- **Upgrade:** target an existing owned building. Costs one action and base building cost × current level in gold. Maximum level 3. Barracks extra growth and mine round income scale by level (default barracks +8/+16/+24 percentage points; mine 8/16/24 gold). Tower garrison damage scales 1×/1.5×/2× (default 25%/37.5%/50%, capped at 100%). Upgrades do not repeat instant construction bonuses or change tower range. Level is visible on the tile and retained on conquest.
- Eliminate all opponent-owned states to win.

The setup config also exposes starting resources, neutral strength/gold, base gold income, building costs and bonuses, mine income, tower range and tower damage percentage. Host config is immutable for a match. Editing setup does not alter a match in progress. Tunables and validation bounds live in `CONFIG_FIELDS` and `DEFAULT_CONFIG` in `game.js`.

## Multiplayer

PeerJS public signaling + WebRTC. Host validates each command, turn, action budget, ownership and revision. All battlefield and resource information is public. Both browsers must remain open. No save, reconnect recovery, host migration or competitive anti-cheat server. No TURN relay is configured; cross-network connectivity depends on the peers' networks. Card-free rooms use a separate protocol namespace so older clients cannot join accidentally.

## GitHub Pages

Push to `main`. Set repository **Settings → Pages → Source** to **GitHub Actions**. The included workflow tests, builds and publishes `dist`. Relative asset URLs support repository subpaths. Do not deploy raw source with the default static/Jekyll workflow. A successful build of `dist` can also be uploaded to any static HTTPS host.

## Feedback and accessibility

Supplied icon sheets, yellow-circle gold badges, helmet troop counts, large buildings and readable source/target highlights. Attacks and moves preview before confirmation. Persistent field log, optional muted-by-default sound, OS/in-game reduced motion, keyboard-accessible buttons. **Coords on/off** persists locally. Gameplay is independent of animation/audio. Mobile styles are included; physical device testing is still needed.

## Validation

    npm test
    npm run build
    node tools/selfplay.mjs

Tests cover config validation, deterministic and connected maps, complete grids, unlimited attack sources, diagonals, tower scaling, arbitrary-distance troop transfers and conservation, costs/ownership/ranges, action budgets, round timing, income, zero/neutral growth, stale commands and victory. The self-play script is a heuristic diagnostic, not a balance guarantee. `PLAYTEST.md` records the earlier card build and is historical.
