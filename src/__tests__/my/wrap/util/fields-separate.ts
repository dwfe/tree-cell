//region Value

export function objValue() {
  return [{name: 'Alex'}, 'name'];
}

export function instanceValue() {
  class A {
    name = 'Alex'
  }

  return [new A(), 'name'];
}

//endregion Value


//region Getter

export function objGetter() {
  return [{
    get age() {
      return 10;
    }
  }, 'age'];
}

export function instanceGetter() {
  class A {
    get age() {
      return 10;
    }
  }

  return [new A(), 'age'];
}

//endregion Getter


//region Method

export function objMethod() {
  return [{
    full() {
      return 'hello';
    },
  }, 'full'];
}

export function instanceMethod() {
  class A {
    full() {
      return 'hello';
    }
  }

  return [new A(), 'full'];
}

//endregion Method


//region Accessor

export function objAccessor() {
  return [{
    get id() {
      return '007';
    },
    set id(value) {
    }
  }, 'id'];
}

export function instanceAccessor() {
  class A {
    get id() {
      return '007';
    }

    set id(value) {
    }
  }

  return [new A(), 'id'];
}

//endregion Accessor


//region Setter

export function objSetter() {
  return [{
    set about(value) {
    }
  }, 'about'];
}

export function instanceSetter() {
  class A {
    set about(value) {
    }
  }

  return [new A(), 'about'];
}

//endregion Setter
