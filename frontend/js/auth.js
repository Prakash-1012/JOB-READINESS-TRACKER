// auth.js - handles signup and login
async function post(url, body){
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  if(loginBtn){
    loginBtn.addEventListener('click', async ()=>{
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if(!username || !password) return alert('Enter username and password');
      const res = await post('/api/auth/login', { username, password });
      const data = await res.json();
      if(!res.ok) return alert(data.error || 'Login failed');
      // store user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      // redirect to dashboard
      window.location.href = 'index.html';
    });
  }

  if(signupBtn){
    signupBtn.addEventListener('click', async ()=>{
      const name = document.getElementById('name').value.trim();
      const age = document.getElementById('age').value.trim();
      const gender = document.getElementById('gender').value;
      const email = document.getElementById('email').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if(!name || !email || !username || !password) return alert('Please fill required fields');
      const res = await post('/api/auth/register', { name, age, gender, email, username, password });
      const data = await res.json();
      if(!res.ok) return alert(data.error || 'Sign up failed');
      // save user locally and redirect
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    });
  }
});
