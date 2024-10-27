import { assert } from "chai";
import { ASTPrinter } from "../src/ast-printer";
import { Expr } from "../src/expr";
import { Token, TokenType } from "../src/token";

describe("ast-printer", function () {
  it("Prints correctly", function () {
    const expression = new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123),
      ),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67)),
    );

    const s = expression.accept(ASTPrinter);
    assert.equal(s, "(* (- 123) (group 45.67))");
  });
});
