function schedulerNoTimeSlice(timer, allProcs, idx){
    if(idx < allProcs.length){

        const procs = allProcs.slice();

        const proc = procs[idx];
        const executed = proc.executed;
        let procDone = false;
        let noProcToRun = false;
        if(proc.arrivalTime > timer){
            noProcToRun = true;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
        
        if(executed === 0){
            proc.startRunning = timer;
            const percentInc = 100 / proc.executionTime;
            proc.percentage = percentInc;
            proc.executedPercentage = proc.percentage;
            proc.executed += 1;
            proc.timeLeft = proc.executionTime;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else if (executed < proc.executionTime){
            proc.executedPercentage += proc.percentage;
            proc.executed += 1;
            proc.timeLeft -= 1;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }else if (executed === proc.executionTime){
            proc.turnaround = timer - proc.arrivalTime;
            proc.response = proc.startRunning - proc.arrivalTime;
            procDone = true;
            noProcToRun = false;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
    }
    return null;
}

export default schedulerNoTimeSlice;