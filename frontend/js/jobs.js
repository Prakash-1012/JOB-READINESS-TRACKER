// jobs.js - handles job search, details, salary and company salary endpoints
async function renderJobResults(data) {
  const out = document.getElementById('resultsList') || document.getElementById('jobResults');
  if (!out) return;

  if (!data || !data.data || data.data.length === 0) {
    out.innerHTML = '<p class="muted">No results</p>';
    return;
  }

  out.innerHTML = data.data.map(j => {
    // safely stringify the job object for inline call
    const jobStr = JSON.stringify(j).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

    return `
      <div class="job-card">
        <h4>${j.job_title}</h4>
        <div class="meta">
          ${j.employer_name || j.company_name || ''} • 
          ${j.job_city || ''}${j.job_country ? ', ' + j.job_country : ''}
        </div>

        <div class="actions">
          <button class="btn small" onclick="viewDetails('${encodeURIComponent(j.job_id)}')">
            🔍 View
          </button>
          <button class="btn save-btn small" onclick="saveJob(JSON.parse('${jobStr}'))">
            💾 Save
          </button>
          <a class="btn small" href="${j.job_apply_link}" target="_blank">Apply</a>
        </div>
      </div>
    `;
  }).join('');
}


async function searchJobs(){
  const q = document.getElementById('jobQuery')?.value || 'developer';
  const location = document.getElementById('jobLocation')?.value || 'us';
  const skills = (document.getElementById('skillsInputWrap')?.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).join(',');
  const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}&skills=${encodeURIComponent(skills)}`);
  const data = await res.json();
  console.log(data);
  renderJobResults(data);
}


function viewDetails(id){
  // navigate to job-details with id in query
  window.location.href = 'job-details.html?id=' + id;
}

async function loadJobDetails(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id) return;
  const res = await fetch('/api/jobs/details/' + decodeURIComponent(id));
  const data = await res.json();
  const out = document.getElementById('jobDetailCard');
  if(!out) return;
  if(data && data.data && data.data.length>0){
    const j = data.data[0];
    out.innerHTML = `<h2>${j.job_title}</h2><p class="meta">${j.employer_name || ''} • ${j.job_city || ''}</p><div class="job-detail">${j.job_description || j.description || 'No description'}</div><div class="actions" style="margin-top:12px"><a class="btn" href="${j.job_apply_link}" target="_blank">Apply</a><button class="btn ghost" onclick='saveJob(${JSON.stringify(j)})'>Save</button></div>`;
  } else {
    out.innerHTML = '<p>No details found</p>';
  }
}

async function getSalary(){
  const title = document.getElementById('salaryTitle')?.value || '';
  const location = document.getElementById('salaryLocation')?.value || '';
  const res = await fetch(`/api/jobs/salary?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`);
  const data = await res.json();
  const out = document.getElementById('salaryResult');
  out.innerHTML = '<pre style="white-space:pre-wrap;color:#ddd">'+JSON.stringify(data, null, 2)+'</pre>';
}

async function getCompanySalary(){
  const company = document.getElementById('companyName')?.value || '';
  const title = document.getElementById('companyTitle')?.value || '';
  const res = await fetch(`/api/jobs/company-salary?company=${encodeURIComponent(company)}&title=${encodeURIComponent(title)}`);
  const data = await res.json();
  const out = document.getElementById('companyResult');
  out.innerHTML = '<pre style="white-space:pre-wrap;color:#ddd">'+JSON.stringify(data, null, 2)+'</pre>';
}

// attach handlers
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('searchBtn')?.addEventListener('click', searchJobs);
  document.getElementById('salaryBtn')?.addEventListener('click', getSalary);
  document.getElementById('companyBtn')?.addEventListener('click', getCompanySalary);
  // skills input on job search page
  const skillAdder = document.getElementById('skillAdder');
  const skillsWrap = document.getElementById('skillsInputWrap');
  if(skillAdder && skillsWrap){
    skillAdder.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){ e.preventDefault(); const v=skillAdder.value.trim(); if(!v) return; const d=document.createElement('div'); d.className='tag'; d.textContent=v; skillsWrap.appendChild(d); skillAdder.value=''; }
    });
  }
  // load details if on details page
  if(window.location.pathname.endsWith('job-details.html')) loadJobDetails();
});