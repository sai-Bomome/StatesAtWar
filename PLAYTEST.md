# Self-play findings

## Method
Played both sides through three full rounds in the browser, then made a round-four conquest. Confirmed troop resource plays, a barracks in an initial exploratory opening, attack targeting, occupation, empty-hand refill, redraw, and round updates. Then compared 100 deterministic seeds for 60 rounds using `node tools/selfplay.mjs`. The bot prioritizes profitable conquests, frontier reinforcement, barracks and gold; it does not deliberately sacrifice troops or conduct bombardment-only preparation. These are diagnostic runs, not proof of human balance or an optimal strategy. No opponent-hand information is used by the action chooser.

## Changes implemented
- Preserve 60% resource / 25% attack / 15% build base odds. Shift resource composition from 30% troops + 30% gold to 40% troops + 20% gold. Keep independent replacement draws and all 14 variants.
- Add optional card replacement: costs one action, once per turn. Lets players cycle a build card when every owned state already has a building. Does not bypass hand limit, grant extra actions or trigger the empty-hand refill.
- Highlight only enemy/neutral targets actually reachable by an owned source. Invalid target clicks explain neighbour/range requirements.
- Disable card confirmation after exhausting actions.

## Diagnostic results
| Metric across 100 matches | Before | After |
| --- | ---: | ---: |
| Mean first conquest round (excludes never-capture games by treating them as zero in the script, so approximate) | 2.0 | 1.8 |
| Mean successful attacks | 5.6 | 7.6 |
| Mean occupied states at cutoff | 7.6 | 9.4 |
| Mean peak treasury | 1085 | 885.8 |
| Completed matches within 60 rounds | 0 | 0 |
| Matches with no conquest | 2 | 3 |

The updated bot can also use replacement, so this comparison combines changed odds and the new action. Fewer turns with no commands is not evidence of more meaningful turns: replacing a card also counts as a command. The unchanged failure to finish is the important limitation.

## Design issues still open
1. Gold accumulates after building slots fill. Consider a gold spending action such as troop purchase, with a per-turn cap.
2. Rear-state troops cannot transfer forward; half of every attacking force stays behind. Consider a March/Transfer card to consolidate along owned neighbours.
3. Neutral troop growth compounds while resource cards stay flat. Later frontier states can become harder to capture faster than a single state can prepare. Preserve global growth for now; tune after transfer and spending choices are settled.
4. Towers currently fire instead of sending troops even when adjacent. Consider an explicit troop/shot choice for tower states.

## Verification
18 rules tests and production build pass. New tests cover redraw cost, hand count, once-per-turn limit/reset, and rejection when out of actions or above the hand limit. Browser round-four test highlighted only E1 from Ember's F1; forecast 30 attackers vs 13 defenders correctly produced a conquest with 17 survivors.
