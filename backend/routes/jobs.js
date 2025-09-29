const express = require('express');
const axios = require('axios');
const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

// /api/jobs/search?query=developer&location=chicago&skills=react,node
router.get('/search', async (req, res) => {
  try {
    const { query='', location='', skills='' } = req.query;
    const skillPart = skills ? ' ' + skills.split(',').join(' ') : '';
    const q = `${query}${skillPart} jobs in ${location}`.trim();
    const params = {
      query: q || 'developer jobs',
      page: '1',
      num_pages: '1',
      country: 'us',
      date_posted: 'all'
    };
    const resp = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.message || err);
    res.status(500).json({ error: 'Job search failed', details: err.message });
  }
});

// /api/jobs/details/:id
router.get('/details/:id', async (req, res) => {
  try {
    const job_id = req.params.id;
    const resp = await axios.get('https://jsearch.p.rapidapi.com/job-details', {
      params: { job_id, country: 'us' },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.message || err);
    res.status(500).json({ error: 'Job details failed', details: err.message });
  }
});

// /api/jobs/salary?title=nodejs%20developer&location=new%20york
router.get('/salary', async (req, res) => {
  try {
    const { title='developer', location='us' } = req.query;
    const resp = await axios.get('https://jsearch.p.rapidapi.com/estimated-salary', {
      params: {
        job_title: title,
        location: location,
        location_type: 'ANY',
        years_of_experience: 'ALL'
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.message || err);
    res.status(500).json({ error: 'Salary fetch failed', details: err.message });
  }
});

// /api/jobs/company-salary?company=Amazon&title=software%20developer
router.get('/company-salary', async (req, res) => {
  try {
    const { company='', title='developer' } = req.query;
    const resp = await axios.get('https://jsearch.p.rapidapi.com/company-job-salary', {
      params: {
        company,
        job_title: title,
        location_type: 'ANY',
        years_of_experience: 'ALL'
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    res.json(resp.data);
  } catch (err) {
    console.error(err?.message || err);
    res.status(500).json({ error: 'Company salary fetch failed', details: err.message });
  }
});

module.exports = router;
