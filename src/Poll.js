import React, { useEffect, useState } from "react";

const API = "http://localhost:4000";

export default function Poll() {

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  /* GET POLL DATA */
  useEffect(() => {
    fetch(API + "/api/polls/poll-123")
      .then(res => res.json())
      .then(data => setPoll(data));
  }, []);

  /* SUBMIT VOTE */
  const submitVote = async () => {

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        pollId: "poll-123",
        optionId: selected
      })
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Vote submitted successfully");
      window.location.reload();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!poll) return <h2 style={{color:"white"}}>Loading...</h2>;

  return (

    <div style={styles.page}>

      <div style={styles.container}>

        <div style={styles.header}>
          <h1>Online Poll</h1>
          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>

        <h2 style={styles.question}>{poll.question}</h2>

        <div style={styles.options}>

          {poll.options.map(opt => (

            <label key={opt.optionId} style={styles.option}>

              <input
                type="radio"
                name="vote"
                value={opt.optionId}
                onChange={() => setSelected(opt.optionId)}
              />

              {opt.text}

            </label>

          ))}

        </div>

        <button style={styles.button} onClick={submitVote}>
          Submit Vote
        </button>

        <p style={styles.message}>{message}</p>

        <div style={styles.results}>

          <h3>Results</h3>

          {poll.options.map(opt => (

            <div key={opt.optionId} style={styles.resultBar}>

              <span>{opt.text}</span>

              <div style={{
                ...styles.bar,
                width: opt.votes * 20 + "px"
              }}></div>

              <span>{opt.votes}</span>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}

/* STYLES */

const styles = {

  page:{
    minHeight:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"linear-gradient(135deg,#0f172a,#1e293b)"
  },

  container:{
    width:"700px",
    background:"#111827",
    padding:"40px",
    borderRadius:"12px",
    color:"white",
    boxShadow:"0 0 20px rgba(0,0,0,0.6)"
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },

  logout:{
    padding:"8px 14px",
    background:"#ef4444",
    border:"none",
    color:"white",
    borderRadius:"6px",
    cursor:"pointer"
  },

  question:{
    marginTop:"20px"
  },

  options:{
    marginTop:"20px"
  },

  option:{
    display:"block",
    marginBottom:"10px",
    fontSize:"16px"
  },

  button:{
    marginTop:"20px",
    padding:"12px",
    background:"#6366f1",
    border:"none",
    borderRadius:"8px",
    color:"white",
    cursor:"pointer",
    width:"100%",
    fontSize:"16px"
  },

  message:{
    marginTop:"10px",
    color:"#22c55e"
  },

  results:{
    marginTop:"30px"
  },

  resultBar:{
    display:"flex",
    alignItems:"center",
    gap:"10px",
    marginBottom:"10px"
  },

  bar:{
    height:"10px",
    background:"#22c55e",
    borderRadius:"5px"
  }

};