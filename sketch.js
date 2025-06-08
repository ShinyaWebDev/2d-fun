// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let vidRatio = 4 / 3;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // createCanvas(640, 480);
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, () => {
    vidRatio = video.width / video.height;
  });

  video.hide();

  // video = createCapture(VIDEO, { flipped: true });
  // video.size(640, 480);
  // video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // image(video, 0, 0);
  background(0);

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

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    // for (let hand of hands) {
    //   if (hand.confidence > 0.1) {
    //     // Loop through keypoints and draw circles
    //     for (let i = 0; i < hand.keypoints.length; i++) {
    //       let keypoint = hand.keypoints[i];

    //       // Color-code based on left or right hand
    //       if (hand.handedness == "Left") {
    //         fill(255, 0, 255);
    //       } else {
    //         fill(255, 255, 0);
    //       }

    //       noStroke();
    //       circle(keypoint.x, keypoint.y, 16);
    //     }
    //   }
    // }
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          let x = map(keypoint.x, 0, video.width, xOffset, xOffset + drawW);
          let y = map(keypoint.y, 0, video.height, yOffset, yOffset + drawH);

          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(x, y, 16);
        }
      }
    }
  }
}
