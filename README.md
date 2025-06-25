# G\_Score 🎯

**G\_Score** là một hệ thống chấm điểm đơn giản với kiến trúc tách biệt giữa frontend và backend:

* 🖙 **Backend**: Django REST Framework – cung cấp API để lưu trữ và truy xuất điểm.
* 🖜 **Frontend**: React – giao diện người dùng thân thiện để nhập dữ liệu và hiển thị điểm.

---

## 🗂 Cấu trúc thư mục hoàn chỉnh

```
G_Score/
├── backend/             # Django project
│   ├── score_project/
    │   ├── manage.py
│   └── venv/
├── frontend/            # React app
│   ├── public/
│   └── src/
└── README.md
```

---

## 🚀 Cài đặt & Khởi động

### ✅ Yêu cầu

* Python 3.8+
* Node.js 16+
* SQLite
* pip, npm

---

### 🚰 Backend – Django

```bash
# Bước 1: Vào thư mục backend
cd backend

# Bước 2: Tạo virtual env và kích hoạt
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bước 3: Vào thư mục gốc score_project
cd score_project

# Bước 4: Cài thư viện
pip install -r requirements.txt

# Bước 5: Thiết lập DB
python manage.py migrate

# Bước 6: Chạy server
python manage.py runserver
```

Mặc định backend chạy tại: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

### 🌐 Frontend – React

```bash
# Bước 1: Vào thư mục frontend
cd frontend

# Bước 2: Cài dependencies
npm install

# Bước 3: Khởi chạy React app
npm start
```

Frontend chạy ở [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints (Django REST Framework)

| Method | Endpoint              | Mô tả                 |
| ------ | --------------------- | --------------------- |
| GET    | `/check/`             | Kiểm tra điểm         |
| GET    | `/report/by-subject/` | Thống kê điểm theo môn|
| GET    | `/top/`               | Thống kê theo khối    |
| GET    | `/export-excel/`      | Xuất file Excel       |

---

## 📦 Triển khai

* Backend: Railway, Heroku, Render
* Frontend: Vercel, Netlify

---

## 👤 Tác giả

* **Trần Ngọc Tài** – [GitHub](https://github.com/tranngoctaiutc2)

---

## 📄 License

This project is licensed under the MIT License.
