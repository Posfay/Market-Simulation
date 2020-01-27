const SELLERS = 6;
const BUYERS = 1;

const HIGH_MAX_BUYER = 250;
const LOW_MAX_BUYER = 100;

const HIGH_MIN_SELLER = 150;
const LOW_MIN_SELLER = 50;

const RISE_AMOUNT_SELLER = 3;
const DROP_AMOUNT_SELLER = 3;

const RISE_AMOUNT_BUYER = 3;
const DROP_AMOUNT_BUYER = 3;

const DAY_LENGTH = 5;

const WIDTH = 600;
const HEIGHT = 1000;
const PADDING = 20;
const RADIUS = 10;

const SELLERS_X = 100;

//----------------------------------------------------

let sellers = [];
let buyers = [];

function setup() {

  canvas = createCanvas(WIDTH, HEIGHT);
  background(200);
  frameRate(30);

  let y = PADDING;
  let a = (HEIGHT - (2 * PADDING) - (2 * SELLERS * RADIUS)) / SELLERS;

  for (let i = 0; i < SELLERS; i++) {

    y += a;
    let min = random(LOW_MIN_SELLER, HIGH_MIN_SELLER);
    let expected = (LOW_MAX_BUYER + HIGH_MAX_BUYER) / 2;
    let seller = new Seller(min, expected, RISE_AMOUNT_SELLER, DROP_AMOUNT_SELLER, SELLERS_X, y);
    sellers.push(seller);
    y += 2 * RADIUS;
  }
}

function draw() {

  background(200);

  for (let i = 0; i < SELLERS; i++) {

    stroke(50);
    fill(50);
    ellipse(sellers[i].x, sellers[i].y, RADIUS, RADIUS);
  }
}
