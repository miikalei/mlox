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
    new Run().run(`1 < "juuh";`);
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

  it("supports looping", function () {
    new Run().run(`
      var a = 0;
      var temp;
      for (var b = 1; a < 10000; b = temp + b) {
        print a;
        temp = a;
        a = b;
      }
 `);
    assert(spy.getCalls().length === 21);
  });

  it("supports functions", function () {
    new Run().run(`
      fun sayHi(first, last) {
        print "Hi, " + first + " " + last + "!";
      }
      sayHi("Dear", "Reader");
      `);
    assert(spy.calledOnceWith("Hi, Dear Reader!"));
  });

  it("has builtin 'clock'", function () {
    new Run().run(`print clock();`);
    assert(spy.calledOnce);
  });

  it("Supports recursion", function () {
    this.timeout(5000);
    new Run().run(`
      fun fib(n) {
        if (n <= 1) return n;
        return fib(n - 2) + fib(n - 1);
      }
      
      for (var i = 0; i < 10; i = i + 1) {
        print fib(i);
      }
      `);
    assert(spy.callCount === 10);
    assert(spy.getCall(9).calledWith("34"));
  });

  it("supports closures", function () {
    new Run().run(`
      fun makeCounter() {
        var i = 0;
        fun count() {
          i = i + 1;
          print i;
        }
        return count;
      }
      var counter = makeCounter();
      counter(); // "1".
      counter(); // "2".
`);
    assert(spy.getCall(0).calledWith("1"));
    assert(spy.getCall(1).calledWith("2"));
  });

  it("supports static scoping", function () {
    new Run().run(`
        var a = "global";
        {
          fun showA() {
            print a; // Locally scoped
          }

          showA();
          var a = "block";
          showA();
        }
      `);
    assert(spy.getCall(0).calledWith("global"));
    assert(spy.getCall(1).calledWith("global"));
  });

  it("supports class declarations", function () {
    new Run().run(`
      class Animal {
        makeSound() {
          return "Honk";
        }
      }

      print Animal; // Prints "Animal".
      `);
    assert(spy.calledOnceWith("Animal"));
  });

  it("supports class instances", function () {
    new Run().run(`
        class Bagel {}
        var bagel = Bagel();
        print bagel; // Prints "Bagel instance".
      `);
    assert(spy.calledOnceWith("Bagel instance"));
  });

  it("Supports class methods", function () {
    new Run().run(`
      class Bacon {
  eat() {
    print "Crunch crunch crunch!";
  }
}

Bacon().eat(); // Prints "Crunch crunch crunch!".
`);
    assert(spy.calledOnceWith("Crunch crunch crunch!"));
  });

  it("Support 'this'", function () {
    new Run().run(`
        class Cake {
          taste() {
            var adjective = "delicious";
            print "The " + this.flavor + " cake is " + adjective + "!";
          }
        }   

        var cake = Cake();
        cake.flavor = "German chocolate";
        cake.taste(); // Prints "The German chocolate cake is delicious!".
      `);
    assert(spy.calledOnceWith("The German chocolate cake is delicious!"));
  });

  it("supports calling initializer from outside", function () {
    new Run().run(`
      class Foo {
      init() {
        print this;
      }
      }

      var foo = Foo();
      print foo.init();
        `);
    assert(spy.callCount === 3);
    assert(spy.getCall(0).calledWith("Foo instance"));
    assert(spy.getCall(1).calledWith("Foo instance"));
    assert(spy.getCall(2).calledWith("Foo instance"));
  });

  it("supports inherited methods", function () {
    new Run().run(`
      class Doughnut {
        cook() {
          print "Fry until golden brown.";
        }
      }

      class BostonCream < Doughnut {}

      BostonCream().cook();
      `);
    assert(spy.calledOnceWith("Fry until golden brown."));
  });

  it("supports super keyword", function () {
    new Run().run(`
      class Doughnut {
        cook() {
          print "Fry until golden brown.";
        }
      }

      class BostonCream < Doughnut {
        cook() {
          super.cook();
          print "Pipe full of custard and coat with chocolate.";
        }
      }

      BostonCream().cook();
`);
    assert(spy.callCount === 2);
    assert(spy.getCall(0).calledWith("Fry until golden brown."));
    assert(
      spy
        .getCall(1)
        .calledWith("Pipe full of custard and coat with chocolate."),
    );
  });

  it("looks up superclass with static scope", function () {
    new Run().run(`
        class A {
          method() {
            print "A method";
          }
        }

        class B < A {
          method() {
            print "B method";
          }

          test() {
            super.method();
          }
        }

        class C < B {}

        C().test();
      `);
    assert(spy.calledWith("A method"));
  });

  it("Is nato compatible", function () {
    new Run().run(`print "a";`);
    assert(spy.calledOnceWith("Alpha"));
  });

  it("Should print error messages", function () {
    const errSpy = sinon.spy(console, "error");
    new Run().run(`fun ()`);
    assert(errSpy.calledOnce);
  })
});
