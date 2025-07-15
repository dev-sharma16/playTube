// ? Its an middleware 'MULTER' ,in express we can take text from the body using 'express.json' but we can't files like image or video so for that we user this middleware and we can use it like this:-
// * app.post('/profile', upload.single('avatar'), function (req, res, next){}

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../../public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.filename);
    },
});

export const upload = multer({ storage });
