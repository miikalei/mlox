import { Resolver } from "./resolver";
import { Interpreter, RuntimeError } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token, TokenType } from "./token";

export class Run {
  hadError = false;
  hadRuntimeError = false;

  interpreter: Interpreter;
  stdOut: (output: string) => void;
  errOut: (output: string) => void;

  constructor(stdOut?: (output: string) => void, errOut?: (output: string) => void) {
    this.stdOut = stdOut ?? console.log;
    this.errOut = errOut ?? console.error;
    this.interpreter = new Interpreter(this.runtimeError.bind(this), this.stdOut.bind(this));
  }

  runProgram(source: string) {
    this.run(source);
    if (this.hadError) {
      return 65; // Error code
    }
    if (this.hadRuntimeError) {
      return 70; // Error code
    }
    return 0;
  }

  runLine(line: string) {
    this.run(line);
    this.hadError = false;
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  errorToken(token: Token, message: string) {
    if (token.tokenType === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  runtimeError(error: RuntimeError) {
    this.errOut(`[Line ${error.token.line}] Error at ${error.token.lexeme}: ${error.message}`)
    this.hadRuntimeError = true;
  }

  private report(line: number, where: string, message: string) {
    this.errOut(`[Line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  run(source: string) {
    const scanner = new Scanner(source, this.error.bind(this));
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, this.errorToken.bind(this));
    const statements = parser.parse();

    if (this.hadError) {
      return;
    }
    const resolver = new Resolver(this.interpreter, this.errorToken.bind(this));
    resolver.resolveMany(statements);

    if (this.hadError) {
      return;
    }

    this.interpreter.interpret(statements);
  }
}
