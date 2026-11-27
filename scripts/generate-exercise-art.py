#!/usr/bin/env python3
"""Generates src/data/exerciseArt.ts: anatomically accurate, equipment-rich SVG pictograms.

Every exercise is drawn on a 120x120 canvas with:
- Back limbs (#8B949E) for two-limb depth
- Foreground body (#E6EDF3)
- Highlighted target muscle segments (#FF2D55)
- Filled equipment (#262E3B fill + #7D8590 stroke): benches, racks, plates, dumbbells, cables, machines
- Subtle motion indicator arrows (#00E5FF) where helpful

Run: python3 scripts/generate-exercise-art.py
"""
import json
import math
import pathlib

BODY = "#E6EDF3"
BACK_BODY = "#8B949E"
HL = "#FF2D55"
EQ = "#7D8590"
EQ_FILL = "#252D3A"
GROUND = "#30363D"
MOTION = "#00E5FF"
BG_BADGE = "#131822"

GROUND_Y = 110


def _pts(points):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def line(points, color, width, extra=""):
    return (
        f'<polyline points="{_pts(points)}" fill="none" stroke="{color}" '
        f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'
    )


def rect(x, y, w, h, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2):
    return (
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
        f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
    )


def circle(cx, cy, r, fill=EQ_FILL, stroke=EQ, sw=2):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def plate(cx, cy, r=11):
    """Side-view barbell weight plate disc with inner hub."""
    return (
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{EQ_FILL}" stroke="{EQ}" stroke-width="2.4"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{max(3, r * 0.38):.1f}" fill="{EQ}" />'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="1.8" fill="{BG_BADGE}" />'
    )


def front_bar(x1, x2, y, plate_r=7):
    """Front-view horizontal barbell shaft with plates on both ends."""
    out = [line([(x1 - 4, y), (x2 + 4, y)], EQ, 3)]
    for x in (x1, x2):
        out.append(rect(x - 2.5, y - plate_r, 5, plate_r * 2, fill=EQ, stroke=EQ, sw=0, rx=1.5))
        out.append(rect(x + (4 if x == x2 else -7), y - plate_r * 0.72, 3, plate_r * 1.44, fill=EQ_FILL, stroke=EQ, sw=1.2, rx=1))
    return "".join(out)


def ez_bar(x1, x2, y):
    """Front-view cambered EZ-curl bar."""
    mx = (x1 + x2) / 2
    pts = [(x1 - 4, y), (x1 + 5, y), (mx - 5, y + 4), (mx, y), (mx + 5, y + 4), (x2 - 5, y), (x2 + 4, y)]
    out = [line(pts, EQ, 2.8)]
    for x in (x1, x2):
        out.append(rect(x - 2, y - 6, 4, 12, fill=EQ, stroke=EQ, sw=0, rx=1.2))
    return "".join(out)


def dumbbell(cx, cy, vertical=False, scale=1.0):
    """Compact dumbbell (horizontal or vertical grip)."""
    if vertical:
        return (
            rect(cx - 2 * scale, cy - 6 * scale, 4 * scale, 12 * scale, fill=EQ, stroke=EQ, sw=0, rx=1)
            + rect(cx - 5 * scale, cy - 8 * scale, 10 * scale, 3 * scale, fill=EQ_FILL, stroke=EQ, sw=1.4, rx=1)
            + rect(cx - 5 * scale, cy + 5 * scale, 10 * scale, 3 * scale, fill=EQ_FILL, stroke=EQ, sw=1.4, rx=1)
        )
    return (
        rect(cx - 6 * scale, cy - 2 * scale, 12 * scale, 4 * scale, fill=EQ, stroke=EQ, sw=0, rx=1)
        + rect(cx - 8 * scale, cy - 5 * scale, 3 * scale, 10 * scale, fill=EQ_FILL, stroke=EQ, sw=1.4, rx=1)
        + rect(cx + 5 * scale, cy - 5 * scale, 3 * scale, 10 * scale, fill=EQ_FILL, stroke=EQ, sw=1.4, rx=1)
    )


def kettlebell(cx, cy):
    return (
        f'<path d="M {cx-4:.1f} {cy-4:.1f} A 4 4 0 1 1 {cx+4:.1f} {cy-4:.1f}" fill="none" stroke="{EQ}" stroke-width="2.4"/>'
        + circle(cx, cy + 3, 5.5, fill=EQ_FILL, stroke=EQ, sw=2)
    )


def flat_bench(x1, x2, y):
    return (
        line([(x1 + 8, y), (x1 + 8, GROUND_Y)], EQ, 3)
        + line([(x2 - 8, y), (x2 - 8, GROUND_Y)], EQ, 3)
        + rect(x1, y - 3, x2 - x1, 6, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2.5)
    )


def angled_bench(x1, y1, x2, y2, seat_x1=None, seat_x2=None, seat_y=None):
    out = [
        line([(x1, y1), (x2, y2)], EQ, 6.5),
        line([((x1 + x2) / 2, (y1 + y2) / 2), ((x1 + x2) / 2, GROUND_Y)], EQ, 3),
    ]
    if seat_x1 is not None and seat_x2 is not None and seat_y is not None:
        out.append(line([(seat_x1, seat_y), (seat_x2, seat_y)], EQ, 6))
        out.append(line([((seat_x1 + seat_x2) / 2, seat_y), ((seat_x1 + seat_x2) / 2, GROUND_Y)], EQ, 3))
    return "".join(out)


def chair_seat(x1, x2, y, back_top=None):
    mx = (x1 + x2) / 2
    out = [
        line([(mx, y), (mx, GROUND_Y)], EQ, 3),
        line([(x1, y), (x2, y)], EQ, 6),
    ]
    if back_top:
        bx1, by1 = back_top
        bx2 = x1 + 3
        out.append(line([(bx2, y), (bx1, by1)], EQ, 5.5))
    return "".join(out)


def cable_tower(x, pulley_y, target, top_y=10, rope=False):
    px, py = x, pulley_y
    tx, ty = target
    out = [
        line([(x, top_y), (x, GROUND_Y)], EQ, 3.5),
        line([(x - 6, GROUND_Y), (x + 8, GROUND_Y)], EQ, 3),
        circle(px, py, 3, fill=EQ_FILL, stroke=EQ, sw=1.8),
        f'<polyline points="{_pts([(px, py), (tx, ty)])}" fill="none" stroke="{EQ}" stroke-width="1.6" stroke-dasharray="3 2.5"/>',
    ]
    if rope:
        out.append(line([(tx - 4, ty + 4), (tx, ty), (tx + 4, ty + 4)], EQ, 2.5))
    else:
        out.append(circle(tx, ty, 2.2, fill=EQ, stroke=EQ, sw=1))
    return "".join(out)


def rack_upright(x, hook_y=None):
    out = [line([(x, 12), (x, GROUND_Y)], EQ, 3), line([(x - 5, GROUND_Y), (x + 5, GROUND_Y)], EQ, 2.5)]
    if hook_y is not None:
        out.append(line([(x - 3, hook_y), (x + 3, hook_y)], EQ, 2.5))
    return "".join(out)


