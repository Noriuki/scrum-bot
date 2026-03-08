import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../../../../src/modules/user/user.service";
import { User } from "../../../../src/modules/user/entities/user.entity";

describe("UserService (unit)", () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: "uuid-1",
    discordId: "discord-123",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  describe("create", () => {
    it("creates and saves a user", async () => {
      const dto = { discordId: "discord-123", name: "Test User" };
      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe("findOne", () => {
    it("returns user when found", async () => {
      const result = await service.findOne("uuid-1");
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "uuid-1" } });
      expect(result).toEqual(mockUser);
    });

    it("throws NotFoundException when user not found", async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne("missing")).rejects.toThrow("User not found");
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "missing" } });
    });
  });

  describe("update", () => {
    it("updates and returns user", async () => {
      const dto = { name: "Updated Name" };
      const updated = { ...mockUser, name: "Updated Name" };
      repo.findOne.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(updated);

      const result = await service.update("uuid-1", dto);

      expect(repo.update).toHaveBeenCalledWith("uuid-1", expect.objectContaining(dto));
      expect(result.name).toBe("Updated Name");
    });
  });
});
