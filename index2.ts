// Test utils
const testBlock = (name: string): void => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: unknown, b: unknown): boolean => {
    const stringA = JSON.stringify(a);
    const stringB = JSON.stringify(b);

    return stringA === stringB;
};
const test = (whatWeTest: string, actualResult: unknown, expectedResult: unknown): void => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

const getType = (value: unknown): string => {
    return typeof value;
};

const getTypesOfItems = (arr: unknown[]): string[] => {
    return arr.map((item) => getType(item));
};

const allItemsHaveTheSameType = (arr: unknown[]): boolean => {
    if (arr.length === 0) {
        return true;
    }
    const firstItemType = getType(arr[0]);
    return arr.every((item) => getType(item) === firstItemType);
};

const getRealType = (value: unknown): string => {
    if (typeof value === 'number') {
        if (isNaN(value)) {
            return 'NaN';
        } else if (value === Infinity || value === -Infinity) {
            return 'infinity';
        }
    }
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

const getRealTypesOfItems = (arr: unknown[]): string[] => {
    // Return array with real types of items of given array
    return arr.map((item) => getRealType(item));
};

const everyItemHasAUniqueRealType = (arr: unknown[]): boolean => {

    const typeMap: Map<string, number> = new Map();

    for (const item of arr) {
        const type: string = getRealType(item);
        const cnt: number = typeMap.get(type) || 0;
        typeMap.set(type, cnt + 1);
        if (cnt + 1 > 1) {
            return false;
        }
    }
    return true;
};

const countRealTypes = (arr: unknown[]): [string, number][] => {
    const typeFreq: { [key: string]: number } = {};

    for (const item of arr) {
        const type = getRealType(item);
        if (typeFreq[type]) {
            typeFreq[type] += 1;
        } else {
            typeFreq[type] = 1;
        }
    }

    const result: [string, number][] = Object.entries(typeFreq);
    result.sort((itm1, itm2) => itm1[0].localeCompare(itm2[0]));

    return result;
};
//added
testBlock('Arrays are Equal');

test('Equal arrays with nested arrays', areEqual([1, [2, 3], [4, [5, 6]]], [1, [2, 3], [4, [5, 6]]]), true);

test(
    'Equal arrays with nested arrays, string/object/number',
    areEqual([1, ['abc', {}], [4, []]], [1, ['abc', {}], [4, []]]),
    true
);

testBlock('Arrays are not Equal');

test('String array vs number array are not equal', areEqual([['1', '2']], [[1, 2]]), false);
test('Number and string are not equal', areEqual(1, '1'), false);

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

// added
test('All values have the same type', everyItemHasAUniqueRealType([{}, /[A-Z]+/, null, new Date()]), true);

test(
    'All values are numbers',
    // @ts-expect-error
    allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]),
    true
    // What the result? number, NaN (number), Infinity (number)
);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('allItemsDoNotHaveTheSameType');

test(
    'All values are not of the same type, some are strings, while one is an object',
    allItemsHaveTheSameType(['11', new String('12'), '13']),
    false
    // What the result?
    // String('12') - object
);

// added negative tests
test('NaN and null do not have the same type', allItemsHaveTheSameType([NaN, null]), false);

test('NaN and undefined do not have the same type', allItemsHaveTheSameType([NaN, undefined]), false);

test('null and undefined do not have the same type', allItemsHaveTheSameType([null, undefined]), false);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    false,
    291,
    'how are you',
    [0, 1, 2, 3],
    { id: 1, name: 'Ivan' },
    () => {},
    undefined,
    null,
    NaN,
    -1 / 0,
    new Date(),
    /[A-Za-z]+/,
    new Set([1, 3, 2]),
    new Map([
        [1, 'one'],
        [2, 'two'],
    ]),
    new Error(),
    Symbol('id'),

    // Add values of different types like boolean, object, date, NaN and so on
];

test('Check basic types', getTypesOfItems(knownTypes), [
    // What the types?
    'boolean', // false
    'number', // 291
    'string', // 'how are you'
    'object', // [0, 1, 2, 3]
    'object', // { id: 1, name: 'Ivan' }
    'function', // () => {}
    'undefined', // undefined
    'object', // null
    'number', // NaN
    'number', // -1 / 0
    'object', // new Date()
    'object', // /[A-Za-z]+/
    'object', // new Set([1, 3, 2])
    'object', // new Map([[1, 'one'], [2, 'two']])
    'object', // new Error()
    'symbol',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'infinity',
    'date',
    'regexp',
    'set',
    // What else?
    'map',
    'error',
    'symbol',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

// @ts-expect-error
test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

// added
test('All values have distinct real types', everyItemHasAUniqueRealType([{}, /[A-Z]+/, null, new Date()]), true);

test('Empty array', everyItemHasAUniqueRealType([]), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

// added
test('Array with no unique real types', countRealTypes([1, 4, 6]), [['number', 3]]);

test(
    'Count distinct types of array items with repetitions',
    countRealTypes([
        5,
        null,
        { name: 'Max' },
        [1, 2, 3],
        /[1-9]/,
        new Date(),
        false,
        undefined,
        {},
        Symbol('ui'),
        /A+/,
        'hi',
        // @ts-expect-error
        1 / 'a',
        2 - 1 === 1,
    ]),
    [
        ['array', 1],
        ['boolean', 2],
        ['date', 1],
        ['NaN', 1],
        ['null', 1],
        ['number', 1],
        ['object', 2],
        ['regexp', 2],
        ['string', 1],
        ['symbol', 1],
        ['undefined', 1],
    ]
);