def arrow(x1, y1, x2, y2, color=MOTION):
    """Crisp directional motion cue arrow."""
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy)
    if length < 1:
        return ""
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    head = 4.2
    ax1, ay1 = x2 - ux * head + px * 2.6, y2 - uy * head + py * 2.6
    ax2, ay2 = x2 - ux * head - px * 2.6, y2 - uy * head - py * 2.6
    return (
        f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{color}" stroke-width="1.8" stroke-linecap="round"/>'
        f'<polyline points="{ax1:.1f},{ay1:.1f} {x2:.1f},{y2:.1f} {ax2:.1f},{ay2:.1f}" '
        f'fill="none" stroke="{color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    )


def timer_badge():
    return (
        f'<circle cx="104" cy="16" r="8.5" fill="{BG_BADGE}" stroke="{MOTION}" stroke-width="1.8"/>'
        f'<polyline points="104,11.5 104,16 107.5,18" fill="none" stroke="{MOTION}" stroke-width="1.8" stroke-linecap="round"/>'
    )


def pause_badge(x=98, y=22):
    return (
        f'<rect x="{x - 9}" y="{y - 8}" width="18" height="16" rx="4" fill="{BG_BADGE}" stroke="{MOTION}" stroke-width="1.6"/>'
        f'<line x1="{x - 3}" y1="{y - 3.5}" x2="{x - 3}" y2="{y + 3.5}" stroke="{MOTION}" stroke-width="2.2" stroke-linecap="round"/>'
        f'<line x1="{x + 3}" y1="{y - 3.5}" x2="{x + 3}" y2="{y + 3.5}" stroke="{MOTION}" stroke-width="2.2" stroke-linecap="round"/>'
    )


def ground():
    return line([(6, GROUND_Y), (114, GROUND_Y)], GROUND, 2)


def figure(p, hl=(), back_eq=(), front_eq=(), cues=(), extra_hl=()):
    """Side/angled figure renderer with back limbs, torso, head, highlighted muscles, equipment, and motion cues."""
    parts = [ground(), *back_eq]
    S, E, W, H, K, A, T = p["S"], p["E"], p["W"], p["H"], p["K"], p["A"], p["T"]

    # Far/back leg & arm for depth
    if p.get("back_leg"):
        parts.append(line(p["back_leg"], BACK_BODY, 7))
    if p.get("back_arm"):
        parts.append(line(p["back_arm"], BACK_BODY, 6))

    segments = {
        "torso": [S, H],
        "upper_arm": [S, E],
        "forearm": [E, W],
        "arm": [S, E, W],
        "thigh": [H, K],
        "calf": [K, A, T],
        "leg": [H, K, A, T],
        "shoulder": [S, (S[0] + (E[0] - S[0]) * 0.45, S[1] + (E[1] - S[1]) * 0.45)],
        "upper_back": [S, ((S[0] + H[0]) / 2, (S[1] + H[1]) / 2)],
        "lower_back": [((S[0] + H[0]) / 2, (S[1] + H[1]) / 2), H],
    }
    widths = {
        "torso": 12.5,
        "upper_arm": 7,
        "forearm": 6.5,
        "arm": 6.8,
        "thigh": 8.5,
        "calf": 7,
        "leg": 8,
        "shoulder": 8.5,
        "upper_back": 12.5,
        "lower_back": 12.5,
    }

    # Base body segments
    parts.append(line(segments["leg"], BODY, 8))
    parts.append(line(segments["torso"], BODY, 12.5))
    parts.append(line(segments["arm"], BODY, 6.8))

    hx, hy = p["head"]
    parts.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="7.5" fill="{BODY}"/>')

    # Muscle highlights
    for name in hl:
        parts.append(line(segments[name], HL, widths[name]))
    for seg_pts, seg_w in extra_hl:
        parts.append(line(seg_pts, HL, seg_w))

    # Optional back_leg highlight (e.g., glute/ham)
    if p.get("back_leg_hl") and p.get("back_leg"):
        parts.append(line(p["back_leg"], HL, 7))

    parts.extend(front_eq)
    parts.extend(cues)

    if p.get("badge") == "timer":
        parts.append(timer_badge())
    elif p.get("badge") == "pause":
        parts.append(pause_badge())

    return (
        f'<svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" '
        f'width="100%" height="100%">{"".join(parts)}</svg>'
    )


def front_figure(
    head=(60, 20),
    torso=((60, 34), (60, 66)),
    left_arm=((53, 36), (48, 54), (46, 68)),
    right_arm=((67, 36), (72, 54), (74, 68)),
    left_leg=((55, 66), (52, 88), (50, 108)),
    right_leg=((65, 66), (68, 88), (70, 108)),
    hl_segs=(),
    back_eq=(),
    front_eq=(),
    cues=(),
    badge=None,
):
    """Symmetric front-view figure for lateral raises, wide-stance deadlifts, curls, pulldowns, flys."""
    parts = [ground(), *back_eq]
    parts.append(line(left_leg, BODY, 7.5))
    parts.append(line(right_leg, BODY, 7.5))
    parts.append(line(list(torso), BODY, 14))
    parts.append(line(list(left_arm), BODY, 6.5))
    parts.append(line(list(right_arm), BODY, 6.5))
    parts.append(f'<circle cx="{head[0]:.1f}" cy="{head[1]:.1f}" r="7.5" fill="{BODY}"/>')

    for seg_pts, w in hl_segs:
        parts.append(line(seg_pts, HL, w))

    parts.extend(front_eq)
    parts.extend(cues)
    if badge == "timer":
        parts.append(timer_badge())
    return (
        f'<svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" '
        f'width="100%" height="100%">{"".join(parts)}</svg>'
    )


def standing(**overrides):
    base = dict(head=(58, 20), S=(58, 36), E=(58, 54), W=(58, 68), H=(58, 66), K=(60, 88), A=(58, 106), T=(66, 110))
    base.update(overrides)
    return base


def lying(**overrides):
    base = dict(
        head=(22, 56),
        S=(36, 63),
        E=(38, 45),
        W=(40, 26),
        H=(72, 65),
        K=(88, 54),
        A=(95, 106),
        T=(103, 109),
        back_leg=[(72, 65), (92, 56), (99, 106), (107, 109)],
    )
    base.update(overrides)
    return base


def seated(**overrides):
    base = dict(
        head=(46, 22),
        S=(48, 38),
        E=(58, 54),
        W=(68, 62),
        H=(44, 78),
        K=(74, 78),
        A=(78, 106),
        T=(86, 109),
    )
    base.update(overrides)
    return base


def hinged(**overrides):
    base = dict(
        head=(78, 32),
        S=(68, 44),
        E=(65, 68),
        W=(62, 92),
        H=(42, 68),
        K=(52, 88),
        A=(52, 107),
        T=(60, 110),
        back_leg=[(42, 68), (57, 88), (58, 107), (65, 110)],
    )
    base.update(overrides)
    return base


EXERCISES = {}

# ==============================================================================
# CHEST
# ==============================================================================
EXERCISES["ex_bench"] = figure(
    lying(),
    hl=[],
    extra_hl=[([(34, 62), (48, 63)], 13)],
    back_eq=[flat_bench(20, 90, 74), rack_upright(32, 30)],
    front_eq=[plate(40, 24, 11)],
    cues=[arrow(56, 36, 56, 20)],
)

EXERCISES["ex_paused_bench"] = figure(
    lying(E=(36, 68), W=(44, 52), badge="pause"),
    hl=[],
    extra_hl=[([(34, 62), (48, 63)], 13)],
    back_eq=[flat_bench(20, 90, 74), rack_upright(32, 30)],
    front_eq=[plate(44, 50, 11)],
)

EXERCISES["ex_incline"] = figure(
    dict(
        head=(38, 36),
        S=(48, 48),
        E=(56, 34),
        W=(60, 20),
        H=(72, 80),
        K=(92, 82),
        A=(98, 106),
        T=(106, 109),
        back_leg=[(72, 80), (96, 83), (102, 106), (109, 109)],
    ),
    hl=[],
    extra_hl=[([(46, 46), (56, 59)], 13)],
    back_eq=[angled_bench(38, 48, 72, 84, 72, 90, 86), rack_upright(42, 26)],
    front_eq=[plate(60, 20, 11)],
    cues=[arrow(76, 36, 76, 18)],
)

EXERCISES["ex_decline_bench"] = figure(
    dict(
        head=(24, 78),
        S=(40, 70),
        E=(44, 50),
        W=(46, 32),
        H=(74, 54),
        K=(92, 46),
        A=(96, 72),
        T=(92, 78),
    ),
    hl=[],
    extra_hl=[([(38, 70), (54, 63)], 13)],
    back_eq=[
        line([(24, 78), (78, 56)], EQ, 6),
        line([(78, 56), (98, 50)], EQ, 5),
        line([(46, 70), (46, GROUND_Y)], EQ, 3),
        line([(88, 52), (88, GROUND_Y)], EQ, 3),
        circle(95, 68, 3.5, fill=EQ_FILL, stroke=EQ, sw=1.8),
    ],
    front_eq=[plate(46, 30, 10.5)],
    cues=[arrow(62, 42, 62, 26)],
)

EXERCISES["ex_db_bench"] = figure(
    lying(E=(38, 48), W=(40, 32)),
    hl=[],
    extra_hl=[([(34, 62), (48, 63)], 13)],
    back_eq=[flat_bench(20, 90, 74)],
    front_eq=[dumbbell(40, 28)],
    cues=[arrow(56, 38, 56, 22)],
)

EXERCISES["ex_db_incline"] = figure(
    dict(
        head=(38, 36),
        S=(48, 48),
        E=(56, 36),
        W=(60, 22),
        H=(72, 80),
        K=(92, 82),
        A=(98, 106),
        T=(106, 109),
    ),
    hl=[],
    extra_hl=[([(46, 46), (56, 59)], 13)],
    back_eq=[angled_bench(38, 48, 72, 84, 72, 90, 86)],
    front_eq=[dumbbell(60, 20)],
    cues=[arrow(76, 36, 76, 20)],
)

EXERCISES["ex_chest_press_machine"] = figure(
    seated(E=(66, 44), W=(86, 42)),
    hl=[],
    extra_hl=[([(46, 38), (52, 48)], 12)],
    back_eq=[
        chair_seat(30, 62, 80, back_top=(38, 22)),
        line([(24, 16), (24, GROUND_Y)], EQ, 4),
        rect(16, 44, 14, 24, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=1.5),
        line([(86, 34), (86, 50)], EQ, 3.5),
        line([(24, 24), (86, 36)], EQ, 2.5),
    ],
    cues=[arrow(72, 30, 90, 30)],
)

EXERCISES["ex_pec_fly"] = front_figure(
    head=(60, 24),
    torso=((60, 38), (60, 68)),
    left_arm=((52, 42), (34, 48), (22, 38)),
    right_arm=((68, 42), (86, 48), (98, 38)),
    left_leg=((55, 68), (48, 86), (48, 108)),
    right_leg=((65, 68), (72, 86), (72, 108)),
    hl_segs=[([(52, 42), (68, 42)], 11)],
    back_eq=[rect(53, 30, 14, 42, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=3)],
    front_eq=[dumbbell(20, 36, vertical=True), dumbbell(100, 36, vertical=True)],
    cues=[arrow(24, 24, 46, 22), arrow(96, 24, 74, 22)],
)

EXERCISES["ex_pec_deck"] = front_figure(
    head=(60, 22),
    torso=((60, 36), (60, 74)),
    left_arm=((52, 38), (34, 46), (40, 30)),
    right_arm=((68, 38), (86, 46), (80, 30)),
    left_leg=((55, 74), (48, 88), (48, 108)),
    right_leg=((65, 74), (72, 88), (72, 108)),
    hl_segs=[([(52, 40), (68, 40)], 11)],
    back_eq=[
        rect(52, 28, 16, 44, fill=EQ_FILL, stroke=EQ, sw=1.6, rx=2),
        line([(60, 12), (38, 22), (38, 50)], EQ, 3),
        line([(60, 12), (82, 22), (82, 50)], EQ, 3),
    ],
    cues=[arrow(34, 18, 52, 18), arrow(86, 18, 68, 18)],
)

EXERCISES["ex_cable_crossover"] = front_figure(
    head=(60, 22),
    torso=((60, 36), (60, 70)),
    left_arm=((52, 38), (38, 52), (48, 64)),
    right_arm=((68, 38), (82, 52), (72, 64)),
    left_leg=((55, 70), (50, 90), (48, 108)),
    right_leg=((65, 70), (70, 90), (72, 108)),
    hl_segs=[([(52, 40), (68, 40)], 11)],
    back_eq=[
        cable_tower(14, 16, (48, 64)),
        cable_tower(106, 16, (72, 64)),
    ],
    cues=[arrow(32, 68, 52, 68), arrow(88, 68, 68, 68)],
)

EXERCISES["ex_smith_bench"] = figure(
    lying(),
    hl=[],
    extra_hl=[([(34, 62), (48, 63)], 13)],
    back_eq=[
        flat_bench(20, 90, 74),
        line([(40, 10), (40, GROUND_Y)], EQ, 3),
        line([(36, 10), (44, 10)], EQ, 3),
    ],
    front_eq=[plate(40, 24, 11)],
    cues=[arrow(56, 36, 56, 18)],
)

EXERCISES["ex_pushup"] = figure(
    dict(
        head=(22, 62),
        S=(34, 72),
        E=(34, 90),
        W=(34, 107),
        H=(72, 86),
        K=(92, 96),
        A=(108, 104),
        T=(108, 109),
        back_leg=[(72, 86), (95, 97), (110, 104), (110, 109)],
        back_arm=[(34, 72), (39, 90), (39, 107)],
    ),
    hl=[],
    extra_hl=[([(34, 72), (52, 79)], 12.5)],
    cues=[arrow(50, 62, 50, 48)],
)

EXERCISES["ex_static_hold"] = figure(
    lying(badge="timer"),
    hl=[],
    extra_hl=[([(34, 62), (48, 63)], 13)],
    back_eq=[flat_bench(20, 90, 74), rack_upright(32, 30)],
    front_eq=[plate(40, 24, 11)],
)

# ==============================================================================
# SHOULDERS
# ==============================================================================
EXERCISES["ex_ohp"] = front_figure(
    head=(60, 28),
    torso=((60, 40), (60, 72)),
    left_arm=((52, 42), (42, 28), (44, 14)),
    right_arm=((68, 42), (78, 28), (76, 14)),
    left_leg=((55, 72), (54, 90), (52, 108)),
    right_leg=((65, 72), (66, 90), (68, 108)),
    hl_segs=[([(52, 42), (46, 35)], 8.5), ([(68, 42), (74, 35)], 8.5)],
    front_eq=[front_bar(24, 96, 14, plate_r=6.5)],
    cues=[arrow(102, 32, 102, 14)],
)

EXERCISES["ex_db_shoulder_press"] = figure(
    seated(head=(48, 26), S=(48, 42), E=(56, 28), W=(58, 14)),
    hl=["shoulder"],
    back_eq=[chair_seat(32, 64, 80, back_top=(40, 22))],
    front_eq=[dumbbell(58, 12)],
    cues=[arrow(74, 28, 74, 12)],
)

EXERCISES["ex_machine_shoulder_press"] = figure(
    seated(head=(48, 26), S=(48, 42), E=(58, 30), W=(62, 16)),
    hl=["shoulder"],
    back_eq=[
        chair_seat(32, 64, 80, back_top=(38, 22)),
        line([(24, 14), (24, GROUND_Y)], EQ, 3.5),
        line([(24, 18), (62, 16)], EQ, 3),
        rect(16, 46, 14, 22, fill=EQ_FILL, stroke=EQ, sw=1.6, rx=1.5),
    ],
    cues=[arrow(74, 28, 74, 12)],
)

EXERCISES["ex_arnold_press"] = front_figure(
    head=(60, 24),
    torso=((60, 38), (60, 74)),
    left_arm=((52, 40), (46, 48), (50, 34)),
    right_arm=((68, 40), (80, 28), (78, 14)),
    left_leg=((55, 74), (50, 90), (50, 108)),
    right_leg=((65, 74), (70, 90), (70, 108)),
    hl_segs=[([(52, 40), (48, 44)], 8.5), ([(68, 40), (74, 34)], 8.5)],
    front_eq=[dumbbell(50, 32, scale=0.85), dumbbell(78, 12, scale=0.85)],
    cues=[arrow(88, 30, 88, 14)],
)

EXERCISES["ex_lateral_raise"] = front_figure(
    head=(60, 20),
    torso=((60, 34), (60, 70)),
    left_arm=((53, 38), (36, 40), (22, 40)),
    right_arm=((67, 38), (84, 40), (98, 40)),
    left_leg=((56, 70), (54, 90), (52, 108)),
    right_leg=((64, 70), (66, 90), (68, 108)),
    hl_segs=[([(53, 38), (38, 39)], 8.5), ([(67, 38), (82, 39)], 8.5)],
    front_eq=[dumbbell(18, 40, scale=0.9), dumbbell(102, 40, scale=0.9)],
    cues=[arrow(20, 56, 20, 48), arrow(100, 56, 100, 48)],
)

EXERCISES["ex_cable_lateral_raise"] = front_figure(
    head=(66, 20),
    torso=((66, 34), (66, 70)),
    left_arm=((59, 38), (54, 54), (54, 66)),
    right_arm=((73, 38), (88, 38), (102, 38)),
    left_leg=((62, 70), (60, 90), (58, 108)),
    right_leg=((70, 70), (72, 90), (74, 108)),
    hl_segs=[([(73, 38), (88, 38)], 8.5)],
    back_eq=[cable_tower(16, 104, (102, 38))],
    cues=[arrow(102, 54, 102, 44)],
)

EXERCISES["ex_front_raise"] = figure(
    standing(E=(78, 38), W=(96, 38), back_arm=[(58, 36), (56, 56), (56, 70)]),
    hl=["shoulder"],
    front_eq=[dumbbell(98, 38)],
    cues=[arrow(96, 58, 96, 44)],
)

EXERCISES["ex_rear_delt_fly"] = figure(
    hinged(
        head=(82, 42),
        S=(68, 48),
        E=(52, 42),
        W=(38, 46),
        H=(44, 68),
        K=(52, 88),
        A=(50, 107),
        T=(58, 110),
        back_arm=[(68, 48), (64, 68), (62, 82)],
    ),
    hl=["shoulder"],
    front_eq=[dumbbell(36, 46)],
    cues=[arrow(38, 66, 36, 52)],
)

EXERCISES["ex_reverse_pec_deck"] = figure(
    seated(
        head=(54, 22),
        S=(54, 38),
        E=(36, 38),
        W=(24, 38),
        H=(54, 78),
        K=(78, 78),
        A=(82, 106),
        T=(90, 109),
        back_arm=[(54, 38), (44, 42), (32, 42)],
    ),
    hl=["shoulder"],
    back_eq=[
        chair_seat(42, 70, 80, back_top=(70, 32)),
        line([(86, 14), (86, GROUND_Y)], EQ, 3.5),
    ],
    cues=[arrow(40, 26, 24, 26)],
)

EXERCISES["ex_face_pull"] = figure(
    standing(
        head=(66, 20),
        S=(66, 36),
        E=(50, 28),
        W=(46, 22),
        H=(66, 66),
        K=(68, 88),
        A=(64, 106),
        T=(72, 109),
        back_leg=[(66, 66), (76, 88), (74, 106), (82, 109)],
    ),
    hl=["shoulder"],
    back_eq=[cable_tower(14, 24, (46, 22), rope=True)],
    cues=[arrow(34, 14, 52, 14)],
)

EXERCISES["ex_upright_row"] = front_figure(
    head=(60, 20),
    torso=((60, 34), (60, 70)),
    left_arm=((52, 36), (38, 34), (50, 46)),
    right_arm=((68, 36), (82, 34), (70, 46)),
    left_leg=((56, 70), (54, 90), (52, 108)),
    right_leg=((64, 70), (66, 90), (68, 108)),
    hl_segs=[([(52, 36), (44, 35)], 8), ([(68, 36), (76, 35)], 8)],
    front_eq=[front_bar(36, 84, 46, plate_r=5.5)],
    cues=[arrow(96, 52, 96, 34)],
)

# ==============================================================================
# TRAPS
# ==============================================================================
EXERCISES["ex_barbell_shrug"] = front_figure(
    head=(60, 20),
    torso=((60, 32), (60, 68)),
    left_arm=((51, 32), (48, 52), (48, 72)),
    right_arm=((69, 32), (72, 52), (72, 72)),
    left_leg=((56, 68), (54, 90), (52, 108)),
    right_leg=((64, 68), (66, 90), (68, 108)),
    hl_segs=[([(51, 32), (60, 29), (69, 32)], 10)],
    front_eq=[front_bar(32, 88, 72, plate_r=7)],
    cues=[arrow(40, 28, 40, 18), arrow(80, 28, 80, 18)],
)

EXERCISES["ex_db_shrug"] = front_figure(
    head=(60, 20),
    torso=((60, 32), (60, 68)),
    left_arm=((51, 32), (46, 52), (44, 72)),
    right_arm=((69, 32), (74, 52), (76, 72)),
    left_leg=((56, 68), (54, 90), (52, 108)),
    right_leg=((64, 68), (66, 90), (68, 108)),
    hl_segs=[([(51, 32), (60, 29), (69, 32)], 10)],
    front_eq=[dumbbell(42, 74, scale=0.9), dumbbell(78, 74, scale=0.9)],
    cues=[arrow(40, 28, 40, 18), arrow(80, 28, 80, 18)],
)

EXERCISES["ex_rack_pull"] = figure(
    hinged(head=(72, 26), S=(64, 40), E=(66, 58), W=(66, 76), H=(46, 66), K=(56, 88), A=(54, 107), T=(62, 110)),
    hl=["upper_back", "lower_back"],
    back_eq=[line([(66, 76), (66, GROUND_Y)], EQ, 6)],
    front_eq=[plate(66, 76, 12)],
    cues=[arrow(84, 72, 84, 52)],
)

# ==============================================================================
# BICEPS
# ==============================================================================
EXERCISES["ex_bicep_curl"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 56), W=(72, 42), H=(54, 66)),
    hl=["upper_arm"],
    front_eq=[plate(74, 42, 8.5)],
    cues=[arrow(86, 58, 84, 38)],
)

