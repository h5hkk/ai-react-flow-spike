const _nodes = [
  {
    id: "G1",
    type: "group_container",
    position: { x: 0, y: 0 },
    style: {
      width: 170,
    },
  },
  {
    id: "G1-1",
    data: { label: "Child Node 1" },
    position: { x: 10, y: 30 },
    parentId: "G1",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G1-2",
    data: { label: "Child Node 2" },
    position: { x: 10, y: 90 },
    parentId: "G1",
    extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G2",
    type: "group_container",
    position: { x: -200, y: 230 },
    data: null,
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
    position: { x: 100, y: 120 },
    parentId: "G2",
    /**限定在parent内部 */
    // extent: "parent",
    style: {
      width: 170,
    },
  },
  {
    id: "G3",
    type: "group_container",
    position: { x: 100, y: 230 },
    style: {
      width: 170,
    },
    data: { label: "Node C" },
  },
];
export default _nodes;
