import assert from "assert";
import { Interpreter, RuntimeError } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

export class Run {
  interpreter = new Interpreter(this.runtimeError);
  hadError = false;
  hadRuntimeError = false;

  runProgram(source: string) {
    this.run(source);
    if (this.hadError) {
      process.exit(65);
    }
    if (this.hadRuntimeError) {
      process.exit(70);
    }
  }

  runLine(line: string) {
    this.run(line);
    this.hadError = false;
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  runtimeError(error: RuntimeError) {
    console.log(error.message + "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }

  private report(line: number, where: string, message: string) {
    console.error(`[Line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  run(source: string) {
    const scanner = new Scanner(source, this.error.bind(this));
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, this.report.bind(this));
    const expr = parser.parse();

    if (this.hadError) {
      return;
    }
    assert(expr);

    this.interpreter.interpret(expr);
  }
}
