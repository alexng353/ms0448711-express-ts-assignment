import app from "../src/app";
import path from 'path';
import request from "supertest";

describe("POST /upload",()=>{
    it("should return {message:'upload complete',success:true}",async  ()=>{
        const pdfDoc = path.resolve(__dirname+'/../data/Business+Backgrounder+B+.pdf')
        const response = await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        expect(response.status).toBe(200)
        expect(response.text).toBe(JSON.stringify({message:"upload complete",success:true}))
    })

    it("should fail because of size limit", async ()=>{
        const pdfDoc = path.resolve(__dirname+'/../data/CAHSMUN+2021+Delegate+Handbook.pdf')
        const response = await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        expect(response.status).toBe(413)
        expect(response.text).toBe("File size limit has been reached")
    })

    it("should run eleven times and return 'Too Many Request'",async  ()=>{
        const pdfDoc = path.resolve(__dirname+'/../data/Business+Backgrounder+B+.pdf')

        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)

        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        
        const response = await request(app).post("/upload").attach('pdfDoc',pdfDoc)
        expect(response.status).toBe(429)
        expect(response.text).toBe("Too Many Request")
    }, 30*1000)
})