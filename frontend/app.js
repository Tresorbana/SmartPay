// ========================================
// WEBSOCKET & STATE
// ========================================
const BACKEND_URL = location.protocol === 'file:'
    ? 'http://localhost:9205'
    : `${location.protocol}//${location.hostname}:${location.port}`;
const socket = io(BACKEND_URL);

// Global state
let currentUser = null;
let currentRole = null;
let lastScannedUid = null;
let lastScannedBalance = null;
let products = [];

// ========================================
// DOM ELEMENTS
// ========================================
// Authentication
const loginModal = document.getElementById('login-modal');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content');
const userDisplay = document.getElementById('user-display');
const userNameText = document.getElementById('user-name');
const roleIndicator = document.getElementById('role-indicator');

// Navigation
const adminNav = document.getElementById('admin-nav');
const tabButtons = document.querySelectorAll('.tab-btn');
const operationsView = document.getElementById('operations-view');
const dashboardView = document.getElementById('dashboard-view');

// Shared Card Display
const cardVisual = document.getElementById('card-visual');
const cardUidDisplay = document.getElementById('card-uid-display');
const cardBalanceDisplay = document.getElementById('card-balance-display');
const statusDisplay = document.getElementById('status-display');
const logList = document.getElementById('log-list');
const connectionStatus = document.getElementById('connection-status');

// Panels
const adminPanel = document.getElementById('admin-panel');
const cashierPanel = document.getElementById('cashier-panel');

// Admin interface
const adminUid = document.getElementById('admin-uid');
const adminCurrentBalance = document.getElementById('admin-current-balance');
const adminAmount = document.getElementById('admin-amount');
const adminTopupBtn = document.getElementById('admin-topup-btn');
const adminResponse = document.getElementById('admin-response');

// Cashier interface
const cashierUid = document.getElementById('cashier-uid');
const cashierCurrentBalance = document.getElementById('cashier-current-balance');
const cashierProduct = document.getElementById('cashier-product');
const cashierQuantity = document.getElementById('cashier-quantity');
const cashierTotalCost = document.getElementById('cashier-total-cost');
const cashierPayBtn = document.getElementById('cashier-pay-btn');
const cashierResponse = document.getElementById('cashier-response');

// Dashboard Stats
const statTotalTopup = document.getElementById('stat-total-topup');
const statTotalSales = document.getElementById('stat-total-sales');
const statActiveWallets = document.getElementById('stat-active-wallets');
const statCountTopup = document.getElementById('stat-count-topup');
const statCountSales = document.getElementById('stat-count-sales');
const globalLogList = document.getElementById('global-log-list');

// Receipt
const receiptModal = document.getElementById('receipt-modal');
const receiptContent = document.getElementById('receipt-content');
const receiptDate = document.getElementById('receipt-date');
const receiptBody = document.getElementById('receipt-body');
const receiptTotalAmount = document.getElementById('receipt-total-amount');
const receiptId = document.getElementById('receipt-id');
const closeReceiptBtn = document.getElementById('close-receipt-btn');

// ========================================
// AUTHENTICATION LOGIC
// ========================================
loginBtn.addEventListener('click', async () => {
    const username = loginUsername.value;
    const password = loginPassword.value;

    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            currentUser = result.name;
            currentRole = result.role;
            setupUIForRole();
            loginModal.classList.add('hidden');
            mainContent.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            roleIndicator.classList.remove('hidden');
            addLog(`Authenticated as ${currentUser} (${currentRole})`);
        } else {
            showLoginError(result.error);
        }
    } catch (error) {
        showLoginError('Connection error: ' + error.message);
    }
});

logoutBtn.addEventListener('click', () => {
    location.reload();
});

function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

function setupUIForRole() {
    userNameText.textContent = currentUser;

    if (currentRole === 'admin') {
        adminPanel.style.display = 'block';
        cashierPanel.style.display = 'none';
        adminNav.classList.remove('hidden');
    } else {
        adminPanel.style.display = 'none';
        cashierPanel.style.display = 'block';
        adminNav.classList.add('hidden');
    }
}

// ========================================
// NAVIGATION LOGIC
// ========================================
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (tab === 'ops') {
            operationsView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        } else {
            operationsView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            fetchDashboardStats();
        }
    });
});

