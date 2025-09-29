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

  // Global Google search
  const gBtn = document.getElementById('globalSearchBtn');
  if(gBtn){
    gBtn.addEventListener('click', async ()=>{
      const q = document.getElementById('globalSearch').value.trim();
      if(!q) return alert('Enter search');
      gBtn.disabled = true;
      try{
        const res = await fetch(`/api/google/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        alert('Got results from Google Custom Search - check console (results in items array)');
        console.log(data);
      }catch(e){ alert('Search failed'); console.error(e) } finally{ gBtn.disabled=false }
    });
  }

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