EXERCISES["ex_ez_bar_curl"] = front_figure(
    head=(60, 20),
    torso=((60, 36), (60, 70)),
    left_arm=((51, 38), (47, 56), (48, 42)),
    right_arm=((69, 38), (73, 56), (72, 42)),
    left_leg=((56, 70), (54, 90), (52, 108)),
    right_leg=((64, 70), (66, 90), (68, 108)),
    hl_segs=[([(51, 38), (47, 56)], 7.5), ([(69, 38), (73, 56)], 7.5)],
    front_eq=[ez_bar(36, 84, 42)],
    cues=[arrow(24, 56, 24, 38), arrow(96, 56, 96, 38)],
)

EXERCISES["ex_db_curl"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 56), W=(72, 42), H=(54, 66), back_arm=[(54, 36), (50, 56), (50, 70)]),
    hl=["upper_arm"],
    front_eq=[dumbbell(74, 42)],
    cues=[arrow(86, 58, 84, 38)],
)

EXERCISES["ex_hammer_curl"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 56), W=(74, 44), H=(54, 66)),
    hl=["upper_arm", "forearm"],
    front_eq=[dumbbell(76, 44, vertical=True)],
    cues=[arrow(88, 60, 86, 40)],
)

EXERCISES["ex_cable_curl"] = figure(
    standing(head=(50, 20), S=(50, 36), E=(52, 56), W=(68, 42), H=(50, 66)),
    hl=["upper_arm"],
    back_eq=[cable_tower(102, 104, (68, 42))],
    cues=[arrow(78, 58, 76, 38)],
)

