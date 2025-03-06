import React, { useState } from "react";

const App = () => {
  const [numProcesses, setNumProcesses] = useState(5);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState([]);
  const [fifoResults, setFifoResults] = useState([]);
  const [sjfResults, setSjfResults] = useState([]);
  const [stcfResults, setStcfResults] = useState([]);
  const [roundRobinResults, setRoundRobinResults] = useState([]);
  const [mlfqResults, setMlfqResults] = useState([]);

  // Function to generate random processes
  const generateProcesses = () => {
    const newProcesses = Array.from({ length: numProcesses }, (_, i) => ({
      id: i + 1,
      arrivalTime: Math.floor(Math.random() * 10), // Random arrival time between 0-9
      burstTime: Math.floor(Math.random() * 10) + 1, // Random burst time between 1-10
    }));
    setProcesses(newProcesses);
    setFifoResults([]);
    setSjfResults([]); 
    setStcfResults([]);
    setRoundRobinResults([]);
    setMlfqResults([]);
  };

  // FIFO Scheduling Algorithm
  const runFIFO = () => {
    console.log("FIFO button clicked!"); // Debug log
  
    if (processes.length === 0) {
      console.log("No processes available!"); // Debug log
      return;
    }
  
    let sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    let results = [];
  
    sortedProcesses.forEach((process) => {
      const startTime = Math.max(currentTime, process.arrivalTime);
      const finishTime = startTime + process.burstTime;
      currentTime = finishTime;
  
      results.push({
        ...process,
        startTime,
        finishTime,
        turnaroundTime: finishTime - process.arrivalTime,
        waitingTime: startTime - process.arrivalTime,
      });
    });
  
    console.log("FIFO results calculated:", results); // Debug log
  
    setFifoResults(results);
  };
  
  // SJF (Shortest Job First) Scheduling Algorithm
  const runSJF = () => {
    if (processes.length === 0) return;

    let sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    let readyQueue = [];
    let completedProcesses = [];

    while (sortedProcesses.length > 0 || readyQueue.length > 0) {
      while (sortedProcesses.length > 0 && sortedProcesses[0].arrivalTime <= currentTime) {
        readyQueue.push(sortedProcesses.shift());
      }

      if (readyQueue.length > 0) {
        readyQueue.sort((a, b) => a.burstTime - b.burstTime);
        let process = readyQueue.shift();

        let startTime = Math.max(currentTime, process.arrivalTime);
        let finishTime = startTime + process.burstTime;
        currentTime = finishTime;

        completedProcesses.push({
          ...process,
          startTime,
          finishTime,
          turnaroundTime: finishTime - process.arrivalTime,
          waitingTime: startTime - process.arrivalTime,
        });
      } else {
        currentTime = sortedProcesses[0].arrivalTime;
      }
    }
    setSjfResults(completedProcesses);    
  };

    // STCF (Shortest Time-to-Completion First) Scheduling Algorithm
  const runSTCF = () => {
    if (processes.length === 0) return;

    let sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    let readyQueue = [];
    let completedProcesses = [];
    let remainingBurstTime = sortedProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));

    while (remainingBurstTime.length > 0 || readyQueue.length > 0) {
      while (remainingBurstTime.length > 0 && remainingBurstTime[0].arrivalTime <= currentTime) {
        readyQueue.push(remainingBurstTime.shift());
      }

      if (readyQueue.length > 0) {
        readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        let process = readyQueue[0];

        process.remainingTime--;
        currentTime++;

        if (process.remainingTime === 0) {
          process.finishTime = currentTime;
          process.turnaroundTime = process.finishTime - process.arrivalTime;
          process.waitingTime = process.turnaroundTime - process.burstTime;
          completedProcesses.push(process);
          readyQueue.shift();
        }
      } else {
        currentTime = remainingBurstTime[0]?.arrivalTime || currentTime + 1;
      }
    }

    setStcfResults(completedProcesses);
  };

    // RR (Round Robin) Scheduling Algorithm
    const runRR = () => {
      if (processes.length === 0) return;
    
      let remainingBurstTime = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
      let queue = [];
      let currentTime = 0;
      let completedProcesses = [];
    
      while (remainingBurstTime.length > 0 || queue.length > 0) {
        while (remainingBurstTime.length > 0 && remainingBurstTime[0].arrivalTime <= currentTime) {
          queue.push(remainingBurstTime.shift());
        }
    
        if (queue.length > 0) {
          let process = queue.shift();
          let burst = Math.min(process.remainingTime, timeQuantum);
    
          process.remainingTime -= burst;
          currentTime += burst;
    
          if (process.remainingTime === 0) {
            process.finishTime = currentTime;
            process.turnaroundTime = process.finishTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            completedProcesses.push(process);
          } else {
            queue.push(process);
          }
        } else {
          currentTime = remainingBurstTime[0]?.arrivalTime || currentTime + 1;
        }
      }
    
      setRoundRobinResults(completedProcesses);
    };

    // MLFQ (Multi-Level Feedback Queue) Scheduling Algorithm
    const runMLFQ = () => {
      if (processes.length === 0) return;

      let currentTime = 0;
      let completedProcesses = [];
      
      // Define multiple queues for different levels of priority
      let queue1 = []; // Highest priority queue
      let queue2 = []; // Second priority queue
      let queue3 = []; // Lowest priority queue

      let remainingProcesses = processes.map(p => ({ ...p, remainingTime: p.burstTime, level: 1 }));
      
      // Sort processes based on arrival time
      remainingProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

      const timeQuantum1 = 2; // Time quantum for queue 1 (highest priority)
      const timeQuantum2 = 4; // Time quantum for queue 2 (second priority)
      const timeQuantum3 = 6; // Time quantum for queue 3 (lowest priority)

      while (remainingProcesses.length > 0 || queue1.length > 0 || queue2.length > 0 || queue3.length > 0) {
        // Move processes into the appropriate queues based on arrival time
        while (remainingProcesses.length > 0 && remainingProcesses[0].arrivalTime <= currentTime) {
          let process = remainingProcesses.shift();
          queue1.push(process); // Initially all processes enter the highest priority queue
        }

        // Process from Queue 1
        if (queue1.length > 0) {
          let process = queue1.shift();
          let burst = Math.min(process.remainingTime, timeQuantum1);
          process.remainingTime -= burst;
          currentTime += burst;

          if (process.remainingTime === 0) {
            process.finishTime = currentTime;
            process.turnaroundTime = process.finishTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            completedProcesses.push(process);
          } else {
            queue2.push({ ...process, level: 2 }); // Move to Queue 2 if not finished
          }
        }
        // Process from Queue 2
        else if (queue2.length > 0) {
          let process = queue2.shift();
          let burst = Math.min(process.remainingTime, timeQuantum2);
          process.remainingTime -= burst;
          currentTime += burst;

          if (process.remainingTime === 0) {
            process.finishTime = currentTime;
            process.turnaroundTime = process.finishTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            completedProcesses.push(process);
          } else {
            queue3.push({ ...process, level: 3 }); // Move to Queue 3 if not finished
          }
        }
        // Process from Queue 3
        else if (queue3.length > 0) {
          let process = queue3.shift();
          let burst = Math.min(process.remainingTime, timeQuantum3);
          process.remainingTime -= burst;
          currentTime += burst;

          if (process.remainingTime === 0) {
            process.finishTime = currentTime;
            process.turnaroundTime = process.finishTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;
            completedProcesses.push(process);
          } else {
            queue3.push(process); // Keep in Queue 3 if not finished
          }
        } else {
          currentTime++; // If no processes are ready to be processed, increment time
        }
      }

      setMlfqResults(completedProcesses);
    };


    
  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1>CPU Scheduling Simulator</h1>

      <div style={{ margin: "20px" }}>
        <label style={{ display: "block", margin: "10px" }}>
          Number of Processes:
          <input
            type="number"
            value={numProcesses}
            onChange={(e) => setNumProcesses(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>

        <label style={{ display: "block", margin: "10px" }}>
          Time Quantum (for RR):
          <input
            type="number"
            value={timeQuantum}
            onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>

      <button 
        onClick={generateProcesses}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginRight: "10px" }}
      >
        Generate Processes
      </button>

      <button 
        onClick={runFIFO}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginRight: "10px" }}
        disabled={processes.length === 0}
      >
        Run FIFO
      </button>

      <button 
        onClick={runSJF}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        disabled={processes.length === 0}
      >
        Run SJF
      </button>

      <button 
        onClick={runSTCF}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginLeft: "10px" }}
        disabled={processes.length === 0}
      >
        Run STCF
      </button>

      <button 
        onClick={runRR}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginLeft: "10px" }}
        disabled={processes.length === 0}
      >
        Run RR
      </button>

      <button 
        onClick={runMLFQ}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", marginLeft: "10px" }}
        disabled={processes.length === 0}
      >
        Run MLFQ
      </button>

      {processes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Processes</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "50%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Arrival Time</th>
                <th style={{ padding: "8px" }}>Burst Time</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id}>
                  <td style={{ padding: "8px" }}>{process.id}</td>
                  <td style={{ padding: "8px" }}>{process.arrivalTime}</td>
                  <td style={{ padding: "8px" }}>{process.burstTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fifoResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>FIFO Scheduling Results</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Start Time</th>
                <th style={{ padding: "8px" }}>Finish Time</th>
                <th style={{ padding: "8px" }}>Turnaround Time</th>
                <th style={{ padding: "8px" }}>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {fifoResults.map((result) => (
                <tr key={result.id}>
                  <td style={{ padding: "8px" }}>{result.id}</td>
                  <td style={{ padding: "8px" }}>{result.startTime}</td>
                  <td style={{ padding: "8px" }}>{result.finishTime}</td>
                  <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
                  <td style={{ padding: "8px" }}>{result.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sjfResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>SJF Scheduling Results</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Start Time</th>
                <th style={{ padding: "8px" }}>Finish Time</th>
                <th style={{ padding: "8px" }}>Turnaround Time</th>
                <th style={{ padding: "8px" }}>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {sjfResults.map((result) => (
                <tr key={result.id}>
                  <td style={{ padding: "8px" }}>{result.id}</td>
                  <td style={{ padding: "8px" }}>{result.startTime}</td>
                  <td style={{ padding: "8px" }}>{result.finishTime}</td>
                  <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
                  <td style={{ padding: "8px" }}>{result.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stcfResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>STCF Scheduling Results</h2>
          <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px" }}>Process ID</th>
                <th style={{ padding: "8px" }}>Finish Time</th>
                <th style={{ padding: "8px" }}>Turnaround Time</th>
                <th style={{ padding: "8px" }}>Waiting Time</th>
              </tr>
            </thead>
            <tbody>
              {stcfResults.map((result) => (
                <tr key={result.id}>
                  <td style={{ padding: "8px" }}>{result.id}</td>
                  <td style={{ padding: "8px" }}>{result.finishTime}</td>
                  <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
                  <td style={{ padding: "8px" }}>{result.waitingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {roundRobinResults.length > 0 && (
        <div style={{ marginTop: "20px" }}>
        <h2>RR Scheduling Results</h2>
        <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px" }}>Process ID</th>
              <th style={{ padding: "8px" }}>Finish Time</th>
              <th style={{ padding: "8px" }}>Turnaround Time</th>
              <th style={{ padding: "8px" }}>Waiting Time</th>
            </tr>
          </thead>
          <tbody>
          {roundRobinResults.map((result) => (
            <tr key={result.id}>
              <td style={{ padding: "8px" }}>{result.id}</td>
              <td style={{ padding: "8px" }}>{result.finishTime}</td>
              <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
              <td style={{ padding: "8px" }}>{result.waitingTime}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    )}

    {mlfqResults.length > 0 && (
      <div style={{ marginTop: "20px" }}>
        <h2>MLFQ Scheduling Results</h2>
        <table border="1" style={{ margin: "auto", borderCollapse: "collapse", width: "60%" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px" }}>Process ID</th>
              <th style={{ padding: "8px" }}>Finish Time</th>
              <th style={{ padding: "8px" }}>Turnaround Time</th>
              <th style={{ padding: "8px" }}>Waiting Time</th>
            </tr>
          </thead>
          <tbody>
          {mlfqResults.map((result) => (
            <tr key={result.id}>
              <td style={{ padding: "8px" }}>{result.id}</td>
              <td style={{ padding: "8px" }}>{result.finishTime}</td>
              <td style={{ padding: "8px" }}>{result.turnaroundTime}</td>
              <td style={{ padding: "8px" }}>{result.waitingTime}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    )}

    </div>

  );
};

export default App;
