import React, { useState, useEffect, useRef } from "react";
import ChartContainer from "./ChartContainer";
import Timer from "./Timer";
import jsPDF from "jspdf";

const STCFSimulator = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [executionProgress, setExecutionProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [executionLogs, setExecutionLogs] = useState([]); // ✅ 실행 과정 로그 저장

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
        let newProcesses = Array.from({ length: count }, (_, i) => ({
            id: `P${i + 1}`,
            arrival: Math.floor(Math.random() * 6),
            burstTime: Math.floor(Math.random() * 6) + 2,
            initialBurst: 0,
            color: getColorForProcess(`P${i + 1}`),
        }));


        // Align processes in arrival order
        newProcesses.sort((a, b) => a.arrival - b.arrival);

        // Save initial burstTime of each process
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcesses);
        setExecutionProgress(0);
        setExecutionLogs([]);
    };

    
    const startSimulation = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecutionProgress(0);
        setExecutionLogs([]);


        //Copy list of processes. add remainingTime property
        let processList = [...processes].map((p) => ({
            ...p, remainingTime: p.burstTime,
        }));

        let executedTime = 0;
        let time = 0;


        let readyQueue = [];
        let executionQueue = [];


        //Repeated execution function that runs a particular task every second
        const interval = setInterval(() => {

            // If a process remains in the list of processes that haven't been executed.
            //Pull the process at the beginning of the process list and add it to the readyQueue
            if (processList.length > 0) {
                let nextProcess = processList.shift();
                readyQueue.push(nextProcess);
            }

            // Add process that has shortest burstTime into executionQueue
            if (readyQueue.length > 0) {
                readyQueue.sort((a, b) => {
                    if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
                    return a.arrival - b.arrival;
                });

                let shortestJob = readyQueue.shift();
                executionQueue.push(shortestJob);

                shortestJob.remainingTime -= 1;
                executedTime++;
                time++;

                //update execution progress
                const totalBurst = processes.reduce((acc, p) => acc + p.initialBurst, 0);
                setExecutionProgress((executedTime / totalBurst) * 100);
                setProcesses((prevProcesses) =>
                    prevProcesses.map((p) => (p.id === shortestJob.id ? { ...p, burstTime: shortestJob.remainingTime } : p))
                );
                setCurrentTime(time);

                // Record log for execution progress
                setExecutionLogs((prevLogs) => [
                    ...prevLogs,
                    `Time ${time}: Process ${shortestJob.id} executed (Remaining time: ${shortestJob.remainingTime})`,
                ]);

                if (shortestJob.remainingTime > 0) {
                    readyQueue.push(shortestJob);
                }
            }

            // Terminate if all process are executed
            if (readyQueue.length === 0 && processList.length === 0) {
                clearInterval(interval);
                setIsRunning(false);
                setTimeout(() => setCurrentTime(0), 1000);
            }
        }, 1000);
    };

    // Save execution log as pdf
    const saveLogsAsPDF = () => {
        const pdf = new jsPDF();
        pdf.text("STCF Scheduling Execution Logs", 10, 10);
        
        executionLogs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });

        pdf.save("STCF_Execution_Logs.pdf");
    };

    return (
        <div style={styles.container}>
            <Timer currentTime={currentTime} />
            <ChartContainer processes={processes} executionProgress={executionProgress} />

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

            <button onClick={saveLogsAsPDF} style={styles.button}>
                Download Execution Logs as PDF
            </button>

            <button onClick={startSimulation} disabled={isRunning} style={styles.button}>
                Start STCF Simulation
            </button>

        </div>
    );
};

const styles = {
    container: { textAlign: "center", marginTop: "20px" },
    controls: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px", gap: "10px" },
    label: { fontSize: "16px", fontWeight: "bold" },
    input: { width: "60px", fontSize: "16px", padding: "5px", textAlign: "center" },
    generateButton: { background: "#007BFF", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "10px" },
    button: { background: "linear-gradient(135deg, #4CAF50, #2E8B57)", color: "white", fontSize: "18px", padding: "12px 24px", border: "none", borderRadius: "30px", cursor: "pointer", marginTop: "15px", transition: "all 0.3s ease-in-out" },
};

export default STCFSimulator;