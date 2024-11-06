import { UserPublicInfo } from '../../models/User.js';
import { getUserInfo } from '../../services/user.js';

/**
 * @type {import('fastify').RouteHandler}
 * @version 1
 */
export async function handleCurrentUserGetInfo_v1(request, reply) {
    /** @type {number} */
    const userId = request.requestContext.get('userId');

    /** @type {UserPublicInfo|null} */
    let userInfo;

    try {
        userInfo = await getUserInfo(userId);
    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to get user information',
        });
    }

    if (!userInfo) {
        return reply.status(404).send({
            message: 'User not found',
        });
    }

    reply.status(200).send({
        message: 'Ok',
        result: userInfo,
    });
}
