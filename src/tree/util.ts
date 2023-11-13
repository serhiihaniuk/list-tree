import { useState, useCallback, useMemo } from "react";

export type CheckboxListNode = {
  id: number;
  value: number;
  label: string;
  children: CheckboxListNode[];
  collapsed?: boolean;
  isBranch?: boolean;
  checked: boolean | "indeterminate";
};
type InputValue = {
  id: number;
  label: string;
  parent: number | null;
  checked?: boolean;
};

export const nodes: InputValue[] = [
  { id: 1, label: "banana", parent: null },
  { id: 2, label: "elephant", parent: 1 },
  { id: 3, label: "apple", parent: 1 },
  { id: 4, label: "jacket", parent: 2 },
  { id: 5, label: "dog", parent: 2 },
  { id: 6, label: "grape", parent: 3 },
  { id: 7, label: "cherry", parent: 3 },
  { id: 8, label: "house", parent: null },
  { id: 9, label: "igloo", parent: 8 },
  { id: 10, label: "flower", parent: 2 },
  { id: 11, label: "elephant", parent: 2 },
];

export const getNodes = (input: InputValue[]): CheckboxListNode[] => {
  const nodes: CheckboxListNode[] = [];
  const map: { [key: number]: CheckboxListNode } = {};

  input.forEach((item) => {
    const node: CheckboxListNode = {
      id: item.id,
      value: item.id,
      label: item.label,
      children: [],
      checked: item.checked ? item.checked : false,
    };

    map[node.id] = node;

    if (item.parent !== null) {
      map[item.parent].children.push(node);
      map[item.parent].isBranch = true;
      map[item.parent].collapsed = false;
    } else {
      nodes.push(node);
    }
  });

  return nodes;
};

const useCheckboxListTree = (initialNodes: CheckboxListNode[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [treeNodes, setTreeNodes] = useState<CheckboxListNode[]>(initialNodes);

  const findNode = useCallback(
    (
      searchNodes: CheckboxListNode[],
      id: number
    ): CheckboxListNode | undefined => {
      for (const node of searchNodes) {
        if (node.id === id) {
          return node;
        }
        const found = findNode(node.children, id);
        if (found) {
          return found;
        }
      }
    },
    []
  );

  const toggleCollapse = useCallback(
    (id: number, state: boolean) => {
      setTreeNodes((prevNodes) => {
        const newNodes = [...prevNodes];
        const node = findNode(newNodes, id);
        if (node) {
          node.collapsed = state;
        }
        return newNodes;
      });
    },
    [findNode]
  );

  const changeNodeCheck = useCallback(
    (node: CheckboxListNode, checked: boolean | "indeterminate") => {
      node.checked = checked;
      if (checked !== "indeterminate") {
        node.children.forEach((child) => {
          changeNodeCheck(child, checked);
        });
      }
    },
    []
  );

  const updateTreeCheckStatuses = useCallback(
    (updateNodes: CheckboxListNode[]) => {
      for (const node of updateNodes) {
        if (node.children.length > 0) {
          updateTreeCheckStatuses(node.children);
          const checkedChildren = node.children.filter(
            (child) => child.checked === true
          );
          if (checkedChildren.length === node.children.length) {
            node.checked = true;
          } else if (
            checkedChildren.length > 0 ||
            node.children.some((child) => child.checked === "indeterminate")
          ) {
            node.checked = "indeterminate";
          } else {
            node.checked = false;
          }
        }
      }
    },
    []
  );

  const changeCheck = useCallback(
    (id: number, checked: boolean | "indeterminate") => {
      setTreeNodes((prevNodes) => {
        const newNodes = [...prevNodes];
        const node = findNode(newNodes, id);
        if (node) {
          changeNodeCheck(node, checked);
          updateTreeCheckStatuses(newNodes);
        }
        return newNodes;
      });
    },
    [findNode, changeNodeCheck, updateTreeCheckStatuses]
  );

  const filteredNodes = useMemo(
    () => filter(treeNodes, searchTerm),
    [treeNodes, searchTerm]
  );

  return [
    filteredNodes,
    changeCheck,
    searchTerm,
    setSearchTerm,
    toggleCollapse,
  ] as const;
};

function filter(productNodes: CheckboxListNode[], term: string) {
  const getNodes = (result: CheckboxListNode[], node: CheckboxListNode) => {
    if (node.label.toLowerCase().includes(term)) {
      result.push(node);
      return result;
    }
    if (node.children.length) {
      const nodes = node.children.reduce(getNodes, []);
      if (nodes.length) result.push({ ...node, children: nodes });
    }
    return result;
  };

  return productNodes.reduce(getNodes, []);
}

export default useCheckboxListTree;
