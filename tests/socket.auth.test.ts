import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateSocket } from '../src/auth/socket.middleware';
import { env } from '../src/env';

describe('Socket.io Authentication', () => {
    let httpServer: any;
    let io: SocketIOServer;
    let serverPort: number;
    let clientSocket: Socket;

    // Setup server before all tests
    beforeAll((done) => {
        const app = express();
        httpServer = createServer(app);
        io = new SocketIOServer(httpServer, {
            cors: {
                origin: true,
                credentials: true,
            },
        });

        // Apply authentication middleware
        io.use(authenticateSocket);

        io.on('connection', (socket) => {
            socket.emit('authenticated', {
                userId: (socket as any).userId,
                email: (socket as any).email,
                message: 'Successfully authenticated'
            });
        });

        httpServer.listen(() => {
            serverPort = (httpServer.address() as any).port;
            done();
        });
    });

    // Cleanup after all tests
    afterAll(() => {
        io.close();
        httpServer.close();
    });

    // Close client socket after each test
    afterAll(() => {
        if (clientSocket) {
            clientSocket.close();
        }
    });

    it('should refuse connection without token', (done) => {
        clientSocket = ioClient(`http://localhost:${serverPort}`, {
            auth: {}
        });

        clientSocket.on('connect_error', (error) => {
            expect(error.message).toBe('Token manquant');
            clientSocket.close();
            done();
        });

        clientSocket.on('connect', () => {
            clientSocket.close();
            done(new Error('Should not connect without token'));
        });
    });

    it('should refuse connection with invalid token', (done) => {
        clientSocket = ioClient(`http://localhost:${serverPort}`, {
            auth: {
                token: 'invalid-token'
            }
        });

        clientSocket.on('connect_error', (error) => {
            expect(error.message).toBe('Token invalide ou expiré');
            clientSocket.close();
            done();
        });

        clientSocket.on('connect', () => {
            clientSocket.close();
            done(new Error('Should not connect with invalid token'));
        });
    });

    it('should accept connection with valid JWT token', (done) => {
        const validToken = jwt.sign(
            { userId: 1, email: 'test@example.com' },
            env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        clientSocket = ioClient(`http://localhost:${serverPort}`, {
            auth: {
                token: validToken
            }
        });

        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
        });

        clientSocket.on('authenticated', (data) => {
            expect(data.userId).toBe(1);
            expect(data.email).toBe('test@example.com');
            expect(data.message).toBe('Successfully authenticated');
            clientSocket.close();
            done();
        });

        clientSocket.on('connect_error', (error) => {
            clientSocket.close();
            done(new Error(`Should connect with valid token: ${error.message}`));
        });
    });

    it('should inject user info (userId, email) into socket after authentication', (done) => {
        const validToken = jwt.sign(
            { userId: 42, email: 'user@example.com' },
            env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        let serverSocket: any;
        io.once('connection', (socket) => {
            serverSocket = socket;
            expect(serverSocket.userId).toBe(42);
            expect(serverSocket.email).toBe('user@example.com');
            clientSocket.close();
            done();
        });

        clientSocket = ioClient(`http://localhost:${serverPort}`, {
            auth: {
                token: validToken
            }
        });
    });
});
