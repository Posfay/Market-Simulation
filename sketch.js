const SELLERS = 5;
const BUYERS = 1;

const HIGH_MIN_SELLER = 125;
const LOW_MIN_SELLER = 75;

const HIGH_MAX_BUYER = 175;
const LOW_MAX_BUYER = 100;

const RISE_AMOUNT_SELLER = 3;
const DROP_AMOUNT_SELLER = 3;

const RISE_AMOUNT_BUYER = 3;
const DROP_AMOUNT_BUYER = 3;

const MAX_ACCEPTED_DIFFERENCE = 5;

const DAY_LENGTH = 5;

const WIDTH = 600;
const HEIGHT = 800;
const FRAME_RATE = 60;

const PADDING = 20;
const EXPECTED_LINE_PLUS_WIDTH = 5;
const RADIUS = 10;
const BUYER_SELLER_GAP = 30;

// !! framerate / time = must be integer
const MOVE_ANIMATION_TIME = 0.5;
const BUY_ANIMATION_TIME = 0.25;

const SELLERS_X = 100;
const BUYERS_X = 500;

const SELLERS_COLOR = [207, 169, 43];
const SELLERS_SOLD_COLOR = [217, 211, 23];

const BUYERS_COLOR = [23, 137, 111];
const BUYERS_BOUGHT_COLOR = [35, 216, 175];

const EXPECTED_STROKE_WEIGHT = 2;

//----------------------------------------------------

let sellers = [];
let buyers = [];

let sellerPattern = [];
let buyerPattern = [];

let actions = [];

let totalSellerSurplus = 0;
let totalBuyerSurplus = 0;

let currentValue = 0;

let aSellers = (HEIGHT - (2 * PADDING) - (2 * SELLERS * RADIUS)) / SELLERS;
let aBuyers = (HEIGHT - (2 * PADDING) - (2 * BUYERS * RADIUS)) / BUYERS;

let currentIndex = 0;
let frameCounter = 0;
let totalAnimationFrames = FRAME_RATE * ((2 * MOVE_ANIMATION_TIME) + BUY_ANIMATION_TIME);
let moveAnimationFrames = FRAME_RATE * MOVE_ANIMATION_TIME;
let buyAnimationFrames = FRAME_RATE * BUY_ANIMATION_TIME;
let dayCompleted = false;
let days = 0;

let paused = true;

let velX = 0;
let velY = 0;

let dayP;
let valueP;
let pauseB;
let startingValueP;

function setup() {

  dayP = createP("Day 1");
  startingValueP = createP("");

  canvas = createCanvas(WIDTH, HEIGHT);
  background(200);
  frameRate(FRAME_RATE);

  pauseB = createButton("Simulate");
  pauseB.mousePressed(pausePressed);
  valueP = createP("");

  // INITIALIZE SELLERS
  let sellersMinSum = 0;
  let y = PADDING;

  for (let i = 0; i < SELLERS; i++) {

    y += aSellers + RADIUS;
    let min = random(LOW_MIN_SELLER, HIGH_MIN_SELLER);
    sellersMinSum += min;
    let expected = 0;
    let seller = new Seller(min, expected, RISE_AMOUNT_SELLER, DROP_AMOUNT_SELLER, SELLERS_X, y);
    sellers.push(seller);
    y += RADIUS;
  }

  // INITIALIZE BUYERS
  let buyersMaxSum = 0;
  y = PADDING;

  for (let i = 0; i < BUYERS; i++) {

    y += aBuyers + RADIUS;
    let max = random(LOW_MAX_BUYER, HIGH_MAX_BUYER);
    buyersMaxSum += max;
    let expected = 0;
    let buyer = new Buyer(max, expected, RISE_AMOUNT_BUYER, DROP_AMOUNT_BUYER, MAX_ACCEPTED_DIFFERENCE, BUYERS_X, y);
    buyers.push(buyer);
    y += RADIUS;
  }

  // NORMALIZING EXPECTED PRICE
  let averageExpected = ((sellersMinSum / SELLERS) + (buyersMaxSum / BUYERS)) / 2;
  console.log(averageExpected);

  for (let i = 0; i < SELLERS; i++) {

    sellers[i].expected = averageExpected;

    if (sellers[i].expected < sellers[i].min) {
      sellers[i].expected = sellers[i].min;
    }
  }

  for (let i = 0; i < BUYERS; i++) {

    buyers[i].expected = averageExpected;

    if (buyers[i].expected > buyers[i].max) {
      buyers[i].expected = buyers[i].max;
    }
  }

  currentValue = averageExpected;

  startingValueP.html("Starting Value = " + round(currentValue));

  // START DAY
  simulateDay();
  days++;
}

