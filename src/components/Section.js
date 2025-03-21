import React from 'react';

// Section Component
function Section({ id, title, desc, Simulator }) {
    return (
        <section id={id} style={styles.section}>
            <h2>{title}</h2>

            {/* Display simulator if available */}
            {Simulator && <Simulator />}
        </section>
    );
}

const styles = {
    section: {
        padding: "80px 20px",
        textAlign: "center",
        borderBottom: "1px solid #d9e2de",
        borderRadius: "5px",
    },
};

export default Section;
