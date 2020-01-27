class Buyer {

  constructor(max, expected, riseAmount, dropAmount, maxAcceptedDiff, x, y) {

    this.max = max;
    this.expected = expected;
    this.riseAmount = riseAmount;
    this.dropAmount = dropAmount;
    this.maxAcceptedDiff = maxAcceptedDiff;
    this.bought = false;
    this.x = x;
    this.y = y;
  }

  changeExpectedPrice() {

    if (this.bought) {
      this.expected -= this.dropAmount;
    } else {

      this.expected += this.riseAmount;

      if (this.expected > this.max) {
        this.expected = this.max;
      }
    }
  }

}
