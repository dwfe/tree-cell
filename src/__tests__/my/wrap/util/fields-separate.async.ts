//region Value

export function objValue() {
  return [{name: new Promise(resolve => resolve('Alex'))}, 'name'];
}

export function instanceValue() {
  class A {
    name = new Promise(resolve => resolve('Alex'))
  }

  return [new A(), 'name'];
}

//endregion Value


//region Method

export function objMethod() {
  return [{
    async full() {
      return 'hello';
    },
  }, 'full'];
}

export function instanceMethod() {
  class A {
    async full() {
      return 'hello';
    }
  }

  return [new A(), 'full'];
}

//endregion Method
