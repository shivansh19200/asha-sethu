# Asha Sethu

An alert aid for ASHA home visits. The health worker describes a sick newborn or mother (speak, type, or tick a checklist). An AI agent picks its own next step, asks only the questions that could change the danger level, shows every step it took, and prepares a referral note and visit record. The worker confirms before anything is saved or sent.

Built for Code for a Billion. **Built with AgentFoundry.**

> **Clinical review:** danger-sign levels (rules version 0.3.0) were reviewed by Dr Pratibha Aggarwal, gynaecologist, on 15 November 2026. The newborn signs have not had a paediatric review, source page numbers are still being confirmed, and this is **not clinically validated**.
> **Prototype security:** real logins come before any field use.
> **This is an alert aid, not a diagnosis.**

## How it works
- **Safety floor in plain Python** (`api/rules.py`). Fixed rules compute the minimum danger level from `data/rules.json` (every sign has a source, a version and a review status). The agent may raise the level, never lower it. The floor is enforced in code after every agent step, outside the model.
- **Unsure instead of Green.** If the input is unclear, the checklist is unfinished, or a question was answered "Not sure", the result is Unsure, never Green.
- **Tick-list, typing and voice together.** A sign that speech or text missed can still be ticked or added by hand. Typed text never removes a tick.
- **Agent loop** (`api/_agent/`, LangGraph, with a plain-Python fallback). The model only chooses the next step (ask a question from the fixed question bank, suggest a level, or finish). Code validates everything it returns.
- **Four tags on every step:** AI suggested, Worker confirmed, From rules, Done. "Done" appears only after the worker taps.
- **Review and send.** Nothing is saved before "Confirm and save". Nothing is sent before "Send referral".
- **Hindi, Hinglish and English** input; note in English or Hindi.

## Privacy and safety
- No names and no initials anywhere. Each visit gets a random 4-character patient code. Age is stored as days.
- The browser never talks to the database. Only the Python API, using a server key kept in environment variables, reads and writes Supabase. Row Level Security is on with no public policies.
- Secrets live only in `.env` (local) and the host's environment variables. No key is in this repo.

## Evidence (104 test cases, offline run, no AI model)
The cases were written by the builder, not collected from real visits, so scores will look better than real use. The baseline is a printed-checklist stand-in: English keywords only, no negation, no questions, no Unsure.

| | Printed checklist | Asha Sethu |
|---|---|---|
| RED cases caught | 32 of 55 | 55 of 55 |
| Level accuracy | 53% | 99% |
| Missed danger (false negatives) | 44% | 0% |
| False alarms (over-referral) | 8% | 0% |
| Unsure rate | 0% | 10% |

By language, level accuracy (checklist / Asha Sethu): English 82% / 98%, Hindi 20% / 100%, Hinglish 7% / 100%. On clean English cases the two are close; the agent wins on Hindi, Hinglish, misspellings and negation.

**Floor test 1** (final level never below the rules floor): 104 of 104. **Floor test 2** (never Green when unclear or the checklist is unfinished): 104 of 104.
The floor test checks the code, not the medicine. It does not prove the clinical rules are correct.

Known miss: free wording such as "baby is feeding well and looks fine" cannot clear the unclear flag, so it returns Unsure (safe, but not Green).

## Run it
```
cd web && npm install && npm run dev          # screens
pip install -r api/requirements.txt           # in another terminal, from the project root
python api/dev.py                             # API on port 3001
python api/eval.py                            # scoreboard and floor tests
```
Copy `.env.example` to `.env` and fill in your own values. Tests: `python api/test_rules.py`, `test_understand.py`, `test_agent.py`, `test_note.py` (run from `api/`).

## Not done yet
Field deployment, real logins and audit logs, a role-play trial with real people, and a consented shadow pilot (planned). Doctor inbox, supervisor view and auto check-back are in progress.
