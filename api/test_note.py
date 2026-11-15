from note import write_note, fill_record

D = {'patient': 'newborn', 'signs': ['nb_fits'], 'answers': [{'qid': 'q_nb_fever', 'answer': 'no'}], 'level': 'RED',
     'age': {'weeks': 1, 'days': 3}, 'asha_name': 'Sita', 'village': 'Rampur', 'code': 'K7M2', 'when': '15/11/2026, 10:00', 'other_concern': 'cries a lot'}


def test_english_note_has_only_confirmed_facts():
    n = write_note(D, 'en')
    assert 'Fits' in n and 'K7M2' in n and 'Go to the hospital now.' in n and 'alert aid, not a diagnosis' in n
    assert '1 week 3 days' in n and 'cries a lot' in n
    assert 'Fever' in n.split('Asked and absent:')[1].split('\n')[0]


def test_hindi_note():
    n = write_note(D, 'hi')
    assert 'रेफ़रल नोट' in n and 'अभी अस्पताल जाएँ।' in n and 'K7M2' in n


def test_no_signs_says_none_and_ignores_unknown_ids():
    n = write_note({'patient': 'mother', 'signs': ['made_up'], 'level': 'UNSURE'}, 'en')
    assert 'Signs present: none' in n and 'made_up' not in n


def test_record_prefill_and_nothing_sent():
    r = fill_record({'patient': 'newborn', 'signs': ['nb_not_feeding'], 'level': 'RED'})
    assert r['feeding'] == 'Not feeding' and r['referral_made'] is False


if __name__ == '__main__':
    for n, f in list(globals().items()):
        if n.startswith('test_'):
            f(); print('ok', n)