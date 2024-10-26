import { Run } from "../src/run";

describe("Running source", () => {
  it("should succeed", () => {
    new Run().run(`< "source"`);
  });
});
