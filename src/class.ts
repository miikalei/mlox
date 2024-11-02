import { Value } from "./ast";
import { Callable } from "./callable";
import { MloxFunction } from "./function";
import { MloxInstance } from "./instance";
import { Interpreter } from "./interpreter";

export class MloxClass implements Callable {
  arity: number = 0;
  methods: Map<string, MloxFunction>;

  constructor(
    public name: string,
    methods: Map<string, MloxFunction>,
  ) {
    this.methods = methods;
    const initializer = this.findMethod("init");
    if (initializer) {
      this.arity = initializer.arity;
    }
  }

  public call(interpreter: Interpreter, args: Value[]) {
    const instance = new MloxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  public findMethod(name: string) {
    return this.methods.get(name);
  }

  toString() {
    return this.name;
  }
}
