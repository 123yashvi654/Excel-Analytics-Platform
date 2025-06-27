const XLSX = require('xlsx');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('excelFile'), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Optional: parse numbers if needed
    const cleanedData = jsonData.map(row => {
      const cleanedRow = {};
      for (let key in row) {
        const val = row[key];
        cleanedRow[key.trim()] = isNaN(Number(val)) ? val : Number(val);
      }
      return cleanedRow;
    });

    res.status(200).json({ data: cleanedData });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({ msg: "Error processing file" });
  }
});

module.exports = router;
