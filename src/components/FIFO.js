import React, { useEffect, useState, useRef } from "react";
import ChartContainer from "./Charts";
import Timer from "./Timer";
import jsPDF from "jspdf";

const FIFO = () => {

    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [execProgress, setExecProgress] = useState(0);
    const [numProc, setNumProc] = useState(3);
    const [processes, setProcesses] = useState([]);
    const [logs, setLogs] = useState([]);
    const colorMap = useRef({});
    const availableColors = ["#F4D1D6", "#D8A8C3", "#E4B9D9", "#A0B8B1", "#E1C7B0", "#D4D7E1", "#F1E1A6", "#F2C9A1", "#D4A79E", "#A3C9B2"];

    const getColor = (id) => {
        if (!colorMap.current[id]) {
            colorMap.current[id] = availableColors[Object.keys(colorMap.current).length % availableColors.length];
        }
        return colorMap.current[id];
    };

    const genProcesses = (count) => {
        let newProcs = Array.from({ length: count }, (_, i) => {
            const procId = `P${i + 1}`;
            return {
                id: procId,
                arrival: Math.floor(Math.random() * 6),
                burstTime: Math.floor(Math.random() * 6) + 2,
                initialBurst: 0,
                color: getColor(procId),
            };
        });

        newProcs = newProcs.sort((a, b) => a.arrival - b.arrival);
        newProcs = newProcs.map((p) => ({ ...p, initialBurst: p.burstTime }));

        setProcesses(newProcs);
        setLogs([]); 
    };

    const startSim = () => {
        if (isRunning) return;
        setIsRunning(true);
        setCurrentTime(0);
        setExecProgress(0);
        setLogs([]);
        runFIFO();
    };

    const runFIFO = () => {
        let totalBurst = processes.reduce((acc, p) => acc + p.burstTime, 0);
        let executedTime = 0;

        const executeProc = (index) => {
            if (index >= processes.length) {
                setIsRunning(false);
                setTimeout(() => setExecProgress(0),1000);
                return;
            }

            const proc = processes[index];
            let burstLeft = proc.burstTime;

            const interval = setInterval(() => {
                if (burstLeft > 0) {
                    setCurrentTime((prev) => prev + 1);
                    burstLeft--;
                    executedTime++;

                    setExecProgress((executedTime / totalBurst) * 100);
                    setProcesses((prevProcs) =>
                        prevProcs.map((p) => (p.id === proc.id ? { ...p, burstTime: burstLeft, color: p.color } : p))
                    );

                    setLogs((prevLogs) => [
                        ...prevLogs,
                        `Time ${executedTime}: Process ${proc.id} executed (Remaining: ${burstLeft})`,
                    ]);
                } else {
                    clearInterval(interval);
                    executeProc(index + 1);
                }
            }, 1000);
        };

        executeProc(0);
    };

    const saveLogs = () => {
        const pdf = new jsPDF();
        pdf.text("FIFO Scheduling Execution Logs", 10, 10);
        logs.forEach((log, index) => {
            pdf.text(log, 10, 20 + index * 5);
        });
        pdf.save("FIFO_Logs.pdf");
    };

    return (
        <div style={styles.container}>
            <div>
                <label style={styles.label}>Processes: </label>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={numProc}
                    onChange={(e) => setNumProc(Number(e.target.value))}
                    style={styles.input}
                />
                <button onClick={() => genProcesses(numProc)} style={styles.genButton}>
                    Generate
                </button>
            </div>

            <Timer currentTime={currentTime} />
            <ChartContainer processes={processes} executionProgress={execProgress} />

            <button onClick={saveLogs} style={styles.button}>
                Download
            </button>

            <button onClick={startSim} disabled={isRunning} style={styles.button}>
                Start Simulation
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
    genButton: {
        background: "linear-gradient(135deg, #e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
    button: {
        background: "linear-gradient(135deg, #e1eff0, #e1eff0)",
        color: "#507882",
        fontSize: "18px",
        padding: "12px 24px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        marginTop: "15px",
        marginRight: "10px",
        marginLeft: "10px",
    },
};

export default FIFO;