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
    "menu": ("fax-machine-menu-pressed-v1.webp", (1090, 438, 1225, 532)),
    "down": ("fax-machine-down-pressed-v1.webp", (638, 494, 780, 590)),
    "enter": ("fax-machine-enter-pressed-v1.webp", (766, 506, 912, 610)),
    "green": ("fax-machine-print-01-v1.webp", (930, 582, 1138, 770)),
}

FRAMES = {
    **{f"{state}-menu-pressed": (state, "menu") for state in NORMAL},
    **{f"{state}-down-pressed": (state, "down") for state in ("device", "rx", "tx", "error", "print")},
    **{f"{state}-enter-pressed": (state, "enter") for state in ("rx", "count", "print")},
    "confirm-green-pressed": ("confirm", "green"),
}


def composite_key(base_name: str, pressed_name: str, box: tuple[int, int, int, int]) -> Image.Image:
    base = Image.open(EVIDENCE / base_name).convert("RGB")
    pressed = Image.open(EVIDENCE / pressed_name).convert("RGB")
    crop = pressed.crop(box)
    width, height = box[2] - box[0], box[3] - box[1]
    mask = Image.new("L", (width, height), 0)
    inner = Image.new("L", (max(1, width - 12), max(1, height - 12)), 255)
    mask.paste(inner, (6, 6))
    mask = mask.filter(ImageFilter.GaussianBlur(4))
    base.paste(crop, box[:2], mask)
    return base


for output_stem, (state, key) in FRAMES.items():
    pressed_name, box = PRESSED[key]
    result = composite_key(NORMAL[state], pressed_name, box)
    result.save(EVIDENCE / f"fax-{output_stem}-v1.webp", "WEBP", quality=76, method=6)

print(f"generated {len(FRAMES)} fixed pressed frames")