EXERCISES["ex_bayesian_curl"] = figure(
    standing(
        head=(70, 20),
        S=(68, 36),
        E=(52, 52),
        W=(64, 44),
        H=(68, 66),
        K=(72, 88),
        A=(68, 106),
        T=(76, 109),
    ),
    hl=["upper_arm"],
    back_eq=[cable_tower(18, 96, (64, 44))],
    cues=[arrow(76, 58, 74, 38)],
)

EXERCISES["ex_preacher_curl"] = figure(
    seated(head=(40, 20), S=(42, 36), E=(60, 58), W=(74, 42), H=(36, 78), K=(66, 78), A=(70, 106), T=(78, 109)),
    hl=["upper_arm"],
    back_eq=[
        chair_seat(24, 48, 82),
        line([(56, 64), (72, 48)], EQ, 6.5),
        line([(64, 56), (64, GROUND_Y)], EQ, 3),
    ],
    front_eq=[dumbbell(76, 40)],
    cues=[arrow(86, 54, 84, 36)],
)

EXERCISES["ex_incline_curl"] = figure(
    dict(head=(72, 38), S=(60, 50), E=(58, 72), W=(66, 86), H=(36, 80), K=(62, 92), A=(66, 107), T=(74, 110)),
    hl=["upper_arm"],
    back_eq=[angled_bench(30, 84, 70, 48)],
    front_eq=[dumbbell(68, 88)],
    cues=[arrow(80, 96, 80, 76)],
)

