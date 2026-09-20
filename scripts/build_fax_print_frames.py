from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "public" / "evidence"

PRINT_1 = Image.open(EVIDENCE / "fax-machine-print-01-v1.webp").convert("RGB")
PRINT_2 = Image.open(EVIDENCE / "fax-machine-print-02-v1.webp").convert("RGB")
REPORT = Image.open(EVIDENCE / "fax-machine-report-v1.webp").convert("RGB")
EARLY = Image.open(EVIDENCE / "fax-machine-print-early-source-v2.webp").convert("RGB")
MIDDLE = Image.open(EVIDENCE / "fax-machine-print-middle-source-v2.webp").convert("RGB")
CONFIRM = Image.open(EVIDENCE / "fax-machine-print-confirm-v1.webp").convert("RGB").resize(
    PRINT_1.size, Image.Resampling.LANCZOS
)

# Every non-paper control must return to the released pose while the rollers run.
RELEASED_CONTROLS = (
    (700, 490, 855, 595),   # down
    (825, 510, 970, 620),   # enter
    (930, 590, 1260, 805),  # red/green start-stop pair
)
LCD = (685, 365, 1070, 540)


def feathered_patch(target: Image.Image, source: Image.Image, box: tuple[int, int, int, int], blur: int = 4) -> None:
    width, height = box[2] - box[0], box[3] - box[1]
    mask = Image.new("L", (width, height), 0)
    mask.paste(255, (6, 6, width - 6, height - 6))
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    target.paste(source.crop(box), box[:2], mask)


def make_frame(a: Image.Image, b: Image.Image, amount: float, screen: Image.Image) -> Image.Image:
    frame = Image.blend(a, b, amount)
    for box in RELEASED_CONTROLS:
        feathered_patch(frame, CONFIRM, box)
    feathered_patch(frame, screen, LCD, 3)
    return frame


# Six held frames create the stepped motion of an old thermal-transfer fax:
# rollers engage, the feeder advances, the leading edge appears, and the report
# exits in three visible increments before the machine reports completion.
frames = (
    make_frame(PRINT_1, PRINT_1, 0, PRINT_1),
    EARLY,
    make_frame(PRINT_2, PRINT_2, 0, PRINT_2),
    MIDDLE,
    make_frame(REPORT, REPORT, 0, PRINT_2),
    make_frame(REPORT, REPORT, 0, REPORT),
)

for index, frame in enumerate(frames, start=1):
    frame.save(EVIDENCE / f"fax-machine-print-frame-{index:02d}-v2.webp", "WEBP", quality=82, method=6)

print(f"generated {len(frames)} released-control print frames")
