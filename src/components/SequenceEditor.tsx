/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SequenceStep, Routine, ServoState } from "../types";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Play, Save, Plus, Trash2, Clock, MoveHorizontal } from "lucide-react";
import { Badge } from "./ui/badge";

interface SequenceEditorProps {
  currentAngles: number[];
  onPlayRoutine: (routine: Routine) => void;
  onSaveRoutine: (routine: Routine) => void;
}

export const SequenceEditor: React.FC<SequenceEditorProps> = ({ 
  currentAngles, 
  onPlayRoutine,
  onSaveRoutine 
}) => {
  const [steps, setSteps] = React.useState<SequenceStep[]>([]);
  const [name, setName] = React.useState("New Sequence");

  const addStep = () => {
    const newStep: SequenceStep = {
      id: Math.random().toString(36).substr(2, 9),
      angles: [...currentAngles],
      duration: 1000,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStepDuration = (id: string, duration: number) => {
    setSteps(steps.map(s => s.id === id ? { ...s, duration } : s));
  };

  const handleSave = () => {
    if (steps.length === 0) return;
    onSaveRoutine({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: `Custom sequence with ${steps.length} steps`,
      steps: [...steps],
    });
    setSteps([]);
    setName("New Sequence");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 border-bottom border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <MoveHorizontal className="w-4 h-4 text-zinc-400" />
          </div>
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-zinc-200 focus:outline-none focus:ring-0 w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[10px] uppercase font-bold border-zinc-700 hover:bg-zinc-800"
            onClick={() => onPlayRoutine({ id: 'temp', name, description: '', steps })}
            disabled={steps.length === 0}
          >
            <Play className="w-3 h-3 mr-1" /> Preview
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-[10px] uppercase font-bold bg-white text-black hover:bg-zinc-200"
            onClick={handleSave}
            disabled={steps.length === 0}
          >
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="group flex items-center gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all">
              <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-zinc-900 text-[10px] font-mono text-zinc-500">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="flex-1 grid grid-cols-6 gap-1">
                {step.angles.map((angle, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[8px] text-zinc-600 uppercase font-mono">S{i+1}</span>
                    <span className="text-[10px] font-mono text-zinc-300">{angle}°</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <input 
                    type="number"
                    value={step.duration}
                    onChange={(e) => updateStepDuration(step.id, Number(e.target.value))}
                    className="w-12 bg-transparent border-none text-[10px] font-mono text-zinc-300 focus:outline-none p-0"
                  />
                  <span className="text-[8px] text-zinc-600 uppercase font-mono">ms</span>
                </div>
                <button 
                  onClick={() => removeStep(step.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-600 space-y-2">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                <Plus className="w-6 h-6 opacity-20" />
              </div>
              <p className="text-xs uppercase tracking-widest font-mono">No steps recorded</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
        <Button 
          onClick={addStep}
          className="w-full h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Record Current Position
        </Button>
      </div>
    </div>
  );
};
