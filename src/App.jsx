import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness, Search, MapPin, Building2, Clock3, ArrowRight,
  LogIn, UserPlus, LogOut, Plus, ShieldCheck, Trash2, RotateCcw,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import {
  apiFetch, getToken, getRole, login, logout, register,
  getJobs, searchJobs, createJob, softDeleteJob, deleteJob, restoreJob
} from "./api";

const sample = [
  { id: "demo-1", title: "Java Backend Developer", company: "TechNova", location: "Noida, Uttar Pradesh", createdAt: new Date().toISOString(), address: { city: "Noida", state: "Uttar Pradesh" }, jobSkills: [{skill:"Java",yearsExperience:0},{skill:"Spring Boot",yearsExperience:0},{skill:"MySQL",yearsExperience:0}] },
  { id: "demo-2", title: "Spring Boot Developer", company: "CloudCraft", location: "Gurugram, Haryana", createdAt: new Date().toISOString(), address: { city: "Gurugram", state: "Haryana" }, jobSkills: [{skill:"Spring Boot",yearsExperience:1},{skill:"JPA",yearsExperience:1},{skill:"REST API",yearsExperience:0}] },
  { id: "demo-3", title: "Junior Java Engineer", company: "CodeBridge", location: "Bengaluru, Karnataka", createdAt: new Date().toISOString(), address: { city: "Bengaluru", state: "Karnataka" }, jobSkills: [{skill:"Java",yearsExperience:0},{skill:"SQL",yearsExperience:0}] }
];

