import { compare } from 'bcryptjs';
import { getUserCredentialByUsername } from '../../db/user.js';

/**
 * Basic authentication handler
 * @param {string} username
 * @param {string} password
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function requestValidator(username, password, request, reply) {
    /** @type {import('../../models/User.js').UserCredential} */
    let cred;

    /** @type {boolean} */
    let isPasswordValid;

    try {
        cred = await getUserCredentialByUsername(username);
    } catch (error) {
        return new Error("Couldn't get user info");
    }

    if (!cred) {
        return new Error('User not found');
    }

    try {
        isPasswordValid = await compare(password, cred.passwordHash);
    } catch (error) {
        return new Error("Couldn't verify password");
    }

    if (!isPasswordValid) {
        return new Error('Invalid password');
    }

    Reflect.set(request, 'userId', cred.id);
    request.requestContext.set('userId', cred.id);
}
