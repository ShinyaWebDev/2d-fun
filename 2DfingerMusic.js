/* 2DfingerMusic.js — wrapped for p5 instance mode */
window.sketch = function (p) {
  /* ───── globals ───── */
  let video,
    handPose,
    hands = [];
  let vidRatio = 4 / 3;
  let painting;
  let pxIndex, pyIndex, pxMiddle, pyMiddle, pxRing, pyRing, pxPinky, pyPinky;
  const pianoSounds = {};
  const lastPlayed = {};

  /* ───── preload ───── */
  p.preload = () => {
    handPose = ml5.handPose({ flipped: false });
    ["c6", "d6", "e6", "f6", "g6", "a6", "b6", "c7"].forEach(
      (n) => (pianoSounds[n] = p.loadSound(`sound/${n}.mp3`))
    );
  };

  /* ───── setup ───── */
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    painting = p.createGraphics(p.windowWidth, p.windowHeight);
    painting.clear();

    video = p.createCapture(p.VIDEO, { flipped: true }, () => {
      if (video.height > 0) vidRatio = video.width / video.height;
    });
    video.hide();

    handPose.detectStart(video, (r) => (hands = r));
    p.noSmooth();
    document.body.style.overflow = "hidden";
  };

  /* ───── draw ───── */
  p.draw = () => {
    p.background(0);

    // fit webcam in canvas
    const canvasRatio = p.width / p.height;
    const drawH = canvasRatio > vidRatio ? p.height : p.width / vidRatio;
    const drawW = canvasRatio > vidRatio ? p.height * vidRatio : p.width;
    const xOff = (p.width - drawW) / 2;
    const yOff = (p.height - drawH) / 2;
    p.image(video, p.width - xOff - drawW, yOff, drawW, drawH);

    // hand tracking
    if (hands.length) {
      for (const hand of hands) {
        if (hand.confidence < 0.1) continue;

        const {
          index_finger_tip: i,
          thumb_tip: t,
          middle_finger_tip: m,
          ring_finger_tip: r,
          pinky_finger_tip: pk,
          handedness: hLabel,
        } = hand;

        const cx = (x) =>
          p.width - p.map(x, 0, video.width, xOff, xOff + drawW);
        const cy = (y) => p.map(y, 0, video.height, yOff, yOff + drawH);

        [
          [i, [255, 255, 0]],
          [m, [255, 0, 255]],
          [r, [0, 255, 255]],
          [pk, [0, 255, 0]],
          [t, [255, 100, 100]],
        ].forEach(([pt, col]) => {
          p.fill(col);
          p.noStroke();
          p.circle(cx(pt.x), cy(pt.y), 20);
        });

        const pinch = (a, b) => p.dist(a.x, a.y, b.x, b.y) < 20;
        if (hLabel === "Right") {
          if (pinch(i, t)) play("c6");
          if (pinch(m, t)) play("d6");
          if (pinch(r, t)) play("e6");
          if (pinch(pk, t)) play("f6");
        } else {
          if (pinch(i, t)) play("g6");
          if (pinch(m, t)) play("a6");
          if (pinch(r, t)) play("b6");
          if (pinch(pk, t)) play("c7");
        }
      }
    }

    p.image(painting, 0, 0);
  };

  /* ───── helpers ───── */
  function play(note) {
    const now = p.millis();
    if (!lastPlayed[note] || now - lastPlayed[note] > 300) {
      pianoSounds[note].play();
      lastPlayed[note] = now;
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    const g = p.createGraphics(p.windowWidth, p.windowHeight);
    g.image(painting, 0, 0, p.windowWidth, p.windowHeight);
    painting = g;
  };
};
