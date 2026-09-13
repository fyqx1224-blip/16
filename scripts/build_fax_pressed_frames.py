from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "public" / "evidence"

NORMAL = {
    "standby": "fax-machine-standby-v1.webp",
    "device": "fax-machine-device-info-v1.webp",
    "rx": "fax-machine-rx-menu-v1.webp",
    "count": "fax-machine-rx-count-v1.webp",
    "tx": "fax-machine-tx-menu-v1.webp",
    "error": "fax-machine-error-menu-v1.webp",
    "print": "fax-machine-print-menu-v1.webp",
    "confirm": "fax-machine-print-confirm-v1.webp",
}

PRESSED = {
    "menu": (None, "fax-machine-menu-pressed-v1.webp", (1150, 458, 1305, 558)),
    "down": ("fax-machine-down-half-source-v2.webp", "fax-machine-down-full-source-v2.webp", (700, 490, 855, 595)),
    "enter": (None, "fax-machine-enter-pressed-v1.webp", (825, 510, 970, 620)),
    "green": (None, "fax-machine-print-01-v1.webp", (1050, 610, 1250, 790)),
}

FRAMES = {
    **{f"{state}-menu-pressed": (state, "menu") for state in NORMAL},
    **{f"{state}-down-pressed": (state, "down") for state in ("device", "rx", "tx", "error", "print")},
    **{f"{state}-enter-pressed": (state, "enter") for state in ("rx", "count", "print")},
    "confirm-green-pressed": ("confirm", "green"),
}


def composite_key(base_name: str, pressed_name: str, box: tuple[int, int, int, int], amount: float = 1) -> Image.Image:
    base = Image.open(EVIDENCE / base_name).convert("RGB")
    pressed = Image.open(EVIDENCE / pressed_name).convert("RGB")
    original = base.crop(box)
    crop = pressed.crop(box)
    if amount < 1:
        crop = Image.blend(original, crop, amount)
    width, height = box[2] - box[0], box[3] - box[1]
    mask = Image.new("L", (width, height), 0)
    inner = Image.new("L", (max(1, width - 12), max(1, height - 12)), 255)
    mask.paste(inner, (6, 6))
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    base.paste(crop, box[:2], mask)
    return base


for output_stem, (state, key) in FRAMES.items():
    half_name, full_name, box = PRESSED[key]
    half = composite_key(NORMAL[state], half_name or full_name, box, 1 if half_name else 0.45)
    full = composite_key(NORMAL[state], full_name, box)
    half.save(EVIDENCE / f"fax-{output_stem.replace('-pressed', '-half')}-v2.webp", "WEBP", quality=78, method=6)
    full.save(EVIDENCE / f"fax-{output_stem.replace('-pressed', '-full')}-v2.webp", "WEBP", quality=78, method=6)

print(f"generated {len(FRAMES) * 2} fixed press-travel frames")