function pausePressed() {

  paused = !paused;
  if (paused) {
    pauseB.html("Simulate");
  } else {
    pauseB.html("Pause");
  }
}

// DRAW -----------------------------------------------------------------------------------------------------------------------------

function draw() {

  if (paused) {
    return;
  }

  background(200);

  // first move animation------------------------------------------------------------------------------------------------
  if (frameCounter == 0) {

    let buyer = actions[currentIndex][0];
    let seller = actions[currentIndex][1];

    let newX = seller.x + (2 * RADIUS) + BUYER_SELLER_GAP;
    let newY = seller.y;
    let oldX = buyer.x;
    let oldY = buyer.y;

    let dx = newX - oldX;
    let dy = newY - oldY;

    velX = dx / moveAnimationFrames;
    velY = dy / moveAnimationFrames;
  }

  // move animation
  if (frameCounter < moveAnimationFrames) {

    actions[currentIndex][0].move(velX, velY);
  }

  // first buy animation-------------------------------------------------------------------------------------------------
  if (frameCounter == moveAnimationFrames) {

    let buyer = actions[currentIndex][0];
    let seller = actions[currentIndex][1];

    tryToBuy(buyer, seller);

  }

  // buy animation
  if ((frameCounter >= moveAnimationFrames) && (frameCounter < (moveAnimationFrames + buyAnimationFrames))) {

  }

  // first back move animation-------------------------------------------------------------------------------------------
  if (frameCounter == (moveAnimationFrames + buyAnimationFrames)) {

    velX = -1 * velX;
    velY = -1 * velY;
  }

  // back move animation
  if ((frameCounter >= (moveAnimationFrames + buyAnimationFrames)) && (frameCounter < totalAnimationFrames)) {

    actions[currentIndex][0].move(velX, velY);
  }

  frameCounter++;

  if (frameCounter == totalAnimationFrames) {

    currentIndex++;
    frameCounter = 0;
  }

  // if end of day (all buyers tried to buy from all sellers)
  if (currentIndex == actions.length) {

    currentIndex = 0;
    updateValues();
    simulateDay();
    days++;
  }

  // TODO days checking

  drawBlobs();

  updateTexts();
}

function drawBlobs() {

  let a = aSellers;

  if (BUYERS > SELLERS) {
    a = aBuyers;
  }

  // DRAW SELLERS
  for (let i = 0; i < SELLERS; i++) {

    stroke(SELLERS_COLOR[0], SELLERS_COLOR[1], SELLERS_COLOR[2]);
    fill(SELLERS_COLOR[0], SELLERS_COLOR[1], SELLERS_COLOR[2]);

    if (sellers[i].sold) {

      stroke(SELLERS_SOLD_COLOR[0], SELLERS_SOLD_COLOR[1], SELLERS_SOLD_COLOR[2]);
      fill(SELLERS_SOLD_COLOR[0], SELLERS_SOLD_COLOR[1], SELLERS_SOLD_COLOR[2]);
    }

    ellipse(sellers[i].x, sellers[i].y, RADIUS, RADIUS);

    let h = a;
    let ph = map(sellers[i].min, 0, HIGH_MAX_BUYER, 0, h);
    let pw = 2 * RADIUS;
    let p2 = sellers[i].y - RADIUS - ph;
    let p1 = sellers[i].x - (1 * RADIUS);
    rect(p1, p2, pw, ph);

    let eh = map(sellers[i].expected, 0, HIGH_MAX_BUYER, 0, h);
    let ey = sellers[i].y - RADIUS - eh;
    let ex1 = p1 - EXPECTED_LINE_PLUS_WIDTH;
    let ex2 = ex1 + (2 * RADIUS) + (2 * EXPECTED_LINE_PLUS_WIDTH);
    strokeWeight(EXPECTED_STROKE_WEIGHT);
    stroke(255, 40, 40);
    line(ex1, ey, ex2, ey);

    stroke(0);
    strokeWeight(0);
    fill(0);
    textSize(18);
    text(round(sellers[i].expected), ex1, ey - 5);
  }

  // DRAW BUYERS
  for (let i = 0; i < BUYERS; i++) {

    stroke(BUYERS_COLOR[0], BUYERS_COLOR[1], BUYERS_COLOR[2]);
    fill(BUYERS_COLOR[0], BUYERS_COLOR[1], BUYERS_COLOR[2]);

    if (buyers[i].bought) {

      stroke(BUYERS_BOUGHT_COLOR[0], BUYERS_BOUGHT_COLOR[1], BUYERS_BOUGHT_COLOR[2]);
      fill(BUYERS_BOUGHT_COLOR[0], BUYERS_BOUGHT_COLOR[1], BUYERS_BOUGHT_COLOR[2]);
    }

    ellipse(buyers[i].x, buyers[i].y, RADIUS, RADIUS);

    let h = a;
    let rh = map(buyers[i].max, 0, HIGH_MAX_BUYER, 0, h);
    let rw = 2 * RADIUS;
    let r2 = buyers[i].y - RADIUS - rh;
    let r1 = buyers[i].x - (1 * RADIUS);
    rect(r1, r2, rw, rh);

    let eh = map(buyers[i].expected, 0, HIGH_MAX_BUYER, 0, h);
    let ey = buyers[i].y - RADIUS - eh;
    let ex1 = r1 - EXPECTED_LINE_PLUS_WIDTH;
    let ex2 = ex1 + (2 * RADIUS) + (2 * EXPECTED_LINE_PLUS_WIDTH);
    strokeWeight(EXPECTED_STROKE_WEIGHT);
    stroke(255, 40, 40);
    line(ex1, ey, ex2, ey);

    stroke(0);
    strokeWeight(0);
    fill(0);
    textSize(18);
    text(round(buyers[i].expected), ex1, ey - 5);
  }
}

