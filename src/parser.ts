import { Expr, Stmt } from "./ast";
import { Token, TokenType } from "./token";

export class Parser {
  tokens: Token[];
  current = 0;
  reportError?: (line: number, where: string, message: string) => void;

  constructor(
    tokens: Token[],
    reportError?: (line: number, where: string, message: string) => void,
  ) {
    this.tokens = tokens;
    this.reportError = reportError;
  }

  public parse() {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) {
        statements.push(stmt);
      }
    }
    return statements;
  }

  private declaration() {
    try {
      if (this.match(TokenType.VAR)) {
        return this.varDeclaration();
      }

      return this.statement();
    } catch {
      this.synchronize();
      return null;
    }
  }

  private varDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");

    let initializer = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration");
    return new Stmt.Var(name, initializer);
  }

  private statement() {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Stmt.Block(this.block());
    }
    return this.expressionStatement();
  }

  private block() {
    const statements: Stmt[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const stmt = this.declaration();
      if (stmt) {
        statements.push(stmt);
      }
    }
    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private printStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private expressionStatement() {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private expression() {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.equality();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.Variable) {
        const name = expr.name;
        return new Expr.Assign(name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private equality() {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison() {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private term() {
    const expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      return new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private factor() {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }
    return this.primary();
  }

  private primary() {
    if (this.match(TokenType.FALSE)) {
      return new Expr.Literal(false);
    }
    if (this.match(TokenType.TRUE)) {
      return new Expr.Literal(true);
    }
    if (this.match(TokenType.NIL)) {
      return new Expr.Literal(null);
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const token of tokenTypes) {
      if (this.check(token)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(tokenType: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().tokenType === tokenType;
  }

  private advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private consume(tokenType: TokenType, message: string) {
    if (this.check(tokenType)) {
      return this.advance();
    }
    throw this.error(this.peek(), message);
  }

  private isAtEnd() {
    return this.peek().tokenType === TokenType.EOF;
  }

  private peek() {
    return this.tokens[this.current];
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string) {
    if (token.tokenType === TokenType.EOF) {
      this.reportError?.(token.line, " at end", message);
    } else {
      this.reportError?.(token.line, ` at '${token.lexeme}'`, message);
    }
    return new ParseError();
  }

  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().tokenType === TokenType.SEMICOLON) {
        return;
      }

      switch (this.peek().tokenType) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }
}

class ParseError extends Error {}
