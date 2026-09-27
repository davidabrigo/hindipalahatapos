function showToast(msg, type) {
  type = type || 'success';
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(function () { toast.classList.remove('show'); }, 3000);
}

function setButtonLoading(btn, on) {
  if (!btn) return;
  var text = btn.querySelector('.btn-text');
  var spinner = btn.querySelector('.spinner');
  if (on) {
    btn.classList.add('loading');
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    btn.classList.remove('loading');
    if (text) text.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

function delay(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function showPage(pageId) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');

  var page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  window.scrollTo(0, 0);

  var links = document.querySelectorAll('.nav-link');
  for (var j = 0; j < links.length; j++) {
    links[j].classList.toggle('active', links[j].getAttribute('data-page') === pageId);
  }

  if (pageId === 'profile') renderMyRequests();
}

document.querySelectorAll('.nav-link').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var page = link.getAttribute('data-page');
    var scroll = link.getAttribute('data-scroll');
    showPage(page);
    if (scroll) {
      setTimeout(function () {
        var el = document.getElementById(scroll);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });
});

function updateFileName(input) {
  var el = document.getElementById('file-name');
  if (el) el.textContent = input.files[0] ? input.files[0].name : 'No file chosen';
}

function switchAuth(mode) {
  var loginForm = document.getElementById('login-form');
  var signupForm = document.getElementById('signup-form');
  var forgotForm = document.getElementById('forgot-form');
  var tabLogin = document.getElementById('tab-login');
  var tabSignup = document.getElementById('tab-signup');

  if (forgotForm) forgotForm.style.display = 'none';

  if (mode === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabSignup) tabSignup.classList.add('active');
  }
}

function showForgotPassword() {
  var loginForm = document.getElementById('login-form');
  var signupForm = document.getElementById('signup-form');
  var forgotForm = document.getElementById('forgot-form');
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'none';
  if (forgotForm) forgotForm.style.display = 'block';
  var tabLogin = document.getElementById('tab-login');
  var tabSignup = document.getElementById('tab-signup');
  if (tabLogin) tabLogin.classList.remove('active');
  if (tabSignup) tabSignup.classList.remove('active');
}

function updateNavbar(isLoggedIn, userName) {
  var loginBtn = document.getElementById('nav-login-btn');
  var navUser = document.getElementById('nav-user');
  var navUserName = document.getElementById('nav-user-name');
  var navLoginLink = document.getElementById('nav-login-link');
  var navProfileLink = document.getElementById('nav-profile-link');

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (navUser) navUser.classList.add('visible');
    if (navUserName) navUserName.textContent = userName || 'Resident';
    if (navLoginLink) navLoginLink.style.display = 'none';
    if (navProfileLink) navProfileLink.style.display = 'inline';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (navUser) navUser.classList.remove('visible');
    if (navLoginLink) navLoginLink.style.display = 'inline';
    if (navProfileLink) navProfileLink.style.display = 'none';
  }
}

