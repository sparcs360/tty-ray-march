import { vec2 } from './vec2';

describe('constructor', () => {
  it('should store element values', () => {
    const v = new vec2(1, 2);

    expect(v.x).toEqual(1);
    expect(v.y).toEqual(2);
  });
});

describe('length', () => {
  const L141 = 1.4142135623730951;
  it.each([
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, L141],
    [0, -1, 1],
    [-1, 0, 1],
    [-1, -1, L141],
  ])('(%d,%d) should have length %d)', (x, y, expected) => {
    const v = new vec2(x, y);
    expect(v.length()).toEqual(expected);
  });
});