function App() {
  const [authTick, setAuthTick] = useState(0);
  const token = getToken();
  const role = getRole();

  const signOut = () => { logout(); setAuthTick(x => x + 1); };

  return (
    <div className="app-shell">
      <Header token={token} role={role} onLogout={signOut} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Auth mode="login" onAuth={() => setAuthTick(x => x + 1)} />} />
        <Route path="/register" element={<Auth mode="register" onAuth={() => setAuthTick(x => x + 1)} />} />
        <Route path="/admin" element={<Admin role={role} />} />
        <Route path="/post-job" element={<PostJob role={role} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

function Header({ token, role, onLogout }) {
  const location = useLocation();
  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-mark"><BriefcaseBusiness size={20}/></span>
        Job<span>Portal</span>
      </Link>
      <nav>
        <Link className={location.pathname === "/" ? "active" : ""} to="/">Home</Link>
        <Link className={location.pathname === "/jobs" ? "active" : ""} to="/jobs">Find Jobs</Link>
        {token && (role === "ADMIN" || role === "RECRUITER") && <Link to="/post-job">Post a Job</Link>}
        {token && role === "ADMIN" && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="nav-actions">
        {token ? (
          <>
            <span className="role-pill"><ShieldCheck size={14}/>{role || "USER"}</span>
            <button className="btn btn-ghost" onClick={onLogout}><LogOut size={16}/> Logout</button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login">Log in</Link>
            <Link className="btn btn-primary" to="/register">Create account</Link>
          </>
        )}
      </div>
    </header>
  );
}

function Home() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</div>
          <h1>Find work that<br/><em>moves you forward.</em></h1>
          <p>Search quality opportunities, explore companies and discover roles that match your skills.</p>
          <form className="searchbar large" onSubmit={e => { e.preventDefault(); navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`); }}>
            <Search size={21}/>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Job title, skill or company" />
            <button className="btn btn-primary" type="submit">Search jobs <ArrowRight size={17}/></button>
          </form>
          <div className="hero-tags">
            <span>Popular:</span><button onClick={() => navigate("/jobs?keyword=Java")}>Java</button>
            <button onClick={() => navigate("/jobs?keyword=Spring Boot")}>Spring Boot</button>
            <button onClick={() => navigate("/jobs?keyword=Backend")}>Backend</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="mini-window">
            <div className="mini-top"><span></span><span></span><span></span><b>jobportal.app</b></div>
            <div className="mini-stat"><strong>1,240+</strong><span>opportunities</span></div>
            <div className="mini-job"><div className="company-icon">J</div><div><b>Java Backend Developer</b><small>TechNova · Noida</small></div><ArrowRight size={16}/></div>
            <div className="mini-job"><div className="company-icon">S</div><div><b>Spring Boot Engineer</b><small>StackLabs · Gurugram</small></div><ArrowRight size={16}/></div>
            <div className="mini-job"><div className="company-icon">C</div><div><b>Software Engineer</b><small>CodeCraft · Bengaluru</small></div><ArrowRight size={16}/></div>
          </div>
        </div>
      </section>
      <section className="feature-strip">
        <div><Search size={21}/><div><b>Smart search</b><span>Find by title or company</span></div></div>
        <div><ShieldCheck size={21}/><div><b>Secure access</b><span>JWT-powered authentication</span></div></div>
        <div><BriefcaseBusiness size={21}/><div><b>Real opportunities</b><span>Built for modern hiring</span></div></div>
      </section>
      <section className="section">
        <div className="section-head"><div><div className="eyebrow">EXPLORE</div><h2>Built for your next move.</h2></div><Link to="/jobs" className="text-link">Browse all jobs <ArrowRight size={16}/></Link></div>
        <div className="category-grid">
          {["Java & Spring Boot","Backend Development","Software Engineering","Entry Level"].map((x,i)=><Link key={x} to={`/jobs?keyword=${encodeURIComponent(i===0?"Java":i===1?"Backend":"Developer")}`} className="category-card"><span>0{i+1}</span><h3>{x}</h3><ArrowRight size={18}/></Link>)}
        </div>
      </section>
    </main>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [pageData, setPageData] = useState({number:0,totalPages:1,totalElements:0});
  const [keyword, setKeyword] = useState(new URLSearchParams(window.location.search).get("keyword") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(page=0, term=keyword) {
    setLoading(true); setError("");
    try {
      let data;
      if (term.trim()) data = await searchJobs(term.trim(), page, 4);
      else data = await getJobs(page, 4);
      setJobs(data?.content || []);
      setPageData(data || {number:page,totalPages:1,totalElements:0});
    } catch (e) {
      setError(e.message);
      setJobs(sample);
      setPageData({number:0,totalPages:1,totalElements:sample.length});
    } finally { setLoading(false); }
  }

  useEffect(() => { load(0, keyword); }, []);

  return <main className="page">
    <div className="page-heading">
      <div><div className="eyebrow">OPPORTUNITIES</div><h1>Find your next role.</h1><p>{pageData.totalElements || jobs.length} opportunities to explore.</p></div>
      <form className="searchbar" onSubmit={e => {e.preventDefault(); load(0,keyword)}}><Search size={19}/><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Search jobs..." /><button className="btn btn-primary">Search</button></form>
    </div>
    {error && <div className="notice">Backend unavailable or request blocked. Showing demo jobs so you can preview the UI. <span>{error}</span></div>}
    {loading ? <div className="loading">Loading opportunities...</div> :
      <div className="jobs-layout">
        <div className="jobs-list">
          {jobs.map(job => <JobCard key={job.id} job={job}/>)}
          {!jobs.length && <div className="empty">No jobs found. Try another keyword.</div>}
          {jobs.length > 0 && <div className="pagination">
            <button disabled={pageData.number <= 0} onClick={()=>load(pageData.number-1)}><ChevronLeft/></button>
            <span>Page {pageData.number + 1} of {Math.max(pageData.totalPages || 1,1)}</span>
            <button disabled={pageData.number >= (pageData.totalPages || 1)-1} onClick={()=>load(pageData.number+1)}><ChevronRight/></button>
          </div>}
        </div>
        <aside className="side-note"><div className="side-icon"><BriefcaseBusiness/></div><h3>Looking for your next opportunity?</h3><p>Create an account to keep your job search organized and access secured features.</p><Link className="btn btn-primary full" to="/register">Create account</Link></aside>
      </div>
    }
  </main>
}

function JobCard({job}) {
  const skills = (job.jobSkills || []).slice(0,5);
  return <article className="job-card">
    <div className="job-logo">{(job.company || "J").charAt(0).toUpperCase()}</div>
    <div className="job-main">
      <div className="job-title-row"><div><h3>{job.title}</h3><p>{job.company}</p></div><span className="job-type">Full time</span></div>
      <div className="job-meta"><span><MapPin size={15}/>{job.location || job.address?.city || "India"}</span><span><Building2 size={15}/>Engineering</span><span><Clock3 size={15}/>Recently posted</span></div>
      <div className="skills">{skills.map((s,i)=><span key={i}>{s.skill}</span>)}</div>
    </div>
    <ArrowRight className="job-arrow" size={19}/>
  </article>
}

function Auth({mode,onAuth}) {
  const isLogin = mode === "login";
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const navigate=useNavigate();

  async function submit(e){
    e.preventDefault(); setBusy(true); setError("");
    try {
      if(isLogin) { await login(username,password); onAuth(); navigate("/jobs"); }
      else { await register(username,password); navigate("/login"); }
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-panel">
      <div className="auth-brand"><span className="brand-mark"><BriefcaseBusiness size={19}/></span>JobPortal</div>
      <div className="eyebrow">{isLogin ? "WELCOME BACK" : "GET STARTED"}</div>
      <h1>{isLogin ? "Sign in to continue." : "Create your account."}</h1>
      <p>{isLogin ? "Access your job search and secured portal features." : "Join the portal and start exploring opportunities."}</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="form">
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username"/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={isLogin?"current-password":"new-password"}/></label>
        <button className="btn btn-primary full" disabled={busy}>{busy ? "Please wait..." : isLogin ? <><LogIn size={17}/> Sign in</> : <><UserPlus size={17}/> Create account</>}</button>
      </form>
      <div className="auth-switch">{isLogin ? "Don't have an account?" : "Already have an account?"} <Link to={isLogin?"/register":"/login"}>{isLogin?"Create one":"Sign in"}</Link></div>
    </div>
  </main>
}

function PostJob({role}) {
  const [form,setForm]=useState({title:"",company:"",location:"",street:"",city:"",state:"",pincode:"",skills:"Java, Spring Boot, MySQL"});
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  if(!getToken()) return <main className="page"><div className="empty"><h2>Sign in required</h2><Link to="/login" className="btn btn-primary">Sign in</Link></div></main>;
  if(role!=="ADMIN" && role!=="RECRUITER") return <main className="page"><div className="empty"><h2>You don't have permission to post jobs.</h2></div></main>;

  async function submit(e){
    e.preventDefault();setBusy(true);setMessage("");setError("");
    const skills=form.skills.split(",").map(s=>s.trim()).filter(Boolean).map(skill=>({skill,yearsExperience:0}));
    try {
      await createJob({title:form.title,company:form.company,location:form.location,address:{street:form.street,city:form.city,state:form.state,pincode:Number(form.pincode)},jobSkills:skills});
      setMessage("Job created successfully."); setForm({...form,title:"",company:"",location:""});
    } catch(e){setError(e.message)}
    finally{setBusy(false)}
  }

  return <main className="page narrow"><div className="page-heading"><div><div className="eyebrow">RECRUITER TOOLS</div><h1>Post a new job.</h1><p>Publish an opportunity directly to your portal.</p></div></div>
    {message&&<div className="success">{message}</div>}{error&&<div className="error">{error}</div>}
    <form className="job-form" onSubmit={submit}>
      <div className="form-grid"><label>Job title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Company<input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Street<input required value={form.street} onChange={e=>setForm({...form,street:e.target.value})}/></label><label>City<input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label>State<input required value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label><label>Pincode<input required type="number" min="100000" max="999999" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})}/></label><label>Skills <small>comma separated</small><input required value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/></label></div>
      <button className="btn btn-primary" disabled={busy}>{busy?"Publishing...":<><Plus size={17}/> Publish job</>}</button>
    </form>
  </main>
}

function Admin({role}) {
  const [jobs,setJobs]=useState([]); const [message,setMessage]=useState("");
  if(!getToken() || role!=="ADMIN") return <main className="page"><div className="empty"><h2>Admin access required.</h2><Link to="/login" className="btn btn-primary">Sign in</Link></div></main>;
  async function load(){ try { const d=await getJobs(0,4); setJobs(d?.content||[]); } catch { setJobs([]); } }
  useEffect(()=>{load()},[]);
  const action=async(fn,id)=>{try{await fn(id);setMessage("Action completed.");load()}catch(e){setMessage(e.message)}};
  return <main className="page"><div className="page-heading"><div><div className="eyebrow">ADMIN</div><h1>Manage opportunities.</h1><p>Review and manage jobs from the portal.</p></div><Link className="btn btn-primary" to="/post-job"><Plus size={17}/> Post job</Link></div>
    {message&&<div className="notice">{message}</div>}
    <div className="admin-list">{jobs.map(j=><div className="admin-row" key={j.id}><div><b>{j.title}</b><span>{j.company} · {j.location}</span></div><div className="row-actions"><button title="Soft delete" onClick={()=>action(softDeleteJob,j.id)}><Trash2 size={17}/></button><button title="Hard delete" onClick={()=>action(deleteJob,j.id)}><X size={17}/></button><button title="Restore" onClick={()=>action(restoreJob,j.id)}><RotateCcw size={17}/></button></div></div>)}</div>
  </main>
}

function NotFound(){return <main className="page"><div className="empty"><h1>404</h1><p>That page doesn't exist.</p><Link to="/" className="btn btn-primary">Back home</Link></div></main>}
function Footer(){return <footer><div className="brand">Job<span>Portal</span></div><p>Spring Boot + JWT Job Portal</p><span>© 2026 JobPortal</span></footer>}

export default App;