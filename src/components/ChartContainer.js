import React from 'react';

function Header({ onGenerate, onTimeQuantumChange, handleAlgorithmClick, onProcessCountChange, onRunAll }) {
  return (
    <div className="header">
      <h1>CPU Scheduling Simulator</h1>

      <div className="input-group">
        <label>Number of Processes:</label>
        <input
          type="number"
          onChange={onProcessCountChange}
          placeholder="Enter number of processes"
        />
      </div>

      <div className="input-group">
        <label>Time Quantum for RR:</label>
        <input
          type="number"
          onChange={onTimeQuantumChange}
          placeholder="Enter Time Quantum"
        />
      </div>

      <button onClick={onGenerate}>Generate Processes</button>

      <div className="algorithm-buttons">
        <button onClick={() => handleAlgorithmClick('FIFO')}>FIFO</button>
        <button onClick={() => handleAlgorithmClick('SJF')}>SJF</button>
        <button onClick={() => handleAlgorithmClick('STCF')}>STCF</button>
        <button onClick={() => handleAlgorithmClick('RR')}>RR</button>
        <button onClick={() => handleAlgorithmClick('MLFQ')}>MLFQ</button>
      </div>

    </div>
  );
}

export default Header;
