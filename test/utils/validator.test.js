const { isNotEmpty, isNotEmptyList , isNotString, isEmpty, isNotList} = require('../../src/utils/validator');

describe('isNotEmpty', () => {
  test('should return true for a non-empty string', () => {
    expect(isNotEmpty('hello')).toBe(true);
  });

  test('should return false for an empty string', () => {
    expect(isNotEmpty('')).toBe(false);
  });

  test('should return false for a null string', () => {
    expect(isNotEmpty(null)).toBe(false);
  });

  test('should return false for an undefined string', () => {
    expect(isNotEmpty(undefined)).toBe(false);
  });

  test('should return true for a whitespace-only string', () => {
    expect(isNotEmpty('   ')).toBe(false);
  });
});

describe('isNotEmptyList', () => {
  test('should return true for a non-empty list', () => {
    expect(isNotEmptyList([1, 2, 3])).toBe(true);
  });

  test('should return false for an empty list', () => {
    expect(isNotEmptyList([])).toBe(false);
  });

  test('should return false for a null list', () => {
    expect(isNotEmptyList(null)).toBe(false);
  });

  test('should return false for an undefined list', () => {
    expect(isNotEmptyList(undefined)).toBe(false);
  });
});

describe('isNotString', () => {
  test('returns false for a string', () => {
    expect(isNotString('hello')).toBe(false);
  });

  test('returns true for a number', () => {
    expect(isNotString(42)).toBe(true);
  });

  test('returns true for a boolean', () => {
    expect(isNotString(true)).toBe(true);
  });

  test('returns true for null', () => {
    expect(isNotString(null)).toBe(true);
  });

  test('returns true for undefined', () => {
    expect(isNotString(undefined)).toBe(true);
  });

  test('returns true for an object', () => {
    expect(isNotString({ key: 'value' })).toBe(true);
  });
});

describe('isEmpty', () => {
  it('should return true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for null and undefined', () => {
    expect(isEmpty(null)).toBe(false);
    expect(isEmpty(undefined)).toBe(false);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty('   hello   ')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isEmpty(123)).toBe(false);
    expect(isEmpty(true)).toBe(false);
    expect(isEmpty({})).toBe(false);
    expect(isEmpty([])).toBe(false);
  });
});

describe('isNotList', () => {
  it('should return true for non-array values', () => {
    expect(isNotList(undefined)).toBe(true);
    expect(isNotList(null)).toBe(true);
    expect(isNotList(123)).toBe(true);
    expect(isNotList('hello')).toBe(true);
    expect(isNotList({})).toBe(true);
    expect(isNotList(() => {})).toBe(true);
  });

  it('should return false for array values', () => {
    expect(isNotList([])).toBe(false);
    expect(isNotList([1, 2, 3])).toBe(false);
    expect(isNotList(['hello', 'world'])).toBe(false);
    expect(isNotList([{ name: 'Alice' }, { name: 'Bob' }])).toBe(false);
  });
});