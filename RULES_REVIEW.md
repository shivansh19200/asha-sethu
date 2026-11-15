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
| nb_not_feeding | newborn | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_fever | newborn | RED | ICMR | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_cold | newborn | RED | ICMR | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_fast_breathing | newborn | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_diff_breathing | newborn | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_fits | newborn | RED | TO VERIFY | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_sleepy | newborn | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_yellow | newborn | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_cord | newborn | AMBER | HBNC leaflet | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_no_cry | newborn | RED | TO VERIFY | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_headache | mother | AMBER | MCP card | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_vision | mother | AMBER | MCP card | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_fits | mother | RED | MCP card | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_bleeding | mother | RED | ICMR | 0.1.0 | pending | none |
| m_fever | mother | AMBER | Job Aid (fever >102 F; TO VERIFY) | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_foul_discharge | mother | AMBER | Job Aid | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_belly_pain | mother | AMBER | TO VERIFY | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_breathless | mother | RED | MCP card | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_baby_less | mother | AMBER | ICMR | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_swelling | mother | AMBER | MCP card | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_water | mother | RED | MCP card | 0.1.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_chest_indrawing | newborn | RED | IMNCI chart | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_skin_pus | newborn | AMBER | IMNCI chart | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_eye_pus | newborn | AMBER | IMNCI chart | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| nb_loose_stools | newborn | AMBER | IMNCI chart | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_faint | mother | RED | MoHFW HBNC/HBYC Job Aid for ASHA | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_vag_bleed_preg | mother | RED | ICMR antenatal guideline | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_early_labour | mother | RED | MCP card: before 37 weeks | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_pale_weak | mother | AMBER | MCP card: severe anaemia | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_urine_burning | mother | AMBER | Added by the reviewer. No document source yet. | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_breast | mother | AMBER | Added by the reviewer. No document source yet. | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_stitches | mother | AMBER | Added by the reviewer. No document source yet. | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |
| m_vomiting | mother | AMBER | Added by the reviewer. No document source yet. | 0.3.0 | reviewed | Dr Pratibha Aggarwal (gynaecologist) |

## Version 0.3.0: reviewer sheet applied (15 Nov 2026)
- Reviewer: Dr Pratibha Aggarwal, gynaecologist. She allowed being named as reviewer in the README.
- Levels lowered RED to AMBER: nb_not_feeding, nb_fast_breathing, nb_diff_breathing, nb_sleepy, nb_yellow, m_headache, m_vision, m_foul_discharge, m_belly_pain, m_baby_less.
- Plain fever in a mother: AMBER. Fever and foul discharge: separate signs.
- Added (she ticked Add): nb_chest_indrawing, nb_skin_pus, nb_eye_pus, nb_loose_stools, m_faint, m_vag_bleed_preg, m_early_labour, m_pale_weak, m_urine_burning, m_breast, m_stitches, m_vomiting. Not added (she ticked Do not add): weak cry (N11).
- Combinations C1 and C2 recorded at AMBER. They change nothing while both signs are AMBER.
- Hindi: reviewer found no corrections. The Hindi for the new signs is from her sheet; the new question sentences are ours and need a Hindi speaker to read them.
- Sheet gaps: M5 (heavy bleeding) had no verdict, kept RED. N4 had Agree and Change both ticked, written level amber used.
- Reviewer is a gynaecologist; the newborn rows have not had a paediatric review.