EXERCISES["ex_concentration_curl"] = figure(
    seated(head=(58, 30), S=(58, 44), E=(68, 68), W=(70, 50), H=(40, 78), K=(68, 74), A=(70, 106), T=(78, 109),
           back_arm=[(58, 44), (48, 62), (46, 74)]),
    hl=["upper_arm"],
    back_eq=[chair_seat(26, 52, 82)],
    front_eq=[dumbbell(72, 48)],
    cues=[arrow(84, 62, 84, 44)],
)

EXERCISES["ex_spider_curl"] = figure(
    dict(head=(78, 34), S=(68, 46), E=(70, 68), W=(78, 54), H=(40, 72), K=(34, 90), A=(26, 107), T=(34, 110)),
    hl=["upper_arm"],
    back_eq=[angled_bench(34, 78, 72, 48)],
    front_eq=[dumbbell(80, 52)],
    cues=[arrow(92, 66, 92, 46)],
)

# ==============================================================================
# TRICEPS
# ==============================================================================
EXERCISES["ex_close_grip"] = figure(
    lying(E=(36, 52), W=(46, 28)),
    hl=["arm"],
    back_eq=[flat_bench(20, 90, 74), rack_upright(32, 30)],
    front_eq=[plate(46, 26, 10.5)],
    cues=[arrow(62, 40, 62, 22)],
)

EXERCISES["ex_jm_press"] = figure(
    lying(E=(46, 54), W=(36, 38)),
    hl=["arm"],
    back_eq=[flat_bench(20, 90, 74), rack_upright(32, 30)],
    front_eq=[plate(36, 36, 10)],
    cues=[arrow(52, 26, 46, 44)],
)

EXERCISES["ex_rope_push"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 52), W=(72, 66), H=(54, 66)),
    hl=["upper_arm"],
    back_eq=[cable_tower(98, 12, (74, 66), rope=True)],
    cues=[arrow(76, 52, 76, 72)],
)

EXERCISES["ex_single_arm"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 52), W=(72, 66), H=(54, 66)),
    hl=["upper_arm"],
    back_eq=[cable_tower(98, 12, (74, 66), rope=False)],
    cues=[arrow(76, 52, 76, 72)],
)

EXERCISES["ex_overhead_tricep_ext"] = figure(
    standing(
        head=(60, 22),
        S=(56, 36),
        E=(52, 16),
        W=(40, 26),
        H=(58, 66),
    ),
    hl=["upper_arm"],
    front_eq=[dumbbell(36, 28, vertical=True)],
    cues=[arrow(34, 18, 48, 10)],
)

EXERCISES["ex_skull_crusher"] = figure(
    lying(E=(36, 40), W=(24, 46)),
    hl=["upper_arm"],
    back_eq=[flat_bench(20, 90, 74)],
    front_eq=[plate(22, 44, 8)],
    cues=[arrow(24, 30, 38, 22)],
)

EXERCISES["ex_tricep_kickback"] = figure(
    hinged(
        head=(80, 36),
        S=(68, 46),
        E=(54, 54),
        W=(34, 52),
        H=(44, 68),
        K=(54, 88),
        A=(54, 107),
        T=(62, 110),
        back_arm=[(68, 46), (68, 66), (72, 74)],
    ),
    hl=["upper_arm"],
    front_eq=[dumbbell(32, 52)],
    cues=[arrow(34, 66, 26, 56)],
)

EXERCISES["ex_seated_dips"] = figure(
    seated(E=(46, 56), W=(56, 70)),
    hl=["arm"],
    back_eq=[
        chair_seat(30, 62, 80, back_top=(38, 22)),
        line([(48, 70), (62, 70)], EQ, 4),
        line([(55, 70), (55, 80)], EQ, 3),
    ],
    cues=[arrow(72, 56, 72, 74)],
)

EXERCISES["ex_dips"] = figure(
    dict(
        head=(58, 22),
        S=(58, 38),
        E=(48, 52),
        W=(58, 56),
        H=(58, 68),
        K=(68, 84),
        A=(56, 98),
        T=(64, 102),
    ),
    hl=["arm"],
    back_eq=[
        line([(42, 56), (42, GROUND_Y)], EQ, 3.5),
        line([(76, 56), (76, GROUND_Y)], EQ, 3.5),
        line([(36, 56), (82, 56)], EQ, 5),
    ],
    cues=[arrow(86, 48, 86, 30)],
)

# ==============================================================================
# FOREARMS
# ==============================================================================
EXERCISES["ex_wrist_curl"] = figure(
    seated(head=(44, 22), S=(46, 38), E=(60, 62), W=(80, 62), H=(42, 78), K=(72, 76), A=(76, 106), T=(84, 109)),
    hl=["forearm"],
    back_eq=[chair_seat(26, 56, 82)],
    front_eq=[dumbbell(84, 60)],
    cues=[arrow(84, 74, 84, 64)],
)

EXERCISES["ex_reverse_wrist_curl"] = figure(
    seated(head=(44, 22), S=(46, 38), E=(60, 62), W=(80, 60), H=(42, 78), K=(72, 76), A=(76, 106), T=(84, 109)),
    hl=["forearm"],
    back_eq=[chair_seat(26, 56, 82)],
    front_eq=[dumbbell(84, 58)],
    cues=[arrow(84, 46, 84, 54)],
)

EXERCISES["ex_reverse_curl"] = figure(
    standing(head=(54, 20), S=(54, 36), E=(56, 56), W=(74, 46), H=(54, 66)),
    hl=["forearm"],
    front_eq=[plate(76, 46, 8)],
    cues=[arrow(88, 62, 86, 42)],
)

EXERCISES["ex_farmers_walk"] = front_figure(
    head=(60, 18),
    torso=((60, 32), (60, 68)),
    left_arm=((51, 34), (44, 52), (42, 72)),
    right_arm=((69, 34), (76, 52), (78, 72)),
    left_leg=((56, 68), (50, 88), (46, 108)),
    right_leg=((64, 68), (70, 88), (74, 108)),
    hl_segs=[([(44, 52), (42, 72)], 7), ([(76, 52), (78, 72)], 7), ([(51, 32), (69, 32)], 8)],
    front_eq=[dumbbell(40, 74, vertical=True), dumbbell(80, 74, vertical=True)],
    cues=[arrow(20, 92, 34, 92)],
)

EXERCISES["ex_dead_hang"] = front_figure(
    head=(60, 36),
    torso=((60, 48), (60, 78)),
    left_arm=((52, 48), (46, 30), (46, 12)),
    right_arm=((68, 48), (74, 30), (74, 12)),
    left_leg=((56, 78), (55, 94), (55, 108)),
    right_leg=((64, 78), (65, 94), (65, 108)),
    hl_segs=[([(46, 30), (46, 12)], 7), ([(74, 30), (74, 12)], 7)],
    back_eq=[
        line([(24, 12), (24, GROUND_Y)], EQ, 3),
        line([(96, 12), (96, GROUND_Y)], EQ, 3),
        line([(20, 12), (100, 12)], EQ, 4),
    ],
    badge="timer",
)

# ==============================================================================
# LATS / BACK
# ==============================================================================
EXERCISES["ex_deadlift"] = figure(
    hinged(head=(76, 36), S=(68, 48), E=(66, 72), W=(64, 95), H=(44, 64), K=(58, 86), A=(56, 107), T=(64, 110)),
    hl=["lower_back", "thigh"],
    front_eq=[plate(64, 96, 14)],
    cues=[arrow(84, 88, 84, 64)],
)

EXERCISES["ex_sumo_deadlift"] = front_figure(
    head=(60, 26),
    torso=((60, 40), (60, 68)),
    left_arm=((52, 42), (53, 68), (54, 94)),
    right_arm=((68, 42), (67, 68), (66, 94)),
    left_leg=((54, 68), (36, 84), (30, 108)),
    right_leg=((66, 68), (84, 84), (90, 108)),
    hl_segs=[([(54, 68), (36, 84)], 8.5), ([(66, 68), (84, 84)], 8.5), ([(60, 40), (60, 68)], 12)],
    front_eq=[front_bar(16, 104, 94, plate_r=14)],
    cues=[arrow(60, 82, 60, 64)],
)