function updateProfileUI(name) {
  var nameEl = document.getElementById('profile-fullname');
  var avatarEl = document.getElementById('profile-avatar');
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) {
    var parts = name.split(' ');
    var initials = '';
    for (var i = 0; i < parts.length && i < 2; i++) {
      if (parts[i][0]) initials += parts[i][0];
    }
    avatarEl.textContent = initials.toUpperCase() || 'R';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  var btn = document.getElementById('login-btn');
  var errEl = document.getElementById('login-error');
  if (errEl) errEl.textContent = '';
  setButtonLoading(btn, true);

  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  try {
    await delay(800);
    if (!email || !password) throw new Error('Please fill in all fields.');

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    var isAdmin = email.toLowerCase().indexOf('admin') !== -1 ||
                  email.toLowerCase().indexOf('staff') !== -1;

    if (isAdmin) {
      localStorage.setItem('userRole', 'Staff Account');
      localStorage.setItem('userName', 'Staff Account');
      showToast('Welcome, Admin!');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 400);
    } else {
      localStorage.setItem('userRole', 'Resident');
      var raw = email.split('@')[0].replace(/[._]/g, ' ');
      var words = raw.split(' ');
      var displayName = '';
      for (var i = 0; i < words.length; i++) {
        if (words[i]) displayName += words[i].charAt(0).toUpperCase() + words[i].slice(1) + ' ';
      }
      displayName = displayName.trim() || 'Resident';
      localStorage.setItem('userName', displayName);
      updateNavbar(true, displayName);
      updateProfileUI(displayName);
      showPage('profile');
      showToast('Welcome back, ' + displayName + '!');
    }
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    showToast(err.message || 'Login failed', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  var btn = document.getElementById('signup-btn');
  var errEl = document.getElementById('signup-error');
  if (errEl) errEl.textContent = '';
  setButtonLoading(btn, true);

  var first = document.getElementById('signup-firstname').value.trim();
  var last = document.getElementById('signup-lastname').value.trim();
  var email = document.getElementById('signup-email').value.trim();
  var pass = document.getElementById('signup-password').value;
  var confirm = document.getElementById('signup-confirm').value;

  try {
    await delay(900);
    if (pass !== confirm) throw new Error('Passwords do not match.');
    if (pass.length < 6) throw new Error('Password must be at least 6 characters.');

    var displayName = (first + ' ' + last).trim() || 'Resident';
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', 'Resident');
    localStorage.setItem('userName', displayName);

    updateNavbar(true, displayName);
    updateProfileUI(displayName);
    showPage('profile');
    showToast('Account created! Welcome, ' + displayName);
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  var btn = document.getElementById('forgot-btn');
  var errEl = document.getElementById('forgot-error');
  if (errEl) errEl.textContent = '';
  setButtonLoading(btn, true);

  var email = document.getElementById('forgot-email').value.trim();

  try {
    await delay(900);
    if (!email) throw new Error('Please enter your email.');
    showToast('If an account exists, a reset link was sent to ' + email);
    document.getElementById('forgot-email').value = '';
    setTimeout(function () { switchAuth('login'); }, 800);
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    showToast(err.message || 'Error', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

function handleLogout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  updateNavbar(false);
  showPage('home');
  showToast('Logged out successfully');
}

async function handleSubmit(e) {
  e.preventDefault();
  var btn = document.getElementById('submit-btn');
  setButtonLoading(btn, true);

  try {
    await delay(1000);
    var doctype = document.getElementById('req-doctype').value;
    var first = document.getElementById('req-firstname').value.trim();
    var last = document.getElementById('req-lastname').value.trim();

    var requests = JSON.parse(localStorage.getItem('myRequests') || '[]');
    requests.unshift({
      id: Date.now(),
      document: doctype,
      name: first + ' ' + last,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    });
    localStorage.setItem('myRequests', JSON.stringify(requests));

    showToast('Request submitted! Track it in your profile.');
    e.target.reset();
    var fn = document.getElementById('file-name');
    if (fn) fn.textContent = 'No file chosen';

    if (localStorage.getItem('isLoggedIn') === 'true') {
      setTimeout(function () { showPage('profile'); }, 600);
    }
  } catch (err) {
    showToast('Failed to submit request', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

function renderMyRequests() {
  var container = document.getElementById('my-requests-list');
  if (!container) return;

  var requests = JSON.parse(localStorage.getItem('myRequests') || '[]');

  if (!requests.length) {
    container.innerHTML =
      '<div class="request-card" style="text-align:center;padding:2rem">' +
      '<p style="color:var(--text-muted);margin-bottom:1rem">No requests yet.</p>' +
      '<button class="btn btn-primary" type="button" onclick="showPage(\'request\')">Submit your first request</button>' +
      '</div>';
    return;
  }

  var steps = ['Pending', 'Approved', 'Processing', 'Completed'];
  var html = '';

  for (var i = 0; i < requests.length; i++) {
    var r = requests[i];
    var status = r.status || 'Pending';

    var statusClass = 'status-pending';
    if (status === 'Approved') statusClass = 'status-approved';
    if (status === 'Processing') statusClass = 'status-processing';
    if (status === 'Completed') statusClass = 'status-completed';
    if (status === 'Rejected') statusClass = 'status-rejected';

    var current = 0;
    if (status === 'Approved') current = 1;
    if (status === 'Processing') current = 2;
    if (status === 'Completed') current = 3;
    if (status === 'Rejected') current = -1;

    var stepsHtml = '';
    if (status === 'Rejected') {
      stepsHtml = '<div class="progress-step rejected"><div class="dot"></div>Rejected</div>';
    } else {
      for (var s = 0; s < steps.length; s++) {
        var cls = 'progress-step';
        if (s < current) cls += ' done';
        if (s === current) cls += ' active';
        stepsHtml += '<div class="' + cls + '"><div class="dot"></div>' + steps[s] + '</div>';
      }
    }

    html +=
      '<div class="request-card">' +
        '<div class="request-card-top">' +
          '<div>' +
            '<div class="request-card-title">' + (r.document || '—') + '</div>' +
            '<div class="request-card-date">Filed on ' + (r.date || '—') + '</div>' +
          '</div>' +
          '<span class="status-badge ' + statusClass + '">' + status + '</span>' +
        '</div>' +
        '<div class="progress-bar">' + stepsHtml + '</div>' +
      '</div>';
  }
  container.innerHTML = html;
}

  var html = '';
  for (var i = 0; i < requests.length; i++) {
    var r = requests[i];
    var statusClass = 'status-pending';
    if (r.status === 'Processing') statusClass = 'status-processing';
    if (r.status === 'Ready for release') statusClass = 'status-ready';
    if (r.status === 'Released') statusClass = 'status-released';

    var current = 0;
    if (r.status === 'Processing') current = 1;
    if (r.status === 'Ready for release' || r.status === 'Released') current = 2;

    var steps = ['Pending', 'Processing', 'Ready for Pickup'];
    var stepsHtml = '';
    for (var s = 0; s < steps.length; s++) {
      var cls = 'progress-step';
      if (s < current) cls += ' done';
      if (s === current) cls += ' active';
      stepsHtml += '<div class="' + cls + '"><div class="dot"></div>' + steps[s] + '</div>';
    }

    html +=
      '<div class="request-card">' +
      '<div class="request-card-top">' +
      '<div><div class="request-card-title">' + r.document + '</div>' +
      '<div class="request-card-date">Filed on ' + r.date + '</div></div>' +
      '<span class="status-badge ' + statusClass + '">' + r.status + '</span>' +
      '</div>' +
      '<div class="progress-bar">' + stepsHtml + '</div>' +
      '</div>';
  }
  container.innerHTML = html;


(function () {
  var isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  var role = localStorage.getItem('userRole');
  var name = localStorage.getItem('userName') || 'Resident';

  if (isLoggedIn) {
    if (role === 'Staff Account') {
      window.location.href = 'dashboard.html';
      return;
    }
    updateNavbar(true, name);
    updateProfileUI(name);
    showPage('profile');
  } else {
    updateNavbar(false);
    if (window.location.hash === '#login') showPage('login');
  }
})();

function startRequest(docType) {
  showPage('request');
  var select = document.getElementById('req-doctype');
  if (select) {
    select.value = docType;
    updateFormFields();
  }
}

function updateFormFields() {
  var doc = document.getElementById('req-doctype').value;
  var box = document.getElementById('extra-fields');
  if (!box) return;

  var html = '';

  if (doc === 'Barangay Certification / Clearance') {
    html =
      '<div class="form-row">' +
      '<div class="form-group"><label>Years as Resident</label><input type="number" id="req-years" placeholder="e.g. 5" min="0"></div>' +
      '<div class="form-group"><label>Purpose</label><input type="text" id="req-purpose" placeholder="Employment, school, travel"></div>' +
      '</div>';
  }
  else if (doc === 'Senior Citizen Certification') {
    html =
      '<div class="form-row">' +
      '<div class="form-group"><label>Date of Birth</label><input type="date" id="req-dob"></div>' +
      '<div class="form-group"><label>Proof of Age</label><input type="text" id="req-proof" placeholder="Birth certificate / valid ID"></div>' +
      '</div>';
  }
  else if (doc === 'PWD Certification') {
    html =
      '<div class="form-row">' +
      '<div class="form-group"><label>Date of Birth</label><input type="date" id="req-dob"></div>' +
      '<div class="form-group"><label>Type of Disability</label><input type="text" id="req-disability" placeholder="e.g. Visual"></div>' +
      '</div>' +
      '<div class="form-group"><label>Supporting Document</label><input type="text" id="req-support" placeholder="Medical certificate"></div>';
  }
  else if (doc === 'Solo Parent Certification') {
    html =
      '<div class="form-group"><label>Circumstance</label><select id="req-circumstance"><option value="">Select</option><option>Death of spouse</option><option>Separation</option><option>Abandonment</option><option>Other</option></select></div>' +
      '<div class="form-group"><label>Child 1 (Name, Age)</label><input type="text" id="req-child1" placeholder="Maria, 8"></div>' +
      '<div class="form-group"><label>Child 2 (optional)</label><input type="text" id="req-child2"></div>' +
      '<div class="form-group"><label>Child 3 (optional)</label><input type="text" id="req-child3"></div>';
  }
  else if (doc === 'Certificate of Indigency') {
    html =
      '<div class="form-group"><label>Purpose</label><select id="req-purpose"><option value="">Select</option><option>Medical assistance</option><option>Educational assistance</option><option>Legal assistance</option><option>Burial assistance</option><option>Other</option></select></div>';
  }
  else if (doc === 'Certificate to File Action (CFA)' || doc === 'Certificate to Bar Action (CBA)' || doc === 'Certificate to Bar Counter-Claim (CBC)') {
    html =
      '<div class="form-row">' +
      '<div class="form-group"><label>Complainant</label><input type="text" id="req-complainant"></div>' +
      '<div class="form-group"><label>Respondent</label><input type="text" id="req-respondent"></div>' +
      '</div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label>Case No.</label><input type="text" id="req-caseno"></div>' +
      '<div class="form-group"><label>Nature of Dispute</label><input type="text" id="req-dispute"></div>' +
      '</div>' +
      '<div class="form-group"><label>Date Filed</label><input type="date" id="req-datefiled"></div>';
  }
  else if (doc === 'Barangay Protection Order (BPO)') {
    html =
      '<div class="form-row">' +
      '<div class="form-group"><label>Applicant / Victim</label><input type="text" id="req-applicant"></div>' +
      '<div class="form-group"><label>Respondent</label><input type="text" id="req-respondent"></div>' +
      '</div>' +
      '<div class="form-group"><label>Relationship</label><select id="req-relationship"><option value="">Select</option><option>Spouse</option><option>Former spouse</option><option>Dating relationship</option><option>Common child</option><option>Other</option></select></div>';
  }
  else if (doc === 'Facilities & Properties Request') {
    html =
      '<div class="form-group"><label>Facility / Property</label><div class="checkbox-group">' +
      '<label><input type="checkbox" name="facility" value="Barangay Hall"> Barangay Hall</label>' +
      '<label><input type="checkbox" name="facility" value="Covered Court"> Covered Court</label>' +
      '<label><input type="checkbox" name="facility" value="Chairs"> Chairs</label>' +
      '<label><input type="checkbox" name="facility" value="Tables"> Tables</label>' +
      '<label><input type="checkbox" name="facility" value="Tent"> Tent</label>' +
      '<label><input type="checkbox" name="facility" value="Sound system"> Sound system</label>' +
      '</div></div>' +
      '<div class="form-group"><label>Purpose</label><input type="text" id="req-purpose"></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label>Date of Use</label><input type="date" id="req-usedate"></div>' +
      '<div class="form-group"><label>Start</label><input type="time" id="req-start"></div>' +
      '<div class="form-group"><label>End</label><input type="time" id="req-end"></div>' +
      '</div>' +
      '<div class="form-group"><label>No. of Participants</label><input type="number" id="req-participants" min="1"></div>';
  }

  box.innerHTML = html;
}

async function handleSubmit(e) {
  e.preventDefault();
  var btn = document.getElementById('submit-btn');
  setButtonLoading(btn, true);

  try {
    await delay(1000);
    var doctype = document.getElementById('req-doctype').value;
    var fullname = document.getElementById('req-fullname').value.trim();

    var requests = JSON.parse(localStorage.getItem('myRequests') || '[]');
    requests.unshift({
      id: Date.now(),
      document: doctype,
      name: fullname,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    });
    localStorage.setItem('myRequests', JSON.stringify(requests));

    showToast('Request submitted!');
    e.target.reset();
    document.getElementById('extra-fields').innerHTML = '';
    document.getElementById('file-name').textContent = 'No file chosen';

    if (localStorage.getItem('isLoggedIn') === 'true') {
      setTimeout(function () { showPage('profile'); }, 600);
    }
  } catch (err) {
    showToast('Failed to submit', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}