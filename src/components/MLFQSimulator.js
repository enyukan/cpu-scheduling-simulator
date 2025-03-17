import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./ChartContainer";
import Timer from "./Timer";
import { jsPDF } from "jspdf"; // Import jsPDF

const MLFQSimulator = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [executionProgress, setExecutionProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [executions, setExecutions] = useState({});
    const [currentQueue, setCurrentQueue] = useState(null);

    // Declare Priority queues
    const [q0, setQ0] = useState([]);
    const [q1, setQ1] = useState([]);
    const [q2, setQ2] = useState([]);

    // Time quantum for each queue
    const timeQuantum = { q0: 1, q1: 2, q2: 5 };

    // Priority Boosting threshold
    const priorityBoostThreshold = 5;

    // Logs to display in the PDF
    const [executionLogs, setExecutionLogs] = useState([]);

    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];

    // Color mapping for processes
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

        // Align process in arrival order
        newProcesses = newProcesses.sort((a, b) => a.arrival - b.arrival);
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));
        setProcesses(newProcesses);
        setExecutions({});
    };

    // Start simulation
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

    // MLFQ Scheduling algorithm
    const runMLFQ = async () => {
        let executedTime = 0;
        let queue0 = [...processes];
        let queue1 = [];
        let queue2 = [];
        let processExecutionCount = {};

        const executeProcess = async () => {
            // Executes as long as at least one process exists in any queue
            while (queue0.length > 0 || queue1.length > 0 || queue2.length > 0) {
                let currentProcess = null;
                let quantum = 0;
                let runningQueue = null;

                // If there is a process in queue0, take a process from queue0 and put it into runningQueue
                if (queue0.length > 0) {
                    currentProcess = queue0.shift();
                    quantum = timeQuantum.q0;
                    runningQueue = "Q0";
                }
                // If there is a process in queue1, take a process from queue1 and put it into runningQueue
                else if (queue1.length > 0) {
                    currentProcess = queue1.shift();
                    quantum = timeQuantum.q1;
                    runningQueue = "Q1";
                } 
                // If there is a process in queue2, take a process from queue2 and put it into runningQueue
                else if (queue2.length > 0) {
                    currentProcess = queue2.shift();
                    quantum = timeQuantum.q2;
                    runningQueue = "Q2";
                }

                // State update to show the currently running queue
                setCurrentQueue(runningQueue);

                // Run process
                if (currentProcess) {
                    // Save the number of runs of each process
                    processExecutionCount[currentProcess.id] = (processExecutionCount[currentProcess.id] || 0) + quantum;

                    // Running during a time quantum
                    for (let i = 0; i < quantum && currentProcess.burstTime > 0; i++) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));

                        currentProcess.burstTime -= 1;
                        executedTime += 1;

                        // Increment current time
                        setCurrentTime((prev) => prev + 1);

                        // Update total execution progress
                        setExecutionProgress(
                            (executedTime / processes.reduce((acc, p) => acc + p.initialBurst, 0)) * 100
                        );

                        setProcesses((prevProcesses) =>
                            prevProcesses.map((p) =>
                                p.id === currentProcess.id ? { ...p, burstTime: currentProcess.burstTime } : p
                            )
                        );

                        // Log every second of execution
                        const log = `Time ${executedTime}: Process ${currentProcess.id} executed (Remaining time: ${currentProcess.burstTime})`;
                        setExecutionLogs((prevLogs) => [...prevLogs, log]);
                    }

                    // Priority Boosting logic and queue movements
                    if (currentProcess.burstTime > 0) {
                        if (processExecutionCount[currentProcess.id] >= priorityBoostThreshold) {
                            queue0.push(currentProcess);
                            processExecutionCount[currentProcess.id] = 0;
                        } else if (quantum === timeQuantum.q0) {
                            queue1.push(currentProcess);
                        } else if (quantum === timeQuantum.q1) {
                            queue2.push(currentProcess);
                        } else {
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

    // Function to generate and download the PDF with logs
    const downloadLogs = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text("MLFQ Scheduling Execution Logs", 20, 20);
        executionLogs.forEach((log, index) => {
            doc.text(log, 20, 30 + (index * 10));
        });
        doc.save("MLFQ_Logs.pdf");
    };

    return (
        <div style={styles.container}>
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

            <button onClick={downloadLogs} disabled={isRunning} style={styles.button}>
                Download 
            </button>

            <button onClick={startSimulation} disabled={isRunning} style={styles.button}>
                Start
            </button>

            
        </div>
    );
};

const styles = {
    container: { textAlign: "center", marginTop: "20px" },
    queueContainer: { display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" },
    queue: { padding: "10px", border: "2px solid black", borderRadius: "8px", minWidth: "150px", textAlign: "center" },
    controls: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px", gap: "10px" },
    label: { fontSize: "16px", fontWeight: "bold", marginBottom: "20px" },
    input: { width: "60px", fontSize: "16px", padding: "5px", textAlign: "center", marginBottom: "20px" },
    generateButton: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)", color: "#507882", fontSize: "18px",
        padding: "12px 24px", border: "none", borderRadius: "30px", cursor: "pointer",
        transition: "all 0.3s ease-in-out", marginTop: "15px", marginRight: "10px", marginLeft: "10px",
        marginBottom: "20px",
    },
    button: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)", color: "#507882", fontSize: "18px", 
        padding: "12px 24px", border: "none", borderRadius: "30px", cursor: "pointer", 
        transition: "all 0.3s ease-in-out", marginTop: "15px", marginRight: "10px", marginLeft: "10px", 
    },
};

export default MLFQSimulator;
