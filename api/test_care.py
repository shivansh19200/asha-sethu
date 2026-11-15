from datetime import datetime, timezone
import care
now = datetime.now(timezone.utc)
rows = care.demo_rows(now)
inbox = care.sort_inbox(rows)
assert inbox[0]['level'] == 'RED' and all(i['level'] != 'AMBER' for i in inbox[:inbox.index(next(i for i in inbox if i['level'] == 'AMBER'))])
reds = [i for i in inbox if i['level'] == 'RED']
assert reds == sorted(reds, key=lambda i: i['sent_at'], reverse=True)
assert all('name' not in i for i in inbox) and all(i['demo'] for i in inbox)
s = care.build_summary(rows, now)
assert any(a['village'] == 'Demo Village A' and a['sign'] == 'nb_fever' and a['count'] == 3 for a in s['alerts'])
assert not any(a['village'] == 'Demo Village C' for a in s['alerts'])
assert {o['code'] for o in s['overdue']} >= {'DM01', 'DM02', 'DM04'} and 'DM05' not in {o['code'] for o in s['overdue']}
assert s['demo']
os_env = __import__('os').environ
os_env['CARE_ACCESS_CODE'] = 'abc'
assert care.authed({'access': 'abc'}) and not care.authed({'access': 'x'}) and not care.authed({})
del os_env['CARE_ACCESS_CODE']
assert not care.authed({'access': ''})
print('care tests pass')
