function TestCompleted() {
  return (  
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <svg height="80" width="80" viewBox="0 0 48 48" style={{ marginRight: 28 }}>
          <circle cx="24" cy="24" r="24" fill="#4caf50" />
          <polyline
            points="13,26 21,34 35,16"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <div style={{ fontSize: 38, fontWeight: 700, color: "#232323" }}>Test Completed</div>
          <div style={{ fontSize: 20, marginTop: 6, color: "#555", maxWidth: 500, lineHeight: 1.6 }}>
            Congratulations! Your responses have been recorded.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestCompleted;