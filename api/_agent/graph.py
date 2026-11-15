"""LangGraph wiring. If LangGraph is missing or AGENT_ENGINE=plain, the same nodes run in a plain Python loop."""
import os
from typing import Any, TypedDict
from . import core


class State(TypedDict, total=False):
    patient: str; signs: list; answers: list; unclear: bool; checklist_done: bool; show_now: bool
    trace: list; suggestion: Any; escalated: bool; stop: bool; pending: Any; next: Any; steps: int
    drafts: list; model_ok: bool; model_used: bool; finished: bool; floor: str; level: str


def _route(st):
    return 'end' if st['stop'] else 'decide'


def run_graph(st):
    from langgraph.graph import StateGraph, END
    g = StateGraph(State)
    g.add_node('enforce', core.enforce)
    g.add_node('decide', core.decide)
    g.add_node('act', core.act)
    g.set_entry_point('enforce')
    g.add_conditional_edges('enforce', _route, {'decide': 'decide', 'end': END})
    g.add_edge('decide', 'act')
    g.add_edge('act', 'enforce')
    return g.compile().invoke(st, {'recursion_limit': 3 * core.MAX_STEPS + 10})


def run_plain(st):
    core.enforce(st)
    while not st['stop']:
        core.decide(st)
        core.act(st)
        core.enforce(st)
    return st


def run(req):
    st = core.prepare(core.new_state(req))
    engine = 'plain'
    if os.environ.get('AGENT_ENGINE') != 'plain':
        try:
            st = run_graph(st)
            engine = 'langgraph'
        except ImportError:
            st = run_plain(st)
    else:
        st = run_plain(st)
    core.finalize(st)
    core.enforce(st)  # one last pass: level can never end below the floor
    return core.result(st, engine)