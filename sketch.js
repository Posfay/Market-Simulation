const SELLERS = 4;
const BUYERS = 4;

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
const HEIGHT = 900;
const PADDING = 20;
const BLOB_PADDING = 10;
const EXPECTED_LINE_PLUS_WIDTH = 8;
const RADIUS = 10;

const SELLERS_X = 100;
const BUYERS_X = 500;

//----------------------------------------------------

let sellers = [];
let buyers = [];

let sellerPattern = [];
let buyerPattern = [];

let totalSellerSurplus = 0;
let totalBuyerSurplus = 0;

let currentValue = 0;

let aSellers = (HEIGHT - (2 * PADDING) - (2 * SELLERS * RADIUS)) / SELLERS;
let aBuyers = (HEIGHT - (2 * PADDING) - (2 * BUYERS * RADIUS)) / BUYERS;

function setup() {

  canvas = createCanvas(WIDTH, HEIGHT);
  background(200);
  frameRate(30);

  // INITIALIZE SELLERS
  let sellersMinSum = 0;
  let y = PADDING;

  for (let i = 0; i < SELLERS; i++) {

    y += aSellers;
    let min = random(LOW_MIN_SELLER, HIGH_MIN_SELLER);
    sellersMinSum += min;
    let expected = 0;
    let seller = new Seller(min, expected, RISE_AMOUNT_SELLER, DROP_AMOUNT_SELLER, SELLERS_X, y);
    sellers.push(seller);
    y += 2 * RADIUS;
  }

  // INITIALIZE BUYERS
  let buyersMaxSum = 0;
  y = PADDING;

  for (let i = 0; i < BUYERS; i++) {

    y += aBuyers;
    let max = random(LOW_MAX_BUYER, HIGH_MAX_BUYER);
    buyersMaxSum += max;
    let expected = 0;
    let buyer = new Buyer(max, expected, RISE_AMOUNT_BUYER, DROP_AMOUNT_BUYER, MAX_ACCEPTED_DIFFERENCE, BUYERS_X, y);
    buyers.push(buyer);
    y += 2 * RADIUS;
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
}

function draw() {

  background(200);

  let a = aSellers;

  if (BUYERS > SELLERS) {
    a = aBuyers;
  }

  // DRAW SELLERS
  for (let i = 0; i < SELLERS; i++) {

    stroke(50);
    fill(50);
    ellipse(sellers[i].x, sellers[i].y, RADIUS, RADIUS);

    let h = a - (2 * BLOB_PADDING);
    let ph = map(sellers[i].min, 0, HIGH_MAX_BUYER, 0, h);
    let pw = 4 * RADIUS;
    let p2 = sellers[i].y - RADIUS - BLOB_PADDING - ph;
    let p1 = sellers[i].x - (2 * RADIUS);
    stroke(50);
    fill(200, 200, 0);
    rect(p1, p2, pw, ph);

    let eh = map(sellers[i].expected, 0, HIGH_MAX_BUYER, 0, h);
    let ey = sellers[i].y - RADIUS - BLOB_PADDING - eh;
    let ex1 = p1 - EXPECTED_LINE_PLUS_WIDTH;
    let ex2 = ex1 + (4 * RADIUS) + (2 * EXPECTED_LINE_PLUS_WIDTH);
    stroke(255, 40, 40);
    line(ex1, ey, ex2, ey);
  }

  // DRAW BUYERS
  for (let i = 0; i < BUYERS; i++) {

    stroke(50, 70, 0);
    fill(50, 70, 0);
    ellipse(buyers[i].x, buyers[i].y, RADIUS, RADIUS);

    let h = a - (2 * BLOB_PADDING);
    let rh = map(buyers[i].max, 0, HIGH_MAX_BUYER, 0, h);
    let rw = 4 * RADIUS;
    let r2 = buyers[i].y - RADIUS - BLOB_PADDING - rh;
    let r1 = buyers[i].x - (2 * RADIUS);
    stroke(50);
    fill(200, 200, 0);
    rect(r1, r2, rw, rh);

    let eh = map(buyers[i].expected, 0, HIGH_MAX_BUYER, 0, h);
    let ey = buyers[i].y - RADIUS - BLOB_PADDING - eh;
    let ex1 = r1 - EXPECTED_LINE_PLUS_WIDTH;
    let ex2 = ex1 + (4 * RADIUS) + (2 * EXPECTED_LINE_PLUS_WIDTH);
    stroke(255, 40, 40);
    line(ex1, ey, ex2, ey);
  }
}

function initializeDay() {

  sellerPattern = [];
  buyerPattern = [];

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

function tryToBuy(buyer, seller) {

  if (buyer.expected >= seller.expected) {

    let value = (buyer.expected + seller.expected) / 2;
    seller.surplus += abs(value - seller.min);
    buyer.surplus += abs(value - buyer.max);
    seller.sold = true;
    buyer.bought = true;
  } else {

    let value = (buyer.expected + seller.expected) / 2;
    let diff = abs(value - buyer.max);

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

        tryToBuy(buyers[buyerPattern[i]], sellers[sellerPattern[j]]);

        if (buyers[buyerPattern[i]].bought) {
          break;
        }
      }
    }
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

  updateValues();
}
