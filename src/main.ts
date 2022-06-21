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
 * Class representing complete controller configuration in JSON format
 * - TFT  : TFT screen calibration data.
 * - WiFi : Details for connecting to WiFi (SSID and KEY)
 * - PID : PID-control coeffitients
 * - Programs : an array of programs available for controller
 */
export class clCConfiguration{
  TFT? : {
    poll    : number;   // TFT polling interval in MS
    TFT     : number[]; // TFT calibration data
  };

  WiFi? : {
    SSID    : string;   // WiFi network SSID
    KEY     : string;   // pre-shared key to access the network
    IP?     : string;   // currently assigned IP address
  };

  PID? : {
    poll    : number; // PID control polling interval - defaults to 1 sec
    KP      : number; // PID control Proportional coeffitient
    KI      : number; // PID control Integral coeffitient
    KD      : number; // PID control Differential coeffitient
  };

  Programs? : clProgram[]; // list of currently available programs to execute

}

/**
 * Class representing current controller status.
 * Reported by controller via WebSocket.
 */
export class clCStatus{
  tPB       : number = 0;
  tAM       : number = 0;
  tSP       : number = 0;
  U         : number = 0;
  isRunning : boolean = false;
  isRelayOn : boolean = false;
  stsText   : string = "";
  actPgm    : clProgram | null = null;
  actStep   : number = 0;
  tmElapsed : number = 0;
}

export class clMsgRequest{
  id    : 'cfgRD' | 'cfgWR' | 'start' | 'stop' = 'cfgRD';
  msg?  : clCConfiguration;
}

export class clMsgResponse{
  id?       : 'OK' | 'ERR' | 'STS' = 'OK';
  details? : string;
  config?  : clCConfiguration;
  status?  : clCStatus;
}

var WSocket : WebSocket | null = null;

/**
 * Controller
 */
export class clController{
  _cStatus        : clCStatus = new clCStatus();
  _cConfiguration : clCConfiguration = new clCConfiguration();
  isWSConnected   : boolean = false;

  // TESTIN ONLY: set timer to update probe temperature
  intervalId : number = 0;
  static onTimer(obj: clController){
    obj._cStatus.tPB++;
  }

  // handle start/stop commands from GUI
  onStartStop(){
    if(this._cStatus.actPgm === null){
      this._cStatus.stsText = "no program selected";
      return;
    }

    // send start or stop command over websocket
    let cmd = new clMsgRequest();
    if(this._cStatus.isRunning){
      // send stop command
      cmd.id = "stop";
    }else{
      // send start command
      cmd.id = "start";
    }
    if( WSocket && WSocket.readyState == WebSocket.OPEN) WSocket.send(JSON.stringify(cmd));
  }

  // get current controller configuration instance
  GetConfiguration() : clCConfiguration {
    return this._cConfiguration;
  }

  // handle changes to configuration in controller memory
  SetConfiguration(config : clCConfiguration){
    this._cConfiguration = config;
  }

  // get programs currently available in controller memory
  GetPrograms() : clProgram[] {
    return this._cConfiguration.Programs ? this._cConfiguration.Programs : [new clProgram()];
  }

  // handle changes to programs in controller memory
  SetPrograms(programs: clProgram[]){
    this._cConfiguration.Programs = programs;
  }

  Connect(host : string) : WebSocket {
    if(WSocket === null) WSocket = new WebSocket("ws://" + host + "/ws");
    return WSocket;
  }
  
}

/**
 * Create a detached copy of serializable object
 * @param obj an object to create detached copy
 * @returns a detached copy of object supplied
 */
 export function detach<Type>(obj : Type) : Type{
  return JSON.parse(JSON.stringify(obj));
}
  











/** 
 * !TESTING ONLY:
 * represents a set of programs to run that are available in controller memory 
 */
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

/**
 * !TESTING ONLY:
 * represents a sample configuration in controller memory
 */
var ControllerConfiguration = new clCConfiguration();
ControllerConfiguration.TFT = {poll : 300, TFT : [1234, 5678, 91011] };
ControllerConfiguration.WiFi = { SSID : "TestSSID", KEY : "YourSecret", IP : "192.168.1.2" };
ControllerConfiguration.PID = {poll: 1000, KP : 1.0, KI : 1.1, KD : 1.2 };
ControllerConfiguration.Programs = ControllerPrograms;



/* Global controller instance */
export const Controller = reactive(new clController());

// set up test configuration
Controller.SetConfiguration(ControllerConfiguration);

// update controller status text
Controller._cStatus.stsText = "Initializing controller";

// provide websocket to downstream components

/**
 * Finally mount application
 */
const appInstance = createApp(App);
appInstance.mount('#app');
