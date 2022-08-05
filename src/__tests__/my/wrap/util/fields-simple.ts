// @formatter:off

export const fieldsSimple = {
  value: 'name',
  getter: 'age',
  method: 'full',
  accessor: 'id',
  setter: 'about',
};

class A {
  constructor(public name) { // value
  }
  get age() {   // getter
    return 10;
  }
  full() {      // method
    return this.name + ', ' + this.age;
  }
  get id() {    // accessor
    return '007';
  }
  set id(value) {
  }
  set about(value) { // setter
  }
}

export function fieldsObj(){
  return {
    name: 'Alex', // value
    get age() {   // getter
      return 10;
    },
    full() {      // method
      return this.name + ', ' + this.age;
    },
    get id() {    // accessor
      return '007';
    },
    set id(value) {
    },
    set about(value) { // setter
    }
  };
}

export function fieldsInstance() {
  return new A('Alex');
}
