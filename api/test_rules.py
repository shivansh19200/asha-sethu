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


if __name__ == "__main__":
    tests = [v for k, v in dict(globals()).items() if k.startswith("test_")]
    for t in tests:
        t()
    print(f"{len(tests)} tests passed")
