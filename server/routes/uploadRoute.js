const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('excelFile'), (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;
