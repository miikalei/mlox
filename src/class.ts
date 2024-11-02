import { Callable } from "./callable";
import { MloxInstance } from "./instance";

export class MloxClass implements Callable {
  arity: number = 0;
  constructor(public name: string) {}

  public call() {
    const instance = new MloxInstance(this);
    return instance;
  }

  toString() {
    return this.name;
  }
}
