
/*
    Run one process for 1 second and return the updated list of processes.
 */


function scheduleNoTimeSlice(timer, allProcs, idx){

    const procs = allProcs.slice();
    const proc = procs[idx];
    const executed = proc.executed;

    let procDone = false;
    let noProcToRun = false;

    /*
        If the process is not in the system yet,
        signal to the scheduler that it can't be run
     */
    if(proc.arrivalTime > timer){
        noProcToRun = true;
        return {
            "updateProcs": procs,
            "procDone": procDone,
            "noProcToRun": noProcToRun
        }
    }
    
    /*
        If it's the first time that the process is scheduled to run, 
        update its starting parameters
     */
    if(executed === 0){
        proc.startRunning = timer;
        const percentInc = 100 / proc.executionTime;
        proc.percentage = percentInc;
        proc.executedPercentage = proc.percentage;
        proc.executed += 1;
        proc.timeLeft = proc.executionTime;
        /*
            If it's already done running, signal to the scheduler
        */
        if (proc.executed === proc.executionTime){
            proc.turnaround = timer - proc.arrivalTime;
            proc.response = proc.startRunning - proc.arrivalTime;
            procDone = true;
            proc.timeLeft -= 1;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else{
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
    }else if (executed < proc.executionTime){
        proc.executedPercentage += proc.percentage;
        proc.executed += 1;
        proc.timeLeft -= 1;
        if (proc.executed === proc.executionTime){
            proc.turnaround = timer - proc.arrivalTime;
            proc.response = proc.startRunning - proc.arrivalTime;
            procDone = true;
            proc.timeLeft -= 1;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else{
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
    }
}

export default scheduleNoTimeSlice;