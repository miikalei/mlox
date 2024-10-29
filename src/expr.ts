import { Token } from "./token";

interface Visitable {
  accept: (visitor: ASTVisitor<unknown>) => unknown;
}

export type Value = object | string | number | boolean | null;
export type Expr = Literal | Unary | Binary | Grouping;

export class Binary implements Visitable {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ASTVisitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping implements Visitable {
  constructor(public expression: Expr) {}

  public accept<R>(visitor: ASTVisitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Visitable {
  constructor(public value: Value) {}

  public accept<R>(visitor: ASTVisitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary implements Visitable {
  constructor(
    public operator: Token,
    public right: Expr,
  ) {}

  public accept<R>(visitor: ASTVisitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}

export const Expr = {
  Binary,
  Grouping,
  Literal,
  Unary,
} as const;

export type ASTVisitor<R> = {
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitLiteralExpr: (expr: Literal) => R;
};
