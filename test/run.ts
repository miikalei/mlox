import { Run } from "../src/run";

describe("Running source", () => {
  it("should succeed", () => {
    new Run().run("source");
  });

  it("should handle complex code", () => {
    const source = `// this is a comment
(( )){} // grouping stuff
!*+-/=<> <= == // operators`;
    new Run().run(source);
  });
});