async function fetchDashboardStats() {
    try {
        const [statsRes, historyRes] = await Promise.all([
            fetch(`${BACKEND_URL}/admin/stats`),
            fetch(`${BACKEND_URL}/admin/all-transactions?limit=10`)
        ]);

        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        if (statsData.success) {
            const s = statsData.stats;
            statTotalTopup.textContent = `$${s.topup.total.toFixed(2)}`;
            statTotalSales.textContent = `$${s.payment.total.toFixed(2)}`;
            statActiveWallets.textContent = s.activeWallets;
            statCountTopup.textContent = `${s.topup.count} TRANSACTIONS`;
            statCountSales.textContent = `${s.payment.count} TRANSACTIONS`;
        }

        if (historyData.success) {
            updateGlobalLog(historyData.transactions);
        }
    } catch (error) {
        addLog('❌ Dashboard sync error: ' + error.message);
    }
}

function updateGlobalLog(transactions) {
    globalLogList.innerHTML = '';
    if (transactions.length === 0) {
        globalLogList.innerHTML = '<li class="status-placeholder">No transactions found</li>';
        return;
    }

    transactions.forEach(tx => {
        const li = document.createElement('li');
        const color = tx.type === 'TOPUP' ? '#10b981' : '#ef4444';
        const prefix = tx.type === 'TOPUP' ? '+' : '-';
        li.innerHTML = `
            <span style="flex: 1;">${tx.cardUid}</span>
            <span style="flex: 1; font-weight: bold; color: ${color};">${prefix}$${tx.amount.toFixed(2)}</span>
            <span style="flex: 2; font-size: 0.8rem; text-align: right;">${new Date(tx.createdAt).toLocaleString()}</span>
        `;
        globalLogList.appendChild(li);
    });
}

// ========================================
// WEBSOCKET EVENTS
// ========================================
socket.on('connect', () => {
    addLog('✓ Connected to backend');
    connectionStatus.className = 'status-online';
    socket.emit('request-products');
});

socket.on('disconnect', () => {
    addLog('✗ Disconnected');
    connectionStatus.className = 'status-offline';
});

socket.on('card-scanned', (data) => {
    const { uid } = data;
    addLog(`🔍 Card detected: ${uid}`);
    lastScannedUid = uid;

    cardVisual.classList.add('active');
    cardUidDisplay.textContent = uid;
    adminUid.value = uid;
    cashierUid.value = uid;

    adminTopupBtn.disabled = false;
    if (products.length > 0) cashierPayBtn.disabled = false;

    socket.emit('request-balance', { uid });

    statusDisplay.innerHTML = `
        <div class="data-row">
            <span class="data-label">UID:</span>
            <span class="data-value">${uid}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Balance:</span>
            <span class="data-value" style="color: #000;">Fetching...</span>
        </div>
        <div class="data-row">
            <span class="data-label">Status:</span>
            <span class="data-value" style="color: #000;">✓ Active</span>
        </div>
    `;
    clearResponses();
});

socket.on('topup-success', (data) => {
    const { uid, amount, newBalance } = data;
    addLog(`✓ Top-up: +$${amount.toFixed(2)} | New: $${newBalance.toFixed(2)}`);

    if (uid === lastScannedUid) {
        lastScannedBalance = newBalance;
        cardBalanceDisplay.textContent = `$${newBalance.toFixed(2)}`;
        adminCurrentBalance.value = `$${newBalance.toFixed(2)}`;

        cardVisual.style.transform = 'scale(1.1)';
        setTimeout(() => { cardVisual.style.transform = ''; }, 300);
    }

    adminResponse.className = 'response-message success';
    adminResponse.innerHTML = `✓ Top-up Successful<br>+$${amount.toFixed(2)}`;
    adminAmount.value = '';

    if (!dashboardView.classList.contains('hidden')) fetchDashboardStats();
});

socket.on('payment-success', (data) => {
    const { uid, amount, newBalance, productId, quantity } = data;
    addLog(`✓ Payment: -$${amount.toFixed(2)} | New: $${newBalance.toFixed(2)}`);

    if (uid === lastScannedUid) {
        lastScannedBalance = newBalance;
        cardBalanceDisplay.textContent = `$${newBalance.toFixed(2)}`;
        cashierCurrentBalance.value = `$${newBalance.toFixed(2)}`;

        cardVisual.style.transform = 'scale(1.1)';
        setTimeout(() => { cardVisual.style.transform = ''; }, 300);
    }

    const productName = products.find(p => p._id === productId)?.name || 'Unknown';
    showReceipt({ uid, amount, productName, quantity });

    if (!dashboardView.classList.contains('hidden')) fetchDashboardStats();
});

