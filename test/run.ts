import { assert } from "chai";
import { main } from "../src/mlox"

describe('The program should run', () => {
  it("Should return 6", () => {
    const result = main();
    assert.equal(result, 6)
  })

})