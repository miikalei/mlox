import { Scanner } from "./scanner";

export class Run {
  hadError = false;

  runProgram(source: string) {
    this.run(source);
    if (this.hadError) {
      process.exit(65);
    }
  }

  runLine(line: string) {
    this.run(line);
    this.hadError = false;
  }

  error(line: number, message: string) {
    console.log("Type:", typeof this.report);
    this.report(line, "", message);
  }

  private report(line: number, where: string, message: string) {
    console.error(`[Line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  run(source: string) {
    const scanner = new Scanner(source, this.error.bind(this));
    const tokens = scanner.scanTokens();

    for (const token of tokens) {
      console.log(token);
    }
  }
}
