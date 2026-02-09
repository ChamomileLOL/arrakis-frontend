import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './App.css'

const BACKEND_URL = "https://arrakis-backend.onrender.com";
const LIMIT = 5;

function App() {
  // --- STATE: SIETCH CORE ---
  const [harvesterName, setHarvesterName] = useState('')
  const [status, setStatus] = useState('')
  const [swarm, setSwarm] = useState([]) 
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  // --- STATE: ARCHIVE RECORDS ---
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalWorms, setTotalWorms] = useState(0)

  // --- LOGIC: DATA PRESCIENCE (The Chart) ---
  const chartData = useMemo(() => {
    const counts = swarm.reduce((acc, trout) => {
      const name = trout.harvester_name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [swarm]);

  // --- LOGIC: FETCHING ---
  const fetchSwarm = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`${BACKEND_URL}/sietch/swarm`, {
        params: { page, limit: LIMIT }
      })
      setSwarm(data.data)
      setTotalPages(data.totalPages)
      setTotalWorms(data.totalWorms)
    } catch (error) {
      console.error("Prescience failed:", error)
      setStatus("ERROR: The Sietch is unreachable.")
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchSwarm()
  }, [fetchSwarm])

  const filteredSwarm = swarm.filter(trout =>
    trout.harvester_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- RITUALS: CRUD ---
  const breedMaker = async () => {
    if (!harvesterName.trim()) return setStatus("A name is required for the ritual.")
    setStatus('Summoning...')
    setIsLoading(true)
    try {
      const now = Date.now()
      const alignment = (10000000000000n + BigInt(now)).toString()

      await axios.post(`${BACKEND_URL}/sietch/breed`, {
        harvester_name: harvesterName,
        prescience_timestamp: now,
        molecular_alignment: alignment
      })

      setStatus('BLESS THE MAKER.')
      setHarvesterName('')
      page === 1 ? fetchSwarm() : setPage(1) 
    } catch (error) {
      setStatus(`FAILURE: ${error.response?.data?.error || "The Desert Rejects You."}`)
    } finally {
      setIsLoading(false)
    }
  }

  const recycleWater = async (id) => {
    if (!window.confirm("Return this water to the tribe?")) return
    setIsLoading(true)
    try {
      await axios.delete(`${BACKEND_URL}/sietch/recycle/${id}`)
      fetchSwarm()
    } catch (error) {
      setStatus("FAILURE: Water discipline failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const renameWorm = async (id, currentName) => {
    const newName = window.prompt(`Rename ${currentName}:`, currentName)
    if (!newName || newName === currentName) return
    setIsLoading(true)
    try {
      await axios.put(`${BACKEND_URL}/sietch/rename/${id}`, { new_name: newName })
      fetchSwarm()
    } catch (error) {
      setStatus("FAILURE: Ritual interrupted.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`app-wrapper ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? "☀️ High Sun" : "🌙 Sietch Night"}
      </button>

      <main className="card">
        <header>
          <h1>Arrakis Breeding Grounds</h1>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Harvester Name..."
              value={harvesterName}
              onChange={(e) => setHarvesterName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && breedMaker()}
            />
            <button onClick={breedMaker} disabled={isLoading}>Breed Maker</button>
          </div>
          <p className={`status ${status.includes('FAILURE') ? 'error' : 'success'}`}>{status}</p>
        </header>

        {/* ANALYTICS HUD */}
        {!isLoading && chartData.length > 0 && (
          <section className="chart-section">
            <h3>Sector Productivity</h3>
            <div style={{ width: '100%', height: 150 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} stroke="currentColor" />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section className="swarm-container">
          <div className="swarm-header">
            <div>
              <h2>The Swarm ({totalWorms})</h2>
              <small>Sector {page} of {totalPages}</small>
            </div>
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Search sands..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="loader-container">
              <div className="sand-spinner"></div>
              <p>Scanning seismic signatures...</p>
            </div>
          ) : (
            <>
              <div className="scroll-box">
                {filteredSwarm.map((trout) => (
                  <article key={trout._id} className="trout-card">
                    <div className="info">
                      <strong>{trout.harvester_name}</strong>
                      <code>ID: {trout._id.slice(-6)}</code>
                    </div>
                    <div className="actions">
                      <button onClick={() => renameWorm(trout._id, trout.harvester_name)}>Rename</button>
                      <button className="recycle-btn" onClick={() => recycleWater(trout._id)}>Recycle</button>
                    </div>
                  </article>
                ))}
              </div>

              <nav className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
              </nav>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App