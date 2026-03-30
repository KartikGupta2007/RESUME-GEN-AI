const Loading = ({ text = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>{text}</p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ccc",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "10px",
    fontSize: "16px",
  },
};

// Inject keyframes manually
const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }`;

if (styleSheet) {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

export default Loading;