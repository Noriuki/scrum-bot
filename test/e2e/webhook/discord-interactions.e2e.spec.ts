/**
 * E2E: Discord interactions (POST /api/interactions).
 * Testa validação de assinatura e corpo; não exige DISCORD_PUBLIC_KEY válido para 401/400.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { config } from "dotenv";
import request from "supertest";
import { AppModule } from "../../../src/app.module";

config();

describe("Discord interactions (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      rawBody: true,
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("POST /api/interactions sem body retorna 400", () => {
    return request(app.getHttpServer())
      .post("/api/interactions")
      .set("X-Signature-Ed25519", "fake")
      .set("X-Signature-Timestamp", "123")
      .expect(400);
  });

  it("POST /api/interactions sem headers de assinatura retorna 401", () => {
    return request(app.getHttpServer())
      .post("/api/interactions")
      .send({ type: 1 })
      .set("Content-Type", "application/json")
      .expect(401);
  });
});
