export default function IntroBanner() {
    return (
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          background: "#fafafa",
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.6, color: "#1f2937" }}>
          Welcome to Hi-Sport Badminton Club. We are a friendly badminton community
          focused on fitness, fun, and regular play for players of different skill
          levels. This portal helps members view upcoming sessions and stay connected
          with the club.
        </p>
  
        <p style={{ marginTop: 12, marginBottom: 0, lineHeight: 1.6, color: "#1f2937" }}>
          Register as a player to view sessions and play. Once registered and
          approved, you will be able to participate in club sessions.
        </p>
  
        <div style={{ marginTop: 12 }}>
          <b>Contact Admin:</b>{" "}
          <a href="mailto:vijaysampath@gmail.com" style={{ color: "#111827" }}>
            vijaysampath@gmail.com
          </a>
        </div>
  
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px solid #e5e5e5",
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
          <b>Phase 1 (Live):</b>
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            <li>View upcoming badminton sessions</li>
            <li>Admin session creation and management</li>
            <li>Basic player and voting functionality</li>
          </ul>
        </div>
      </div>
    );
  }