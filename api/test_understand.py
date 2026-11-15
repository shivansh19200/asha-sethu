from understand import analyse


def t(text, patient='newborn'):
    return analyse(text, patient)


def test_basic():
    assert set(t("baby won't feed, feels warm")['signs']) == {'nb_not_feeding', 'nb_fever'}
    assert 'nb_fits' in t('baby had fits')['signs']


def test_negation():
    assert 'nb_not_feeding' not in t('baby is feeding well')['signs']
    r = t('baby has no fever and is not feeding')
    assert r['signs'] == ['nb_not_feeding'] and r['negated'] == ['nb_fever']
    assert t('baby is not having fits')['negated'] == ['nb_fits']


def test_both_signs():
    assert set(t('not drinking milk, very sleepy')['signs']) == {'nb_not_feeding', 'nb_sleepy'}


def test_hindi_hinglish():
    assert 'nb_not_feeding' in t('बच्चा दूध नहीं पी रहा')['signs']
    r = t('doodh nahi pee raha, bukhar nahi')
    assert r['signs'] == ['nb_not_feeding'] and r['negated'] == ['nb_fever']


def test_vague_is_unclear():
    r = t('baby seems off')
    assert r['signs'] == [] and r['unclear'] is True


def test_ambiguous_negation_keeps_sign():
    r = t('fever no cough')
    assert 'nb_fever' in r['signs'] and r['unclear'] is True

def test_longer_phrase_negation():
    r = t('no severe headache', 'mother')
    assert r['signs'] == [] and r['negated'] == ['m_headache']


if __name__ == '__main__':
    for name, fn in list(globals().items()):
        if name.startswith('test_'):
            fn()
            print('ok', name)