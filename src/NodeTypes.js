import { Handle } from "@xyflow/react";
const height = "200px";
const offsetHeight = "220px";
export let positionAbsolute = { x: 0, y: 0 };
export let parentId = undefined;
export const nodeTypes = {
  group_container: (props) => {
    const { id } = props;
    return (
      <div
        className="node_group_container"
        style={{
          zIndex: -1,
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          // width: "100%",
          height,
          opacity: 0.5,
        }}
      >
        <Handle type="source" id={id + "source"} />
        {id}
        <Handle
          type="target"
          id={id + "target"}
          style={{
            transform: `translateY(${offsetHeight})`,
          }}
        />
      </div>
    );
  },
};
