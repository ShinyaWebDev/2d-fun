let video;
let bodyPose;
let connections;
let poses = [];

let answerColor = "blue";
let countdownStartTime = null;
let countdownSeconds = 2;
let resultShownAt = null;
let resultType = null;

let confettiParticles = [];
let confettiDuration = 1000;

let vidRatio;
let pattern = ["red", "blue", "blue", "red"];
let selectedColor = null;

function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();

  // Create webcam feed and hide the default video element
  video = createCapture(VIDEO, () => {
    vidRatio = video.width / video.height;
  });
  video.size(640, 480); // fallback size
  video.hide();

  bodyPose.detectStart(video, gotPoses);

  // Prevent scrollbars
  document.body.style.overflow = "hidden";
}

function draw() {
  background(0);

  // Fit video into window while maintaining aspect ratio
  let canvasRatio = width / height;
  let drawW, drawH;

  if (canvasRatio > vidRatio) {
    drawH = height;
    drawW = height * vidRatio;
  } else {
    drawW = width;
    drawH = width / vidRatio;
  }

  let xOffset = (width - drawW) / 2;
  let yOffset = (height - drawH) / 2;

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, width - xOffset - drawW, yOffset, drawW, drawH);
  pop();

  // Draw top pattern
  //   drawTopPattern();
  drawTopPattern(xOffset, yOffset, drawW, drawH);

  if (poses.length > 0) {
    let pose = poses[0];
    if (pose.left_wrist.y < pose.nose.y && pose.left_wrist.confidence > 0.1) {
      selectedColor = "red";
    } else if (
      pose.right_wrist.y < pose.nose.y &&
      pose.right_wrist.confidence > 0.1
    ) {
      selectedColor = "blue";
    } else {
      selectedColor = null;
    }

    // Countdown logic
    if (selectedColor && countdownStartTime === null && resultType === null) {
      countdownStartTime = millis();
    }

    if (!selectedColor && countdownStartTime !== null) {
      countdownStartTime = null;
    }

    if (countdownStartTime !== null && resultType === null) {
      let timeElapsed = millis() - countdownStartTime;
      let remaining = countdownSeconds - floor(timeElapsed / 1000);

      if (remaining >= 0) {
        fill(255);
        textSize(60);
        textAlign(CENTER);
        text(remaining, width / 2, height / 2);
      }

      if (remaining <= 0) {
        resultType = selectedColor === answerColor ? "success" : "fail";
        resultShownAt = millis();
        countdownStartTime = null;
      }
    }

    // Transform positions based on video scale and offset
    drawBodyPart(pose.nose, "red", 16, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.left_eye, "orange", 10, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_eye, "orange", 10, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.left_ear, "yellow", 12, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_ear, "yellow", 12, xOffset, yOffset, drawW, drawH);

    drawBodyPart(
      pose.left_shoulder,
      "purple",
      20,
      xOffset,
      yOffset,
      drawW,
      drawH
    );
    drawBodyPart(
      pose.right_shoulder,
      "purple",
      20,
      xOffset,
      yOffset,
      drawW,
      drawH
    );
    drawBodyPart(pose.left_elbow, "blue", 16, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_elbow, "blue", 16, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.left_wrist, "red", 40, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_wrist, "blue", 40, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.left_hip, "green", 20, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_hip, "green", 20, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.left_knee, "magenta", 16, xOffset, yOffset, drawW, drawH);
    drawBodyPart(
      pose.right_knee,
      "magenta",
      16,
      xOffset,
      yOffset,
      drawW,
      drawH
    );
    drawBodyPart(pose.left_ankle, "white", 14, xOffset, yOffset, drawW, drawH);
    drawBodyPart(pose.right_ankle, "white", 14, xOffset, yOffset, drawW, drawH);
    if (selectedColor) {
      fill(selectedColor);
      noStroke();
      textAlign(CENTER);
      textSize(36);
      text(`Selected: ${selectedColor.toUpperCase()}`, width / 2, height - 40);
    }
    if (resultType === "success") {
      drawConfetti();
    } else if (resultType === "fail") {
      // Friendly fail feedback
      fill(255, 200, 200, 180);
      noStroke();
      ellipse(width / 2, height / 2, 200);
      fill(100);
      textSize(36);
      text("Oops! Try again!", width / 2, height / 2 + 12);
    }

    if (resultShownAt !== null && millis() - resultShownAt > 2000) {
      resultType = null;
      resultShownAt = null;
      selectedColor = null;
      confettiParticles = []; // ⬅ clear confetti
    }
  }
}

