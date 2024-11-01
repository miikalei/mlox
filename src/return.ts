import { Value } from "./ast";

export class ReturnSignal extends Error {
  value: Value;

  constructor(value: Value) {
    super();
    Object.setPrototypeOf(this, ReturnSignal.prototype);
    this.value = value;
  }
}
