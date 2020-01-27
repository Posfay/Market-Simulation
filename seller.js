class Seller {

  constructor(min, expected, riseAmount, dropAmount, x, y) {

    this.min = min;
    this.expected = expected;
    this.riseAmount = riseAmount;
    this.dropAmount = dropAmount;
    this.sold = false;
    this.x = x;
    this.y = y;
  }

  changeExpectedPrice() {

    if (this.sold) {
      this.expected += this.riseAmount;
    } else {

      this.expected -= this.dropAmount;

      if (this.expected < this.min) {
        this.expected = this.min;
      }
    }
  }

}
