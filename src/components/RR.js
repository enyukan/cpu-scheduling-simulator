import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./Charts";
import Timer from "./Timer";
import jsPDF from "jspdf";

const RR = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [execProgress, setExecProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [timeQuantum, setTimeQuantum] = useState(2);
    const [processes, setProcesses] = useState([]);
    const [execLogs, setExecLogs] = useState([]);

    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];

    const getColorForProcess = (id) => {
        if (!colorMap.current[id]) {
            colorMap.current[id] = availableColors[Object.keys(colorMap.current).length % availableColors.length];
        }
        return colorMap.current[id];
    };

    // Generate random process
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

        // Save initial burstTime
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcesses);
        setExecLogs([]); // Reset logs
    };

    // Create a queue for execution list (in arrival order). We need processes and quantum
    const generateExecQueue = (processes, timeQuantum) => {
        let queue = [];
        let remainingBursts = processes.map((p) => ({
            id: p.id,
            burstTime: p.burstTime,
        }));

        while (remainingBursts.some((p) => p.burstTime > 0)) {
            for (let i = 0; i < processes.length; i++) {
                let process = remainingBursts[i];

                if (process.burstTime > 0) {
                    let execTime = Math.min(timeQuantum, process.burstTime);
                    queue.push({ ...process, execTime });
                    process.burstTime -= execTime;
                }
            }
        }

        return queue;
    };

    // Start Simulation
    const startSimulation = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecProgress(0);
        setExecLogs([]); // Clear previous logs
        runRoundRobin();
    };

    // Run RR Scheduling
    const runRoundRobin = () => {
        let queue = generateExecQueue(processes, timeQuantum);
        let totalBurst = processes.reduce((acc, p) => acc + p.burstTime, 0);
        let executedTime = 0;

        const executeProcess = () => {
            if (queue.length === 0) {
                setIsRunning(false);
                setTimeout(() => {
                    setExecProgress(0);
                }, 500);
                return;
            }

            let process = queue.shift();
            let execTime = process.execTime;

            const interval = setInterval(() => {
                if (execTime > 0) {
                    setCurrentTime((prev) => prev + 1);
                    executedTime++;

                    setExecProgress((executedTime / totalBurst) * 100);

                    setProcesses((prevProcesses) =>
                        prevProcesses.map((p) =>
                            p.id === process.id ? { ...p, burstTime: p.burstTime - 1 } : p
                        )
                    );

                    // Record log for execution progress
                    setExecLogs((prevLogs) => [
                        ...prevLogs,
                        `Time ${executedTime}: Process ${process.id} executed (Remaining time: ${process.burstTime - 1})`,
                    ]);

                    execTime--;
                } else {
                    clearInterval(interval);
                    executeProcess();
                }
            }, 500);
        };

        executeProcess();
    };

    // Save execution process log as pdf
    const saveLogsAsPDF = () => {
        const pdf = new jsPDF();
        pdf.text("Round Robin Scheduling Execution Logs", 10, 10);

        execLogs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });

        pdf.save("RR_Execution_Logs.pdf");
    };

    // Styles object
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

                <label style={styles.label}>Time Quantum: </label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(Number(e.target.value))}
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

            <button onClick={startSimulation} disabled={isRunning} style={styles.button}>
                Start
            </button>
        </div>
    );
};

export default RR;
