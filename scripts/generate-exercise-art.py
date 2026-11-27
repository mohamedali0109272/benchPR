#!/usr/bin/env python3
"""Generates src/data/exerciseArt.ts: one stick-figure pictogram per exercise.

Every exercise is a side-view figure defined by joint positions on a 120x120
canvas, plus the equipment it uses and the body parts to highlight.
Run:  python3 scripts/generate-exercise-art.py
"""
import json
import pathlib

BODY = "#E6EDF3"   # figure
HL = "#FF2D55"     # worked muscles (brand coral)
EQ = "#6E7681"     # equipment
GROUND = "#30363D"

GROUND_Y = 110


def _pts(points):
    return " ".join(f"{x},{y}" for x, y in points)


def line(points, color, width, extra=""):
    return (f'<polyline points="{_pts(points)}" fill="none" stroke="{color}" '
            f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"{extra}/>')


def bar(x1, x2, y):
    """Barbell in front of the body: shaft plus a plate at each end."""
    out = [line([(x1, y), (x2, y)], EQ, 3.5)]
    for x in (x1, x2):
        out.append(f'<rect x="{x - 3}" y="{y - 8}" width="6" height="16" rx="2" fill="{EQ}"/>')
    return "".join(out)


def dumbbell(x, y):
    return (f'<rect x="{x - 6}" y="{y - 3}" width="12" height="6" rx="2" fill="{EQ}"/>'
            f'<rect x="{x - 8}" y="{y - 5}" width="3" height="10" rx="1" fill="{EQ}"/>'
            f'<rect x="{x + 5}" y="{y - 5}" width="3" height="10" rx="1" fill="{EQ}"/>')


def bench(x1, x2, y, leg_x=None):
    """Flat bench: padded top plus legs to the floor."""
    lx = leg_x or (x1 + 8, x2 - 8)
    out = [line([(x1, y), (x2, y)], EQ, 6)]
    for x in lx:
        out.append(line([(x, y), (x, GROUND_Y)], EQ, 3))
    return "".join(out)


def incline(x1, y1, x2, y2):
    """Incline bench: sloped pad with a support leg."""
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    return line([(x1, y1), (x2, y2)], EQ, 6) + line([(mx, my), (mx - 4, GROUND_Y)], EQ, 3)


def seat(x1, x2, y, back=None):
    out = [line([(x1, y), (x2, y)], EQ, 6), line([((x1 + x2) / 2, y), ((x1 + x2) / 2, GROUND_Y)], EQ, 3)]
    if back:
        out.append(line(back, EQ, 5))
    return "".join(out)


def cable(points):
    return (f'<polyline points="{_pts(points)}" fill="none" stroke="{EQ}" stroke-width="1.8" '
            f'stroke-dasharray="3 3" stroke-linecap="round"/>')


def ground():
    return line([(6, GROUND_Y), (114, GROUND_Y)], GROUND, 2)


def figure(p, hl=(), extra_eq=()):
    """Draws equipment, then the figure, then highlighted body parts on top."""
    parts = [ground(), *extra_eq]
    S, E, W, H, K, A, T = p["S"], p["E"], p["W"], p["H"], p["K"], p["A"], p["T"]
    segments = {
        "torso": [S, H],
        "arm": [S, E, W],
        "leg": [H, K, A, T],
    }
    widths = {"torso": 13, "arm": 7, "leg": 8}
    for leg_pts in p.get("extra_legs", []):
        parts.append(line(leg_pts, HL if p.get("extra_hl") else BODY, 8))
    for name in ("leg", "torso", "arm"):
        parts.append(line(segments[name], BODY, widths[name]))
    hx, hy = p["head"]
    parts.append(f'<circle cx="{hx}" cy="{hy}" r="8" fill="{BODY}"/>')
    for name in hl:
        parts.append(line(segments[name], HL, widths[name]))
    if p.get("badge") == "timer":
        parts.append(f'<circle cx="104" cy="16" r="9" fill="#131822" stroke="{HL}" stroke-width="2"/>'
                     f'<polyline points="104,11 104,16 108,18" fill="none" stroke="{HL}" stroke-width="2" stroke-linecap="round"/>')
    return (f'<svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" '
            f'width="100%" height="100%">{"".join(parts)}</svg>')


def standing(**overrides):
    """Standing side-view base: straight legs, arms down."""
    base = dict(head=(60, 20), S=(60, 36), E=(60, 54), W=(60, 68),
                H=(60, 66), K=(62, 88), A=(60, 106), T=(68, 110))
    base.update(overrides)
    return base


def lying(**overrides):
    """Lying on a flat bench, face up, knees bent."""
    base = dict(head=(24, 58), S=(36, 64), E=(38, 46), W=(40, 30),
                H=(72, 66), K=(88, 50), A=(96, 68), T=(104, 70))
    base.update(overrides)
    return base


def seated(**overrides):
    """Seated upright, knees forward."""
    base = dict(head=(50, 22), S=(50, 38), E=(64, 56), W=(74, 66),
                H=(44, 80), K=(74, 80), A=(80, 106), T=(88, 110))
    base.update(overrides)
    return base


def hinged(**overrides):
    """Standing hip hinge, torso forward."""
    base = dict(head=(78, 32), S=(68, 46), E=(64, 68), W=(60, 92),
                H=(44, 70), K=(54, 88), A=(54, 108), T=(62, 110))
    base.update(overrides)
    return base


def pushup_body(**overrides):
    """Straight plank body, hands under shoulders."""
    base = dict(head=(20, 50), S=(32, 60), E=(32, 90), W=(30, 108),
                H=(70, 74), K=(94, 92), A=(108, 104), T=(112, 106))
    base.update(overrides)
    return base


def standing_front_lateral():
    """Front view for lateral raises: arms out to the sides."""
    body = (
        f'<circle cx="60" cy="20" r="8" fill="{BODY}"/>'
        + line([(60, 34), (60, 66)], BODY, 13)
        + line([(56, 66), (54, 108)], BODY, 8) + line([(64, 66), (66, 108)], BODY, 8)
        + line([(60, 38), (40, 40), (24, 40)], HL, 7)
        + line([(60, 38), (80, 40), (96, 40)], HL, 7)
        + dumbbell(20, 40) + dumbbell(100, 40)
    )
    return (f'<svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" '
            f'width="100%" height="100%">{ground()}{body}</svg>')


EXERCISES = {}

# ---- Chest ----
EXERCISES["ex_bench"] = figure(lying(), ["torso"], [bench(22, 104, 74), bar(16, 108, 22)])
EXERCISES["ex_paused_bench"] = figure(lying(E=(40, 56), W=(44, 46)), ["torso"],
                                      [bench(22, 104, 74), bar(16, 108, 44)])
EXERCISES["ex_incline"] = figure(
    dict(head=(42, 46), S=(54, 56), E=(66, 40), W=(70, 24), H=(78, 84), K=(96, 88), A=(104, 108), T=(112, 110)),
    ["torso"], [incline(40, 96, 86, 66), bar(44, 98, 20)])
EXERCISES["ex_db_bench"] = figure(lying(E=(38, 48), W=(40, 34)), ["torso"],
                                  [bench(22, 104, 74), dumbbell(40, 30)])
EXERCISES["ex_db_incline"] = figure(
    dict(head=(42, 46), S=(54, 56), E=(64, 42), W=(68, 28), H=(78, 84), K=(96, 88), A=(104, 108), T=(112, 110)),
    ["torso"], [incline(40, 96, 86, 66), dumbbell(68, 24)])
EXERCISES["ex_chest_press_machine"] = figure(
    seated(head=(44, 22), S=(48, 40), E=(66, 44), W=(86, 44), H=(42, 82), K=(74, 80), A=(78, 106), T=(86, 110)),
    ["torso"], [seat(30, 58, 84, back=[(34, 84), (30, 22)]), line([(86, 36), (86, 52)], EQ, 3), line([(30, 16), (30, 100)], EQ, 2)])
EXERCISES["ex_pec_fly"] = figure(lying(E=(46, 46), W=(46, 28)), ["torso"],
                                 [bench(22, 104, 74), dumbbell(46, 24)])
EXERCISES["ex_cable_crossover"] = figure(
    standing(head=(56, 22), S=(56, 38), E=(72, 56), W=(62, 72), H=(58, 68), K=(54, 88), A=(56, 108), T=(64, 110)),
    ["torso"], [cable([(14, 6), (62, 72)]), cable([(106, 6), (62, 72)])])
EXERCISES["ex_pushup"] = figure(pushup_body(), ["torso"], [])
EXERCISES["ex_static_hold"] = figure(dict(pushup_body(), badge="timer"), ["torso"], [])

# ---- Shoulders ----
EXERCISES["ex_ohp"] = figure(standing(head=(58, 30), S=(58, 46), E=(68, 34), W=(74, 18),
                                       H=(58, 72), K=(60, 90), A=(58, 108), T=(66, 110)),
                             ["arm"], [bar(40, 96, 12)])
EXERCISES["ex_db_shoulder_press"] = figure(
    seated(head=(50, 22), S=(50, 38), E=(64, 30), W=(68, 14), H=(46, 80), K=(74, 80), A=(80, 106), T=(88, 110)),
    ["arm"], [seat(34, 66, 80, back=[(38, 22), (38, 80)]), dumbbell(68, 12)])
EXERCISES["ex_arnold_press"] = figure(standing(E=(70, 44), W=(70, 30)), ["arm"], [dumbbell(70, 26)])
EXERCISES["ex_lateral_raise"] = standing_front_lateral()
EXERCISES["ex_front_raise"] = figure(standing(E=(80, 38), W=(98, 40)), ["arm"], [dumbbell(100, 40)])
EXERCISES["ex_rear_delt_fly"] = figure(hinged(head=(84, 46), S=(70, 54), E=(72, 60), W=(90, 62),
                                              H=(44, 72), K=(50, 90), A=(48, 108), T=(56, 110)),
                                       ["arm"], [dumbbell(92, 62)])
EXERCISES["ex_face_pull"] = figure(standing(E=(54, 40), W=(42, 34)), ["arm"],
                                   [cable([(6, 34), (42, 34)])])
EXERCISES["ex_upright_row"] = figure(standing(E=(74, 40), W=(64, 52)), ["arm"], [bar(46, 90, 52)])
EXERCISES["ex_barbell_shrug"] = figure(standing(head=(60, 14), S=(60, 30), E=(62, 52), W=(62, 70),
                                                H=(60, 66)), ["torso"], [bar(42, 84, 72)])
EXERCISES["ex_db_shrug"] = figure(standing(head=(60, 14), S=(60, 30), E=(62, 52), W=(62, 70),
                                           H=(60, 66)), ["torso"], [dumbbell(62, 74)])

# ---- Biceps ----
curl = standing(E=(58, 54), W=(66, 40))
EXERCISES["ex_bicep_curl"] = figure(curl, ["arm"], [bar(50, 82, 40)])
EXERCISES["ex_db_curl"] = figure(curl, ["arm"], [dumbbell(66, 40)])
EXERCISES["ex_hammer_curl"] = figure(curl, ["arm"], [dumbbell(66, 40)])
EXERCISES["ex_cable_curl"] = figure(curl, ["arm"], [cable([(96, 108), (66, 40)])])
EXERCISES["ex_preacher_curl"] = figure(
    seated(head=(46, 20), S=(48, 36), E=(62, 60), W=(72, 46), H=(40, 80), K=(72, 80), A=(80, 106), T=(88, 110)),
    ["arm"], [line([(56, 72), (72, 56)], EQ, 6), seat(28, 50, 82)])
EXERCISES["ex_incline_curl"] = figure(
    dict(head=(72, 40), S=(60, 54), E=(60, 76), W=(58, 96), H=(36, 84), K=(60, 100), A=(64, 110), T=(72, 112)),
    ["arm"], [incline(30, 92, 70, 62), dumbbell(58, 100)])

# ---- Triceps ----
EXERCISES["ex_close_grip"] = figure(lying(E=(42, 48), W=(44, 30)), ["arm"],
                                    [bench(22, 104, 74), bar(30, 62, 26)])
EXERCISES["ex_rope_push"] = figure(standing(E=(58, 52), W=(72, 66)), ["arm"],
                                   [cable([(100, 6), (74, 68)]), line([(74, 68), (80, 74)], EQ, 2)])
EXERCISES["ex_single_arm"] = figure(standing(head=(58, 20), E=(70, 24), W=(86, 30)), ["arm"], [dumbbell(90, 30)])
EXERCISES["ex_overhead_tricep_ext"] = figure(standing(E=(66, 12), W=(52, 24)), ["arm"], [dumbbell(50, 22)])
EXERCISES["ex_skull_crusher"] = figure(lying(E=(40, 46), W=(34, 30)), ["arm"],
                                       [bench(22, 104, 74), bar(20, 50, 26)])
EXERCISES["ex_seated_dips"] = figure(seated(E=(56, 50), W=(64, 70)), ["arm"],
                                     [seat(40, 70, 82), line([(92, 10), (92, 100)], EQ, 3), line([(104, 10), (104, 100)], EQ, 3)])
EXERCISES["ex_dips"] = figure(
    dict(head=(60, 26), S=(60, 42), E=(46, 36), W=(34, 44), H=(60, 70), K=(72, 88), A=(60, 104), T=(68, 108)),
    ["arm"], [line([(30, 30), (30, 110)], EQ, 4), line([(92, 30), (92, 110)], EQ, 4)])

# ---- Forearms ----
EXERCISES["ex_wrist_curl"] = figure(
    seated(head=(48, 22), S=(48, 38), E=(60, 56), W=(84, 58), H=(42, 80), K=(90, 76), A=(96, 106), T=(104, 110)),
    ["arm"], [dumbbell(88, 58), seat(30, 58, 84)])
EXERCISES["ex_reverse_curl"] = figure(curl, ["arm"], [bar(50, 82, 40)])

# ---- Back ----
EXERCISES["ex_deadlift"] = figure(hinged(head=(74, 28), S=(66, 42), E=(64, 68), W=(60, 98),
                                         H=(46, 68), K=(56, 88), A=(56, 108), T=(64, 110)),
                                  ["torso", "leg"], [bar(14, 106, 104)])
EXERCISES["ex_romanian_deadlift"] = figure(hinged(head=(70, 26), S=(62, 40), E=(64, 62), W=(62, 84),
                                                  H=(52, 66), K=(60, 88), A=(56, 108), T=(64, 110)),
                                           ["leg"], [bar(30, 100, 86)])
EXERCISES["ex_barbell_row"] = figure(hinged(head=(76, 30), S=(64, 44), E=(64, 62), W=(62, 80),
                                            H=(42, 66), K=(50, 88), A=(46, 108), T=(54, 110)),
                                     ["torso"], [bar(36, 92, 84)])
EXERCISES["ex_db_row"] = figure(hinged(head=(76, 30), S=(64, 44), E=(64, 62), W=(62, 80),
                                       H=(42, 66), K=(50, 88), A=(46, 108), T=(54, 110)),
                                ["torso"], [dumbbell(62, 84)])
EXERCISES["ex_tbar_row"] = figure(hinged(head=(70, 40), S=(60, 52), E=(58, 70), W=(56, 88),
                                         H=(42, 72), K=(52, 92), A=(50, 108), T=(58, 110)),
                                  ["torso"], [bar(38, 84, 94)])
EXERCISES["ex_seated_row"] = figure(seated(head=(50, 22), S=(48, 40), E=(60, 56), W=(70, 66),
                                           H=(46, 82), K=(74, 82), A=(78, 106), T=(86, 110)),
                                    ["torso"], [seat(30, 58, 88), cable([(106, 66), (72, 66)]), line([(106, 66), (106, 12)], EQ, 3)])
EXERCISES["ex_lat_pulldown"] = figure(seated(head=(56, 42), S=(54, 58), E=(70, 36), W=(74, 16),
                                             H=(46, 84), K=(74, 84), A=(78, 106), T=(86, 110)),
                                      ["torso"], [bar(60, 110, 10), line([(104, 10), (104, 100)], EQ, 3), seat(34, 62, 90)])
EXERCISES["ex_pullup"] = figure(
    dict(head=(60, 38), S=(60, 46), E=(70, 28), W=(60, 10), H=(60, 70), K=(62, 90), A=(60, 108), T=(68, 110)),
    ["torso"], [bar(20, 100, 10)])
EXERCISES["ex_chinup"] = figure(
    dict(head=(60, 38), S=(60, 46), E=(52, 28), W=(60, 10), H=(60, 70), K=(62, 90), A=(60, 108), T=(68, 110)),
    ["torso"], [bar(20, 100, 10)])
EXERCISES["ex_back_extension"] = figure(
    dict(head=(104, 40), S=(92, 50), E=(104, 60), W=(114, 64), H=(60, 66), K=(30, 72), A=(14, 80), T=(10, 82)),
    ["torso"], [line([(50, 68), (76, 74)], EQ, 8)])
EXERCISES["ex_good_morning"] = figure(hinged(head=(86, 36), S=(72, 50), E=(66, 70), W=(62, 88),
                                             H=(44, 70), K=(50, 90), A=(48, 108), T=(56, 110)),
                                      ["leg"], [bar(50, 82, 48)])

# ---- Legs ----
EXERCISES["ex_squat"] = figure(
    dict(head=(64, 22), S=(60, 38), E=(66, 48), W=(58, 36), H=(44, 70), K=(64, 84), A=(56, 108), T=(72, 110)),
    ["leg"], [bar(36, 86, 36)])
EXERCISES["ex_front_squat"] = figure(
    dict(head=(64, 20), S=(58, 36), E=(70, 42), W=(68, 34), H=(50, 70), K=(66, 84), A=(60, 108), T=(72, 110)),
    ["leg"], [bar(54, 92, 34)])
EXERCISES["ex_hack_squat"] = figure(
    dict(head=(54, 24), S=(54, 42), E=(64, 58), W=(70, 66), H=(54, 72), K=(78, 80), A=(90, 104), T=(100, 106)),
    ["leg"], [line([(34, 40), (56, 66)], EQ, 6), line([(60, 106), (112, 106)], EQ, 5)])
EXERCISES["ex_leg_press"] = figure(
    dict(head=(30, 46), S=(36, 60), E=(48, 72), W=(54, 80), H=(56, 84), K=(84, 62), A=(102, 74), T=(110, 68)),
    ["leg"], [line([(22, 100), (40, 52)], EQ, 6), line([(94, 96), (116, 56)], EQ, 5)])
EXERCISES["ex_leg_extension"] = figure(
    dict(head=(42, 30), S=(46, 48), E=(56, 60), W=(62, 66), H=(54, 74), K=(90, 74), A=(104, 62), T=(112, 58)),
    ["leg"], [seat(40, 66, 80, back=[(36, 36), (38, 80)]), line([(96, 58), (110, 58)], EQ, 6)])
EXERCISES["ex_leg_curl"] = figure(
    dict(head=(26, 64), S=(38, 68), E=(48, 84), W=(54, 94), H=(72, 68), K=(92, 68), A=(102, 50), T=(108, 46)),
    ["leg"], [bench(20, 100, 80), line([(96, 42), (110, 42)], EQ, 6)])
EXERCISES["ex_lunge"] = figure(
    dict(head=(58, 20), S=(58, 36), E=(60, 52), W=(70, 64), H=(54, 64), K=(72, 88), A=(66, 108), T=(76, 110)),
    ["leg"], [dumbbell(72, 66)])
EXERCISES["ex_hip_thrust"] = figure(
    dict(head=(14, 66), S=(26, 74), E=(36, 84), W=(44, 92), H=(58, 44), K=(78, 60), A=(74, 102), T=(86, 110)),
    ["torso"], [bench(6, 46, 80, leg_x=(12, 40)), bar(50, 70, 40)])
EXERCISES["ex_cable_kickback"] = figure(
    dict(head=(54, 22), S=(54, 38), E=(74, 48), W=(86, 50), H=(56, 66), K=(56, 88), A=(56, 108), T=(64, 110),
         extra_legs=[[(56, 66), (34, 70), (16, 72)]], extra_hl=True),
    ["leg"], [cable([(4, 110), (14, 74)]), line([(74, 52), (86, 52)], EQ, 2)])
EXERCISES["ex_standing_calf"] = figure(
    standing(head=(60, 20), S=(60, 36), E=(60, 54), W=(62, 68), H=(60, 66), K=(62, 86), A=(64, 100), T=(72, 108)),
    ["leg"], [line([(44, 70), (48, 110)], EQ, 4), line([(70, 68), (74, 110)], EQ, 4)])
EXERCISES["ex_seated_calf"] = figure(
    seated(head=(42, 22), S=(44, 40), E=(54, 58), W=(60, 68), H=(44, 74), K=(74, 70), A=(84, 98), T=(90, 108)),
    ["leg"], [seat(30, 58, 82), line([(66, 66), (84, 66)], EQ, 6)])

# ---- Core ----
EXERCISES["ex_plank"] = figure(
    dict(head=(20, 50), S=(32, 60), E=(34, 104), W=(54, 104), H=(68, 68), K=(92, 80), A=(108, 96), T=(112, 100)),
    ["torso"], [])
EXERCISES["ex_hanging_leg_raise"] = figure(
    dict(head=(60, 36), S=(60, 46), E=(60, 26), W=(60, 10), H=(60, 70), K=(84, 66), A=(102, 62), T=(108, 66)),
    ["leg"], [bar(30, 90, 10)])
EXERCISES["ex_cable_crunch"] = figure(
    dict(head=(80, 56), S=(68, 68), E=(78, 78), W=(76, 88), H=(36, 84), K=(56, 106), A=(28, 108), T=(18, 110)),
    ["torso"], [cable([(104, 4), (92, 30), (80, 52)])])
EXERCISES["ex_ab_wheel"] = figure(
    dict(head=(44, 44), S=(58, 60), E=(76, 82), W=(94, 100), H=(72, 84), K=(66, 104), A=(56, 110), T=(48, 110)),
    ["torso"], [f'<circle cx="98" cy="106" r="7" fill="none" stroke="{EQ}" stroke-width="3"/>'])
EXERCISES["ex_russian_twist"] = figure(
    dict(head=(44, 30), S=(50, 50), E=(72, 54), W=(84, 46), H=(64, 84), K=(94, 82), A=(108, 98), T=(112, 100)),
    ["torso"], [f'<circle cx="92" cy="40" r="7" fill="{EQ}"/>'])


def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    out = root / "src" / "data" / "exerciseArt.ts"
    lines = [
        "// Generated by scripts/generate-exercise-art.py. Do not edit by hand.",
        "export const EXERCISE_ART: Record<string, string> = {",
    ]
    for exercise_id, svg in EXERCISES.items():
        lines.append(f"  {exercise_id}: {json.dumps(svg)},")
    lines.append("};")
    out.write_text("\n".join(lines) + "\n")
    print(f"wrote {len(EXERCISES)} entries to {out}")


if __name__ == "__main__":
    main()
