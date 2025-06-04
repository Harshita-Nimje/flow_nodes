"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { FlowNode } from "@/types/flow";

interface NodeSettingsProps {
  node: FlowNode | null;
  onSettingsChange: (
    nodeId: string,
    updates: Partial<FlowNode["data"]>
  ) => void;
  onDeleteNode: (nodeId: string) => void; 
}

export function NodeSettings({
  node,
  onSettingsChange,
  onDeleteNode,
}: NodeSettingsProps) {
  const [localNode, setLocalNode] = useState<FlowNode | null>(null);

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  if (!localNode) {
    return null;
  }

  const handleChange = (key: string, value: any) => {
    const newData = { ...localNode.data, [key]: value };
    setLocalNode({ ...localNode, data: newData });
    onSettingsChange(localNode.id, { [key]: value });
  };

  const handleTransitionChange = (index: number, value: string) => {
    const updated = [...(localNode.data.transitions || [])];
    updated[index] = value;
    handleChange("transitions", updated);
  };

  const handleAddTransition = () => {
    const updated = [...(localNode.data.transitions || []), ""];
    handleChange("transitions", updated);
  };

  const handleDeleteTransition = (index: number) => {
    const updated = [...(localNode.data.transitions || [])];
    updated.splice(index, 1);
    handleChange("transitions", updated);
  };

  const handleDeleteNode = () => {
    if (
      localNode &&
      window.confirm(
        `Are you sure you want to delete node "${localNode.data.label}"?`
      )
    ) {
      onDeleteNode(localNode.id);
    }
  };

  return (
    <div className="w-80 border-l p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Node Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={localNode.data.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                placeholder="Enter label..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instruction">Instruction</Label>
              <Textarea
                id="instruction"
                value={localNode.data.instruction || ""}
                onChange={(e) => handleChange("instruction", e.target.value)}
                placeholder="Enter instruction..."
              />
            </div>

            {localNode.type === "pressDigit" && (
              <div className="space-y-2">
                <Label htmlFor="pauseDelay">Pause Detection Delay (ms)</Label>
                <Input
                  id="pauseDelay"
                  type="number"
                  value={localNode.data.pauseDelay || 1000}
                  onChange={(e) =>
                    handleChange("pauseDelay", Number(e.target.value))
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="global">Global Node</Label>
              <Switch
                id="global"
                checked={localNode.data.isGlobal || false}
                onCheckedChange={(checked) => handleChange("isGlobal", checked)}
              />
            </div>

          
            <div className="flex items-center justify-between">
              <Label htmlFor="llm">Custom LLM</Label>
              <Switch
                id="llm"
                checked={localNode.data.customLLM || false}
                onCheckedChange={(checked) =>
                  handleChange("customLLM", checked)
                }
              />
            </div>

          
            <div className="space-y-2">
              <Label>Transition Conditions</Label>
              {(localNode.data.transitions || []).map(
                (t: string, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={t}
                      onChange={(e) =>
                        handleTransitionChange(index, e.target.value)
                      }
                      placeholder={`Condition ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete transition ${index + 1}`}
                      onClick={() => handleDeleteTransition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              )}
              <Button onClick={handleAddTransition} className="w-full">
                + Add Transition
              </Button>
            </div>

            <div className="pt-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteNode}
              >
                Delete Node
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
