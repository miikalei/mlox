import { assert } from "./utils";
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

  public getAt(depth: number, name: string): Value {
    const value = this.ancestor(depth).values.get(name);
    assert(
      value !== undefined,
      "Unexpectedly found no value from the resolved scope.",
    );
    return value;
  }

  public assignAt(depth: number, name: Token, value: Value) {
    this.ancestor(depth).values.set(name.lexeme, value);
  }

  private ancestor(depth: number) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let environment: Environment = this;
    for (let i = 0; i < depth; i++) {
      assert(
        environment.enclosing !== null,
        "Unexpected: resolved scope depth too high.",
      );
      environment = environment.enclosing;
    }
    return environment;
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
