import request from "supertest";
import app from "../src/index.js";

let token;
let fileId;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "user1@test.com",
      password: "12345678"
    });
  token = res.body.token;
});

describe("Files API", () => {
  it("list files", async () => {
    const res = await request(app)
      .get("/api/files")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("upload file", async () => {
    const res = await request(app)
      .post("/api/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", "tests/sample.txt");

    expect(res.statusCode).toBe(200);
    fileId = res.body.file.id;
  });

  it("delete file", async () => {
    const res = await request(app)
      .delete(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.message).toBe("File moved to trash");
  });

  it("restore file", async () => {
    const res = await request(app)
      .post(`/api/files/restore/${fileId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.message).toBe("File restored");
  });
});
