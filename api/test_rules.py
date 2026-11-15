from rules import floor_level


def test_red_mixed_with_green():
    assert floor_level(["nb_cold", "nb_cord"], checklist_done=True) == "RED"

def test_red_plus_amber_is_red():
    assert floor_level(["nb_cord", "nb_fits"], checklist_done=True) == "RED"

def test_no_signs_checklist_not_done_is_unsure():
    assert floor_level([], checklist_done=False) == "UNSURE"

def test_no_signs_but_unclear_is_unsure():
    assert floor_level([], unclear=True, checklist_done=True) == "UNSURE"

def test_amber_plus_unclear_stays_amber():
    assert floor_level(["nb_cord"], unclear=True, checklist_done=True) == "AMBER"

def test_clean_finished_checklist_is_green():
    assert floor_level([], unclear=False, checklist_done=True) == "GREEN"

def test_unknown_sign_id_is_never_green():
    assert floor_level(["made_up_sign"], checklist_done=True) == "UNSURE"

def test_single_red_sign():
    assert floor_level(["m_bleeding"], checklist_done=False) == "RED"


COMBO_RULES = {"signs": [{"id": "a", "level": "AMBER"}, {"id": "b", "level": "AMBER"}],
               "combinations": [{"id": "c", "signs": ["a", "b"], "level": "RED"}]}

def test_combination_raises_level():
    assert floor_level(["a"], checklist_done=True, rules=COMBO_RULES) == "AMBER"
    assert floor_level(["a", "b"], checklist_done=True, rules=COMBO_RULES) == "RED"

def test_mother_fever_alone_is_amber():
    assert floor_level(["m_fever"], checklist_done=False) == "AMBER"

def test_mother_foul_discharge_is_red():
    assert floor_level(["m_foul_discharge"], checklist_done=False) == "RED"

def test_adding_a_sign_never_lowers_level():
    import itertools
    from rules import load_rules, RANK
    ids = [s["id"] for s in load_rules()["signs"]]
    for r in range(0, 3):
        for sub in itertools.combinations(ids, r):
            base = floor_level(list(sub), checklist_done=True)
            for extra in ids:
                assert RANK[floor_level(list(sub) + [extra], checklist_done=True)] >= RANK[base]


if __name__ == "__main__":
    tests = [v for k, v in dict(globals()).items() if k.startswith("test_")]
    for t in tests:
        t()
    print(f"{len(tests)} tests passed")
