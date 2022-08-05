import {recognizePropType} from '@do-while-for-each/common';
import {IAnnotation} from './contract';

export function checkPossibilityOfUsing(
  obj: any,
  prop: string | symbol,
  descriptor: PropertyDescriptor,
  annotation: IAnnotation,
): void {
  const propType = recognizePropType(descriptor);
  const info = [`See property '${String(prop)}' for object:`, obj];

  if (propType === 'accessor' || propType === 'setter') {
    const message = `It's forbidden to annotate properties that have a setter.`;
    console.error(message, ...info);
    throw new Error(message);
  }
  //
  // below are only: method | value | getter
  //
  if (annotation === 'asyncCell' && propType === 'getter') {
    console.error(`The 'asyncCell' annotation cannot be set for a getter.`, ...info);
    throw new Error(`Incorrect use of annotation 'asyncCell'`);
  }
  if (annotation === 'obsValueCell' && propType !== 'value') {
    console.error(`The 'obsValueCell' annotation can only be set on a value-based-property.`, ...info);
    throw new Error(`Incorrect use of annotation 'obsValueCell'`);
  }
}
