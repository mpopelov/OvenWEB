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
    TOL     : number; // PID control temperature measurement tolerance
  };
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
  id    : 'setPG' | 'cfgRD' | 'cfgWR' | 'cfgSV' | 'pgmRD' | 'pgmWR' | 'pgmSV' | 'start' | 'stop' = 'cfgRD';
  msg?  : clCConfiguration | clProgram[] | string;
}

export class clMsgResponse{
  id?       : 'OK' | 'ERR' | 'STS' = 'OK';
  details? : string;
  config?  : clCConfiguration;
  status?  : clCStatus;
  programs? : clProgram[];
}

/**
 * Controller
 */
export class clController{
  _cStatus        : clCStatus = new clCStatus();
  _cConfiguration : clCConfiguration = new clCConfiguration();
  _cPrograms      : clProgram[] = []; // list of currently available programs to execute
  isWSConnected   : boolean = false;
  WSocket         : WebSocket | null = null;
  host            : string = "";

  // TESTIN ONLY: set timer to update probe temperature
  intervalId : number = 0;
  static onTimer(obj: clController){
    obj._cStatus.tPB++;
  }

  // handle start/stop commands from GUI
  onStartStop() {
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
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // get current controller configuration instance
  GetConfiguration() : clCConfiguration {
    return this._cConfiguration;
  }

  // handle changes to configuration in controller memory
  SetConfiguration(config : clCConfiguration){
    this._cConfiguration = config;

    // send programs to controller
    let cmd = new clMsgRequest();
    cmd.id = "cfgWR";
    cmd.msg = this._cConfiguration;
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // get programs currently available in controller memory
  GetPrograms() : clProgram[] {
    return this._cPrograms;
  }

  // handle changes to programs in controller memory
  SetPrograms(programs: clProgram[]){
    this._cPrograms = programs;

    // send programs to controller
    let cmd = new clMsgRequest();
    cmd.id = "pgmWR";
    cmd.msg = this._cPrograms;
    console.log(cmd);
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // send select active program command
  SetActiveProgram(name : string) {
    let cmd = new clMsgRequest();
    cmd.id = "setPG";
    cmd.msg = name;
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // tell controller to save running configuration to flash memory
  SaveConfiguration() {
    let cmd = new clMsgRequest();
    cmd.id = "cfgSV";
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // tell controller to save programs to flash memory
  SavePrograms() {
    let cmd = new clMsgRequest();
    cmd.id = "pgmSV";
    if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
  }

  // set up WebSocket connection and bind call-backs
  Connect(host : string) {

    // save host information
    this.host = host;

    if(this.WSocket === null) {
      this.WSocket = new WebSocket("ws://" + host + "/ws");

      // on Error
      this.WSocket.onerror = event => {
        console.log("onWSError: ", event);
        //Controller._cStatus.stsText = "WSError: " + event;
        this._cStatus.stsText = "WSError: " + event;
      };

      // on Open
      this.WSocket.onopen = event => {
        console.log("onWSOpen: ", event);
        this.isWSConnected = true;

        // request configuration from controller upon connecting
        let cmd = new clMsgRequest();
        cmd.id = "cfgRD"
        this.WSocket?.send(JSON.stringify(cmd));
      };

      // on Close
      this.WSocket.onclose = event => {
        console.log("onWSClosed: ", event);
        this.isWSConnected = false;
        this._cStatus.stsText = "Connection closed: clean=" + event.wasClean + ", code=" + event.code + ", reason: " + event.reason;
        
        // reinstantiate connection
        this.WSocket = null;
        this.isWSConnected = false;
        this.Connect(this.host);
      };

      // on Message
      this.WSocket.onmessage = event => {
        //console.log("onWSMessage: ", event);
        let msg = JSON.parse(event.data) as clMsgResponse;
        if(msg && msg.id){
          switch(msg.id){
            case "STS": {
              // update status upon regular message from controller
              if(msg.status){
                this._cStatus = msg.status;
              }else{
                console.log("received message does not contain status object!");
                this._cStatus.stsText = "Message from controller with errors!!!";
              }
              break;
            }
            case "ERR": {
              // handle error
              console.log("received error message");
              this._cStatus.stsText = msg.details ? msg.details : "ERROR: no details provided!"
              break;
            }
            case "OK": {
              // handle ok
              console.log("received confirmation message");
              this._cStatus.stsText = msg.details ? msg.details : "OK: no details provided!"

              // check if a valid configuration was sent in response
              if(msg.config){
                this._cConfiguration = msg.config;

                // upon receiving configuration - request programs as well
                let cmd = new clMsgRequest();
                cmd.id = "pgmRD";
                if( this.WSocket && this.WSocket.readyState == WebSocket.OPEN) this.WSocket.send(JSON.stringify(cmd));
              }

              // check if a valid programs array was supplied
              if(msg.programs){
                this._cPrograms = msg.programs;
              }
            }
          }
        }
      };

    }

  } // end Connect()

  // disconnect WebSocket
  Disconnect() {
    console.log("Closing connection to controller");
    if(this.WSocket != null){
      // remove onclose event so that we are not in an infinite loop
      this.WSocket.onclose = null;
      this.WSocket.close();
    }
    this.isWSConnected = false;
    this.WSocket = null;
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
ControllerConfiguration.PID = {poll: 1000, KP : 1.0, KI : 1.1, KD : 1.2, TOL : 1.3 };



/* Global controller instance */
export const Controller = reactive(new clController());

// set up test configuration
Controller.SetConfiguration(ControllerConfiguration);

// set up test programs
Controller._cPrograms = ControllerPrograms;

// update controller status text
Controller._cStatus.stsText = "Initializing controller";

/**
 * Finally mount application
 */
const appInstance = createApp(App);
appInstance.mount('#app');