EXERCISES["ex_romanian_deadlift"] = figure(
    hinged(head=(76, 32), S=(66, 44), E=(65, 62), W=(64, 80), H=(44, 62), K=(54, 86), A=(54, 107), T=(62, 110)),
    hl=["thigh", "lower_back"],
    front_eq=[plate(64, 80, 12)],
    cues=[arrow(82, 78, 82, 56)],
)

EXERCISES["ex_stiff_leg_deadlift"] = figure(
    hinged(head=(80, 40), S=(68, 48), E=(68, 68), W=(68, 88), H=(46, 56), K=(52, 82), A=(54, 107), T=(62, 110)),
    hl=["thigh", "lower_back"],
    front_eq=[plate(68, 88, 12)],
    cues=[arrow(86, 82, 86, 60)],
)

EXERCISES["ex_barbell_row"] = figure(
    hinged(head=(78, 34), S=(66, 44), E=(56, 52), W=(64, 70), H=(40, 62), K=(52, 86), A=(50, 107), T=(58, 110)),
    hl=["torso"],
    front_eq=[plate(64, 70, 11)],
    cues=[arrow(80, 74, 80, 56)],
)

EXERCISES["ex_pendlay_row"] = figure(
    hinged(head=(80, 50), S=(68, 52), E=(58, 64), W=(66, 94), H=(40, 54), K=(48, 82), A=(48, 107), T=(56, 110)),
    hl=["torso"],
    front_eq=[plate(66, 96, 14)],
    cues=[arrow(84, 90, 84, 66)],
)

EXERCISES["ex_seal_row"] = figure(
    dict(
        head=(24, 44),
        S=(38, 48),
        E=(38, 66),
        W=(40, 84),
        H=(74, 50),
        K=(92, 54),
        A=(106, 58),
        T=(108, 62),
    ),
    hl=["torso"],
    back_eq=[
        line([(28, 52), (96, 52)], EQ, 6),
        line([(34, 52), (34, GROUND_Y)], EQ, 3),
        line([(88, 52), (88, GROUND_Y)], EQ, 3),
    ],
    front_eq=[plate(40, 86, 11)],
    cues=[arrow(56, 86, 56, 66)],
)

EXERCISES["ex_db_row"] = figure(
    hinged(
        head=(80, 38),
        S=(68, 46),
        E=(56, 42),
        W=(62, 62),
        H=(42, 62),
        K=(48, 82),
        A=(34, 82),
        T=(30, 82),
        back_leg=[(42, 62), (32, 86), (26, 107), (34, 110)],
        back_arm=[(68, 46), (72, 60), (74, 72)],
    ),
    hl=["torso"],
    back_eq=[flat_bench(38, 86, 76)],
    front_eq=[dumbbell(62, 64)],
    cues=[arrow(62, 80, 62, 68)],
)

EXERCISES["ex_tbar_row"] = figure(
    hinged(head=(74, 34), S=(64, 44), E=(56, 54), W=(66, 68), H=(42, 64), K=(54, 86), A=(52, 107), T=(60, 110)),
    hl=["torso"],
    back_eq=[line([(20, GROUND_Y), (72, 64)], EQ, 3.5)],
    front_eq=[plate(68, 66, 10)],
    cues=[arrow(82, 70, 82, 52)],
)

EXERCISES["ex_chest_supported_row"] = figure(
    dict(
        head=(66, 22),
        S=(60, 38),
        E=(46, 48),
        W=(64, 52),
        H=(48, 76),
        K=(68, 90),
        A=(66, 107),
        T=(74, 110),
    ),
    hl=["torso"],
    back_eq=[
        angled_bench(50, 74, 68, 36, 36, 56, 78),
        line([(86, 18), (86, GROUND_Y)], EQ, 3.5),
        line([(86, 40), (66, 52)], EQ, 2.5),
    ],
    cues=[arrow(76, 40, 56, 40)],
)

EXERCISES["ex_seated_row"] = figure(
    seated(head=(42, 22), S=(42, 38), E=(34, 54), W=(52, 60), H=(44, 78), K=(74, 78), A=(82, 102), T=(86, 98)),
    hl=["torso"],
    back_eq=[
        chair_seat(28, 58, 82),
        cable_tower(104, 60, (54, 60)),
        line([(86, 86), (92, 108)], EQ, 4),
    ],
    cues=[arrow(66, 46, 46, 46)],
)

EXERCISES["ex_lat_pulldown"] = figure(
    seated(head=(48, 26), S=(48, 42), E=(60, 26), W=(64, 14), H=(46, 78), K=(74, 78), A=(78, 106), T=(86, 109)),
    hl=["torso"],
    back_eq=[
        chair_seat(32, 62, 82),
        line([(66, 68), (80, 68)], EQ, 5),
        cable_tower(92, 10, (64, 14)),
    ],
    front_eq=[line([(52, 14), (76, 14)], EQ, 3.5)],
    cues=[arrow(46, 12, 46, 30)],
)

EXERCISES["ex_straight_arm_pulldown"] = figure(
    hinged(head=(60, 26), S=(54, 40), E=(70, 54), W=(76, 70), H=(46, 68), K=(54, 88), A=(52, 107), T=(60, 110)),
    hl=["torso"],
    back_eq=[cable_tower(102, 14, (76, 70))],
    front_eq=[line([(72, 70), (80, 70)], EQ, 3)],
    cues=[arrow(84, 52, 78, 72)],
)

EXERCISES["ex_pullup"] = front_figure(
    head=(60, 32),
    torso=((60, 44), (60, 74)),
    left_arm=((52, 44), (40, 28), (44, 12)),
    right_arm=((68, 44), (80, 28), (76, 12)),
    left_leg=((56, 74), (55, 92), (55, 106)),
    right_leg=((64, 74), (65, 92), (65, 106)),
    hl_segs=[([(54, 46), (60, 66)], 10), ([(66, 46), (60, 66)], 10)],
    back_eq=[
        line([(24, 12), (24, GROUND_Y)], EQ, 3),
        line([(96, 12), (96, GROUND_Y)], EQ, 3),
        line([(20, 12), (100, 12)], EQ, 4),
    ],
    cues=[arrow(90, 42, 90, 22)],
)

EXERCISES["ex_chinup"] = front_figure(
    head=(60, 30),
    torso=((60, 42), (60, 74)),
    left_arm=((52, 44), (48, 28), (51, 12)),
    right_arm=((68, 44), (72, 28), (69, 12)),
    left_leg=((56, 74), (55, 92), (55, 106)),
    right_leg=((64, 74), (65, 92), (65, 106)),
    hl_segs=[([(54, 44), (60, 66)], 10), ([(66, 44), (60, 66)], 10), ([(52, 44), (48, 28)], 6.5), ([(68, 44), (72, 28)], 6.5)],
    back_eq=[
        line([(24, 12), (24, GROUND_Y)], EQ, 3),
        line([(96, 12), (96, GROUND_Y)], EQ, 3),
        line([(20, 12), (100, 12)], EQ, 4),
    ],
    cues=[arrow(90, 42, 90, 22)],
)

# ==============================================================================
# LOWER BACK
# ==============================================================================
EXERCISES["ex_back_extension"] = figure(
    dict(
        head=(94, 34),
        S=(82, 44),
        E=(82, 58),
        W=(88, 48),
        H=(54, 62),
        K=(38, 78),
        A=(24, 94),
        T=(20, 98),
    ),
    hl=["lower_back"],
    back_eq=[
        line([(22, 96), (62, 64)], EQ, 4),
        line([(48, 76), (48, GROUND_Y)], EQ, 3.5),
        line([(26, 94), (26, GROUND_Y)], EQ, 3),
        rect(48, 56, 14, 8, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2),
        circle(24, 90, 4, fill=EQ_FILL, stroke=EQ, sw=1.8),
    ],
    cues=[arrow(92, 62, 96, 46)],
)

EXERCISES["ex_good_morning"] = figure(
    hinged(head=(86, 40), S=(72, 46), E=(66, 36), W=(68, 42), H=(42, 60), K=(50, 84), A=(48, 107), T=(56, 110)),
    hl=["lower_back", "thigh"],
    front_eq=[plate(68, 42, 10)],
    cues=[arrow(86, 60, 86, 42)],
)

