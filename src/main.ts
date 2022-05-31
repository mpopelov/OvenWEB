import { createApp, reactive } from 'vue'
import App from './App.vue'

/**
 * Class representing controller program step.
 * Each step of a program is defined by its duration along with desired temperatures
 * at start and end of the step.
 */
export class clPGMStep{
    tStart: number;
    tEnd: number;
    duration: number;

  constructor(tStart?: number, tEnd?: number, duration?: number){
    this.tStart = tStart === undefined ? 0 : tStart;
    this.tEnd = tEnd === undefined ? 0 : tEnd;
    this.duration = duration === undefined ? 0 : duration;
  }

}

/**
 * Class representing controller program.
 * A human readable name and at least one step are mandatory.
 */
export class clProgram{
    Name: string;
    steps: clPGMStep[];
  constructor(Name?: string, steps?: clPGMStep | clPGMStep[] ){
    this.Name = Name === undefined ? 'New program' : Name;
    if(steps === undefined){
      this.steps = [new clPGMStep()];
    }else{
      if(Array.isArray(steps)){
        this.steps = steps;
      }else{
        this.steps = [steps];
      }
    }
  }
}

/**
 * Class representing controller configuration in JSON format
 * - TFT  : TFT screen calibration data.
 * - WiFi : Details for connecting to WiFi (SSID and KEY)
 * - PID : PID-control coeffitients
 * - Programs : an array of programs available for controller
 */
class clControllerConfiguration{
  TFT? : {
    tft1: number;
    tft2: number;
  };

  WiFi? : {
    SSID : string;
    KEY : string;
  };

  PID? : {
    KP : number;
    KI : number;
    KD : number;
  };

  Programs? : clProgram[];

}

/**
 * Class representing current controller status.
 * Reported by controller via WebSocket.
 */
class clControllerStatus{
  tProbe        : number = 0;
  tAmbient      : number = 0;
  tStep         : number = 0;
  isRunning     : boolean = false;
  statusText    : string = "";
  activeProgram : clProgram | null = null;
  activeStep    : number = 0;
  timeElapsed   : number = 0;
}

class clMsgRequest{
  id    : 'cfgRD' | 'cfgWR' | 'start' | 'stop' = 'cfgRD';
  msg?  : clControllerConfiguration;
}

class clMsgResponse{
  id      : 'OK' | 'ERR' | 'status' = 'OK';
  details?: string;
  config? : clControllerConfiguration;
  status? : clControllerStatus;
}







/** represents a set of programs to run that are available in controller memory */
var ControllerPrograms = [
  new clProgram('Program1', [
    new clPGMStep(100, 200, 86400),
    new clPGMStep(200, 400, 86400),
    new clPGMStep(400, 800, 86400)
  ]),
  new clProgram('Program2', [
    new clPGMStep(100, 200, 86400),
    new clPGMStep(200, 400, 86400)
   ]),
  new clProgram('Program3', new clPGMStep(200, 400, 86400))
]

/* global state object representing Oven controller state */
export const Controller = reactive({
    tempProbe: 300.01,
    tempAmbient: 27.3,
    tempTarget: 100,
    status: "Connecting to controller",
    isWSConnected: false,
    isRunning: false,
    program: null as clProgram | null,

    // handle start/stop commands from GUI
    onStartStop(){
      if(this.program === null){
        this.status = "no program selected";
        return;
      }

      // toggle running state
      this.isRunning = !this.isRunning;
      // for now just increase the probe temperature - TODO: send command to controller
      this.tempProbe++;
      this.status = this.isRunning ? "Program is running" : "Program stopped";
    },

    // handle changes to programs in controller memory
    GetPrograms(){
      return ControllerPrograms;
    },

    SetPrograms(programs: clProgram[]){
      ControllerPrograms = programs;
    }
  });


  /**
   * Create a detached copy of serializable object
   * @param {any} obj an object to create detached copy
   * @returns a detached copy of object supplied
   */
export function detach(obj : any){
  return JSON.parse(JSON.stringify(obj));
}

createApp(App).mount('#app')