function updateTexts() {

  dayP.html("Day " + days);
  valueP.html("Value = " + round(currentValue));
}



// MARKET LOGIC --------------------------------------------------------------------------------------------------------------------------

function initializeDay() {

  sellerPattern = [];
  buyerPattern = [];

  actions = [];

  for (let i = 0; i < SELLERS; i++) {

    sellers[i].sold = false;
    sellerPattern.push(i);
  }

  for (let i = 0; i < BUYERS; i++) {

    buyers[i].bought = false;
    buyerPattern.push(i);
  }

  shuffle(sellerPattern, true);
  shuffle(buyerPattern, true);
}

function addToActions(buyer, seller) {

  let buyerAndSeller = [];
  buyerAndSeller.push(buyer);
  buyerAndSeller.push(seller);
  actions.push(buyerAndSeller);
}

function willBuy(buyer, seller) {

  if (buyer.expected >= seller.expected) {

    return true;
  } else {

    let value = (buyer.expected + seller.expected) / 2;
    let diff = abs(value - buyer.expected);

    if (diff <= MAX_ACCEPTED_DIFFERENCE) {
      return true;
    }

    return false;
  }
}

function tryToBuy(buyer, seller) {

  if (buyer.expected >= seller.expected) {

    let value = (buyer.expected + seller.expected) / 2;
    seller.surplus += abs(value - seller.min);
    buyer.surplus += abs(value - buyer.max);
    seller.sold = true;
    buyer.bought = true;
  } else {

    let value = (buyer.expected + seller.expected) / 2;
    let diff = abs(value - buyer.expected);

    if (diff <= MAX_ACCEPTED_DIFFERENCE) {

      seller.surplus += abs(value - seller.min);
      buyer.surplus += abs(value - buyer.max);
      seller.sold = true;
      buyer.bought = true;
    }
  }
}

function simulateTransactions() {

  for (let i = 0; i < BUYERS; i++) {

    for (let j = 0; j < SELLERS; j++) {

      // NOT SOLD YET
      if (!sellers[sellerPattern[j]].sold) {

        addToActions(buyers[buyerPattern[i]], sellers[sellerPattern[j]]);

        if (willBuy(buyers[buyerPattern[i]], sellers[sellerPattern[j]])) {

          // marking seller, he sold -> should not sell again
          sellers[sellerPattern[j]].sold = true;
          break;
        }
      }
    }
  }

  // resetting sold to false for animation (will be simulated in animation part)
  for (let i = 0; i < SELLERS; i++) {

    sellers[i].sold = false;
  }
}

function updateValues() {

  let valueSum = 0;

  for (let i = 0; i < SELLERS; i++) {

    sellers[i].changeExpectedPrice();

    valueSum += sellers[i].expected;
  }

  for (let i = 0; i < BUYERS; i++) {

    buyers[i].changeExpectedPrice();

    valueSum += buyers[i].expected;
  }

  currentValue = valueSum / (SELLERS + BUYERS);
}

function simulateDay() {

  initializeDay();

  simulateTransactions();
}
