const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// إعدادات الاتصال بقاعدة البيانات
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bero2512@',  // غيرها حسب جهازك
  database: 'logout'      // غيرها حسب قاعدة بياناتك
});

db.connect(err => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    return;
  }
  console.log('✔️ متصل بقاعدة البيانات');
});

// إعداد session
app.use(session({
  secret: 'your_secret_key',    // غيرها بكلمة سر سرية
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 30 } // 30 دقيقة
}));

// تسجيل دخول
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    // تسجيل الجلسة
    req.session.user = {
      id: results[0].id,
      email: results[0].email
    };
    res.json({ message: 'تم تسجيل الدخول بنجاح' });
  });
});

// endpoint لعرض حالة الجلسة (للتأكد)
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'غير مسجل دخول' });
  res.json({ message: `أهلاً ${req.session.user.email}` });
});

// endpoint تسجيل خروج
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'خطأ في تسجيل الخروج', error: err.message });
    }
    res.clearCookie('connect.sid');  // حذف الكوكيز
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
});

// تشغيل السيرفر
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
