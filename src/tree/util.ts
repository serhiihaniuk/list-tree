import { useState, useCallback, useMemo } from "react";

type InputValue = {
  id: number;
  label: string;
  parent: number | null;
  checked?: boolean;
};

export type ProductNode = {
  id: number;
  value: number;
  label: string;
  children: ProductNode[];
  collapsed?: boolean;
  isBranch?: boolean;
  checked: boolean | "indeterminate";
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

const useCheckboxTree = (initialNodes: ProductNode[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [nodes, setNodes] = useState<ProductNode[]>(initialNodes);

  const findNode = useCallback(
    (nodes: ProductNode[], id: number): ProductNode | undefined => {
      for (const node of nodes) {
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
    (id: number) => {
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes];
        const node = findNode(newNodes, id);
        if (node) {
          console.log(node);
          node.collapsed = !node.collapsed; // Toggle the collapsed state
        }
        return newNodes;
      });
    },
    [findNode]
  );

  const changeNodeCheck = useCallback(
    (node: ProductNode, checked: boolean | "indeterminate") => {
      node.checked = checked;
      if (checked !== "indeterminate") {
        node.children.forEach((child) => {
          changeNodeCheck(child, checked);
        });
      }
    },
    []
  );

  const updateTreeCheckStatuses = useCallback((nodes: ProductNode[]) => {
    for (const node of nodes) {
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
  }, []);

  const changeCheck = useCallback(
    (id: number, checked: boolean | "indeterminate") => {
      setNodes((prevNodes) => {
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
    () => filter(nodes, searchTerm),
    [nodes, searchTerm]
  );

  return [
    filteredNodes,
    changeCheck,
    searchTerm,
    setSearchTerm,
    toggleCollapse,
  ] as const;
};

function filter(productNodes: ProductNode[], term: string) {
  const getNodes = (result: ProductNode[], node: ProductNode) => {
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

export default useCheckboxTree;

export const getNodes = (input: InputValue[]): ProductNode[] => {
  const nodes: ProductNode[] = [];
  const map: { [key: number]: ProductNode } = {};

  input.forEach((item) => {
    const node: ProductNode = {
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
