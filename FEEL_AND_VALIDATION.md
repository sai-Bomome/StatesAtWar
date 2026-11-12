# Open Command implementation and validation

The 0.2 prototype replaces card play with permanent Build / Attack / Move Troops controls. It preserves the supplied artwork, board styling, coordinates preference, reduced motion and optional sound. The original card implementation and its playtest report remain in Git history / PLAYTEST.md (historical).

Truth is resolved by game.js before presentation. No animation or sound callback controls outcomes. Host configuration is validated and frozen into authoritative state, then replicated to the guest. Attack forecast calls the same calculation as combat resolution. Move preview shows source remainder and destination total. Invalid commands do not mutate the input state or spend actions.

Intended feel: deliberate, readable, direct. Main verbs: construct, combine, transfer. Critical information: active player, action budget, eligible sources/targets, troop totals, gold costs and forecast. Selecting an action resets only targeting, not game state; Escape cancels. Confirmation commits one action. Cosmetic hover/press motion remains short and interruptible; reduced mode removes transforms. No screen shake or flashing.

Verification: 18 new card-free rules tests and production build passed. 500 seeded maps validated for 26 connected cells. Browser checked per-field reset, Reset all, full-grid toggle, configurable starting troops and action budget. Custom local match: 36 states, 3 actions, 40 starting troops; diagonal capture (20 vs 8 → 12 survivors), transfer 19 troops into the new state leaving 1 behind, mine construction, then full-round growth and income. Network/config synchronization validation is recorded after final checks.

Limits: no measured FPS/latency, no physical mobile or assistive-technology testing, no cross-network connectivity guarantee. No persistence/reconnect. Balance values are provisional; base treasury income is new because resource cards have been removed. Move allows arbitrary distance and ignores paths per user instruction.

Network verification passed in two browser tabs: host full grid, 0% growth, 4 actions/turn replicated to guest. Guest built a mine; host field report updated. Both turns ended; troops remained 12/12, treasury totals became 55/53, and guest action budget reset to 4. Reset all restored edited actions from 4 to 2. Per-field reset restored growth to 8. Cross-network devices remain untested.

Diagnostic heuristic self-play: 30 seeded card-free matches, 60-round cutoff; 8 completed, mean 33.3 attacks and 129.1 transfers. This is not an optimal strategy or a controlled comparison with the old card bot.

## Board sizes and economy revision
Board picker supports 4/6/8/10, default 6. Removal supports 0 and dynamically validates size²−2 maximum. Renderer and network summaries use host board size; wide boards scroll together with coordinate labels. Buy and Upgrade join the permanent action palette. Three troop packages have explicit prices; upgrades preview next cost and effect. Tile level labels supplement enlarged building icons.

23 rules tests and production build passed. New tests cover every size, zero removal, minimal connected boards, package amounts/costs/ownership, scaling upgrade costs and cap, no repeated construction bonuses, upgraded round production and tower damage, and levels retained on conquest. Browser used 8×8 / 64 states with 0 removal, 5 actions and 200 starting gold. Bought Company (+15, 25 gold), built a tower (25 gold), upgraded L1 → L2 (25 gold); treasury 200 → 125, troops 12 → 27, tower damage 6 → 10, 2/5 actions remained.

## 2–4 player support
Configurable Players selector, default 2. Each player owns one distinct starting state; extra spawns maximize their minimum path distance to existing spawns. Turns rotate through surviving players, with explicit ended-this-round tracking. Eliminated players are skipped, and victory requires exactly one surviving owner. Gold income stops for eliminated players. Removal limit leaves at least one state per player. Colours and AZ/EM/JA/VI labels distinguish all four owners without relying on colour alone.

27 rules tests and production build passed, including three/four-player spawn capacity, four-turn round boundaries, elimination skipping and final-survivor victory. Browser: four separate tabs connected to one code, first two guests waited in the lobby, fourth arrival started the match. Turn rotation was Violet → Azure → Ember → Jade; exactly one End turn button was enabled at a time; round 2 began after four ends. Violet bought 5 troops and the host received the event. Local four-player pass-and-play rotated Ember → Jade → Violet → Azure and advanced once to round 2. Network tests were on one machine, not cross-network devices. Disconnect pause behavior is implemented; no reconnect/host migration.
