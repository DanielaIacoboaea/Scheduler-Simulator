const arrival = "<em>Arrival Time: </em> <br/> <strong> A </strong>=<em> When</em> does the process get here?"
const execute = "<em>Execute Time: </em> <br/> <strong> E </strong>=<em> How</em> long the process will run."
const slice = "<em>Time Slice: </em> <br /> <em>Amount of time</em> a process runs when scheduled."
const boost = "<em>Boost Slice: </em> <br /> Amount of time after which all processes <em>move</em> to the highest priority (queue 0)."
const queues = "<em>Queues: </em> <br /> Number of <em>priority queues</em>. Each process moves to lower priority after its time slice is over."

export {arrival, execute, slice, boost, queues};