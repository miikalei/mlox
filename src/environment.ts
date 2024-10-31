import { Value } from "./ast";
import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class Environment {
  enclosing: Environment | null;
  values: Map<string, Value> = new Map();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing ?? null;
  }

  public get(name: Token): Value {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }
    if (this.enclosing !== null) {
      return this.enclosing.get(name);
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

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
