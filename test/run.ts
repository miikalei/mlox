import { assert } from "chai";
import { Run } from "../src/run";
import sinon from "sinon";

describe("Running source", () => {
  let spy: sinon.SinonSpy;

  beforeEach(function () {
    spy = sinon.spy(console, "log");
  });

  afterEach(function () {
    spy.restore();
  });

  it("should succeed", () => {
    new Run().run(`< "source"`);
  });

  it("Should handle expressions", () => {
    new Run().run(`8 + 3`);
    assert(spy.calledWith("11"));
  });

  it("Should handle expressions 2", () => {
    new Run().run(`1-5*3`);
    assert(spy.calledWith("-14"));
  });

  it("Should handle expressions 3", () => {
    new Run().run(`(-4+5) / (-2-(-1)) == -1`);
    assert(spy.calledWith("true"));
  });
});
