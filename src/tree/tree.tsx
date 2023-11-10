import { FC } from "react";
import useCheckboxTree, { getNodes, nodes, ProductNode } from "./util";
import { Checkbox } from "./checkbox";

export const Tree = () => {
  const [items, setItems, searchTerm, setSearchTerm, toggleCollapsed] =
    useCheckboxTree(getNodes(nodes));

  // TODO: filter items before render
  // filterItemsBeforeRender

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {items.map((node) => (
          <TreeItem
            isSearching={!!searchTerm}
            onCheck={setItems}
            key={node.id}
            node={node}
            onCollapse={toggleCollapsed}
          />
        ))}
      </ul>
    </div>
  );
};

const TreeItem: FC<{
  node: ProductNode;
  isSearching: boolean;
  onCheck: (id: number, value: boolean | "indeterminate") => void;
  onCollapse: (id: number) => void;
}> = ({ node, onCheck, onCollapse, isSearching }) => {
  const handleSelect = () => {
    onCheck(node.id, !node.checked);
  };

  const showBranch = isSearching || !node.collapsed;

  return (
    <li>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {node.isBranch && (
          <button
            style={{
              backgroundColor: "transparent",
              border: "none",
            }}
            onClick={() => onCollapse(node.id)}
          >
            +
          </button>
        )}
        <Checkbox
          checked={node.checked}
          onCheckedChange={() => {
            handleSelect();
          }}
        />
        <span>{node.label}</span>
      </div>

      {node.isBranch && showBranch && (
        <ul style={{ paddingLeft: "100px" }}>
          {node.children.map((child) => (
            <TreeItem
              onCollapse={onCollapse}
              key={child.id}
              onCheck={onCheck}
              node={child}
              isSearching={isSearching}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
