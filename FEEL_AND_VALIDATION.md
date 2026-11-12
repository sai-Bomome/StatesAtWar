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

## Quick skirmish pacing
Changed defaults to 4×4 full board, starting troops 30, neutral strength 3, neutral growth off, 3 actions, growth 5%, treasury income 10 and round limit 8. Configurable limit supports 0 = unlimited. End condition after every living player finishes the last round: territory count, troops, gold; exact ties draw. No final extra growth/payout. Live standings and round-limit indicator expose the objective.

31 tests and production build pass. New tests verify an immediate opening capture, round-cap timing, territory-first victory, troop/gold tie-breaks, full draws, 4-player waiting and unlimited mode. Browser confirmed default 4×4, 30 troops, 3 actions; captured a neutral immediately (15 vs 3 → 12 survivors). A one-round test ended with Azure winning 2 states versus 1, despite having fewer troops; all controls disabled.

Same heuristic strategy, 30 seeds per settings group: legacy contact mean round 8.13, 13/30 completed by 60-round cutoff; quick contact mean round 2, 30/30 completed at round 8. The round cap guarantees the latter bound. These simulations diagnose pacing, not human balance or measured play duration.

## Procedural island presentation
Replaced visible square buttons with a seeded SVG territory mesh. Shared cubic edges preserve seams across owner changes. Water gaps, shallow coast, ivory cliff extrusion, static waves/rocks, pastel territory gradients and code-drawn buildings establish the reference aesthetic. Gameplay adjacency is unchanged. Shape generation is independent of rules and cached; hover, focus, selected and target cues remain distinct. SVG groups have semantic button roles, labels, tabindex and Enter/Space activation. Coordinate toggle hides SVG labels as well. No animated water or camera motion was added.

34 tests and production build passed. New geometry checks cover deterministic seeds, variation, all 4 board sizes, cell count, shared-edge use, coast/border accounting, finite paths, view-box centers, removed water cells and geometry stability under owner/resource/building changes. Browser checked a 6×6 map with 10 removals: 26 irregular territories, diagonal capture (15 vs 3 → 12 survivors), barracks and tower construction, player handoff, mine construction, coordinate off and all three map building drawings. Visuals are stylized procedural approximations of the reference, not a copy of the supplied image.
