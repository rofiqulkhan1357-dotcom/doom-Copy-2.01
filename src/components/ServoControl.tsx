/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ServoState } from "../types";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Settings2, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ServoControlProps {
  servo: ServoState;
  onChange: (id: number, updates: Partial<ServoState>) => void;
}

export const ServoControl: React.FC<ServoControlProps> = ({ servo, onChange }) => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 group transition-all hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Servo {servo.id + 1}</span>
          <h3 className="text-sm font-medium text-zinc-200">{servo.name}</h3>
        </div>
        <div className="flex items-center gap-2">
           <input 
            type="number"
            value={Math.round(servo.angle)}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                onChange(servo.id, { angle: Math.max(servo.minAngle, Math.min(servo.maxAngle, val)) });
              }
            }}
            className="w-16 bg-transparent text-lg font-mono font-bold text-white tabular-nums text-right border-none focus:ring-0 p-0"
           />
           <span className="text-lg font-mono font-bold text-zinc-500">°</span>
           <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
           >
             <Settings2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[servo.angle]}
          min={servo.minAngle}
          max={servo.maxAngle}
          step={1}
          onValueChange={(val) => {
            const angle = Array.isArray(val) ? val[0] : val;
            onChange(servo.id, { angle });
          }}
          className="py-4"
        />
        <div className="flex justify-between text-[10px] font-mono text-zinc-600">
          <span>{servo.minAngle}°</span>
          <span>{servo.maxAngle}°</span>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-2 border-t border-zinc-800 mt-2"
          >
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-zinc-500">Speed</Label>
                <Input 
                  type="number" 
                  value={servo.speed} 
                  onChange={(e) => onChange(servo.id, { speed: Number(e.target.value) })}
                  className="h-8 bg-zinc-950 border-zinc-800 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-zinc-500">Accel</Label>
                <Input 
                  type="number" 
                  value={servo.acceleration} 
                  onChange={(e) => onChange(servo.id, { acceleration: Number(e.target.value) })}
                  className="h-8 bg-zinc-950 border-zinc-800 text-xs font-mono"
                />
              </div>
            </div>
            <button 
              onClick={() => onChange(servo.id, { angle: 90 })}
              className="w-full mt-2 py-1.5 flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-all"
            >
              <RotateCw className="w-3 h-3" />
              Reset to Center
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
