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
    new Run().run(`1 < "juuh" + "source";`);
  });

  it("Should handle expressions", () => {
    new Run().run(`print 8 + 3;`);
    assert(spy.calledWith("11"));
  });

  it("Should handle expressions 2", () => {
    new Run().run(`print 1-5*3;`);
    assert(spy.calledWith("-14"));
  });

  it("Should handle expressions 3", () => {
    new Run().run(`print (-4+5) / (-2-(-1)) == -1;`);
    assert(spy.calledWith("true"));
  });

  it("Should store global state", function () {
    new Run().run(`var a = 3*4; print(a -10);`);
    assert(spy.calledWith("2"));
  });

  it("supports assigment", function () {
    new Run().run(`var a = 5; a=3; print a;`);
    assert(spy.calledWith("3"));
  });

  it("Supports scoping", function () {
    new Run().run(`
      var a = "global a";
      var b = "global b";
      var c = "global c";
        {
        var a = "outer a";
        var b = "outer b";
          {
          var a = "inner a";
          print a;
          print b;
          print c;
          }
        print a;
        print b;
        print c;
        }
      print a;
      print b;
      print c;
      `);
    const logs = spy.getCalls();
    assert(logs[0].calledWith("inner a"));
    assert(logs[1].calledWith("outer b"));
    assert(logs[2].calledWith("global c"));
    assert(logs[3].calledWith("outer a"));
    assert(logs[4].calledWith("outer b"));
    assert(logs[5].calledWith("global c"));
    assert(logs[6].calledWith("global a"));
    assert(logs[7].calledWith("global b"));
    assert(logs[8].calledWith("global c"));
  });

  it("supports conditionals", function () {
    new Run().run(`if (true) print "yes";`);
    assert(spy.calledWith("yes"));
  });
  it("supports else branch", function () {
    new Run().run(`if (1+1==3) print "yes"; else var a;`);
    assert(spy.notCalled);
  });

  it("supports logical operators", function () {
    new Run().run(`print true and false;`);
    assert(spy.calledOnceWith("false"));
  });
});
