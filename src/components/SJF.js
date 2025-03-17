import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./Charts";
import Timer from "./Timer";
import jsPDF from "jspdf";
const SJF = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [execProgress, setExecProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [execLogs, setExecLogs] = useState([]);

    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];

    // Function to get color for each process
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

        // Sort in ascending order based on arrival time
        newProcesses = newProcesses.sort((a, b) => a.arrival - b.arrival);

        // Save the initial burstTime separately to remember the initial execution order even during execution
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcesses);
        setExecLogs([]);
    };

    // Start simulation
    const startSim = () => {
        if (isRunning) return;
        setIsRunning(true);
        setExecProgress(0);
        setExecLogs([]);
        runSJF();
    };
    const runSJF = () => {
        let totalBurst = processes.reduce((acc, p) => acc + p.burstTime, 0); // Total burst time for progress calculation
        let executedTime = 0;
        let currentTime = 0; // Track the current simulation time
        let queue = [...processes]; // Queue to hold processes
        let remainingProcesses = [...processes]; // Track processes yet to be executed
        let isProcessing = false;
    
        // Recursive function to execute processes
        const executeProcess = () => {
            // Filter out processes that have not arrived yet
            let availableProcesses = remainingProcesses.filter(p => p.arrival <= currentTime && p.burstTime > 0);
    
            // If no processes are ready, wait for the next process to arrive (if any)
            if (availableProcesses.length === 0) {
                const nextArrivalTime = Math.min(...remainingProcesses.filter(p => p.burstTime > 0).map(p => p.arrival));
                if (nextArrivalTime > currentTime) {
                    // Skip time to the next arrival (simulate clock progression)
                    setTimeout(() => {
                        currentTime = nextArrivalTime;
                        setCurrentTime(currentTime);
                        executeProcess(); // Recurse after advancing time
                    }, 500);
                } else {
                    setTimeout(executeProcess, 500); // Wait and check again
                }
                return;
            }
    
            // Sort available processes by burst time (Shortest Job First)
            availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
            let processToExecute = availableProcesses[0]; // Select the shortest burst time process
    
            let burstLeft = processToExecute.burstTime;
            let process = processToExecute;
    
            // Log the execution of the selected process
            const interval = setInterval(() => {
                if (burstLeft > 0) {
                    // Decrease the burst time of the current process
                    burstLeft--;
                    executedTime++;
                    currentTime++;
    
                    // Update UI states
                    setExecProgress((executedTime / totalBurst) * 100);
                    setCurrentTime(currentTime);
    
                    // Update process burst time in the state
                    setProcesses((prevProcesses) =>
                        prevProcesses.map((p) =>
                            p.id === process.id ? { ...p, burstTime: burstLeft, color: p.color } : p
                        )
                    );
    
                    // Log the execution progress
                    setExecLogs((prevLogs) => [
                        ...prevLogs,
                        `Time ${executedTime}: Process ${process.id} executed (Remaining time: ${burstLeft})`,
                    ]);
                } else {
                    // Once process finishes, mark it as completed and move to the next process
                    clearInterval(interval);
                    remainingProcesses = remainingProcesses.filter(p => p.id !== process.id); // Remove completed process
    
                    if (remainingProcesses.length > 0) {
                        executeProcess(); // Continue with the next process
                    } else {
                        setIsRunning(false); // All processes are finished
                        setExecLogs((prevLogs) => [...prevLogs, `Simulation complete at time ${currentTime}`]);
                    }
                }
            }, 500); // Process runs every 0.5 second
        };
    
        executeProcess(); // Start the execution
    };
    
    
    // Save execution process log as pdf
    const saveLogsAsPDF = () => {
        const pdf = new jsPDF();
        pdf.text("SJF Scheduling Execution Logs", 10, 10);

        execLogs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });

        pdf.save("SJF_Logs.pdf");
    };

    return (
        <div style={styles.container}>
            <div>
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

            <ChartContainer processes={processes} execProgress={execProgress} />

            <button onClick={saveLogsAsPDF} style={styles.button}>
                Download
            </button>

            <button onClick={startSim} disabled={isRunning} style={styles.button}>
                Start
            </button>
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        marginTop: "10px",
        marginBottom: "10px",
    },
    label: {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "30px",
    },
    input: {
        width: "60px",
        fontSize: "16px",
        padding: "5px",
        margin: "10px",
        marginBottom: "30px",
    },
    generateButton: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
    button: {
        background: "linear-gradient(135deg,#e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
};

export default SJF;
