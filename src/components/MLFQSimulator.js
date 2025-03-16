import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./ChartContainer";
import Timer from "./Timer";
import { transition } from "d3";

const MLFQSimulator = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [executionProgress, setExecutionProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [executions, setExecutions] = useState({});
    const [currentQueue, setCurrentQueue] = useState(null);


    //Declare Priority queues
    const [q0, setQ0] = useState([]);
    const [q1, setQ1] = useState([]);
    const [q2, setQ2] = useState([]);


    //Time quantum for each queue
    const timeQuantum = { q0: 1, q1: 2, q2: 5 };

    //priorityBoosting
    const priorityBoostThreshold = 5;


    const colorMap = useRef({});
    const availableColors = ["red", "blue", "green", "orange", "purple", "cyan", "pink", "brown", "lime", "magenta"];


    //Color mapping
    const getColorForProcess = (id) => {
        if (!colorMap.current[id]) {
            colorMap.current[id] = availableColors[Object.keys(colorMap.current).length % availableColors.length];
        }
        return colorMap.current[id];
    };



    // Generate random processes
    const generateRandomProcesses = (count) => {
        let newProcesses = Array.from({ length: count }, (_, i) => {
            const processId = `P${i + 1}`;
            return {
                id: processId,
                arrival: Math.floor(Math.random() * 6),
                burstTime: Math.floor(Math.random() * 6) + 2,
                initialBurst: 0,
                color: getColorForProcess(processId),
            };
        });


        //Align process in arrival order
        newProcesses = newProcesses.sort((a, b) => a.arrival - b.arrival);
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));
        setProcesses(newProcesses);
        setExecutions({});
    };




    //Start simulation
    const startSimulation = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecutionProgress(0);
        setCurrentQueue(null);

        let sortedProcesses = [...processes].sort((a, b) => a.arrival - b.arrival);
        setQ0(sortedProcesses);
        runMLFQ(sortedProcesses);
    };





    //MLFQ Scheduling algorithm
    const runMLFQ = async () => {
        let executedTime = 0;
        let queue0 = [...processes];
        let queue1 = [];
        let queue2 = [];
        let processExecutionCount = {};

        const executeProcess = async () => {

            //Executes as long as at least one process exists in any queue
            while (queue0.length > 0 || queue1.length > 0 || queue2.length > 0) {
                let currentProcess = null;
                let quantum = 0;
                let runningQueue = null;

                //If there is a process in queue0, take a process from queue0 and put it into runningQueue, and runningQueue -> Q0
                if (queue0.length > 0) {
                    currentProcess = queue0.shift();
                    quantum = timeQuantum.q0;
                    runningQueue = "Q0";
                }
                //If there is a process in queue1, take a process from queue0 and put it into runningQueue, and runningQueue -> Q1
                else if (queue1.length > 0) {
                    currentProcess = queue1.shift();
                    quantum = timeQuantum.q1;
                    runningQueue = "Q1";
                } 
                //If there is a process in queue2, take a process from queue0 and put it into runningQueue, and runningQueue -> Q2
                else if (queue2.length > 0) {
                    currentProcess = queue2.shift();
                    quantum = timeQuantum.q2;
                    runningQueue = "Q2";
                }

                //State update to show the currently running queues on screen
                setCurrentQueue(runningQueue);


                //Run process
                if (currentProcess) {

                    //Save the number of runs of each process
                    processExecutionCount[currentProcess.id] = (processExecutionCount[currentProcess.id] || 0) + quantum;


                    //Running during a time quantum
                    for (let i = 0; i < quantum && currentProcess.burstTime > 0; i++) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));

                        currentProcess.burstTime -= 1;
                        executedTime += 1;


                        //Increment current time
                        setCurrentTime((prev) => prev + 1);


                        //Update total execution progress
                        setExecutionProgress(
                            (executedTime / processes.reduce((acc, p) => acc + p.initialBurst, 0)) * 100
                        );

                        setProcesses((prevProcesses) =>
                            prevProcesses.map((p) =>
                                p.id === currentProcess.id ? { ...p, burstTime: currentProcess.burstTime } : p
                            )
                        );
                    }




                    //If the currently running process is not finished yet
                    if (currentProcess.burstTime > 0) {

                        //If the currently running process has run 5 times (priority Boosting)
                        if (processExecutionCount[currentProcess.id] >= priorityBoostThreshold) {
                            queue0.push(currentProcess);
                            processExecutionCount[currentProcess.id] = 0;
                        } 
                        
                        //Move process in Q0 to Q1
                        else if (quantum === timeQuantum.q0) {
                            queue1.push(currentProcess);
                        } 
                        
                        //Move process in Q1 to Q2
                        else if (quantum === timeQuantum.q1) {
                            queue2.push(currentProcess);
                        } 
                        
                        else {
                            queue2.push(currentProcess);
                        }
                    }

                    setQ0([...queue0]);
                    setQ1([...queue1]);
                    setQ2([...queue2]);
                }
            }

            setIsRunning(false);
        };

        executeProcess();
    };

    return (
        <div style={styles.container}>
            <Timer currentTime={currentTime} />
            <ChartContainer processes={processes} executionProgress={executionProgress} />


            {/* Status window for priority queue */}
            <div style={styles.queueContainer}>
                {["Q0", "Q1", "Q2"].map((q) => (
                    <div
                        key={q}
                        style={{
                            ...styles.queue,
                            borderColor: currentQueue === q ? "green" : "black",
                            backgroundColor: currentQueue === q ? "#e0ffe0" : "white",
                        }}
                    >
                        <h3>{q} {currentQueue === q ? "(Running)" : ""}</h3>
                        <p>
                            {q === "Q0" ? q0.map((p) => p.id).join(", ") :
                                q === "Q1" ? q1.map((p) => p.id).join(", ") :
                                    q2.map((p) => p.id).join(", ")}
                        </p>
                    </div>
                ))}
            </div>

            
            <div style={styles.controls}>
                <label style={styles.label}>Number of Processes: </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={numProcesses}
                    onChange={(e) => setNumProcesses(Number(e.target.value))}
                    style={styles.input}
                />
                <button onClick={() => generateRandomProcesses(numProcesses)} style={styles.generateButton}>
                    Generate Processes
                </button>
            </div>

            <button onClick={startSimulation} disabled={isRunning} style={styles.button}>
                Start MLFQ Simulation
            </button>
        </div>
    );
};

const styles = {
    container: { textAlign: "center", marginTop: "20px" },
    queueContainer: { display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" },
    queue: { padding: "10px", border: "2px solid black", borderRadius: "8px", minWidth: "150px", textAlign: "center" },
    controls: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px", gap: "10px" },
    label: { fontSize: "16px", fontWeight: "bold" },
    input: { width: "60px", fontSize: "16px", padding: "5px", textAlign: "center" },
    generateButton: { background: "#007BFF", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "10px", },
    button: { background: "linear-gradient(135deg, #4CAF50, #2E8B57)", color: "white", fontSize: "18px", padding: "12px 24px", border: "none", borderRadius: "30px", cursor: "pointer", marginTop: "15px", transition: "all 0.3s ease-in-out", },
};

export default MLFQSimulator;