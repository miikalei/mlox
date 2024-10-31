import { Token } from "./token";

interface Visitable<Visitor> {
  accept: (visitor: Visitor) => unknown;
}

export type Value = object | string | number | boolean | null;
export type Expr = Literal | Unary | Binary | Grouping;
export type Stmt = Expression | Print;

export class Expression<R = unknown> implements Visitable<StmtVisitor<R>> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitExpressionExpr(this);
  }
}

export class Print<R = unknown> implements Visitable<StmtVisitor<R>> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitPrintExpr(this);
  }
}

export class Binary<R = unknown> implements Visitable<ExprVisitor<R>> {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping<R = unknown> implements Visitable<ExprVisitor<R>> {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal<R = unknown> implements Visitable<ExprVisitor<R>> {
  constructor(public value: Value) {}

  public accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary<R = unknown> implements Visitable<ExprVisitor<R>> {
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
  Unary,
} as const;

export const Stmt = {
  Expression,
  Print,
};

export type ExprVisitor<R> = {
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitUnaryExpr: (expr: Unary<R>) => R;
  visitLiteralExpr: (expr: Literal) => R;
};

export type StmtVisitor<R> = {
  visitExpressionExpr: (stmt: Expression) => R;
  visitPrintExpr: (stmt: Print) => R;
};
