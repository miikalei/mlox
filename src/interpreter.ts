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
  Var,
  Variable,
  Assign,
  Block,
  If,
  Logical,
  While,
  Call,
  Function,
  Return,
  Class,
  Get,
  Set,
} from "./ast";
import { Callable, isCallable } from "./callable";
import { MloxClass } from "./class";
import { Environment } from "./environment";
import { MloxFunction } from "./function";
import { MloxInstance } from "./instance";
import { ReturnSignal } from "./return";
import { Token, TokenType } from "./token";

export class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
  globals = new Environment(); // Outermost scope
  environment = this.globals; // Current env, changes with scope
  locals = new Map<Expr, number>();
  reportError?: (error: RuntimeError) => void;

  constructor(reportError?: (error: RuntimeError) => void) {
    this.reportError = reportError;

    this.globals.define(
      "clock",
      new Callable("<native fn>", 0, () => {
        return new Date().getTime() / 1_000;
      }),
    );
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

  public resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  public visitClassStmt(stmt: Class) {
    this.environment.define(stmt.name.lexeme, null);

    const methods: Map<string, MloxFunction> = new Map();
    for (const method of stmt.methods) {
      const fun = new MloxFunction(method, this.environment);
      methods.set(method.name.lexeme, fun);
    }

    const klass = new MloxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
    return null;
  }

  public visitVarStmt(stmt: Var) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  public visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
    return;
  }

  public visitFunctionStmt(stmt: Function) {
    const fun = new MloxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, fun);
    return null;
  }

  public visitIfStmt(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  public visitWhileStmt(stmt: While) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
    return null;
  }

  public visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(stringify(value));
    return null;
  }

  public visitReturnStmt(stmt: Return) {
    let value: Value = null;
    if (stmt.value !== null) {
      value = this.evaluate(stmt.value);
    }
    throw new ReturnSignal(value);
  }

  public visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  public executeBlock(statements: Stmt[], environment: Environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const stmt of statements) {
        this.execute(stmt);
      }
    } finally {
      this.environment = previous;
    }
  }

  public visitAssignExpr(expr: Assign) {
    const value = this.evaluate(expr.value);

    const depth = this.locals.get(expr);
    if (depth !== undefined) {
      this.environment.assignAt(depth, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  public visitGetExpr(expr: Get) {
    const obj = this.evaluate(expr.obj);
    if (obj instanceof MloxInstance) {
      return obj.get(expr.name);
    }
    throw new RuntimeError(expr.name, "Only instances have properties.");
  }

  public visitSetExpr(expr: Set) {
    const obj = this.evaluate(expr.obj);

    if (!(obj instanceof MloxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    obj.set(expr.name, value);
    return value;
  }

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical) {
    const left = this.evaluate(expr.left);

    if (expr.operator.tokenType === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
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

  public visitCallExpr(expr: Call) {
    const callee = this.evaluate(expr.callee);

    const argValues: Value[] = [];
    for (const arg of expr.args) {
      argValues.push(this.evaluate(arg));
    }

    if (!isCallable(callee)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes.",
      );
    }

    const fun = callee;

    if (argValues.length !== fun.arity) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${fun.arity} arguments but got ${argValues.length}.`,
      );
    }

    return fun.call(this, argValues);
  }

  public visitVariableExpr(expr: Variable) {
    return this.lookUpVariable(expr.name, expr);
  }

  private lookUpVariable(name: Token, expr: Expr) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
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
