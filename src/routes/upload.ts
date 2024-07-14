import { Router, Request, Response, NextFunction } from 'express';
import { promises } from "fs";
import {
    CommonResponse
} from "../utils/types"
import fileUpload = require('express-fileupload');
import rateLimit from '../middlewares/ratelimit';

const router = Router();

export default router;

router.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true
})
)

router.use(rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
})
)

router.post('/upload', (request: Request, response: Response) => {
    try {
        const file = request.files?.pdfDoc as fileUpload.UploadedFile;
        if (!file)
            response.status(400).send({message:"No file found",success:false})
        if (file.mimetype != 'application/pdf')
            response.status(400).send({message:"Unsupport data type",success:false})

        promises.writeFile("@/../data/"+file.name, file.data, {
            flag: "w"
           })
        //console.log("Finish Write")
        response.status(200).send({message:"upload complete",success:true});
    } catch (error) {
        response.status(500).send({message:"Internal Server Error",success:false})
    }

});