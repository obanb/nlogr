import { generator } from './generator.js';
import { Expression } from './types.js';
import { expressionParser } from './expression_parser.js';

type JsonPrimitive = string | number | boolean | null;

// the order depends

const reflectAndGenerate = (schema: Record<string, JsonPrimitive>) => {
  Object.entries(schema).map(([key, elem]) => {
    if (isNotEmptyPrimitiveArray(elem)) {
      console.log('primitivni pole')
      elem.forEach((item, i) => {
         elem[i] = generator.generateFromJsonPrimitive(item)
      });
      return elem;
    } else if (isNotEmptyObjectArray(elem)) {
      return elem.forEach(reflectAndGenerate);
    } else if (isNonNullableObject(elem)) {
      return reflectAndGenerate(elem as any);
    } else if (isJsonPrimitive(elem)) {
      if (isExpression(elem)) {
        schema[key] = expressionParser.proceed(elem) as any
      } else {
        schema[key] = generator.generateFromJsonPrimitive(elem);
      }
    }
  });
  return schema;
};

const isExpression = (elem: unknown): elem is Expression => {
  if(isString(elem)) {
    return elem.startsWith('#')
  }
  return false
}

const isJsonPrimitive = (elem: unknown): elem is JsonPrimitive =>
  isNumber(elem) || isString(elem) || isBoolean(elem) || elem === null;

const isNotEmptyPrimitiveArray = (elem: unknown): elem is JsonPrimitive[] => {
  if (Array.isArray(elem)) {
    const elem0 = elem[0];

    if (isJsonPrimitive(elem0)) {
      return true;
    }
  }

  return false;
};

const isNotEmptyObjectArray = (
  elem: unknown,
): elem is Record<string, unknown>[] => {
  if (Array.isArray(elem)) {
    const elem0 = elem[0];

    if (elem0 && !Array.isArray(elem0) && isNonNullableObject(elem0)) {
      return true;
    }
  }

  return false;
};

const isNumber = (val: unknown): val is 'number' => typeof val === 'number';
const isString = (val: unknown): val is 'string' => typeof val === 'string';
const isNumberString = (val: unknown): val is 'numberString' =>
  isString(val) && parseFloat(val) == (val as unknown);
const isDateString = (val: unknown): val is 'dateString' =>
  isString(val) && !isNaN(Date.parse(val));
const isNull = (val: unknown): val is 'null' => val === null;
const isBoolean = (val: unknown): val is 'boolean' => typeof val === 'boolean';

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object';

const isNonNullableObject = (val: unknown): val is Record<string, JsonPrimitive> =>
  typeof val === 'object' && val !== null;

export const reflection = {
  reflectAndGenerate,
  isString,
  isNumber,
  isNumberString,
  isDateString,
  isNull,
  isBoolean,
  isObject,
  isNonNullableObject,
  isNotEmptyObjectArray
};