socket.on('payment-declined', (data) => {
    const { reason } = data;
    addLog(`✗ Declined: ${reason}`);
    cashierResponse.className = 'response-message error';
    cashierResponse.textContent = `✗ Declined: ${reason}`;
});

socket.on('balance-response', (data) => {
    if (data.success && data.uid === lastScannedUid) {
        const balance = data.balance || 0;
        lastScannedBalance = balance;
        cardBalanceDisplay.textContent = `$${balance.toFixed(2)}`;
        adminCurrentBalance.value = `$${balance.toFixed(2)}`;
        cashierCurrentBalance.value = `$${balance.toFixed(2)}`;

        const balanceVal = statusDisplay.querySelector('.data-row:nth-child(2) .data-value');
        if (balanceVal) balanceVal.textContent = `$${balance.toFixed(2)}`;
    }
});

socket.on('products-response', (data) => {
    if (data.success) {
        products = data.products;
        populateProductList();
    }
});

// ========================================
// CORE ACTIONS
// ========================================
adminTopupBtn.addEventListener('click', async () => {
    const amount = parseFloat(adminAmount.value);
    if (!lastScannedUid || !amount || amount <= 0) return;

    try {
        await fetch(`${BACKEND_URL}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: lastScannedUid, amount })
        });
    } catch (error) {
        addLog(`❌ Error: ${error.message}`);
    }
});

cashierPayBtn.addEventListener('click', async () => {
    const productId = cashierProduct.value;
    const quantity = parseInt(cashierQuantity.value);
    const totalAmount = parseFloat(cashierTotalCost.value.replace('$', ''));

    if (!lastScannedUid || !productId || totalAmount <= 0) return;

    try {
        await fetch(`${BACKEND_URL}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: lastScannedUid, productId, quantity, totalAmount })
        });
    } catch (error) {
        addLog(`❌ Error: ${error.message}`);
    }
});

// ========================================
// RECEIPT LOGIC
// ========================================
function showReceipt(data) {
    receiptDate.textContent = new Date().toLocaleString();
    receiptBody.innerHTML = `
        <div class="receipt-item">
            <span>Item:</span>
            <span>${data.productName} (x${data.quantity})</span>
        </div>
        <div class="receipt-item">
            <span>Card UID:</span>
            <span>${data.uid}</span>
        </div>
    `;
    receiptTotalAmount.textContent = `$${data.amount.toFixed(2)}`;
    receiptId.textContent = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    receiptModal.classList.remove('hidden');
}

closeReceiptBtn.addEventListener('click', () => {
    receiptModal.classList.add('hidden');
    cashierQuantity.value = '1';
    cashierTotalCost.value = '$0.00';
    clearResponses();
});

// ========================================
// UTILITIES
// ========================================
function populateProductList() {
    cashierProduct.innerHTML = '<option value="">-- Select Product --</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p._id;
        opt.textContent = `${p.name} - $${p.price.toFixed(2)}`;
        opt.dataset.price = p.price;
        cashierProduct.appendChild(opt);
    });
}

function calculateTotal() {
    const sel = cashierProduct.options[cashierProduct.selectedIndex];
    if (!sel.dataset.price) {
        cashierTotalCost.value = '$0.00';
        return;
    }
    const total = parseFloat(sel.dataset.price) * (parseInt(cashierQuantity.value) || 1);
    cashierTotalCost.value = `$${total.toFixed(2)}`;
}

cashierProduct.addEventListener('change', calculateTotal);
cashierQuantity.addEventListener('input', calculateTotal);

function addLog(msg) {
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString([], { hour12: false });
    li.textContent = `[${time}] ${msg}`;
    logList.prepend(li);
    if (logList.children.length > 20) logList.removeChild(logList.lastChild);
}

function clearResponses() {
    adminResponse.innerHTML = '';
    cashierResponse.innerHTML = '';
}

addLog('Ready for secure login');
