const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ── Almacenamiento a disco (imágenes) ───────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './public/uploads';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp).'));
  }
};

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '5') * 1024 * 1024 },
  fileFilter: imageFilter,
});

// ── Almacenamiento a disco (PDFs) ───────────────────────────────────
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_PDF_DIR || './public/uploads/cv';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' || ext === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o ZIP.'));
  }
};

const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: pdfFilter,
});

// ── Upload PDFs para documentos clínicos (directorio propio) ──────────────
const documentoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads/documentos';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Preservar nombre original sanitizado para facilitar identificación
    const base = file.originalname
      .replace(/[^a-zA-Z0-9ÁáÉéÍíÓóÚúÑñ._\- ]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 120);
    const unique = `${Date.now()}_${base}`;
    cb(null, unique);
  },
});

const uploadDocumento = multer({
  storage: documentoStorage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB para lotes ZIP grandes
  fileFilter: pdfFilter,
});

// ── Upload múltiple para médicos (foto + cv) ────────────────────────
const medicoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isCV = file.fieldname === 'cv';
    const dir = isCV
      ? (process.env.UPLOAD_PDF_DIR || './public/uploads/cv')
      : (process.env.UPLOAD_DIR || './public/uploads');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const medicoFilter = (req, file, cb) => {
  if (file.fieldname === 'cv') {
    if (/\.pdf$/i.test(file.originalname) && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('El CV debe ser un archivo PDF.'));
    }
  } else {
    const allowed = /jpeg|jpg|png|webp/;
    if (
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error('La foto debe ser una imagen (jpeg, jpg, png, webp).'));
    }
  }
};

const uploadMedico = multer({
  storage: medicoStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: medicoFilter,
});

// ── Subida de Excel en memoria ──────────────────────────────────────
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(xlsx|xls)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls).'));
  },
});

// ── Almacenamiento a disco (POA Excel) ───────────────────────────────
const poaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploads/poa';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const uploadPOA = multer({
  storage: poaStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    if (/\.(xlsx|xls)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls).'));
  },
});

module.exports = { uploadImage, uploadPDF, uploadDocumento, uploadMedico, uploadExcel, uploadPOA };
