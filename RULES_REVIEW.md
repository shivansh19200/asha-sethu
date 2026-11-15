# Rules review

**Clinical review pending. Rules are based on official ASHA training material.**
All levels are provisional until a named doctor signs off. Never describe these rules as clinically validated before that.

## How rules change
1. Any edit to `data/rules.json` or `data/questions.json` bumps the `version`.
2. Each change gets its own commit.
3. A named reviewer is needed before `review_status` changes from pending.

## Open jobs
- Sources were found by search. Open each linked document and confirm the page number. Four signs still say TO VERIFY: nb_fits, nb_no_cry, m_belly_pain, m_breathless (partial).
- Hindi names, phrases and questions need a Hindi speaker to read them.
- Doctor to confirm every level, especially the two AMBER ones (cord pus or redness, swelling of face or hands). Yellow palms or soles was moved to RED after checking the Job Aid and IMNCI chart.
- Doctor to approve the Unsure action sentence.

## Rules table
| id | patient | level | source (short) | version | review_status | reviewed_by |
|---|---|---|---|---|---|---|
| nb_not_feeding | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_fever | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_cold | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_fast_breathing | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_diff_breathing | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_fits | newborn | RED | TO VERIFY | 0.1.0 | pending | none |
| nb_sleepy | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_yellow | newborn | RED | ICMR | 0.1.0 | pending | none |
| nb_cord | newborn | AMBER | HBNC leaflet | 0.1.0 | pending | none |
| nb_no_cry | newborn | RED | TO VERIFY | 0.1.0 | pending | none |
| m_headache | mother | RED | MCP card | 0.1.0 | pending | none |
| m_vision | mother | RED | MCP card | 0.1.0 | pending | none |
| m_fits | mother | RED | MCP card | 0.1.0 | pending | none |
| m_bleeding | mother | RED | ICMR | 0.1.0 | pending | none |
| m_belly_pain | mother | RED | TO VERIFY | 0.1.0 | pending | none |
| m_breathless | mother | RED | MCP card | 0.1.0 | pending | none |
| m_baby_less | mother | RED | ICMR | 0.1.0 | pending | none |
| m_swelling | mother | AMBER | MCP card | 0.1.0 | pending | none |
| m_water | mother | RED | MCP card | 0.1.0 | pending | none |
| m_fever | mother | AMBER | Job Aid (fever >102 F; TO VERIFY) | 0.2.0 | pending | none |
| m_foul_discharge | mother | RED | Job Aid | 0.2.0 | pending | none |

## Version 0.2.0 changes
- Split m_fever_discharge into m_fever (AMBER, provisional) and m_foul_discharge (RED).
- Added an empty `combinations` list; floor = highest of sign levels and any combination whose signs are all present.
- Doctor to decide: level for plain fever, and whether any combinations (for example fever plus another sign) should raise the level.
