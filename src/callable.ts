import { Value } from "./ast";
import { Interpreter } from "./interpreter";

export class Callable {
  name: string;
  arity: number;

  call: (interpreter: Interpreter, args: Value[]) => Value;

  constructor(
    name: string,
    arity: number,
    call: (interpreter: Interpreter, args: Value[]) => Value,
  ) {
    this.name = name;
    this.arity = arity;
    this.call = call;
  }
}

export function isCallable(value: Value) {
  return typeof value === "object" && value !== null && "arity" in value;
}
