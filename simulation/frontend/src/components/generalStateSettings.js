/*
    The state for each scheduler will hold:
    ---------------------------------------
    State for running a scheduler:

    -General settings: common for all schedulers(FIFO, SJF, STCF, RR, MLFQ)
    -Specific settings: RR and MLFQ

    State for using the current setup and switch to other scheduler to run it:
    
    -general_paste:  common for all schedulers(FIFO, SJF, STCF, RR, MLFQ)
    -Specific paste: for RR and MLFQ
*/

const general = {
    procs: [],
    count: 0,
    running: false,
    playIcon: "play_circle",
    timer: 0,
    currentProcessIdx: 0,
    arrivalTime: "",
    executionTime: "",
    arrivalDisabled: false,
    executionDisabled: false,
    totalExecutionTime: 0,
    avgTurnaround: 0,
    avgResponse: 0,
    textarea: "",
    colorDeleteIcon: "#dc3545",
    colorAddIcon: "#28a745",
    colorClearIcon: "#dec8c8",
    sessionComplete: false,
    showDescription: false
};

const specific_RR = {
    quantum: "",
    quantumTicks: 1,
    disabled: false,
    clear: {
        "quantum": ""
    }
}

const specific_MLFQ = {
    currentQueueIdx: 0,
    numQueues: "",
    queues: [],
    quantum: "",
    quantumTicks: 0,
    boost: "",
    boostTicks: 0,
    quantumDisabled: false,
    boostDisabled: false,
    queuesDisabled: false,
    clear: {
        "quantum": "",
        "boost": "",
        "numQueues": ""
    }
}

const general_paste = {
    pasteSetup: "",
    pasteSlice: "",
    pasteSliceDisabled: true,
    pasteBoost: "",
    pasteBoostDisabled: true,
    pasteQueues: "",
    pasteQueuesDisabled: true,
}

const paste_RR = {
    pasteSetup: "",
    pasteBoost: "",
    pasteBoostDisabled: true,
    pasteQueues: "",
    pasteQueuesDisabled: true,
}

const paste_MLFQ = {
    pasteSetup: ""
}

export {general, specific_RR, specific_MLFQ, general_paste, paste_RR, paste_MLFQ};