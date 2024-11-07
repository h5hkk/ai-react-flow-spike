export const P1 = {
  id: "P1",
  type: "group",
  data: { label: null },
  position: { x: 0, y: 0 },
  style: {
    width: 170,
    height: 200,
  },
};
export const P2 = {
  id: "P2",
  type: "group",
  data: { label: null },
  position: { x: 300, y: 0 },
  style: {
    width: 170,
    height: 200,
  },
};
export const C1 = {
  id: "C1",
  type: "input",
  data: { label: "child node 1" },
  position: { x: 10, y: 10 },
  parentNode: "P1",
  extent: "parent",
};
export const C2 = {
  id: "C2",
  data: { label: "child node 2" },
  position: { x: 10, y: 150 },
  parentNode: "P1",
  // extent: "parent",
};
export const C3 = {
  id: "C3",
  data: { label: "C N 3" },
  position: { x: 20, y: 190 },
};
const nodes = [P1, C1, C2, C3, P2];

export default nodes;
