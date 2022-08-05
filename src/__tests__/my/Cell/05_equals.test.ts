import {isEqual} from '@do-while-for-each/common';
import '@do-while-for-each/test';
import {Cell} from '../../..';

describe('05_equals', () => {

  test('just value has changed', () => {
    const a = new Cell<any>(7);
    expect(a.value).eq(7);
    a.set(2);
    expect(a.value).eq(2);
    a.set(['hello', NaN, {world: null}]);
    expect(a.value).not.eq(['hello', NaN, {world: null}]);
  });

  test('opt.equalsMapping', () => {
    const initValue = {name: 'Alex', hello: 'world', age: 17};
    const a = new Cell<any>(initValue, {equalsMapping: x => x.hello});
    expect(a.value).eq(initValue);
    expect(a.value).toHaveProperty('name', 'Alex');
    expect(a.value).toHaveProperty('hello', 'world');
    expect(a.value).toHaveProperty('age', 17);
    a.set({hello: 'world'});
    expect(a.value).eq(initValue); // hasn't changed
    a.set({name: 'Naruto', hello: 'world'});
    expect(a.value).eq(initValue); // hasn't changed
    a.set({name: 'Naruto', hello: 5});
    expect(a.value).not.eq(initValue); // changed
    expect(a.value).toHaveProperty('name', 'Naruto');
    expect(a.value).toHaveProperty('hello', 5);
    expect(a.value).not.toHaveProperty('age', 17);
  });

  test('opt.isEqual', () => {
    const initValue = ['hello', NaN, {world: null}];
    const a = new Cell<any>(initValue, {isEqual});
    expect(a.value).eq(initValue);
    a.set(['hello', NaN, {world: null}]);
    expect(a.value).eq(initValue); // hasn't changed
    expect(a.value[2]).not.toHaveProperty('world', 'hello');
    a.set(['hello', NaN, {world: 'hello'}]);
    expect(a.value).not.eq(initValue); // changed
    expect(a.value[2]).toHaveProperty('world', 'hello');
  });


  test('opt.equalsMapping, opt.isEqual', () => {
    const initValue = {name: 'Alex', hello: new Map<string, any>([['hello', 123], ['world', {data: null}]]), age: 17};
    const a = new Cell<any>(initValue, {equalsMapping: x => x.name, isEqual});
    expect(a.value).eq(initValue);
    expect(a.value).toHaveProperty('name', 'Alex');
    expect(a.value.hello.size).eq(2);
    expect(a.value).toHaveProperty('age', 17);
    a.set({name: 'Alex'});
    expect(a.value).eq(initValue); // hasn't changed
    a.set({name: 'Alex', hello: 'world'});
    expect(a.value).eq(initValue); // hasn't changed
    a.set({name: 'Naruto', hello: 5});
    expect(a.value).not.eq(initValue); // changed
    expect(a.value).toHaveProperty('name', 'Naruto');
    expect(a.value).toHaveProperty('hello', 5);
    expect(a.value).not.toHaveProperty('age', 17);
  });

});
