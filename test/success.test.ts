import app from "../src/app";
import request from "supertest";

describe("GET /",()=>{
    it("should return {success:true}",async  ()=>{
        const response = await request(app).get("/")
        expect(response.status).toBe(200)
        expect(response.text).toBe(JSON.stringify({"success": true}))
    })
})