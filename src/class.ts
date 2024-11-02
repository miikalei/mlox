import { Callable } from "./callable";
import { MloxFunction } from "./function";
import { MloxInstance } from "./instance";

export class MloxClass implements Callable {
  arity: number = 0;
  methods: Map<string, MloxFunction>;

  constructor(
    public name: string,
    methods: Map<string, MloxFunction>,
  ) {
    this.methods = methods;
  }

  public call() {
    const instance = new MloxInstance(this);
    return instance;
  }

  public findMethod(name: string) {
    return this.methods.get(name);
  }

  toString() {
    return this.name;
  }
}
