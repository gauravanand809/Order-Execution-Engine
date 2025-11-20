(function(){
  const ordersEl = document.getElementById('orders');
  const submitBtn = document.getElementById('submitBtn');
  const submit5Btn = document.getElementById('submit5Btn');
  const tokenInEl = document.getElementById('tokenIn');
  const tokenOutEl = document.getElementById('tokenOut');
  const amountEl = document.getElementById('amount');

  function createOrderCard(orderId, tokenIn, tokenOut, amount){
    const card = document.createElement('div');
    card.className = 'order-card';
    card.id = `order-${orderId}`;

    const row = document.createElement('div'); row.className='order-row';
    const left = document.createElement('div');
    left.innerHTML = `<div class="order-id">${orderId}</div><div class="order-meta">${tokenIn} → ${tokenOut} • ${amount}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<span class="status-badge status-pending">pending</span>`;

    row.appendChild(left); row.appendChild(right);

    const progress = document.createElement('div'); progress.className='progress';
    const bar = document.createElement('i');
    bar.style.width='2%';
    progress.appendChild(bar);

    card.appendChild(row);
    card.appendChild(progress);

    return { card, badge: right.querySelector('.status-badge'), bar };
  }

  function statusToPercent(status){
    switch(status){
      case 'pending': return 10;
      case 'routing': return 40;
      case 'building': return 60;
      case 'submitted': return 80;
      case 'confirmed': return 100;
      case 'failed': return 100;
    }
    return 0;
  }

  function setBadge(badge, status){
    badge.textContent = status;
    badge.className = 'status-badge status-'+status;
  }

  function subscribeToOrder(orderId, badge, bar){
    const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/api/orders/status';
    const ws = new WebSocket(wsUrl);
    ws.addEventListener('open', ()=>{
      ws.send(JSON.stringify({ orderId }));
    });
    ws.addEventListener('message', (ev)=>{
      try{
        const data = JSON.parse(ev.data);
        if(data.status){
          setBadge(badge, data.status);
          bar.style.width = statusToPercent(data.status)+'%';
        }
        // show txHash if confirmed
        if(data.txHash){
          const txEl = document.createElement('div'); txEl.className='order-meta'; txEl.textContent = 'tx: '+data.txHash;
          badge.parentElement.parentElement.appendChild(txEl);
        }
      }catch(e){ console.warn('invalid msg', e); }
    });
    ws.addEventListener('close', ()=>{ /* no-op */ });
  }

  submitBtn.addEventListener('click', async ()=>{
    submitBtn.disabled = true;
    const tokenIn = tokenInEl.value || 'TOKENA';
    const tokenOut = tokenOutEl.value || 'TOKENB';
    const amount = Number(amountEl.value) || 1;
    try{
      const res = await fetch('/api/orders/execute', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ tokenIn, tokenOut, amount })
      });
      const body = await res.json();
      const orderId = body.orderId;
      const { card, badge, bar } = createOrderCard(orderId, tokenIn, tokenOut, amount);
      ordersEl.prepend(card);
      subscribeToOrder(orderId, badge, bar);
    }catch(err){
      alert('failed to submit order');
    }finally{ submitBtn.disabled = false; }
  });

  submit5Btn.addEventListener('click', async ()=>{
    submit5Btn.disabled = true;
    const tokenIn = tokenInEl.value || 'TOKENA';
    const tokenOut = tokenOutEl.value || 'TOKENB';
    const amount = Number(amountEl.value) || 1;

    const promises = [];
    for(let i=0; i<5; i++){
      promises.push((async ()=>{
        try{
          const res = await fetch('/api/orders/execute', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ tokenIn, tokenOut, amount })
          });
          const body = await res.json();
          const orderId = body.orderId;
          const { card, badge, bar } = createOrderCard(orderId, tokenIn, tokenOut, amount);
          ordersEl.prepend(card);
          subscribeToOrder(orderId, badge, bar);
        }catch(err){
          console.warn('failed to submit one of the parallel orders', err);
        }
      })());
    }
    await Promise.all(promises);
    submit5Btn.disabled = false;
  });

})();
