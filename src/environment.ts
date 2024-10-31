import { Value } from "./ast";
import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
  values: Map<string, Value> = new Map();

  public get(name: Token) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  public define(name: string, value: Value) {
    this.values.set(name, value);
  }

  public assign(name: Token, value: Value) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
