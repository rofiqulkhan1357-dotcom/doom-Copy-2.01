/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ServoState, ArmModel, Routine, SequenceStep } from "./types";
import { DEFAULT_ARM_MODELS, PREMADE_ROUTINES } from "./constants";
import { ArmVisualizer } from "./components/ArmVisualizer";
import { ServoControl } from "./components/ServoControl";
import { SequenceEditor } from "./components/SequenceEditor";
import { 
  Cpu, 
  Library, 
  Play, 
  Settings, 
  Terminal, 
  Activity,
  ChevronRight,
  Box,
  Save,
  Trash2,
  Usb
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ScrollArea } from "./components/ui/scroll-area";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { serialService } from "./services/serialService";

export default function App() {
  const [currentModel, setCurrentModel] = React.useState<ArmModel>(DEFAULT_ARM_MODELS[0]);
  const [servos, setServos] = React.useState<ServoState[]>(DEFAULT_ARM_MODELS[0].servos);
  const [customRoutines, setCustomRoutines] = React.useState<Routine[]>([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [activeRoutineId, setActiveRoutineId] = React.useState<string | null>(null);
  const [isSerialConnected, setIsSerialConnected] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedSteps, setRecordedSteps] = React.useState<SequenceStep[]>([]);

  // Load custom routines from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("robo-routines");
    if (saved) {
      try {
        setCustomRoutines(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load routines", e);
      }
    }
  }, []);

  const saveRoutines = (routines: Routine[]) => {
    setCustomRoutines(routines);
    localStorage.setItem("robo-routines", JSON.stringify(routines));
  };

  const handleServoChange = (id: number, updates: Partial<ServoState>) => {
    setServos(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    
    // Send to hardware if connected
    if (isSerialConnected && updates.angle !== undefined) {
      serialService.sendServoAngle(id, updates.angle);
    }
  };

  const handleConnectSerial = async () => {
    try {
      if (isSerialConnected) {
        await serialService.disconnect();
        setIsSerialConnected(false);
      } else {
        const success = await serialService.connect();
        setIsSerialConnected(success);
      }
    } catch (error) {
      console.error("Serial connection error:", error);
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = DEFAULT_ARM_MODELS.find(m => m.id === modelId);
    if (model) {
      setCurrentModel(model);
      setServos(model.servos);
    }
  };

  const playRoutine = async (routine: Routine) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActiveRoutineId(routine.id);

    // Get initial angles
    let currentAngles = servos.map(s => s.angle);

    for (const step of routine.steps) {
      const startAngles = [...currentAngles];
      const targetAngles = step.angles;
      const duration = Math.max(step.duration, 1); // Prevent division by zero
      const startTime = performance.now();

      // Interpolation loop
      while (true) {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Calculate interpolated angles
        const nextAngles = startAngles.map((start, i) => {
          const target = targetAngles[i];
          return start + (target - start) * progress;
        });

        // Update state and hardware
        setServos(prev => prev.map((s, i) => {
          const newAngle = nextAngles[i];
          if (isSerialConnected) {
            serialService.sendServoAngle(s.id, newAngle);
          }
          return { ...s, angle: newAngle };
        }));

        currentAngles = nextAngles;

        if (progress >= 1) break;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    }

    setIsPlaying(false);
    setActiveRoutineId(null);
  };

  const deleteRoutine = (id: string) => {
    saveRoutines(customRoutines.filter(r => r.id !== id));
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and save
      if (recordedSteps.length > 0) {
        const newRoutine: Routine = {
          id: Math.random().toString(36).substr(2, 9),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          description: `Live capture with ${recordedSteps.length} steps`,
          steps: [...recordedSteps],
        };
        saveRoutines([...customRoutines, newRoutine]);
      }
      setIsRecording(false);
      setRecordedSteps([]);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordedSteps([]);
    }
  };

  // Recording loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        const newStep: SequenceStep = {
          id: Math.random().toString(36).substr(2, 9),
          angles: servos.map(s => s.angle),
          duration: 100, // 10Hz recording
        };
        setRecordedSteps(prev => [...prev, newStep]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, servos]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tighter">RoboControl Studio</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] h-4 border-zinc-700 text-zinc-500 uppercase">v1.0.4-stable</Badge>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-zinc-500 uppercase font-mono">System Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-mono text-zinc-600 uppercase">Active Model</span>
             <select 
              className="bg-transparent text-xs font-mono text-zinc-300 border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
              value={currentModel.id}
              onChange={(e) => handleModelChange(e.target.value)}
             >
               {DEFAULT_ARM_MODELS.map(m => (
                 <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
               ))}
             </select>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <Button 
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={toggleRecording}
            className={`gap-2 text-[10px] uppercase font-bold ${isRecording ? 'animate-pulse' : 'border-zinc-700 text-zinc-400'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
            {isRecording ? "Stop Recording" : "Live Record"}
          </Button>
          <div className="h-8 w-px bg-zinc-800" />
          <Button 
            variant={isSerialConnected ? "default" : "outline"}
            size="sm"
            onClick={handleConnectSerial}
            className={`gap-2 text-[10px] uppercase font-bold ${isSerialConnected ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' : 'border-zinc-700 text-zinc-400'}`}
          >
            <Usb className="w-3.5 h-3.5" />
            {isSerialConnected ? "Hardware Connected" : "Connect Hardware"}
          </Button>
          <div className="h-8 w-px bg-zinc-800" />
          <button className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Column: Visualizer & Library */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Visualizer Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Telemetry & Visualization</h2>
              </div>
              <div className="flex gap-4 text-[10px] font-mono text-zinc-600 uppercase">
                <span>FPS: 60</span>
                <span>Latency: 12ms</span>
              </div>
            </div>
            <ArmVisualizer servos={servos} />
          </section>

          {/* Bottom Grid: Library & Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Library */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Routine Library</h2>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[400px] flex flex-col">
                <Tabs defaultValue="premade" className="flex-1 flex flex-col">
                  <TabsList className="bg-zinc-950/50 border-b border-zinc-800 rounded-none h-12 px-2">
                    <TabsTrigger value="premade" className="text-[10px] uppercase font-bold data-[state=active]:bg-zinc-800">Standard</TabsTrigger>
                    <TabsTrigger value="custom" className="text-[10px] uppercase font-bold data-[state=active]:bg-zinc-800">User Defined</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="premade" className="flex-1 m-0">
                    <ScrollArea className="h-[350px] p-4">
                      <div className="space-y-2">
                        {PREMADE_ROUTINES.map(routine => (
                          <div key={routine.id} className="group p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-zinc-200">{routine.name}</h4>
                              <p className="text-[10px] text-zinc-500 line-clamp-1">{routine.description}</p>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full hover:bg-white hover:text-black transition-all"
                              onClick={() => playRoutine(routine)}
                              disabled={isPlaying}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="custom" className="flex-1 m-0">
                    <ScrollArea className="h-[350px] p-4">
                      {customRoutines.length > 0 ? (
                        <div className="space-y-2">
                          {customRoutines.map(routine => (
                            <div key={routine.id} className="group p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-all flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="text-sm font-medium text-zinc-200">{routine.name}</h4>
                                <p className="text-[10px] text-zinc-500 line-clamp-1">{routine.description}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-full hover:bg-white hover:text-black transition-all"
                                  onClick={() => playRoutine(routine)}
                                  disabled={isPlaying}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  onClick={() => deleteRoutine(routine.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-12">
                          <Box className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] uppercase font-mono tracking-widest">No custom routines</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Editor */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sequence Programmer</h2>
              </div>
              <div className="h-[400px]">
                <SequenceEditor 
                  currentAngles={servos.map(s => s.angle)}
                  onPlayRoutine={playRoutine}
                  onSaveRoutine={(r) => saveRoutines([...customRoutines, r])}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Axis Controls</h2>
              </div>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px] uppercase">6 DOF Active</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {servos.map(servo => (
                <ServoControl 
                  key={servo.id} 
                  servo={servo} 
                  onChange={handleServoChange} 
                />
              ))}
            </div>
          </section>

          {/* System Status */}
          <section className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Diagnostics</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">CPU Load</span>
                <span className="text-xs font-mono text-emerald-500">4.2%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[4.2%]" />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Memory</span>
                <span className="text-xs font-mono text-emerald-500">128MB / 2GB</span>
              </div>
              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[6%]" />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Controller Link</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">ID: ARM-X6-992</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            Connected
          </span>
          <span>Buffer: 100%</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Local Storage Persistence: Active</span>
          <span>© 2026 RoboControl Systems</span>
        </div>
      </footer>
    </div>
  );
}
