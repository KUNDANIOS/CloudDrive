import request from "supertest";
import app from "../src/index.js";

describe("Auth API", () => {
  it("should login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user1@test.com",
        password: "12345678"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
