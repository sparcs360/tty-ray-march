import { vec2 } from './vec2';
import { vec3 } from './vec3';

describe('constructor', () => {
  describe('3 scalars', () => {
    it('should store element values', () => {
      const v = new vec3(1, 2, 3);

      expect(v.x).toEqual(1);
      expect(v.y).toEqual(2);
      expect(v.z).toEqual(3);
    });
  });
  describe('vec2 and 1 scalar', () => {
    it('should store element values', () => {
      const v = new vec3(new vec2(1, 2), 3);

      expect(v.x).toEqual(1);
      expect(v.y).toEqual(2);
      expect(v.z).toEqual(3);
    });
  });
  describe('vec3', () => {
    it('should store element values', () => {
      const v = new vec3(new vec3(1, 2, 3));

      expect(v.x).toEqual(1);
      expect(v.y).toEqual(2);
      expect(v.z).toEqual(3);
    });
  });
});

describe('add', () => {
  const v = new vec3(1, 2, 3).add(new vec3(-1, 2, -4));

  expect(v).toEqual(new vec3(0, 4, -1));
});

describe('sub', () => {
  const v = new vec3(1, 2, 3).sub(new vec3(-1, 2, -4));

  expect(v).toEqual(new vec3(2, 0, 7));
});

describe('mul', () => {
  const v = new vec3(1, 2, 3).mul(10);

  expect(v).toEqual(new vec3(10, 20, 30));
});

describe('length', () => {
  const L141 = 1.4142135623730951;
  const L173 = 1.7320508075688772;
  it.each([
    [0, 0, 0, 0],
    [0, 0, 1, 1],
    [0, 1, 0, 1],
    [0, 1, 1, L141],
    [1, 0, 0, 1],
    [1, 0, 1, L141],
    [1, 1, 0, L141],
    [1, 1, 1, L173],
    [0, 0, -1, 1],
    [0, -1, 0, 1],
    [0, -1, -1, L141],
    [-1, 0, 0, 1],
    [-1, 0, -1, L141],
    [-1, -1, 0, L141],
    [-1, -1, -1, L173],
  ])('(%d,%d,%d) should have length %d)', (x, y, z, expected) => {
    const v = new vec3(x, y, z);
    expect(v.length()).toEqual(expected);
  });
});

describe('normalise', () => {
  const L707 = 0.7071067811865475;
  const L577 = 0.5773502691896258;
  it.each([
    [0, 0, 0, new vec3(0, 0, 0)],
    [0, 0, 1, new vec3(0, 0, 1)],
    [0, 1, 0, new vec3(0, 1, 0)],
    [0, 1, 1, new vec3(0, L707, L707)],
    [1, 0, 0, new vec3(1, 0, 0)],
    [1, 0, 1, new vec3(L707, 0, L707)],
    [1, 1, 0, new vec3(L707, L707, 0)],
    [1, 1, 1, new vec3(L577, L577, L577)],
    [0, 0, -1, new vec3(0, 0, -1)],
    [0, -1, 0, new vec3(0, -1, 0)],
    [0, -1, -1, new vec3(0, -L707, -L707)],
    [-1, 0, 0, new vec3(-1, 0, 0)],
    [-1, 0, -1, new vec3(-L707, 0, -L707)],
    [-1, -1, 0, new vec3(-L707, -L707, 0)],
    [-1, -1, -1, new vec3(-L577, -L577, -L577)],
    [0, 1, -1, new vec3(0, L707, -L707)],
    [0, -1, 1, new vec3(0, -L707, L707)],
    [1, 0, -1, new vec3(L707, 0, -L707)],
    [-1, 0, 1, new vec3(-L707, 0, L707)],
    [1, 1, -1, new vec3(L577, L577, -L577)],
    [1, -1, 1, new vec3(L577, -L577, L577)],
    [1, -1, -1, new vec3(L577, -L577, -L577)],
    [-1, 1, 1, new vec3(-L577, L577, L577)],
    [-1, 1, -1, new vec3(-L577, L577, -L577)],
    [-1, -1, 1, new vec3(-L577, -L577, L577)],
  ])('(%d,%d,%d) should have length %d)', (x, y, z, expected) => {
    const v = new vec3(x, y, z);
    expect(v.normalise()).toEqual(expected);
  });
});

describe('dot', () => {
  const v1 = new vec3(1, 2, 3);
  const v2 = new vec3(-1, 2, -4);

  expect(v1.dot(v2)).toEqual(-9);
});
