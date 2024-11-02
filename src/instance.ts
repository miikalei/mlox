import { MloxClass } from "./class";

export class MloxInstance {
  private klass: MloxClass;

  constructor(klass: MloxClass) {
    this.klass = klass;
  }

  public toString() {
    return this.klass.name + " instance";
  }
}