function drawConfetti() {
  // Generate new particles (burst from top center)
  if (confettiParticles.length < 200) {
    for (let i = 0; i < 10; i++) {
      confettiParticles.push(new ConfettiParticle(width / 2, 0));
    }
  }

  // Update and draw particles
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.update();
    p.display();

    // Remove off-screen or faded particles
    if (p.y > height || p.alpha <= 0) {
      confettiParticles.splice(i, 1);
    }
  }
}

class ConfettiParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(6, 12);
    this.vx = random(-10, 10);
    this.vy = random(2, 6);
    this.gravity = 0.1;
    this.alpha = 255;
    this.angle = random(TWO_PI);
    this.spin = random(-0.05, 0.05);
    this.color = color(random(255), random(255), random(255));
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.spin;
    this.alpha -= 2;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size, this.size / 2);
    pop();
  }
}

// Draw keypoint adjusted to current video scale and offset
function drawBodyPart(part, col, size, xOff, yOff, drawW, drawH) {
  if (part && part.confidence > 0.1) {
    let x = map(part.x, 0, video.width, xOff, xOff + drawW);
    let y = map(part.y, 0, video.height, yOff, yOff + drawH);
    fill(col);
    noStroke();
    circle(x, y, size);
  }
}

// function drawTopPattern() {
//   let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
//   let shapeCount = colors.length;
//   let spacing = width / 2 / shapeCount;
//   let y = 40;

//   for (let i = 0; i < shapeCount; i++) {
//     fill(colors[i]);
//     noStroke();
//     ellipse(i * spacing + spacing / 2, y, 40, 40);
//   }
// }

// function drawTopPattern(xOff, yOff, drawW, drawH) {
//   let spacing = drawW / (pattern.length + 1);
//   let radius = 30;

//   // Place balls at 10% from top within the video feed
//   let y = yOff + drawH * 0.1;

//   for (let i = 0; i < pattern.length; i++) {
//     let x = xOff + spacing * (i + 1);
//     fill(pattern[i]);
//     stroke(255);
//     strokeWeight(3);
//     circle(x, y, radius * 2);
//   }
// }

// function drawTopPattern(xOff, yOff, drawW, drawH) {
//   let spacing = drawW / (pattern.length + 1);
//   let radius = 30;
//   let y = yOff + drawH * 0.1;

//   for (let i = 0; i < pattern.length; i++) {
//     let x = xOff + spacing * (i + 1);

//     // Outer glow
//     noStroke();
//     fill(
//       pattern[i] === "red" ? "rgba(255,100,100,0.4)" : "rgba(100,100,255,0.4)"
//     );
//     circle(x, y, radius * 3);

//     // Main ball
//     fill(pattern[i]);
//     stroke(255);
//     strokeWeight(3);
//     circle(x, y, radius * 2);

//     // Inner white shine
//     fill(255, 255, 255, 100);
//     noStroke();
//     circle(x - 8, y - 8, radius * 0.6);
//   }
// }

function drawTopPattern(xOff, yOff, drawW, drawH) {
  let totalBalls = pattern.length + 1; // 4 pattern + 1 answer
  let spacing = drawW / (totalBalls + 1);
  let radius = 30;
  let y = yOff + drawH * 0.1;

  for (let i = 0; i < pattern.length; i++) {
    let x = xOff + spacing * (i + 1);

    // Outer glow
    noStroke();
    fill(
      pattern[i] === "red" ? "rgba(255,100,100,0.4)" : "rgba(100,100,255,0.4)"
    );
    circle(x, y, radius * 3);

    // Main ball
    fill(pattern[i]);
    stroke(255);
    strokeWeight(3);
    circle(x, y, radius * 2);

    // Inner white shine
    fill(255, 255, 255, 100);
    noStroke();
    circle(x - 8, y - 8, radius * 0.6);
  }

  // Draw answer ball if selectedColor is set
  if (selectedColor) {
    let answerX = xOff + spacing * (pattern.length + 1);

    // Glow
    noStroke();
    fill(
      selectedColor === "red"
        ? "rgba(255,100,100,0.4)"
        : "rgba(100,100,255,0.4)"
    );
    circle(answerX, y, radius * 3);

    // Main ball
    fill(selectedColor);
    stroke(255);
    strokeWeight(3);
    circle(answerX, y, radius * 2);

    // Shine
    fill(255, 255, 255, 100);
    noStroke();
    circle(answerX - 8, y - 8, radius * 0.6);
  }
}

function gotPoses(results) {
  poses = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
