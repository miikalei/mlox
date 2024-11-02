import { Function, Value } from "./ast";
import { Callable } from "./callable";
import { Environment } from "./environment";
import { MloxInstance } from "./instance";
import { Interpreter } from "./interpreter";
import { ReturnSignal } from "./return";

export class MloxFunction implements Callable {
  constructor(
    private declaration: Function,
    private closure: Environment,
    private isInitializer: boolean,
  ) {}

  get arity() {
    return this.declaration.params.length;
  }

  get name() {
    return `<fn ${this.declaration.name.lexeme}>`;
  }

  public call(interpreter: Interpreter, args: Value[]) {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err: unknown) {
      if (err instanceof ReturnSignal) {
        if (this.isInitializer) {
          return this.closure.getAt(0, "this");
        }
        return err.value;
      }
      throw err;
    }
    if (this.isInitializer) {
      return this.closure.getAt(0, "this");
    }
    return null;
  }

  public bind(instance: MloxInstance) {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new MloxFunction(this.declaration, environment, this.isInitializer);
  }
}
