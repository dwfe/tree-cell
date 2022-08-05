import {createObsMap} from '@do-while-for-each/common';

//region Value

export function objValue() {
  return [{name: createObsMap()}, 'name'];
}

export function instanceValue() {
  class A {
    name = createObsMap();
  }

  return [new A(), 'name'];
}

//endregion Value
