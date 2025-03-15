import { ExprVisitor, Expr } from "./ast";

export const ASTPrinter: ExprVisitor<string> = {
  visitBinaryExpr: (expr) =>
    parenthesize(expr.operator.lexeme, expr.left, expr.right),
  visitGroupingExpr: (expr) => parenthesize("group", expr.expression),
  visitUnaryExpr: (expr) => parenthesize(expr.operator.lexeme, expr.right),
  visitLiteralExpr: (expr) => {
    if (expr.value == null) {
      return "nil";
    }
    return expr.value.toString();
  },
} as ExprVisitor<string>; // TODO: Support other expr types 

function parenthesize(name: string, ...exprs: Expr[]) {
  const res = [];
  res.push("(");
  res.push(name);
  for (const expr of exprs) {
    res.push(" ");
    res.push(expr.accept(ASTPrinter));
  }
  res.push(")");

  return res.join("");
}
