import React from "react";

function Header() {
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>CPU Scheduling Simulator</h1>
            <p style={styles.subtitle}>
                We are assuming that each process on the barline came in at different times and is one second apart, 
                and is already aligned based on arrival time.
            </p>
        </header>
    );
}

const styles = {
    header: {
        background: "#e1eff0", 
        color: "#507882", 
        textAlign: "center",
        padding: "15px 30px",
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Playfair Display', serif",
    },
    title: {
        margin: "10px 0",
        fontSize: "40px",
    },
    subtitle: {
        marginTop: "10px", 
        fontSize: "16px",  
        color: "#507882",  
        fontStyle: "italic",  
    },
};

export default Header;
