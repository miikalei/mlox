import { ASTVisitor, Expr } from "./ast";

export const ASTPrinter: ASTVisitor<string> = {
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
};

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
