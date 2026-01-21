import request from "supertest";
import app from "../src/index.js";

let token;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "user1@test.com",
      password: "12345678"
    });
  token = res.body.token;
});

describe("Folders API", () => {
  it("create folder", async () => {
    const res = await request(app)
      .post("/api/folders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Folder", parent_id: null });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Test Folder");
  });
});
