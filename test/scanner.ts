import { assert } from "chai";
import { Scanner } from "../src/scanner";

describe("Scanner", function () {
  it("Should handle comments", function () {
    const source = `// this is a comment
(( )){} // grouping stuff
!*+-/=<> <= == // operators`;
    const tokens = new Scanner(source).scanTokens();
    assert.equal(tokens.length, 17);
  });

  it("Should handle strings", function () {
    const source = `< "juuh"`;
    const tokens = new Scanner(source).scanTokens();
    assert.equal(tokens.length, 3);
  });
});