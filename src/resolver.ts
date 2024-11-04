import {
  Assign,
  Binary,
  Block,
  Call,
  Class,
  Expr,
  Expression,
  ExprVisitor,
  Function,
  Get,
  Grouping,
  If,
  Logical,
  Print,
  Return,
  Set,
  Stmt,
  StmtVisitor,
  This,
  Unary,
  Var,
  Variable,
  While,
} from "./ast";
import { Interpreter } from "./interpreter";
import { Token } from "./token";

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
}

/**
 * Static analysis AST walker, which for each variable usage, tells the interpreter
 * how many scopes up the variable is defined (by calling interpreter.resolve()).
 */
export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  // Stack of scopes containing their variables. False boolean means that variable is declared,
  // but still under initialization. True means ready.
  private scopes: Array<Map<string, boolean>> = [];
  private currentFunction: FunctionType = FunctionType.NONE;
  private currentClass: ClassType = ClassType.NONE;

  constructor(
    public interpreter: Interpreter,
    private reportError?: (token: Token, message: string) => void,
  ) {}

  public resolveMany(statements: Stmt[]) {
    for (const stmt of statements) {
      this.resolve(stmt);
    }
  }

  public resolve(stmt: Stmt | Expr) {
    stmt.accept(this);
  }

  private beginScope() {
    this.scopes.push(new Map());
  }

  private endScope() {
    this.scopes.pop();
  }

  // Mark token declared (but not defined) in the current local scope
  private declare(name: Token) {
    if (this.scopes.length === 0) {
      return;
    }
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      this.reportError?.(
        name,
        "Already a variable with this name in the scope.",
      );
    }
    scope.set(name.lexeme, false);
  }

  // Mark token defined in the current local scope
  private define(name: Token) {
    if (this.scopes.length === 0) {
      return;
    }
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  // Stores scope depth for an expression using a variable, by calling interpreter.resolve with
  // the computed depth.
  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private resolveFunction(fun: Function, functionType: FunctionType) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = functionType;

    this.beginScope();
    for (const param of fun.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveMany(fun.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  public visitBlockStmt(stmt: Block) {
    this.beginScope();
    this.resolveMany(stmt.statements);
    this.endScope();
  }

  public visitVarStmt(stmt: Var) {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  public visitVariableExpr(expr: Variable) {
    if (
      this.scopes.length !== 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false
    ) {
      this.reportError?.(
        expr.name,
        "Can't read local variable in its own initializer.",
      );
    }

    this.resolveLocal(expr, expr.name);
  }

  public visitGetExpr(expr: Get) {
    this.resolve(expr.obj);
  }

  public visitSetExpr(expr: Set) {
    this.resolve(expr.value);
    this.resolve(expr.obj);
  }

  public visitAssignExpr(expr: Assign) {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitFunctionStmt(stmt: Function) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  // Trivial parts
  public visitClassStmt(stmt: Class) {
    const enclosingClassType = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass !== null) {
      if (stmt.name.lexeme === stmt.superclass.name.lexeme) {
        this.reportError?.(
          stmt.superclass.name,
          "A class can't inherit from itself.",
        );
      }
      this.resolve(stmt.superclass);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set("this", true);

    for (const method of stmt.methods) {
      const functionType =
        method.name.lexeme === "init"
          ? FunctionType.INITIALIZER
          : FunctionType.METHOD;
      this.resolveFunction(method, functionType);
    }

    this.endScope();
    this.currentClass = enclosingClassType;
  }
  public visitExpressionStmt(stmt: Expression) {
    this.resolve(stmt.expression);
  }
  public visitIfStmt(stmt: If) {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolve(stmt.elseBranch);
    }
  }
  public visitPrintStmt(stmt: Print) {
    this.resolve(stmt.expression);
  }
  public visitReturnStmt(stmt: Return) {
    if (this.currentFunction === FunctionType.NONE) {
      this.reportError?.(stmt.keyword, "Can't return from top-level code.");
    }
    if (stmt.value) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        this.reportError?.(
          stmt.keyword,
          "Can't return a value from an initializer.",
        );
      }

      this.resolve(stmt.value);
    }
  }
  public visitWhileStmt(stmt: While) {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }
  public visitBinaryExpr(expr: Binary) {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }
  public visitCallExpr(expr: Call) {
    this.resolve(expr.callee);
    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }
  public visitThisExpr(expr: This) {
    if (this.currentClass === ClassType.NONE) {
      this.reportError?.(expr.keyword, "Can't use 'this' outside of a class.");
    }
    this.resolveLocal(expr, expr.keyword);
  }
  public visitGroupingExpr(expr: Grouping) {
    this.resolve(expr.expression);
  }
  public visitLogicalExpr(expr: Logical) {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }
  public visitUnaryExpr(expr: Unary) {
    this.resolve(expr.right);
  }
  public visitLiteralExpr() {
    return;
  }
}
