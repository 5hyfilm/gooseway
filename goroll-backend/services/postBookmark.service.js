import db from '../models/database.js';

const { postBookmark, post, user } = db;

const postBookmarkService = {
    async findAll(queryOptions, criteria) {
        let where = {};

        if (criteria.title) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Post".title')), {
                    [Op.like]: `%${criteria.title.toLowerCase()}%`,
                }),
            ];
        }
        where['userId'] = criteria.userId;
        const data = criteria.countOnly
            ? undefined
            : await postBookmark.findAll({
                  attributes: ['id', 'postId', 'userId', 'createdAt'],
                  order: [['createdAt', 'DESC']],
                  include: [
                      {
                          model: post,
                          as: 'post',
                          attributes: ['id', 'title', 'content', 'createdAt'],
                          include: [
                              {
                                  model: user,
                                  as: 'user',
                                  attributes: ['id', 'fullName', 'avatarUrl'],
                              },
                          ],
                      },
                  ],
                  where,
                  ...queryOptions,
              });
        const total = await postBookmark.count({
            where,
        });

        return {
            data,
            total,
        };
    },

    async insert({ postId, userId }) {
        const existingBookmark = await postBookmark.findOne({
            where: { postId, userId },
        });
        if (existingBookmark) {
            throw new Error('This post is already bookmarked');
        }
        return await postBookmark.create({
            postId,
            userId,
        });
    },

    async delete(id, userId) {
        const existingBookmark = await postBookmark.findOne({
            where: { postId: id, userId },
        });
        if (!existingBookmark) {
            throw new Error('Bookmark not found or does not belong to this user');
        }
        return await postBookmark.destroy({
            where: { postId: id, userId },
        });
    },
};

export default postBookmarkService;
