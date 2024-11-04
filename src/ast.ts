import { Callable } from "./callable";
import { MloxClass } from "./class";
import { Token } from "./token";

interface Visitable<Visitor> {
  accept: (visitor: Visitor) => unknown;
}

export type Value =
  | object
  | string
  | number
  | boolean
  | Callable
  | null
  | MloxClass;
export type Expr =
  | Assign
  | Get
  | Set
  | This
  | Literal
  | Unary
  | Logical
  | Call
  | Binary
  | Grouping
  | Variable;
export type Stmt =
  | Block
  | Class
  | Function
  | If
  | Expression
  | Print
  | Return
  | Var
  | While;

export class Block implements Visitable<StmtVisitor> {
  constructor(public statements: Stmt[]) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitBlockStmt(this);
  }
}

export class Class implements Visitable<StmtVisitor> {
  constructor(
    public name: Token,
    public superclass: Variable | null,
    public methods: Function[],
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitClassStmt(this);
  }
}

export class Expression implements Visitable<StmtVisitor> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitExpressionStmt(this);
  }
}

export class Function implements Visitable<StmtVisitor> {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[],
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    visitor.visitFunctionStmt(this);
  }
}

export class If implements Visitable<StmtVisitor> {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt | null,
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitIfStmt(this);
  }
}

export class Print implements Visitable<StmtVisitor> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitPrintStmt(this);
  }
}

export class Return implements Visitable<StmtVisitor> {
  constructor(
    public keyword: Token,
    public value: Expr | null,
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitReturnStmt(this);
  }
}

export class Var implements Visitable<StmtVisitor> {
  constructor(
    public name: Token,
    public initializer: Expr | null,
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Visitable<StmtVisitor> {
  constructor(
    public condition: Expr,
    public body: Stmt,
  ) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitWhileStmt(this);
  }
}

// EXPRs:

export class Assign implements Visitable<ExprVisitor> {
  constructor(
    public name: Token,
    public value: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitAssignExpr(this);
  }
}

export class Get implements Visitable<ExprVisitor> {
  constructor(
    public obj: Expr,
    public name: Token,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitGetExpr(this);
  }
}

export class Set implements Visitable<ExprVisitor> {
  constructor(
    public obj: Expr,
    public name: Token,
    public value: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitSetExpr(this);
  }
}

export class This implements Visitable<ExprVisitor> {
  constructor(public keyword: Token) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitThisExpr(this);
  }
}

export class Logical implements Visitable<ExprVisitor> {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLogicalExpr(this);
  }
}

export class Binary implements Visitable<ExprVisitor> {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Call implements Visitable<ExprVisitor> {
  constructor(
    public callee: Expr,
    public paren: Token,
    public args: Expr[],
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitCallExpr(this);
  }
}

export class Grouping implements Visitable<ExprVisitor> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Visitable<ExprVisitor> {
  constructor(public value: Value) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Variable implements Visitable<ExprVisitor> {
  constructor(public name: Token) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitVariableExpr(this);
  }
}

export class Unary implements Visitable<ExprVisitor> {
  constructor(
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}

export const Expr = {
  Assign,
  Call,
  Get,
  Set,
  This,
  Logical,
  Binary,
  Grouping,
  Literal,
  Variable,
  Unary,
} as const;

export const Stmt = {
  Block,
  Class,
  Function,
  If,
  Expression,
  Print,
  Return,
  Var,
  While,
};

export type ExprVisitor<R = unknown> = {
  visitAssignExpr: (expr: Assign) => R;
  visitLogicalExpr: (expr: Logical) => R;
  visitCallExpr: (expr: Call) => R;
  visitGetExpr: (expr: Get) => R;
  visitSetExpr: (expr: Set) => R;
  visitThisExpr: (expr: This) => R;
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitVariableExpr: (expr: Variable) => R;
  visitLiteralExpr: (expr: Literal) => R;
};

export type StmtVisitor<R = unknown> = {
  visitBlockStmt: (stmt: Block) => R;
  visitClassStmt: (stmt: Class) => R;
  visitFunctionStmt: (stmt: Function) => R;
  visitIfStmt: (stmt: If) => R;
  visitExpressionStmt: (stmt: Expression) => R;
  visitPrintStmt: (stmt: Print) => R;
  visitReturnStmt: (stmt: Return) => R;
  visitVarStmt: (stmt: Var) => R;
  visitWhileStmt: (stmt: While) => R;
};
