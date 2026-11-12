# Open Command implementation and validation

The 0.2 prototype replaces card play with permanent Build / Attack / Move Troops controls. It preserves the supplied artwork, board styling, coordinates preference, reduced motion and optional sound. The original card implementation and its playtest report remain in Git history / PLAYTEST.md (historical).

Truth is resolved by game.js before presentation. No animation or sound callback controls outcomes. Host configuration is validated and frozen into authoritative state, then replicated to the guest. Attack forecast calls the same calculation as combat resolution. Move preview shows source remainder and destination total. Invalid commands do not mutate the input state or spend actions.

Intended feel: deliberate, readable, direct. Main verbs: construct, combine, transfer. Critical information: active player, action budget, eligible sources/targets, troop totals, gold costs and forecast. Selecting an action resets only targeting, not game state; Escape cancels. Confirmation commits one action. Cosmetic hover/press motion remains short and interruptible; reduced mode removes transforms. No screen shake or flashing.

Verification: 18 new card-free rules tests and production build passed. 500 seeded maps validated for 26 connected cells. Browser checked per-field reset, Reset all, full-grid toggle, configurable starting troops and action budget. Custom local match: 36 states, 3 actions, 40 starting troops; diagonal capture (20 vs 8 → 12 survivors), transfer 19 troops into the new state leaving 1 behind, mine construction, then full-round growth and income. Network/config synchronization validation is recorded after final checks.

Limits: no measured FPS/latency, no physical mobile or assistive-technology testing, no cross-network connectivity guarantee. No persistence/reconnect. Balance values are provisional; base treasury income is new because resource cards have been removed. Move allows arbitrary distance and ignores paths per user instruction.

Network verification passed in two browser tabs: host full grid, 0% growth, 4 actions/turn replicated to guest. Guest built a mine; host field report updated. Both turns ended; troops remained 12/12, treasury totals became 55/53, and guest action budget reset to 4. Reset all restored edited actions from 4 to 2. Per-field reset restored growth to 8. Cross-network devices remain untested.

Diagnostic heuristic self-play: 30 seeded card-free matches, 60-round cutoff; 8 completed, mean 33.3 attacks and 129.1 transfers. This is not an optimal strategy or a controlled comparison with the old card bot.
