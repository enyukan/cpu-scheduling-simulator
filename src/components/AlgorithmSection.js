import React from 'react';

// Define AlgorithmSection Component
function AlgorithmSection({ id, title, description, SimulatorComponent }) {

    return (
        <section id={id} style={styles.section}>
            <h2>{title}</h2>

            {/* Display the simulator automatically */}
            {SimulatorComponent && <SimulatorComponent />}
        </section>
    );
}

const styles = {
    section: {
        padding: "80px 20px",
        textAlign: "center",
        borderBottom: "1px solid #ddd",
        borderRadius: "5px",
    },
};

export default AlgorithmSection;
