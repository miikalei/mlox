import { Token } from "./token";

interface Visitable<Visitor> {
  accept: (visitor: Visitor) => unknown;
}

export type Value = object | string | number | boolean | null;
export type Expr = Literal | Unary | Binary | Grouping | Variable;
export type Stmt = Expression | Print | Var;

export class Expression implements Visitable<StmtVisitor> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitExpressionStmt(this);
  }
}

export class Print implements Visitable<StmtVisitor> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitPrintStmt(this);
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
  Binary,
  Grouping,
  Literal,
  Variable,
  Unary,
} as const;

export const Stmt = {
  Expression,
  Print,
  Var,
};

export type ExprVisitor<R = unknown> = {
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitVariableExpr: (expr: Variable) => R;
  visitLiteralExpr: (expr: Literal) => R;
};

export type StmtVisitor<R = unknown> = {
  visitExpressionStmt: (stmt: Expression) => R;
  visitPrintStmt: (stmt: Print) => R;
  visitVarStmt: (stmt: Var) => R;
};