EXERCISES["ex_superman"] = figure(
    dict(
        head=(20, 92),
        S=(34, 98),
        E=(20, 96),
        W=(10, 92),
        H=(68, 104),
        K=(88, 100),
        A=(106, 92),
        T=(110, 88),
        badge="timer",
    ),
    hl=["lower_back"],
)

EXERCISES["ex_reverse_hyper"] = figure(
    dict(
        head=(22, 42),
        S=(34, 48),
        E=(26, 62),
        W=(22, 72),
        H=(64, 48),
        K=(84, 58),
        A=(102, 72),
        T=(108, 70),
    ),
    hl=["lower_back", "thigh"],
    back_eq=[
        rect(30, 48, 36, 9, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2),
        line([(34, 57), (34, GROUND_Y)], EQ, 3.5),
        line([(60, 57), (60, GROUND_Y)], EQ, 3.5),
    ],
    cues=[arrow(102, 86, 106, 68)],
)

# ==============================================================================
# QUADS
# ==============================================================================
EXERCISES["ex_squat"] = figure(
    dict(
        head=(64, 34),
        S=(56, 48),
        E=(50, 56),
        W=(54, 46),
        H=(42, 76),
        K=(68, 76),
        A=(58, 107),
        T=(68, 110),
        back_leg=[(42, 76), (73, 77), (63, 107), (72, 110)],
    ),
    hl=["thigh"],
    back_eq=[rack_upright(32, 34)],
    front_eq=[plate(54, 44, 12)],
    cues=[arrow(84, 62, 84, 40)],
)

EXERCISES["ex_front_squat"] = figure(
    dict(
        head=(60, 30),
        S=(56, 46),
        E=(74, 44),
        W=(62, 42),
        H=(46, 76),
        K=(70, 76),
        A=(60, 107),
        T=(70, 110),
        back_leg=[(46, 76), (75, 77), (65, 107), (74, 110)],
    ),
    hl=["thigh"],
    back_eq=[rack_upright(32, 34)],
    front_eq=[plate(62, 42, 11.5)],
    cues=[arrow(86, 62, 86, 40)],
)

EXERCISES["ex_goblet_squat"] = figure(
    dict(
        head=(60, 30),
        S=(56, 46),
        E=(66, 56),
        W=(74, 48),
        H=(46, 76),
        K=(70, 76),
        A=(60, 107),
        T=(70, 110),
        back_leg=[(46, 76), (75, 77), (65, 107), (74, 110)],
    ),
    hl=["thigh"],
    front_eq=[dumbbell(76, 48, vertical=True)],
    cues=[arrow(88, 62, 88, 40)],
)

EXERCISES["ex_bulgarian_split_squat"] = figure(
    dict(
        head=(62, 24),
        S=(60, 40),
        E=(60, 56),
        W=(62, 70),
        H=(56, 68),
        K=(82, 76),
        A=(82, 107),
        T=(92, 110),
        back_leg=[(56, 68), (44, 88), (28, 76), (24, 72)],
    ),
    hl=["thigh"],
    back_eq=[flat_bench(12, 38, 78)],
    front_eq=[dumbbell(62, 72)],
    cues=[arrow(96, 68, 96, 48)],
)

EXERCISES["ex_lunge"] = figure(
    dict(
        head=(60, 26),
        S=(58, 42),
        E=(58, 58),
        W=(60, 70),
        H=(54, 70),
        K=(80, 76),
        A=(80, 107),
        T=(90, 110),
        back_leg=[(54, 70), (40, 96), (26, 106), (26, 110)],
    ),
    hl=["thigh"],
    front_eq=[dumbbell(60, 72)],
    cues=[arrow(94, 68, 94, 48)],
)

EXERCISES["ex_step_up"] = figure(
    dict(
        head=(54, 18),
        S=(54, 34),
        E=(56, 50),
        W=(58, 64),
        H=(52, 62),
        K=(76, 62),
        A=(78, 84),
        T=(86, 86),
        back_leg=[(52, 62), (48, 86), (46, 107), (54, 110)],
    ),
    hl=["thigh"],
    back_eq=[rect(68, 86, 30, 24, fill=EQ_FILL, stroke=EQ, sw=2, rx=2)],
    front_eq=[dumbbell(58, 66)],
    cues=[arrow(96, 64, 96, 44)],
)

EXERCISES["ex_sissy_squat"] = figure(
    dict(
        head=(34, 34),
        S=(44, 48),
        E=(54, 60),
        W=(64, 62),
        H=(62, 68),
        K=(86, 80),
        A=(64, 106),
        T=(72, 110),
    ),
    hl=["thigh"],
    back_eq=[line([(100, 32), (100, GROUND_Y)], EQ, 3.5)],
    cues=[arrow(48, 30, 58, 22)],
)

EXERCISES["ex_hack_squat"] = figure(
    dict(
        head=(46, 28),
        S=(50, 44),
        E=(60, 58),
        W=(64, 66),
        H=(56, 72),
        K=(80, 76),
        A=(88, 104),
        T=(98, 106),
    ),
    hl=["thigh"],
    back_eq=[
        line([(30, 20), (62, 108)], EQ, 4),
        line([(42, 42), (56, 74)], EQ, 6.5),
        line([(76, 108), (108, 94)], EQ, 5),
    ],
    cues=[arrow(36, 64, 28, 42)],
)

EXERCISES["ex_leg_press"] = figure(
    dict(
        head=(34, 44),
        S=(40, 56),
        E=(50, 68),
        W=(56, 74),
        H=(56, 78),
        K=(86, 64),
        A=(102, 74),
        T=(108, 70),
    ),
    hl=["thigh"],
    back_eq=[
        line([(26, 40), (54, 82)], EQ, 6.5),
        line([(42, 82), (42, GROUND_Y)], EQ, 3.5),
        line([(56, 86), (112, 62)], EQ, 3),
        line([(106, 86), (114, 58)], EQ, 5.5),
    ],
    cues=[arrow(82, 46, 98, 38)],
)

EXERCISES["ex_leg_extension"] = figure(
    seated(head=(40, 28), S=(44, 46), E=(54, 60), W=(60, 68), H=(50, 74), K=(82, 74), A=(100, 68), T=(108, 64)),
    hl=["thigh"],
    back_eq=[
        chair_seat(34, 66, 80, back_top=(32, 34)),
        line([(82, 74), (102, 68)], EQ, 3.5),
        circle(102, 68, 4, fill=EQ_FILL, stroke=EQ, sw=2),
    ],
    cues=[arrow(96, 86, 106, 74)],
)

# ==============================================================================
# HAMSTRINGS
# ==============================================================================
EXERCISES["ex_leg_curl"] = figure(
    dict(head=(24, 62), S=(38, 66), E=(46, 80), W=(52, 88), H=(68, 66), K=(88, 66), A=(96, 46), T=(102, 42)),
    hl=["calf"],
    extra_hl=[([(68, 66), (88, 66)], 8.5)],
    back_eq=[
        flat_bench(20, 92, 76),
        circle(98, 46, 4, fill=EQ_FILL, stroke=EQ, sw=2),
    ],
    cues=[arrow(106, 62, 104, 46)],
)

EXERCISES["ex_seated_leg_curl"] = figure(
    seated(head=(40, 28), S=(44, 46), E=(54, 60), W=(62, 66), H=(48, 74), K=(82, 74), A=(72, 104), T=(80, 108)),
    hl=["thigh"],
    back_eq=[
        chair_seat(34, 66, 80, back_top=(32, 34)),
        line([(70, 64), (86, 64)], EQ, 5),
        circle(72, 102, 4, fill=EQ_FILL, stroke=EQ, sw=2),
    ],
    cues=[arrow(92, 90, 76, 102)],
)

EXERCISES["ex_nordic_curl"] = figure(
    dict(head=(88, 48), S=(76, 56), E=(82, 72), W=(92, 78), H=(56, 78), K=(46, 106), A=(20, 107), T=(16, 110)),
    hl=["thigh"],
    back_eq=[
        circle(22, 100, 4.5, fill=EQ_FILL, stroke=EQ, sw=2),
        line([(16, 108), (52, 108)], EQ, 4),
    ],
    cues=[arrow(84, 34, 72, 26)],
)

