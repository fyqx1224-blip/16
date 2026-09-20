from pathlib import Path
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "public" / "evidence"
BASE = Image.open(EVIDENCE / "fax-machine-print-empty-source-v3.webp").convert("RGB")
DONE_SOURCE = Image.open(EVIDENCE / "fax-machine-report-v1.webp").convert("RGB").resize(
    BASE.size, Image.Resampling.LANCZOS
)
LCD = (685, 365, 1070, 540)

PAPER_SIZE = (900, 1000)
TOP_LEFT = (500, 690)
TOP_RIGHT = (900, 710)
BOTTOM_LEFT = (260, 941)
BOTTOM_RIGHT = (875, 941)
FRACTIONS = (0.08, 0.22, 0.38, 0.56, 0.76, 1.0)


def font(size: int):
    for path in (Path(r"C:\Windows\Fonts\consola.ttf"), Path(r"C:\Windows\Fonts\cour.ttf")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def make_report() -> Image.Image:
    rng = random.Random(3724)
    paper = Image.new("RGBA", PAPER_SIZE, (224, 221, 208, 255))
    pixels = paper.load()
    for y in range(PAPER_SIZE[1]):
        for x in range(PAPER_SIZE[0]):
            grain = rng.randint(-7, 7)
            pixels[x, y] = (224 + grain, 221 + grain, 208 + grain, 255)
    draw = ImageDraw.Draw(paper)
    ink = (50, 49, 44, 245)
    title_font = font(40)
    body_font = font(31)
    lines = (
        "MAINTENANCE REPORT",
        "===================================",
        "DEVICE       FAX-02",
        "PRINTED      2015-04-17  17:53",
        "-----------------------------------",
        "RX TOTAL     003724",
        "LAST RESET   2015-04-01",
        "CHECK        A7-3724",
        "-----------------------------------",
        "RECEIVE LOG  VERIFIED",
        "COUNTER      MATCHED",
        "===================================",
    )
    y = 38
    for index, line in enumerate(lines):
        draw.text((55, y), line, font=title_font if index == 0 else body_font, fill=ink)
        y += 72 if index == 0 else 61
    return paper


def perspective_coefficients(source, destination):
    matrix = []
    values = []
    for (sx, sy), (dx, dy) in zip(source, destination):
        matrix.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        matrix.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
        values.extend([sx, sy])
    return np.linalg.solve(np.asarray(matrix, dtype=float), np.asarray(values, dtype=float))


def project(layer: Image.Image, quad) -> Image.Image:
    width, height = layer.size
    source = ((0, 0), (width, 0), (width, height), (0, height))
    coeffs = perspective_coefficients(source, quad)
    return layer.transform(
        BASE.size,
        Image.Transform.PERSPECTIVE,
        tuple(coeffs),
        Image.Resampling.BICUBIC,
        fillcolor=(0, 0, 0, 0),
    )


def interpolate(point_a, point_b, amount):
    return (
        round(point_a[0] + (point_b[0] - point_a[0]) * amount),
        round(point_a[1] + (point_b[1] - point_a[1]) * amount),
    )


def patch_lcd(frame: Image.Image, source: Image.Image) -> None:
    width, height = LCD[2] - LCD[0], LCD[3] - LCD[1]
    mask = Image.new("L", (width, height), 0)
    mask.paste(255, (7, 7, width - 7, height - 7))
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    frame.paste(source.crop(LCD), LCD[:2], mask)


report = make_report()
for index, fraction in enumerate(FRACTIONS, start=1):
    visible_height = max(1, round(PAPER_SIZE[1] * fraction))
    visible = report.crop((0, 0, PAPER_SIZE[0], visible_height))
    lower_left = interpolate(TOP_LEFT, BOTTOM_LEFT, fraction)
    lower_right = interpolate(TOP_RIGHT, BOTTOM_RIGHT, fraction)
    quad = (TOP_LEFT, TOP_RIGHT, lower_right, lower_left)
    paper_layer = project(visible, quad)

    shadow_source = Image.new("RGBA", visible.size, (0, 0, 0, 120))
    shadow_quad = tuple((x + 8, y + 10) for x, y in quad)
    shadow = project(shadow_source, shadow_quad).filter(ImageFilter.GaussianBlur(8))

    frame = BASE.convert("RGBA")
    frame.alpha_composite(shadow)
    frame.alpha_composite(paper_layer)
    frame = frame.convert("RGB")
    if index == len(FRACTIONS):
        patch_lcd(frame, DONE_SOURCE)
    frame.save(EVIDENCE / f"fax-machine-print-frame-{index:02d}-v3.webp", "WEBP", quality=84, method=6)

report.convert("RGB").save(EVIDENCE / "fax-maintenance-report-master-v3.webp", "WEBP", quality=88, method=6)
print(f"generated {len(FRACTIONS)} progressive report frames")
