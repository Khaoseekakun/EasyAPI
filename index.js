const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;
const sql = new sqlite3.Database("./database/data.db")

sql.on("open", () => {
    console.log("[SQL] Database is coonected.")
}).on("error", () => {
    console.log("[SQL] Database error.")
})

app.use(bodyParser.json());

app.use(cors());

// เพิ่ม endpoint สำหรับ GET method (ดึงข้อมูล);
app.get('/api/users', async(req, res) => {
    const body = req.body;

    const firstname = body.firstname ?? null;
    const lastname = body.lastname ?? null;
    const email = body.email ?? null;
    const id = body.id ?? null;
    // เราจะให้ตรวจสอบจากชื่อและนามสกุล (firstname lastname)
    if(firstname == null || lastname == null) return res.json
    sql.get(`SELECT * FROM users WHERE first = ? AND lastname = ? LIMIT`, [firstname, lastname], (err, user) => {

    })

});

// เพิ่ม endpoint สำหรับ POST method (เพิ่ม)
app.post('/api/users', (req, res) => {
  const newUser = req.body.user;
  // ทำสิ่งที่ต้องการกับข้อมูล user
  res.send('User added successfully');
});

app.listen(PORT, () => {
  console.log(`[API] Server is running on port ${PORT}`);
});
