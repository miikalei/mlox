import { assert } from "chai";
import { Parser } from "../src/parser";
import { TokenType } from "../src/token";

describe("parser", function () {
  it("Should parse expressions", function () {
    const expr = new Parser([
      { tokenType: TokenType.BANG, lexeme: "!", literal: null, line: 1 },
      {
        tokenType: TokenType.STRING,
        line: 1,
        lexeme: '"juuh"',
        literal: "juuh",
      },
      { tokenType: TokenType.SEMICOLON, line: 1, lexeme: "", literal: null },
      { tokenType: TokenType.EOF, line: 2, lexeme: "", literal: "" },
    ]).parse();
    assert.isNotNull(expr);
  });
});
