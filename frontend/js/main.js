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

  function saveJob(job) {
  try {
    const saved = ls.get('savedJobs') || [];

    // Prevent duplicates
    if (saved.some(s => s.job_id === job.job_id)) {
      alert('⚠️ This job is already saved!');
      return;
    }

    saved.push(job);
    ls.set('savedJobs', saved);

    alert('✅ Job saved successfully!');
    renderSavedJobs();
  } catch (e) {
    console.error('Error saving job:', e);
    alert('❌ Failed to save job.');
  }
}
window.saveJob = saveJob;



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

// ================= SALARY INSIGHTS =================
async function getSalaryInsights() {
  const title = document.getElementById("salary-title").value.trim();
  const location = document.getElementById("salary-location").value.trim();
  const results = document.getElementById("salary-results");
  results.innerHTML = "<p class='muted'>Fetching salary data...</p>";

  try {
    const res = await fetch(`/api/jobs/salary?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`);
    const data = await res.json();

    results.innerHTML = "";

    if (data && data.data && data.data.length > 0) {
      const salary = data.data[0];
      const card = document.createElement("div");
      card.className = "result-card card";
      card.innerHTML = `
        <h3>${salary.job_title || title} in ${salary.location || location}</h3>
        <p><strong>Currency:</strong> ${salary.salary_currency}</p>
        <p><strong>Average Salary:</strong> ${Math.floor(salary.median_salary)}</p>
        <p><strong>Range:</strong> ${Math.floor(salary.min_salary)} – ${Math.floor(salary.max_salary)}</p>
      `;
      results.appendChild(card);
    } else {
      results.innerHTML = "<p>No salary data found for this job/location.</p>";
    }
  } catch (err) {
    console.error("Salary API error:", err);
    results.innerHTML = "<p class='muted'>Error fetching salary insights.</p>";
  }
}


// ================= COMPANY INSIGHTS =================
async function getCompanyInsights() {
  const company = document.getElementById("company-name").value.trim();
  const title = document.getElementById("company-title").value.trim();
  const results = document.getElementById("company-results");
  results.innerHTML = "<p class='muted'>Fetching company salary data...</p>";

  try {
    const res = await fetch(`/api/jobs/company-salary?company=${encodeURIComponent(company)}&title=${encodeURIComponent(title)}`);
    const data = await res.json();

    results.innerHTML = "";

    if (data && data.data && data.data.length > 0) {
      const salary = data.data[0];
      const card = document.createElement("div");
      card.className = "result-card card";
      card.innerHTML = `
        <h3>${salary.job_title || title} at ${salary.company_name || company}</h3>
        <p><strong>Currency:</strong> ${salary.salary_currency}</p>
        <p><strong>Average Salary:</strong> ${Math.floor(salary.median_salary)}</p>
        <p><strong>Range:</strong> ${Math.floor(salary.min_salary)} – ${Math.floor(salary.max_salary)}</p>`;
      results.appendChild(card);
    } else {
      results.innerHTML = "<p>No company salary data found.</p>";
    }
  } catch (err) {
    console.error("Company salary API error:", err);
    results.innerHTML = "<p class='muted'>Error fetching company insights.</p>";
  }
}

// ================== Local Storage Helper ==================
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

// ================== SAVE JOB ==================
function saveJob(job) {
  try {
    const saved = ls.get('savedJobs') || [];

    // prevent duplicates
    if (saved.some(s => s.job_id === job.job_id)) {
      alert('⚠️ This job is already saved!');
      return;
    }

    saved.push(job);
    ls.set('savedJobs', saved);

    alert('✅ Job saved successfully!');
    renderSavedJobs();
  } catch (e) {
    console.error('Error saving job:', e);
    alert('❌ Failed to save job.');
  }
}

// ================== REMOVE JOB ==================
function removeSavedJob(jobId) {
  try {
    let saved = ls.get('savedJobs') || [];
    saved = saved.filter(s => s.job_id !== jobId);
    ls.set('savedJobs', saved);

    alert('🗑 Job removed.');
    renderSavedJobs();
  } catch (e) {
    console.error('Error removing job:', e);
  }
}

// ================== RENDER SAVED JOBS ==================
function renderSavedJobs() {
  const saved = ls.get('savedJobs') || [];
  const savedDiv = document.getElementById('savedJobs');
  const profileJobs = document.getElementById('profileJobs');

  const html = saved.map(s => `
    <div class="job-card">
      <h4>${s.job_title || s.title}</h4>
      <div class="meta">${s.company_name || s.employer_name || ''} • ${s.job_city || ''}</div>
      <button class="btn remove-btn" onclick="removeSavedJob('${s.job_id}')">🗑 Remove</button>
    </div>
  `).join('') || '<p class="muted">No saved jobs</p>';

  if (savedDiv) savedDiv.innerHTML = html;
  if (profileJobs) profileJobs.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderSavedJobs);



