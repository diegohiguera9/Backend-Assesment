const mongoose = require("mongoose");
const clonServer = require("supertest");
const app = require("../../app");
const { connect, disconnected, cleanup } = require("../../db.js");

describe("User", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnected();
  });

  beforeEach(async () => {
    await cleanup();
  });

  it("should create a user correctly", async () => {
    const user = { email: "test@test.com", password: "12345" };
    const res = await clonServer(app).post("/auth/local/singup").send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    );
  });

  it("should nor create user when there is no email", async () => {
    const user = { password: "12345" };
    const res = await clonServer(app).post("/auth/local/singup").send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("Path `email` is required.");
  });

  it("should not create user when email is invalid", async () => {
    const user = { email:"diego",password: "12345" };
    const res = await clonServer(app).post("/auth/local/singup").send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch('Not valid email');
  });

  it("should not create user when email already exist", async () => {
    const user = { email: "test@test.com", password: "12345" };
    await clonServer(app).post("/auth/local/singup").send(user);
    const res = await clonServer(app).post("/auth/local/singup").send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("Email already exist");
  });

  it("should signin a user correctly", async () => {
    const user = { email: "test@test.com", password: "12345" };
    await clonServer(app).post("/auth/local/singup").send(user);
    const res = await clonServer(app).post("/auth/local/login").send(user);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    );
  });

  it("should not login with incorrect password", async () => {
    const user = { email: "test@test.com", password: "12345" };
    await clonServer(app).post("/auth/local/singup").send(user);
    const res = await clonServer(app).post("/auth/local/login").send({...user,password:"1"});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("No valid password");
  });

  it("should not login if email does not exist", async () => {
    const user = { email: "test@test.com", password: "12345" };
    const res = await clonServer(app).post("/auth/local/login").send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch("No user with those credentials");
  });
});
