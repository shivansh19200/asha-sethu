import os
os.environ.pop('GROQ_API_KEY', None)
from _agent import core
from _agent.graph import run


def go(patient, signs=(), answers=None, **kw):
    req = {'patient': patient, 'signs': list(signs), 'answers': answers or [], 'checklist_done': kw.get('done', False),
           'unclear': kw.get('unclear', False), 'show_now': kw.get('show_now', False)}
    return run(req)


def texts(r):
    return [t['text'] for t in r['trace']]


def test_red_floor_escalates_without_questions():
    r = go('newborn', ['nb_fits'])
    assert r['status'] == 'done' and r['level'] == 'RED' and r['question'] is None
    assert 'Escalated Red' in texts(r)


def test_amber_asks_then_stays_amber():
    r = go('newborn', ['nb_cord'])
    assert r['status'] == 'ask' and r['level'] == 'AMBER'
    answers = []
    while r['status'] == 'ask':
        answers.append({'qid': r['question']['id'], 'answer': 'no'})
        r = go('newborn', ['nb_cord'], answers)
    assert r['level'] == 'AMBER'


def test_vague_show_now_is_unsure_never_green():
    r = go('newborn', [], unclear=True, show_now=True)
    assert r['status'] == 'done' and r['level'] == 'UNSURE'


def test_unanswered_show_now_never_green_even_if_checklist_done():
    r = go('newborn', [], done=True, show_now=True)
    assert r['level'] == 'UNSURE'


def test_clean_checklist_all_no_is_green():
    answers, r = [], go('newborn', [], done=True)
    while r['status'] == 'ask':
        answers.append({'qid': r['question']['id'], 'answer': 'no'})
        r = go('newborn', [], answers, done=True)
    assert r['level'] == 'GREEN'


def test_mother_fever_then_foul_discharge_goes_red():
    r = go('mother', ['m_fever'])
    assert r['level'] == 'AMBER'
    r = go('mother', ['m_fever'], [{'qid': 'q_m_foul_discharge', 'answer': 'yes'}])
    assert r['level'] == 'RED' and r['status'] == 'done'


def test_not_sure_answer_is_never_green():
    answers, r = [], go('newborn', [], done=True)
    while r['status'] == 'ask':
        answers.append({'qid': r['question']['id'], 'answer': 'unsure'})
        r = go('newborn', [], answers, done=True)
    assert r['level'] == 'UNSURE'


def test_model_cannot_lower_floor():
    core.model_choose = lambda st, c: {'tool': 'suggest_level', 'level': 'GREEN', 'reason': 'looks fine', 'by': 'ai'}
    core.os.environ['GROQ_API_KEY'] = 'x'
    try:
        r = go('newborn', ['nb_cord'])
        assert r['level'] == 'AMBER'
        assert any(t['text'].startswith('Safety floor kept Amber') for t in r['trace'])
    finally:
        core.os.environ.pop('GROQ_API_KEY', None)


def test_model_can_raise_and_invalid_choice_is_dropped():
    assert core.validate_choice({'tool': 'ask_question', 'question_id': 'nope'}, []) is None
    core.model_choose = lambda st, c: {'tool': 'suggest_level', 'level': 'RED', 'reason': 'two worrying signs', 'by': 'ai'}
    core.os.environ['GROQ_API_KEY'] = 'x'
    try:
        r = go('newborn', ['nb_cord'])
        assert r['level'] == 'RED' and r['floor'] == 'AMBER'
        assert any(t['tag'] == 'ai_suggested' for t in r['trace'])
    finally:
        core.os.environ.pop('GROQ_API_KEY', None)


def test_drafts_prepared_never_sent():
    r = go('newborn', ['nb_fits'])
    assert 'send_referral' in r['drafts']
    assert not any(t['tag'] == 'done' for t in r['trace'])


def test_plain_engine_same_result():
    os.environ['AGENT_ENGINE'] = 'plain'
    try:
        assert go('newborn', ['nb_fits'])['level'] == 'RED'
    finally:
        os.environ.pop('AGENT_ENGINE')


def test_suggestion_persists_between_requests():
    r = run({'patient': 'newborn', 'signs': ['nb_cord'], 'answers': [], 'suggestion': 'RED'})
    assert r['level'] == 'RED' and r['suggestion'] == 'RED'


if __name__ == '__main__':
    for n, f in list(globals().items()):
        if n.startswith('test_'):
            f()
            print('ok', n)