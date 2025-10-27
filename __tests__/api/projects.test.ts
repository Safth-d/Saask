import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../../src/app/api/projects/route';
import * as NextAuth from 'next-auth';
import prisma from '../../src/lib/prisma';

// Mock next-auth's getServerSession
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getServerSession: jest.fn(),
}));

// Mock prisma client
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    task: {
      groupBy: jest.fn(),
    },
  },
}));

describe('Projects API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (NextAuth.getServerSession as jest.Mock).mockReset();
    (prisma.project.findMany as jest.Mock).mockReset();
    (prisma.project.create as jest.Mock).mockReset();
    (prisma.task.groupBy as jest.Mock).mockReset();
  });

  describe('GET /api/projects', () => {
    it('should return 401 if unauthorized', async () => {
      (NextAuth.getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: 'Non autorisé' });
    });

    it('should return projects for an authenticated user', async () => {
      const mockSession = {
        user: { tenantId: 'test-tenant-id', id: 'user-id' },
      };
      (NextAuth.getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const mockProjects = [
        { id: 'p1', name: 'Project 1', tenantId: 'test-tenant-id', createdAt: new Date(), description: null },
        { id: 'p2', name: 'Project 2', tenantId: 'test-tenant-id', createdAt: new Date(), description: null },
      ];
      (prisma.project.findMany as jest.Mock).mockResolvedValueOnce(mockProjects);
      (prisma.task.groupBy as jest.Mock).mockResolvedValueOnce([]); // No tasks for simplicity

      const { req, res } = createMocks({
        method: 'GET',
      });

      const response = await GET(req as any);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Project 1');
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'test-tenant-id' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('POST /api/projects', () => {
    it('should return 401 if unauthorized', async () => {
      (NextAuth.getServerSession as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: 'POST',
      });
      req.json = () => Promise.resolve({ name: 'New Project' });

      const response = await POST(req as any);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ message: 'Non autorisé' });
    });

    it('should return 400 if project name is missing', async () => {
      const mockSession = {
        user: { tenantId: 'test-tenant-id', id: 'user-id' },
      };
      (NextAuth.getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const { req, res } = createMocks({
        method: 'POST',
      });
      req.json = () => Promise.resolve({ description: 'Some description' });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: 'Le nom du projet est requis' });
    });

    it('should create a new project for an authenticated user', async () => {
      const mockSession = {
        user: { tenantId: 'test-tenant-id', id: 'user-id' },
      };
      (NextAuth.getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const newProjectData = { name: 'New Project', description: 'A new project' };
      const createdProject = { id: 'new-p-id', ...newProjectData, tenantId: 'test-tenant-id', createdAt: new Date(), updatedAt: new Date() };
      (prisma.project.create as jest.Mock).mockResolvedValueOnce(createdProject);

      const { req, res } = createMocks({
        method: 'POST',
      });
      req.json = () => Promise.resolve(newProjectData);

      const response = await POST(req as any);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe('New Project');
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: newProjectData.name,
          description: newProjectData.description,
          tenantId: mockSession.user.tenantId,
        },
      });
    });
  });
});