import colors from "./colors";

/*
    Add a new process to the list of processes about to 
    be run
*/

function addProcess(procs, id, arrivalTime, executeTime){
    
    let addProc = procs.slice();
    addProc.push(
        {
            id: id,
            arrivalTime: parseInt(arrivalTime),
            executionTime: parseInt(executeTime),
            turnaround: "",
            response: "",
            color: colors[Math.floor(Math.random() * 31)],
            executed: 0,
            executedPercentage: 0,
            percentage: 0,
            startRunning: 0,
            timeLeft: parseInt(executeTime)
        }
    );

    return [...addProc];
}

export default addProcess;