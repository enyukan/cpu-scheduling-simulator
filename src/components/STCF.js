import React, { useState, useEffect, useRef } from "react";
import ChartContainer from "./Charts";
import Timer from "./Timer";
import jsPDF from "jspdf";

const STCF = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [executionProgress, setExecutionProgress] = useState(0);
    const [numProcesses, setNumProcesses] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [executionLogs, setExecutionLogs] = useState([]); 

    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];

    const getColorForProcess = (id) => {
        if (!colorMap.current[id]) {
            colorMap.current[id] = availableColors[Object.keys(colorMap.current).length % availableColors.length];
        }
        return colorMap.current[id];
    };

    const generateProcesses = (count) => {
        let newProcesses = Array.from({ length: count }, (_, i) => ({
            id: `P${i + 1}`,
            arrival: Math.floor(Math.random() * 6),
            burstTime: Math.floor(Math.random() * 6) + 2,
            initialBurst: 0,
            color: getColorForProcess(`P${i + 1}`),
        }));

        newProcesses.sort((a, b) => a.arrival - b.arrival);
        newProcesses = newProcesses.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcesses);
        setExecutionProgress(0);
        setExecutionLogs([]);
    };

    const startSim = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecutionProgress(0);
        setExecutionLogs([]);

        let processList = [...processes].map((p) => ({ ...p, remainingTime: p.burstTime }));
        let executedTime = 0;
        let time = 0;

        let readyQueue = [];
        let executionQueue = [];

        const interval = setInterval(() => {
            if (processList.length > 0) {
                let nextProcess = processList.shift();
                readyQueue.push(nextProcess);
            }

            if (readyQueue.length > 0) {
                readyQueue.sort((a, b) => a.remainingTime - b.remainingTime || a.arrival - b.arrival);
                let shortestJob = readyQueue.shift();
                executionQueue.push(shortestJob);

                shortestJob.remainingTime -= 1;
                executedTime++;
                time++;

                const totalBurst = processes.reduce((acc, p) => acc + p.initialBurst, 0);
                setExecutionProgress((executedTime / totalBurst) * 100);
                setProcesses((prevProcesses) =>
                    prevProcesses.map((p) => (p.id === shortestJob.id ? { ...p, burstTime: shortestJob.remainingTime } : p))
                );
                setCurrentTime(time);

                setExecutionLogs((prevLogs) => [
                    ...prevLogs,
                    `Time ${executedTime}: Process ${shortestJob.id} executed (Remaining time: ${shortestJob.remainingTime})`,
                ]);

                if (shortestJob.remainingTime > 0) {
                    readyQueue.push(shortestJob);
                }
            }

            if (readyQueue.length === 0 && processList.length === 0) {
                clearInterval(interval);
                setIsRunning(false);
                setTimeout(() => setCurrentTime(0), 1000);
            }
        }, 1000);
    };

    const saveLogsAsPDF = () => {
        const pdf = new jsPDF();
        pdf.text("STCF Scheduling Logs", 10, 10);
        executionLogs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });
        pdf.save("STCF_Logs.pdf");
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
                <button onClick={() => generateProcesses(numProcesses)} style={styles.generateButton}>
                    Generate Processes
                </button>
            </div>

            <Timer currentTime={currentTime} />
            <ChartContainer processes={processes} executionProgress={executionProgress} />

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

export default STCF;
