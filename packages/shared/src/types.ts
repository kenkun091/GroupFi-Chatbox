import { IContext } from "./util/thread";

export interface ICycle {
    bootstrap(): Promise<void>; // resource allocation and channel connection
    start(): Promise<void>; // start loop
    resume(): Promise<void>; // unpause loop
    
    pause(): Promise<void>; // pause loop
    stop(): Promise<void>; // drain then stop loop with timeout
    destroy(): Promise<void>; // de allocation
}

export interface IRunnable {
    poll(): Promise<boolean>; // return true if should pause
}