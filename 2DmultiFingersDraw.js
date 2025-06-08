/* 2DmultiFingersDraw.js — wrapped for p5 instance mode */
window.sketch = function (p) {
  /* ───── globals ───── */
  let video,
    handPose,
    hands = [];
  let vidRatio = 4 / 3;
  let painting;
  let pxIndex, pyIndex, pxMiddle, pyMiddle, pxRing, pyRing, pxPinky, pyPinky;

  const BTN_W = 100;
  const BTN_H = 40;

  /* ───── preload ───── */
  p.preload = () => {
    handPose = ml5.handPose({ flipped: false });
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
      const hand = hands[0];
      const {
        index_finger_tip: i,
        thumb_tip: t,
        middle_finger_tip: m,
        ring_finger_tip: r,
        pinky_finger_tip: pk,
      } = hand;

      const cx = (x) => p.width - p.map(x, 0, video.width, xOff, xOff + drawW);
      const cy = (y) => p.map(y, 0, video.height, yOff, yOff + drawH);

      const iX = cx(i.x),
        iY = cy(i.y);
      const mX = cx(m.x),
        mY = cy(m.y);
      const rX = cx(r.x),
        rY = cy(r.y);
      const pkX = cx(pk.x),
        pkY = cy(pk.y);

      if (p.dist(i.x, i.y, t.x, t.y) < 20) {
        if (pxIndex != null) {
          painting.stroke(255, 255, 0);
          painting.strokeWeight(8);
          painting.line(pxIndex, pyIndex, iX, iY);
        }
        pxIndex = iX;
        pyIndex = iY;
      } else {
        pxIndex = pyIndex = null;
      }

      if (p.dist(m.x, m.y, t.x, t.y) < 20) {
        if (pxMiddle != null) {
          painting.stroke(255, 0, 255);
          painting.strokeWeight(8);
          painting.line(pxMiddle, pyMiddle, mX, mY);
        }
        pxMiddle = mX;
        pyMiddle = mY;
      } else {
        pxMiddle = pyMiddle = null;
      }

      if (p.dist(r.x, r.y, t.x, t.y) < 20) {
        if (pxRing != null) {
          painting.stroke(0, 255, 255);
          painting.strokeWeight(8);
          painting.line(pxRing, pyRing, rX, rY);
        }
        pxRing = rX;
        pyRing = rY;
      } else {
        pxRing = pyRing = null;
      }

      if (p.dist(pk.x, pk.y, t.x, t.y) < 20) {
        if (pxPinky != null) {
          painting.stroke(0, 255, 0);
          painting.strokeWeight(8);
          painting.line(pxPinky, pyPinky, pkX, pkY);
        }
        pxPinky = pkX;
        pyPinky = pkY;
      } else {
        pxPinky = pyPinky = null;
      }
    }

    p.image(painting, 0, 0);
  };

  /* ───── resize ───── */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    const g = p.createGraphics(p.windowWidth, p.windowHeight);
    g.image(painting, 0, 0, p.windowWidth, p.windowHeight);
    painting = g;
  };
};
