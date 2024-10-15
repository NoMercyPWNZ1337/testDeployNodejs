const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

// Настройка хранилища Multer с оригинальными расширениями файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Доступ к загруженным изображениям

// Шлях до JSON файла для збереження продуктів
const filePath = path.join(__dirname, 'products.json');

// Читання даних з JSON файлу
function readProducts() {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Запис даних у JSON файл
function writeProducts(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API для отримання всіх товарів
app.get('/api/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});

// API для додавання нового товару з можливістю завантаження зображень
app.post('/api/products', upload.array('images', 5), (req, res) => {
    const newProduct = {
        _id: req.body._id,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        images: req.files.map(file => `/uploads/${file.filename}`), // Збереження шляху до зображень
        alt: req.body.alt
    };

    // Отримуємо існуючі продукти
    const products = readProducts();

    // Додаємо новий товар до масиву
    products.push(newProduct);

    // Записуємо назад у JSON файл
    writeProducts(products);

    // Відправляємо відповідь клієнту
    res.status(201).json({ message: 'Товар успішно доданий!' });
});

// Запуск сервера на порту 3000
app.listen(3000, () => {
    console.log('Сервер запущено на порту 3000');
});
