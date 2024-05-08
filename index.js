const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// เชื่อมต่อกับ SQLite database
const sql = new sqlite3.Database("./database/data.db")

sql.on("open", () => {
    console.log("[SQL] Database is connected.")
}).on("error", () => {
    console.log("[SQL] Database error.")
})

// ใช้ bodyParser สำหรับแปลง JSON
app.use(bodyParser.json());

// ใช้ cors เพื่อเปิดให้แอปพลิเคชันรับข้อมูลจากหลายๆ origin
app.use(cors());

// Middleware function เพื่อตรวจสอบ Content-Type ของ request
const checkContentType = (req, res, next) => {
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(415).json({
            message: 'ประเภทสื่อที่ไม่รองรับ อนุญาตเฉพาะ application/json เท่านั้น',
            code: 415
        });
    }
    next();
};

// เพิ่ม endpoint สำหรับ GET method (ดึงข้อมูล);
app.get('/api/users', checkContentType, (req, res) => {
    // ดึงข้อมูลจาก req.body
    const body = req.body;

    // รับค่าข้อมูลจาก body
    const firstname = body.firstname ?? null;
    const lastname = body.lastname ?? null;

    // เราจะให้ตรวจสอบจากชื่อและนามสกุล (firstname lastname)
    if (firstname == null || lastname == null) return res.status(400).json({
        message: "โปรดระบุ ชื่อและนามสกุลให้ถูกต้อง",
        code: 400
    })

    // ค้นหาข้อมูลผู้ใช้
    sql.get(`SELECT * FROM users WHERE firstname = ? AND lastname = ? LIMIT 1`, [firstname, lastname], (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "ข้อผิดพลาดภายในเซิร์ฟเวอร์",
                code: 500
            })
        } else {
            if (user) {
                return res.status(200).json({
                    code: 200,
                    data: { ...user }
                })
            } else {
                return res.status(200).json({
                    message: "ไม่พบสมาชิกที่คุณกำลังค้นหา",
                    code: 204
                })
            }
        }
    })

});

// เพิ่ม endpoint สำหรับ POST method (เพิ่ม)
app.post('/api/users', checkContentType, (req, res) => {
    // รับค่าข้อมูลจาก req.body
    const body = req.body;
    const firstname = body.firstname ?? null;
    const lastname = body.lastname ?? null;
    const email = body.email ?? null;

    // ตรวจสอบความสมบูรณ์ของข้อมูล
    if (firstname == null || lastname == null || email == null) return res.status(400).json({
        message: "โปรดระบุ ชื่อ นามสกุล และ อีเมลให้ครบถ้วน",
        code: 400
    })

    // ตรวจสอบว่าข้อมูลผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    sql.get(`SELECT * FROM users WHERE firstname = ? AND lastname = ? LIMIT 1`, [firstname, lastname], (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "ข้อผิดพลาดภายในเซิร์ฟเวอร์",
                code: 500
            })
        } else {
            if (user) {
                return res.status(208).json({
                    message: "มีข้อมูลนนี้อยู่ในระบบแล้ว",
                    code: 208
                })
            } else {
                // เพิ่มข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
                sql.run(`INSERT INTO users (firstname, lastname, email) VALUES (?,?,?)`, [firstname, lastname, email], (err, insert) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: "ข้อผิดพลาดภายในเซิร์ฟเวอร์",
                            code: 500
                        })
                    } else {
                        return res.status(200).json({
                            message: "เพิ่มข้อมูลใหม่เรียบร้อย",
                            code: 200
                        })
                    }
                })
            }
        }
    })
});

// เพิ่ม endpoint สำหรับ DELETE method (ลบข้อมูล)
app.delete('/api/users/:id', checkContentType, (req, res) => {
    const userId = req.params.id;

    // ตรวจสอบว่ามี userId ที่ส่งมาหรือไม่
    if (!userId) {
        return res.status(400).json({
            message: "โปรดระบุ ID ของผู้ใช้ที่ต้องการลบ",
            code: 400
        });
    }

    // ลบข้อมูลผู้ใช้จากฐานข้อมูล
    sql.run(`DELETE FROM users WHERE id = ?`, [userId], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "ข้อผิดพลาดภายในเซิร์ฟเวอร์",
                code: 500
            });
        } else {
            return res.status(200).json({
                message: "ลบข้อมูลผู้ใช้เรียบร้อยแล้ว",
                code: 200
            });
        }
    });
});

// เริ่ม Express server ที่ PORT 3000
app.listen(PORT, () => {
    console.log(`[API] Server is running on port ${PORT}`);
});
