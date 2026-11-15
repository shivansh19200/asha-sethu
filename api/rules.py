import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
RANK = {"GREEN": 0, "UNSURE": 1, "AMBER": 2, "RED": 3}


def load_rules(path=None):
    path = Path(path) if path else DATA / "rules.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def floor_level(signs, unclear=False, checklist_done=False, rules=None):
    """Minimum danger level. Plain code, no AI.
    signs: list of sign ids present.
    Highest level among present signs wins.
    No signs and (unclear or checklist not done) -> UNSURE.
    GREEN only when checklist done, nothing unclear, no sign present.
    An unknown sign id counts as unclear (never silently ignored)."""
    rules = rules or load_rules()
    levels = {s["id"]: s["level"] for s in rules["signs"]}
    best = "GREEN"
    for sid in signs:
        if sid not in levels:
            unclear = True
            continue
        if RANK[levels[sid]] > RANK[best]:
            best = levels[sid]
    if best == "GREEN" and (unclear or not checklist_done):
        return "UNSURE"
    if unclear and RANK[best] < RANK["UNSURE"]:
        return "UNSURE"
    return best
