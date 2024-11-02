import { Resolver } from "./resolver";
import { Interpreter, RuntimeError } from "./interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token, TokenType } from "./token";

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

  errorToken(token: Token, message: string) {
    if (token.tokenType === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
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
