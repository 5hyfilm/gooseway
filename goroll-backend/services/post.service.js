import { Op, Sequelize } from 'sequelize';
import db from '../models/database.js';

const { post, postCategory, user, commentPost, postTag, postImg } = db;

const postService = {
    async findById(postId, userId) {
        const newPost = await post.findByPk(postId, {
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl'],
                },
                {
                    model: postCategory,
                    as: 'category',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
                {
                    model: postTag,
                    as: 'tags',
                },
                {
                    model: postImg,
                    as: 'images',
                    attributes: ['id', 'imageUrl'],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "like_post" AS "likes"
                        WHERE "likes"."post_id" = "Post"."id"
                        )`),
                        'likeCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "comment_post" AS "comments"
                        WHERE "comments"."post_id" = "Post"."id"
                        )`),
                        'commentCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT EXISTS (
                            SELECT 1
                            FROM user_followers
                            WHERE follower_id = ${userId} AND following_id = "Post"."user_id"
                        ) 
                        )`),
                        'isFollowing',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT EXISTS (
                            SELECT 1
                            FROM like_post
                            WHERE post_id = "Post"."id" AND user_id = ${userId}
                        ) 
                        )`),
                        'isLike',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT EXISTS (
                            SELECT 1
                            FROM post_bookmark
                            WHERE post_id = "Post"."id" AND user_id = ${userId}
                        ) 
                        )`),
                        'isBookMark',
                    ],
                ],
            },
        });
        return newPost;
    },
    async findShareById(postId) {
        const newPost = await post.findByPk(postId, {
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl'],
                },
                {
                    model: postCategory,
                    as: 'category',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
                {
                    model: postTag,
                    as: 'tags',
                },
                {
                    model: postImg,
                    as: 'images',
                    attributes: ['id', 'imageUrl'],
                },
                {
                    model: commentPost,
                    as: 'comments',
                    include: [
                        {
                            model: user,
                            as: 'user',
                            attributes: ['id', 'fullName', 'avatarUrl'],
                        },
                    ],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "like_post" AS "likes"
                        WHERE "likes"."post_id" = "Post"."id"
                        )`),
                        'likeCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "comment_post" AS "comments"
                        WHERE "comments"."post_id" = "Post"."id"
                        )`),
                        'commentCount',
                    ],
                ],
            },
        });
        return newPost;
    },
    async adminFindById(locationId) {
        const newPost = await post.findByPk(locationId, {
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: ['id', 'fullName', 'avatarUrl', 'roleId'],
                },
                {
                    model: postCategory,
                    as: 'category',
                    attributes: ['id', 'nameEn', 'nameTh'],
                },
                {
                    model: commentPost,
                    as: 'comments',
                    include: [
                        {
                            model: user,
                            as: 'user',
                            attributes: ['id', 'fullName', 'avatarUrl'],
                        },
                    ],
                },
                {
                    model: postTag,
                    as: 'tags',
                },
                {
                    model: postImg,
                    as: 'images',
                    attributes: ['id', 'imageUrl'],
                },
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "like_post" AS "likes"
                        WHERE "likes"."post_id" = "Post"."id"
                        )`),
                        'likeCount',
                    ],
                    [
                        Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "comment_post" AS "comments"
                        WHERE "comments"."post_id" = "Post"."id"
                        )`),
                        'commentCount',
                    ],
                ],
            },
        });
        return newPost;
    },
    async insert(postPayload) {
        const newPost = await post.create(postPayload);
        return newPost;
    },
    async findAll(queryOptions, criteria) {
        let where = {};

        let order = [];
        if (criteria.sort === 'mostLike') {
            order.push([Sequelize.literal('"likeCount"'), 'DESC']);
        } else if (criteria.sort === 'mostComment') {
            order.push([Sequelize.literal('"commentCount"'), 'DESC']);
        } else if (criteria.sort === 'mostRecent') {
            order.push(['createdAt', 'DESC']);
        }

        if (criteria.title) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Post".title')), {
                    [Op.like]: `%${criteria.title.toLowerCase()}%`,
                }),
            ];
        }

        if (criteria.categoryId) {
            where['categoryId'] = criteria.categoryId;
        }

        if (criteria.follower === true) {
            where['userId'] = {
                [Sequelize.Op.in]: Sequelize.literal(`(
                SELECT "following_id"
                FROM "user_followers"
                WHERE "follower_id" = ${criteria.userId}
                )`),
            };
        }

        if (criteria.isBookMark === true) {
            where['id'] = {
                [Sequelize.Op.in]: Sequelize.literal(`(
                SELECT "post_id"
                FROM "post_bookmark"
                WHERE "user_id" = ${criteria.userId}
                )`),
            };
        }

        const data = criteria.countOnly
            ? undefined
            : await post.findAll({
                  include: [
                      {
                          model: user,
                          as: 'user',
                          attributes: ['id', 'fullName', 'avatarUrl'],
                      },
                      {
                          model: postCategory,
                          as: 'category',
                          attributes: ['id', 'nameEn', 'nameTh'],
                      },
                      {
                          model: postTag,
                          as: 'tags',
                      },
                      {
                          model: postImg,
                          as: 'images',
                          attributes: ['id', 'imageUrl'],
                          order: [['id', 'ASC']],
                          limit: 1,
                      },
                  ],
                  attributes: {
                      include: [
                          [
                              Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "like_post" AS "likes"
                            WHERE "likes"."post_id" = "Post"."id"
                            )`),
                              'likeCount',
                          ],
                          [
                              Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "comment_post" AS "comments"
                            WHERE "comments"."post_id" = "Post"."id"
                            )`),
                              'commentCount',
                          ],
                      ],
                  },
                  where,
                  ...queryOptions,
                  order: order,
              });

        const total = await post.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async adminFindAll(queryOptions, criteria) {
        let where = {};

        if (criteria.title) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Post".title')), {
                    [Op.like]: `%${criteria.title.toLowerCase()}%`,
                }),
            ];
        }

        if (criteria.categoryId) {
            where['categoryId'] = criteria.categoryId;
        }

        const data = criteria.countOnly
            ? undefined
            : await post.findAll({
                  include: [
                      {
                          model: user,
                          as: 'user',
                          attributes: ['id', 'fullName', 'roleId'],
                      },
                      {
                          model: postCategory,
                          as: 'category',
                          attributes: ['id', 'nameEn', 'nameTh'],
                      },
                  ],
                  attributes: {
                      include: [
                          [
                              Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "like_post" AS "likes"
                            WHERE "likes"."post_id" = "Post"."id"
                            )`),
                              'likeCount',
                          ],
                          [
                              Sequelize.literal(`(
                            SELECT COUNT(1)
                            FROM "comment_post" AS "comments"
                            WHERE "comments"."post_id" = "Post"."id"
                            )`),
                              'commentCount',
                          ],
                      ],
                  },
                  where,
                  ...queryOptions,
              });

        const total = await post.count({
            where,
        });

        return {
            data,
            total,
        };
    },
    async findPostAll(queryOptions, criteria) {
        let where = {};
        where['userId'] = criteria.userId;

        if (criteria.title) {
            where[Op.and] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('"Post".title')), {
                    [Op.like]: `%${criteria.title.toLowerCase()}%`,
                }),
            ];
        }

        const data = criteria.countOnly
            ? undefined
            : await post.findAll({
                  include: [
                      {
                          model: postTag,
                          as: 'tags',
                          attributes: ['tag'],
                      },
                  ],
                  attributes: [
                      'id',
                      'title',
                      'content',
                      'createdAt',
                      [
                          Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "like_post" AS "likes"
                        WHERE "likes"."post_id" = "Post"."id"
                    )`),
                          'likeCount',
                      ],
                      [
                          Sequelize.literal(`(
                        SELECT COUNT(1)
                        FROM "comment_post" AS "comments"
                        WHERE "comments"."post_id" = "Post"."id"
                    )`),
                          'commentCount',
                      ],
                  ],
                  where,
                  ...queryOptions,
              });

        const total = await post.count({
            where,
        });

        const mapped = (data || []).map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            tags: (post.tags || []).map(t => t.tag),
        }));

        return {
            data: mapped,
            total,
        };
    },
    async update(postPayload, userId) {
        const existingPost = await post.findByPk(postPayload.id);
        if (!existingPost) {
            throw new Error('Error Post not found');
        }
        if (existingPost.userId !== userId) {
            throw new Error('Error You can only update your own posts');
        }
        await existingPost.update(postPayload);
    },

    async adminUpdate(postPayload) {
        const existingPost = await post.findByPk(postPayload.id);
        if (!existingPost) {
            throw new Error('Error Post not found');
        }
        await existingPost.update(postPayload);
    },

    async delete(postId) {
        await post.destroy({
            where: { id: postId },
        });
    },
    async userDelete(postId, userId) {
        const existingPost = await post.findByPk(postId);
        if (!existingPost) {
            throw new Error('Error Post not found');
        }
        if (existingPost.userId !== userId) {
            throw new Error('You can only delete your own posts');
        }
        await post.destroy({
            where: { id: postId },
        });
    },
};

export default postService;
