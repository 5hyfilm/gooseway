import { Router } from 'express';
import postController from '../controllers/post.controller.js';
import postBookmarkController from '../controllers/postBookmark.controller.js';
import { authMiddleware, checkAdminRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/insert', authMiddleware, postController.insert);

router.post('/admin/insert', authMiddleware, checkAdminRole, postController.insert);

router.post('/update', authMiddleware, postController.update);

router.post('/admin/update', authMiddleware, checkAdminRole, postController.adminUpdate);

router.post('/admin/findAll', authMiddleware, checkAdminRole, postController.adminFindAll);

router.post('/findAll', authMiddleware, postController.findAll);

router.get('/findById/:id', authMiddleware, postController.findById);

router.get('/findShareById/:id', postController.findShareById);

router.get('/admin/findById/:id', authMiddleware, checkAdminRole, postController.adminFindById);

router.delete('/admin/delete/:id', authMiddleware, checkAdminRole, postController.delete);

router.delete('/delete/:id', authMiddleware, postController.userDelete);

router.post('/like', authMiddleware, postController.likePost);

router.post('/comment', authMiddleware, postController.commentPost);

router.delete('/admin/delete/comment/:id', authMiddleware, checkAdminRole, postController.deleteComment);

router.get('/findComment/:postId', authMiddleware, postController.findCommentByPostId);

router.post('/admin/export', authMiddleware, checkAdminRole, postController.export);

router.post('/findAllPostByUserId', authMiddleware, postController.findPostAll);

router.post('/updateComment', authMiddleware, postController.updateComment);

router.post('/findPostBookmark', authMiddleware, postBookmarkController.findAll);

router.post('/insertPostBookmark', authMiddleware, postBookmarkController.insert);

router.delete('/deletePostBookmark/:id', authMiddleware, postBookmarkController.delete);

export default router;
