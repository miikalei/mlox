import type {
  Expr,
  Literal,
  Grouping,
  Value,
  Binary,
  Unary,
  Expression,
  ExprVisitor,
  StmtVisitor,
  Print,
  Stmt,
} from "./ast";
import { Token, TokenType } from "./token";

export class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
  reportError?: (error: RuntimeError) => void;

  constructor(reportError?: (error: RuntimeError) => void) {
    this.reportError = reportError;
  }

  public interpret(statements: Stmt[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error: unknown) {
      if (error instanceof RuntimeError) {
        this.reportError?.(error);
      } else {
        throw error;
      }
    }
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
  }

  public visitExpressionExpr(stmt: Expression) {
    this.evaluate(stmt.expression);
    return;
  }

  public visitPrintExpr(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(stringify(value));
    return null;
  }

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: Unary): Value {
    const right = this.evaluate(expr.right);

    switch (expr.operator.tokenType) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
      case TokenType.BANG:
        return !this.isTruthy(right);
    }
    // Unreachable
    return null;
  }

  public visitBinaryExpr(expr: Binary): Value {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    switch (expr.operator.tokenType) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);

      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings.",
        );
        break;

      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
    }
    // Unreachable
    return null;
  }

  private evaluate(expr: Expr): Value {
    return expr.accept(this);
  }

  private isTruthy(value: Value) {
    if (value === null) {
      return false;
    }
    if (typeof value === "boolean") {
      return value;
    }
    return true;
  }

  private isEqual(a: Value, b: Value) {
    if (a === null && b === null) {
      return true;
    }
    if (a === null) {
      return false;
    }
    return a === b;
  }

  private checkNumberOperand(
    operator: Token,
    operand: Value,
  ): asserts operand is number {
    if (typeof operand === "number") {
      return;
    }
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    operandA: Value,
    operandB: Value,
    // Sadly typescript does not support multiple assertion return type
  ): asserts operandA is number {
    if (typeof operandA === "number" && typeof operandB === "number") {
      return;
    }
    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}

export class RuntimeError extends Error {
  token: Token;

  constructor(token: Token, message: string) {
    super(message);
    Object.setPrototypeOf(this, RuntimeError.prototype);
    this.token = token;
  }
}

function stringify(value: Value) {
  if (value === null) {
    return "nil";
  }
  return value.toString();
}
