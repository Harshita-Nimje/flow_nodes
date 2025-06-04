"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { NodePalette } from "./sidebar/node-palette";
import { NodeSettings } from "./sidebar/node-settings";
import { ConversationNode } from "./nodes/conversation-node";
import { FunctionNode } from "./nodes/function-node";
import { CallTransferNode } from "./nodes/call-transfer-node";
import { PressDigitNode } from "./nodes/press-digit-node";
import { EndingNode } from "./nodes/ending-node";
import { v4 as uuidv4 } from "uuid";
import type { FlowNode, NodeType } from "@/types/flow";

const nodeTypes = {
  conversation: ConversationNode,
  function: FunctionNode,
  callTransfer: CallTransferNode,
  pressDigit: PressDigitNode,
  ending: EndingNode,
};

const LOCAL_STORAGE_KEY = "flow-editor-state";

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [lastNodePosition, setLastNodePosition] = useState({ x: 100, y: 100 });
  const [edgeToDelete, setEdgeToDelete] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const [confirmDeleteNodeId, setConfirmDeleteNodeId] = useState<string | null>(
    null
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(stored);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
    }
  }, []);

  useEffect(() => {
    setSaveStatus("saving");

    const timeout = setTimeout(() => {
      const data = JSON.stringify({ nodes, edges });
      localStorage.setItem(LOCAL_STORAGE_KEY, data);
      setSaveStatus("saved");
      setLastSavedTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 600); 

    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const id = uuidv4();
      const newNode: FlowNode = {
        id,
        type,
        position: {
          x: lastNodePosition.x + 50,
          y: lastNodePosition.y + 50,
        },
        data: {
          label: `New ${type} Node`,
          instruction: "",
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setLastNodePosition((pos) => ({
        x: pos.x + 50,
        y: pos.y + 50,
      }));
    },
    [lastNodePosition]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as FlowNode);
    setEdgeToDelete(null);
  }, []);

  const handleSettingsChange = useCallback(
    (nodeId: string, updates: Partial<FlowNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              }
            : node
        )
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId
          ? { ...prev, data: { ...prev.data, ...updates } }
          : prev
      );
    },
    []
  );

  const requestDeleteNode = useCallback((nodeId: string) => {
    setConfirmDeleteNodeId(nodeId);
  }, []);

  const confirmDeleteNode = useCallback(() => {
    if (!confirmDeleteNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== confirmDeleteNodeId));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== confirmDeleteNodeId && e.target !== confirmDeleteNodeId
      )
    );
    setSelectedNode((prev) => (prev?.id === confirmDeleteNodeId ? null : prev));
    setConfirmDeleteNodeId(null);
  }, [confirmDeleteNodeId]);

  const cancelDeleteNode = useCallback(() => {
    setConfirmDeleteNodeId(null);
  }, []);

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setEdgeToDelete({
      id: edge.id,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
      },
    });
    setSelectedNode(null);
  }, []);

  const handleDeleteEdge = useCallback(() => {
    if (!edgeToDelete) return;
    setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete.id));
    setEdgeToDelete(null);
  }, [edgeToDelete, setEdges]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setEdgeToDelete(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        if (confirmDeleteNodeId) {
          confirmDeleteNode();
        } else if (selectedNode) {
          requestDeleteNode(selectedNode.id);
        } else if (edgeToDelete) {
          handleDeleteEdge();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNode,
    confirmDeleteNodeId,
    requestDeleteNode,
    confirmDeleteNode,
    edgeToDelete,
    handleDeleteEdge,
  ]);

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.nodes && json.edges) {
          setNodes(json.nodes);
          setEdges(json.edges);
          setSelectedNode(null);
          setEdgeToDelete(null);
        } else {
          alert("Invalid flow JSON file format.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className={`flex h-screen relative ${darkMode ? "dark" : ""}`}>
      <NodePalette onAddNode={handleAddNode} />

      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
        <div
          className={`
            px-4 py-1 rounded-md text-sm font-medium shadow-md
            ${
              saveStatus === "saving"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }
          `}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : lastSavedTime
            ? `Last saved at ${lastSavedTime}`
            : "Changes saved"}
        </div>
      </div>

      <div className="flex-1 h-full relative">
        <div className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-900 shadow-lg rounded-md flex gap-3 p-3 border border-gray-300 dark:border-gray-700 select-none items-center">
          <button
            onClick={handleExport}
            className="
      bg-gradient-to-r from-blue-600 to-blue-500
      text-white
      px-5 py-2
      rounded-md
      font-semibold
      shadow-md
      hover:from-blue-700 hover:to-blue-600
      transition
      duration-300
      ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
    "
          >
            Export JSON
          </button>

          <label
            htmlFor="import-json"
            className="
      bg-gradient-to-r from-green-600 to-green-500
      text-white
      px-5 py-2
      rounded-md
      font-semibold
      shadow-md
      cursor-pointer
      hover:from-green-700 hover:to-green-600
      transition
      duration-300
      ease-in-out
      focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1
      select-none
    "
          >
            Import JSON
          </label>
          <input
            id="import-json"
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold select-none"
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12H3m15.36 4.95l-.71-.71M6.34 7.05l-.71-.71m12.02 0l-.71.71M6.34 16.95l-.71.71M12 7a5 5 0 000 10 5 5 0 000-10z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="none"
              >
                <path d="M21.752 15.002A9 9 0 1112 3v0a7 7 0 009.752 12.002z" />
              </svg>
            )}
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="h-full"
        >
          <Background />
          <Controls />
        </ReactFlow>

        {edgeToDelete && (
          <button
            style={{
              position: "absolute",
              top: edgeToDelete.position.y,
              left: edgeToDelete.position.x,
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              userSelect: "none",
            }}
            onClick={handleDeleteEdge}
          >
            Delete
          </button>
        )}
      </div>

      {selectedNode && (
        <NodeSettings
          node={selectedNode}
          onSettingsChange={handleSettingsChange}
          onDeleteNode={() => requestDeleteNode(selectedNode.id)}
        />
      )}

      {confirmDeleteNodeId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-sm w-full shadow-lg flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Are you sure you want to delete this node?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteNode}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-semibold transition"
              >
                Delete
              </button>
              <button
                onClick={cancelDeleteNode}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
