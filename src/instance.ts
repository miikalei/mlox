import { Value } from "./ast";
import { MloxClass } from "./class";
import { RuntimeError } from "./interpreter";
import { Token } from "./token";

export class MloxInstance {
  private klass: MloxClass;
  private fields: Map<string, Value> = new Map();

  constructor(klass: MloxClass) {
    this.klass = klass;
  }

  public get(name: Token) {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme) as Value;
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) {
      return method;
    }
    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  public set(name: Token, value: Value) {
    this.fields.set(name.lexeme, value);
  }

  public toString() {
    return this.klass.name + " instance";
  }
}
