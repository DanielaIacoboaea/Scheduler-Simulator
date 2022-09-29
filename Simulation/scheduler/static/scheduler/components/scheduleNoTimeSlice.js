function scheduleNoTimeSlice(timer, allProcs, idx){
    if(idx < allProcs.length){

        const procs = allProcs.slice();

        const proc = procs[idx];
        const executed = proc.executed;
        let procDone = false;
        let noProcToRun = false;
        console.log("proc: ", proc);
        console.log("executed: ", executed);
        console.log("proc.executed: ", proc.executed);
        if(proc.arrivalTime > timer){
            console.log("proc.arrivalTime > timer");
            noProcToRun = true;
            return {
                "updateProcs": procs,
                "procDone": procDone,
                "noProcToRun": noProcToRun
            }
        }
        
        if(executed === 0){
            console.log("executed === 0");
            proc.startRunning = timer;
            const percentInc = 100 / proc.executionTime;
            proc.percentage = percentInc;
            proc.executedPercentage = proc.percentage;
            proc.executed += 1;
            proc.timeLeft = proc.executionTime;
            console.log("proc.executed: ", proc.executed);
            console.log("proc.executionTime: ", proc.executionTime);
            if (proc.executed === proc.executionTime){
                console.log("executed === proc.executionTime");
                proc.turnaround = timer - proc.arrivalTime;
                proc.response = proc.startRunning - proc.arrivalTime;
                procDone = true;
                proc.timeLeft -= 1;
                console.log("about to return proc: ", proc);
                console.log("procDone: ", procDone);
                console.log("typeOFprocDone: ", typeof(procDone));
                return {
                    "updateProcs": procs,
                    "procDone": procDone,
                    "noProcToRun": noProcToRun
                }
            }else{
                console.log("return from else: proc, procDone: ", proc, procDone);
                return {
                    "updateProcs": procs,
                    "procDone": procDone,
                    "noProcToRun": noProcToRun
                }
            }
        }else if (executed < proc.executionTime){
            console.log("executed < proc.executionTime");
            proc.executedPercentage += proc.percentage;
            proc.executed += 1;
            proc.timeLeft -= 1;
            if (proc.executed === proc.executionTime){
                console.log("executed === proc.executionTime");
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
    console.log("return null");
    return null;
}

export default scheduleNoTimeSlice;