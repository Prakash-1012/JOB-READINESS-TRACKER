// main.js - handles sidebar active state, simple local storage for skills/goals/saved jobs
document.addEventListener('DOMContentLoaded', ()=>{

  // Sidebar active link style
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
    });
  });

  // Basic storage helpers
  const ls = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k)||'null') }catch(e){return null} },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)) },
  };

  // Goals
  const goals = ls.get('goals') || [];
  const goalsList = document.getElementById('goalsList');
  const goalInput = document.getElementById('goalInput');
  const addGoalBtn = document.getElementById('addGoal');
  if(goalsList && addGoalBtn){
    function renderGoals(){ goalsList.innerHTML=''; (ls.get('goals')||[]).forEach(g=>{ const li=document.createElement('li'); li.textContent=g; goalsList.appendChild(li) }) }
    renderGoals();
    addGoalBtn.addEventListener('click', ()=>{ const v=goalInput.value.trim(); if(!v) return; const arr=ls.get('goals')||[]; arr.push(v); ls.set('goals',arr); goalInput.value=''; renderGoals(); })
  }

  // Skills tags on dashboard
  const skillsTags = document.getElementById('skillsTags');
  const skillInput = document.getElementById('skillInput');
  function renderSkills(){
    const arr = ls.get('skills')||[];
    if(skillsTags) skillsTags.innerHTML = arr.map(s=>`<div class="tag">${s}</div>`).join('');
    const profileSkills = document.getElementById('profileSkills');
    if(profileSkills) profileSkills.innerHTML = arr.map(s=>`<div class="tag">${s}</div>`).join('');
  }
  renderSkills();
  if(skillInput){
    skillInput.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){ e.preventDefault(); const v=skillInput.value.trim(); if(!v) return; const arr=ls.get('skills')||[]; if(!arr.includes(v)){ arr.push(v); ls.set('skills',arr); renderSkills(); } skillInput.value=''; }
    });
  }

  // Saved jobs render
  function renderSavedJobs(){
    const saved = ls.get('savedJobs') || [];
    const savedDiv = document.getElementById('savedJobs');
    const profileJobs = document.getElementById('profileJobs');
    const html = saved.map(s=>`<div class="job-card"><h4>${s.job_title||s.title}</h4><div class="meta">${s.company_name||s.employer_name||''} • ${s.job_city||''}</div></div>`).join('') || '<p class="muted">No saved jobs</p>';
    if(savedDiv) savedDiv.innerHTML = html;
    if(profileJobs) profileJobs.innerHTML = html;
  }
  renderSavedJobs();


  // Logout
  document.getElementById('logout')?.addEventListener('click', ()=>{
    // simple: clear local storage and go to index
    localStorage.clear();
    window.location.href = 'index.html';
  });

});

function showUserWelcome(){
  const u = localStorage.getItem('user');
  if(!u) return;
  try{
    const user = JSON.parse(u);
    const welcomeCard = document.querySelector('.welcome-card h2');
    if(welcomeCard) welcomeCard.textContent = `Welcome back, ${user.name || user.username} 👋`;
  }catch(e){}
}
showUserWelcome();

// ================= GOOGLE SEARCH (Resources page) =================
async function googleSearch() {
  const queryEl = document.getElementById('google-query');
  const resultsEl = document.getElementById('google-results');
  if (!queryEl || !resultsEl) return; // page not loaded or wrong ids

  const q = queryEl.value.trim();
  if (!q) {
    resultsEl.innerHTML = '<p class="muted">Please enter a search query.</p>';
    return;
  }

  resultsEl.innerHTML = '<p class="muted">Searching…</p>';
  try {
    const resp = await fetch(`/api/google/search?q=${encodeURIComponent(q)}`);
    if (!resp.ok) {
      // show error details (status) and log server message
      const txt = await resp.text().catch(()=>null);
      resultsEl.innerHTML = `<p class="muted">Search failed (status ${resp.status}). See console for details.</p>`;
      console.error('Google search failed', resp.status, txt);
      return;
    }
    const data = await resp.json();

    // clear
    resultsEl.innerHTML = '';

    // Google custom search returns items array
    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = '<p class="muted">No results found.</p>';
      return;
    }

    data.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'result-card card';
      // show displayLink if present (host), and formatted snippet
      const host = item.displayLink || item.formattedUrl || '';
      const snippet = item.snippet || '';
      const title = item.title || 'Untitled';

      card.innerHTML = `
        <a class="result-link" href="${item.link}" target="_blank" rel="noopener noreferrer">${title}</a>
        <div class="meta" style="margin-top:6px;color:var(--muted);font-size:13px">${host}</div>
        <p style="margin-top:10px;color:#ddd">${snippet}</p>
      `;
      resultsEl.appendChild(card);
    });

  } catch (err) {
    console.error('Google search error', err);
    resultsEl.innerHTML = '<p class="muted">Error fetching results. Check console/network.</p>';
  }
}

// bind UI (if the page loaded the button/field after main.js ran)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('googleSearchBtn');
  const input = document.getElementById('google-query');
  if (btn) btn.addEventListener('click', googleSearch);
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') googleSearch(); });
});
