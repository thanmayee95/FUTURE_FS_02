(async () => {
  const BASE = 'http://localhost:4000';
  
  async function req(method, path, body, token) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE + path, opts);
    const data = await res.json();
    return { data, status: res.status };
  }

  console.log('=== COMPREHENSIVE FEATURE TEST ===\n');

  // 1. LOGIN
  console.log('1. LOGIN');
  const { data: login, status: loginStatus } = await req('POST', '/api/auth/login', 
    { email: 'admin@crm.local', password: 'Admin123!' });
  const token = login.token;
  console.log(loginStatus === 200 ? '   ✓ Admin login successful' : '   ✗ Login failed');
  
  // 2. LIST LEADS (should exist from seed)
  console.log('\n2. LEAD LISTING');
  const { data: leads, status: leadsStatus } = await req('GET', '/api/leads', null, token);
  console.log(leadsStatus === 200 ? `   ✓ Fetched ${leads.length} leads` : '   ✗ Failed to fetch leads');
  const hasRequiredFields = leads.every(l => l.name && l.email !== undefined && l.source !== undefined && l.status);
  console.log(hasRequiredFields ? '   ✓ All leads have required fields (name, email, source, status)' : '   ✗ Missing fields');

  // 3. CREATE NEW LEAD
  console.log('\n3. CREATE NEW LEAD');
  const newLead = { name: 'API Test Lead', email: 'apitest@test.com', source: 'Direct', status: 'new' };
  const { data: created, status: createStatus } = await req('POST', '/api/leads', newLead, token);
  const testLeadId = created.id;
  console.log(createStatus === 200 ? `   ✓ Lead created with ID ${testLeadId}` : `   ✗ Failed (${createStatus}): ${created.message}`);

  // 4. UPDATE LEAD STATUS
  console.log('\n4. LEAD STATUS UPDATE');
  const { data: updated, status: updateStatus } = await req('PUT', `/api/leads/${testLeadId}`, 
    { status: 'contacted' }, token);
  console.log(updateStatus === 200 && updated.status === 'contacted' ? '   ✓ Status updated to "contacted"' : '   ✗ Failed');

  // 5. ADD NOTES
  console.log('\n5. ADD & EDIT NOTES');
  const notes = [{ text: 'First contact', date: new Date().toISOString() }];
  const { data: withNotes, status: notesStatus } = await req('PUT', `/api/leads/${testLeadId}`, 
    { notes }, token);
  console.log(notesStatus === 200 && withNotes.notes?.length > 0 ? '   ✓ Note added' : '   ✗ Failed');
  
  const editedNotes = [...withNotes.notes];
  editedNotes[0].text = 'Follow-up scheduled';
  editedNotes[0].date = new Date().toISOString();
  const { status: editStatus } = await req('PUT', `/api/leads/${testLeadId}`, { notes: editedNotes }, token);
  console.log(editStatus === 200 ? '   ✓ Note edited' : '   ✗ Failed');

  // 6. SET FOLLOW-UP DATE
  console.log('\n6. SET FOLLOW-UP DATE');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const { data: withFollowup, status: followupStatus } = await req('PUT', `/api/leads/${testLeadId}`, 
    { followUpDate: futureDate.toISOString() }, token);
  console.log(followupStatus === 200 && withFollowup.followUpDate ? '   ✓ Follow-up date set' : '   ✗ Failed');

  // 7. CREATE USER
  console.log('\n7. CREATE USER');
  const newUser = { name: 'John Seller', email: 'john@seller.com', password: 'Seller123!', role: 'user' };
  const { data: userCreated, status: createUserStatus } = await req('POST', '/api/users', newUser, token);
  const newUserId = userCreated?.user?.id;
  console.log(createUserStatus === 200 ? `   ✓ User created with ID ${newUserId}` : `   ✗ Failed (${createUserStatus}): ${userCreated.message}`);

  // 8. ADD VALIDATION
  console.log('\n8. VALIDATION TESTS');
  
  // Invalid email
  const badEmail = { name: 'Test', email: 'notanemail', password: 'Pass123!' };
  const { status: emailStatus } = await req('POST', '/api/users', badEmail, token);
  console.log(emailStatus === 400 ? '   ✓ Invalid email rejected' : '   ✗ Bad email not caught');
  
  // Short password
  const shortPass = { name: 'Test', email: 'test@x.co', password: 'Short' };
  const { status: passStatus } = await req('POST', '/api/users', shortPass, token);
  console.log(passStatus === 400 ? '   ✓ Short password rejected' : '   ✗ Short password not caught');
  
  // Invalid lead status
  const { status: badStatusCode } = await req('PUT', `/api/leads/${testLeadId}`, { status: 'invalid' }, token);
  console.log(badStatusCode === 400 ? '   ✓ Invalid status rejected' : '   ✗ Bad status not caught');

  // 9. LIST USERS
  console.log('\n9. LIST USERS');
  const { data: users, status: usersStatus } = await req('GET', '/api/users', null, token);
  console.log(usersStatus === 200 ? `   ✓ Fetched ${users.length} users` : '   ✗ Failed');

  // 10. DELETE LEAD
  console.log('\n10. DELETE LEAD');
  const { status: deleteStatus } = await req('DELETE', `/api/leads/${testLeadId}`, null, token);
  console.log(deleteStatus === 200 ? '   ✓ Lead deleted' : '   ✗ Failed');

  // 11. VERIFY AUTH
  console.log('\n11. AUTHORIZATION CHECKS');
  const salesUser = { email: 'sales@crm.local', password: 'Sales123!' };
  const { data: userLogin } = await req('POST', '/api/auth/login', salesUser);
  const userToken = userLogin.token;
  
  // User should NOT be able to create leads
  const { status: forbiddenLeadStatus } = await req('POST', '/api/leads', newLead, userToken);
  console.log(forbiddenLeadStatus === 403 ? '   ✓ Non-admin cannot create leads' : '   ✗ Auth check failed');
  
  // User should NOT be able to list users
  const { status: forbiddenUserStatus } = await req('GET', '/api/users', null, userToken);
  console.log(forbiddenUserStatus === 403 ? '   ✓ Non-admin cannot list users' : '   ✗ Auth check failed');
  
  // User CAN view assigned leads
  const { data: userLeads, status: userLeadsStatus } = await req('GET', '/api/leads', null, userToken);
  console.log(userLeadsStatus === 200 ? '   ✓ User can fetch leads' : '   ✗ User fetch failed');

  console.log('\n=== ALL TESTS COMPLETE ===');
})();
