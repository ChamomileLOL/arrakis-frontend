import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Replace this with YOUR actual Render URL
const BACKEND_URL = "https://arrakis-backend.onrender.com";

function App() {
  const [harvesterName, setHarvesterName] = useState('')
  const [status, setStatus] = useState('')
  const [swarm, setSwarm] = useState([]) // The Army of Worms

  // FETCH THE SWARM (Runs once on load)
  const fetchSwarm = async () => {
    try {
      const response = await axios.get(${BACKEND_URL}/sietch/swarm)
      setSwarm(response.data.data)
    } catch (error) {
      console.error("Could not see the swarm:", error)
    }
  }

  // UseEffect runs fetchSwarm when the component mounts
  useEffect(() => {
    fetchSwarm()
  }, [])

  const breedMaker = async () => {
    setStatus('Summoning...')
    
    try {
      const now = Date.now()
      const sacredNumber = 10000000000000n 
      const timeReference = BigInt(now)
      const alignment = (sacredNumber + timeReference).toString()

      await axios.post(${BACKEND_URL}/sietch/breed, {
        harvester_name: harvesterName,
        prescience_timestamp: now,
        molecular_alignment: alignment
      })

      setStatus('BLESS THE MAKER. Space was folded.')
      
      // REFRESH THE SWARM immediately after breeding!
      fetchSwarm()
      setHarvesterName('') // Clear input

    } catch (error) {
      console.error(error)
      setStatus('FAILURE: The Desert Rejects You.')
    }
  }

  // RECYCLE WATER (Delete)
  const recycleWater = async (id) => {
    if (!confirm("This will return the water to the tribe. Proceed?")) return;

    try {
      await axios.delete(${BACKEND_URL}/sietch/recycle/${id}`);
      // Refresh the list immediately to show it's gone
      fetchSwarm();
    } catch (error) {
      alert("Could not recycle water.");
    }
  };


// RENAME WORM (Update)
  const renameWorm = async (id, currentName) => {
    const newName = prompt(`Rename ${currentName} to:`, currentName);
    
    // If they clicked Cancel or typed nothing, do nothing
    if (!newName || newName === currentName) return;

    try {
      await axios.put(${BACKEND_URL}/sietch/rename/${id}`, { new_name: newName });
      fetchSwarm(); // Refresh the list to see the new name
    } catch (error) {
      alert("The name was rejected.");
    }
  };

  return (
    <div className="card">
      <h1>Arrakis Breeding Grounds</h1>
      
      <div className="input-group">
        <input 
          type="text" 
          placeholder="Enter Harvester Name"
          value={harvesterName}
          onChange={(e) => setHarvesterName(e.target.value)}
        />
        <button onClick={breedMaker}>
          Attempt to Breed
        </button>
      </div>

      <p className="status">{status}</p>

      {/* THE SWARM LIST */}
      <div className="swarm-container">
        <h2>The Swarm ({swarm.length})</h2>
        <div className="scroll-box">
          {swarm.map((trout) => (
  <div key={trout._id} className="trout-card">
    <span className="icon">🪱</span>
    <div className="info">
      <strong>{trout.harvester_name}</strong>
      <small>ID: {trout._id}</small>
    </div>
    
    {/* RENAME Button */}
    <button 
      className="rename-btn" 
      onClick={() => renameWorm(trout._id, trout.harvester_name)}
    >
      Rename
    </button>

    {/* RECYCLE Button (Keep this one) */}
    <button 
      className="recycle-btn" 
      onClick={() => recycleWater(trout._id)}
    >
      Recycle
    </button>
  </div>
))}
        </div>
      </div>
    </div>
  )
}

export default App