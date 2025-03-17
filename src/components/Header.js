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
        background: "#e1eff0", // Header background black
        color: "#507882", // Text white
        textAlign: "center",
        padding: "15px 30px", // Adjusted padding to make the header thinner
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Playfair Display', serif", // Apply Playfair Display font
    },
    title: {
        margin: "10px 0",
        fontSize: "40px",
    },
    subtitle: {
        marginTop: "10px", // Add some space between the title and subtitle
        fontSize: "16px",  // Smaller font size for the subtitle
        color: "#507882",  // Same color as the title for consistency
        fontStyle: "italic",  // Optional: Make the subtitle italic for distinction
    },
};

export default Header;
