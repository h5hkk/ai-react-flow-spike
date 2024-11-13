export const NodeHeight = 54;
const group = Array(3)
  .fill("")
  .map((_, index) => ({
    id: `G${index + 1}`,
    type: "group_container",
    position: { x: (index - 1) * 300, y: -(index % 2) * 300 },
    style: {
      width: 170,
    },
  }));
const _nodes = [
  ...group,
  {
    id: "G1-1",
    data: { label: "Child Node 1" },
    position: { x: 10, y: 50 },
    parentId: "G1",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G1-2",
    data: { label: "Child Node 2" },
    position: { x: 10, y: 220 },
    parentId: "G1",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G2-1",
    data: { label: "Child 1" },
    position: { x: 50, y: 40 },
    parentId: "G2",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G2-2",
    data: { label: "Child 2" },
    position: { x: 10, y: 90 },
    parentId: "G2",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G2-3",
    data: { label: "Child 3" },
    /**相对parent的position */
    position: { x: 100, y: 150 },
    parentId: "G2",
    /**限定在parent内部 */
    extent: "parent",
    style: {
      width: 170,
    },
  },

  {
    id: "test",
    position: { x: 200, y: 130 },
    style: {
      width: 170,
    },
    data: { label: "Node Test" },
  },
];
export default _nodes;