# ==============================================================================
# GLUTES
# ==============================================================================
EXERCISES["ex_hip_thrust"] = figure(
    dict(head=(18, 64), S=(32, 70), E=(44, 78), W=(48, 86), H=(64, 54), K=(82, 74), A=(86, 107), T=(94, 110)),
    hl=[],
    extra_hl=[([(54, 58), (72, 58)], 12)],
    back_eq=[flat_bench(10, 42, 78)],
    front_eq=[plate(62, 54, 12)],
    cues=[arrow(64, 36, 64, 22)],
)

EXERCISES["ex_glute_bridge"] = figure(
    dict(head=(20, 102), S=(34, 104), E=(48, 106), W=(62, 106), H=(66, 72), K=(84, 80), A=(90, 107), T=(98, 110)),
    hl=[],
    extra_hl=[([(56, 76), (72, 74)], 11)],
    front_eq=[plate(64, 70, 10.5)],
    cues=[arrow(66, 54, 66, 40)],
)

EXERCISES["ex_cable_kickback"] = figure(
    hinged(
        head=(72, 24),
        S=(64, 38),
        E=(76, 48),
        W=(88, 50),
        H=(54, 64),
        K=(56, 86),
        A=(56, 107),
        T=(64, 110),
        back_leg=[(54, 64), (34, 72), (18, 76)],
        back_leg_hl=True,
    ),
    hl=[],
    back_eq=[cable_tower(92, 104, (18, 76))],
    cues=[arrow(24, 92, 14, 78)],
)

EXERCISES["ex_hip_abduction"] = front_figure(
    head=(60, 22),
    torso=((60, 36), (60, 72)),
    left_arm=((52, 38), (44, 54), (44, 68)),
    right_arm=((68, 38), (76, 54), (76, 68)),
    left_leg=((54, 72), (32, 78), (30, 106)),
    right_leg=((66, 72), (88, 78), (90, 106)),
    hl_segs=[([(54, 72), (32, 78)], 8.5), ([(66, 72), (88, 78)], 8.5)],
    back_eq=[rect(46, 32, 28, 42, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2)],
    cues=[arrow(42, 92, 26, 92), arrow(78, 92, 94, 92)],
)

# ==============================================================================
# CALVES
# ==============================================================================
EXERCISES["ex_standing_calf"] = figure(
    standing(head=(58, 18), S=(58, 34), E=(56, 50), W=(58, 36), H=(58, 64), K=(60, 82), A=(60, 96), T=(68, 102)),
    hl=["calf"],
    back_eq=[
        rect(54, 102, 20, 8, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=1.5),
        line([(42, 28), (42, GROUND_Y)], EQ, 3.5),
        line([(42, 30), (62, 30)], EQ, 5),
    ],
    cues=[arrow(76, 96, 76, 78)],
)

EXERCISES["ex_seated_calf"] = figure(
    seated(head=(42, 22), S=(44, 40), E=(54, 56), W=(62, 64), H=(44, 74), K=(74, 70), A=(78, 94), T=(86, 100)),
    hl=["calf"],
    back_eq=[
        chair_seat(28, 58, 78),
        rect(74, 100, 18, 10, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=1.5),
        rect(66, 62, 16, 7, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2),
    ],
    cues=[arrow(92, 82, 92, 64)],
)

EXERCISES["ex_leg_press_calf"] = figure(
    dict(head=(34, 44), S=(40, 56), E=(50, 68), W=(56, 74), H=(56, 78), K=(84, 72), A=(104, 68), T=(110, 62)),
    hl=["calf"],
    back_eq=[
        line([(26, 40), (54, 82)], EQ, 6.5),
        line([(42, 82), (42, GROUND_Y)], EQ, 3.5),
        line([(106, 76), (114, 48)], EQ, 5.5),
    ],
    cues=[arrow(96, 48, 108, 42)],
)

EXERCISES["ex_donkey_calf"] = figure(
    hinged(head=(82, 52), S=(70, 56), E=(82, 64), W=(94, 64), H=(44, 56), K=(46, 80), A=(46, 96), T=(54, 102)),
    hl=["calf"],
    back_eq=[
        rect(40, 102, 20, 8, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=1.5),
        rect(86, 64, 20, 8, fill=EQ_FILL, stroke=EQ, sw=1.8, rx=2),
        line([(96, 72), (96, GROUND_Y)], EQ, 3.5),
    ],
    cues=[arrow(64, 96, 64, 78)],
)

# ==============================================================================
# CORE
# ==============================================================================
EXERCISES["ex_plank"] = figure(
    dict(
        head=(22, 80),
        S=(34, 88),
        E=(32, 105),
        W=(48, 106),
        H=(68, 92),
        K=(88, 98),
        A=(106, 104),
        T=(106, 109),
        badge="timer",
    ),
    hl=["torso"],
)

EXERCISES["ex_side_plank"] = figure(
    dict(
        head=(28, 70),
        S=(38, 82),
        E=(34, 105),
        W=(48, 106),
        H=(72, 92),
        K=(90, 98),
        A=(106, 106),
        T=(106, 109),
        back_arm=[(38, 82), (40, 62), (40, 54)],
        badge="timer",
    ),
    hl=["torso"],
)

EXERCISES["ex_hanging_leg_raise"] = figure(
    dict(
        head=(54, 34),
        S=(54, 44),
        E=(54, 28),
        W=(54, 14),
        H=(54, 70),
        K=(78, 66),
        A=(96, 62),
        T=(102, 66),
        back_leg=[(54, 70), (78, 71), (96, 68), (102, 71)],
    ),
    hl=["torso"],
    back_eq=[
        line([(34, 14), (34, GROUND_Y)], EQ, 3),
        line([(28, 14), (70, 14)], EQ, 4),
    ],
    cues=[arrow(92, 86, 98, 74)],
)

EXERCISES["ex_cable_crunch"] = figure(
    dict(head=(72, 60), S=(64, 70), E=(74, 62), W=(76, 52), H=(48, 88), K=(46, 106), A=(26, 108), T=(20, 108)),
    hl=["torso"],
    back_eq=[cable_tower(102, 12, (76, 52), rope=True)],
    cues=[arrow(86, 64, 78, 82)],
)

EXERCISES["ex_decline_situp"] = figure(
    dict(head=(34, 52), S=(42, 64), E=(36, 48), W=(30, 50), H=(64, 82), K=(88, 70), A=(94, 92), T=(90, 98)),
    hl=["torso"],
    back_eq=[
        line([(24, 96), (92, 74)], EQ, 6),
        line([(84, 76), (84, GROUND_Y)], EQ, 3),
        circle(93, 88, 3.5, fill=EQ_FILL, stroke=EQ, sw=1.8),
    ],
    cues=[arrow(48, 44, 64, 52)],
)

EXERCISES["ex_ab_wheel"] = figure(
    dict(head=(48, 56), S=(60, 68), E=(76, 84), W=(92, 100), H=(42, 82), K=(36, 104), A=(22, 108), T=(16, 108)),
    hl=["torso"],
    front_eq=[circle(96, 102, 7.5, fill=EQ_FILL, stroke=EQ, sw=2.6)],
    cues=[arrow(86, 82, 104, 88)],
)

EXERCISES["ex_russian_twist"] = figure(
    dict(head=(42, 38), S=(50, 54), E=(68, 58), W=(80, 52), H=(62, 84), K=(86, 76), A=(100, 92), T=(106, 90)),
    hl=["torso"],
    front_eq=[circle(86, 48, 7, fill=EQ_FILL, stroke=EQ, sw=2)],
    cues=[arrow(76, 36, 94, 36)],
)

EXERCISES["ex_cable_woodchopper"] = front_figure(
    head=(60, 22),
    torso=((60, 36), (60, 70)),
    left_arm=((52, 38), (38, 42), (30, 34)),
    right_arm=((68, 38), (52, 54), (32, 36)),
    left_leg=((55, 70), (50, 90), (48, 108)),
    right_leg=((65, 70), (70, 90), (72, 108)),
    hl_segs=[([(56, 48), (64, 64)], 11)],
    back_eq=[cable_tower(16, 20, (30, 34))],
    cues=[arrow(36, 44, 72, 68)],
)


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
