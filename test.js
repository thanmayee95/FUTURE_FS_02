(async()=>{
 const resp=await fetch('http://localhost:4000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@crm.local',password:'Admin123!'})});
 const data=await resp.json();
 console.log('login',resp.status,data);
 const token=data.token;
 const leadsResp=await fetch('http://localhost:4000/api/leads',{headers:{Authorization:'Bearer '+token}});
 const leads=await leadsResp.json();
 console.log('leads count',leads.length,leads[0]);
})();
