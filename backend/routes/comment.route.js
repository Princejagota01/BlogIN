const express = require('express');
const { createComment, getPostComments, likeComment, editComment, deleteComment, getComments,getCommentsByID } = require('../controllers/comment.controller');
const { verifyToken } = require('../utils/verifyUser');
const router = express.Router();

router.post('/create',verifyToken,createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId',verifyToken,likeComment);
router.put('/editComment/:commentId', verifyToken, editComment)
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);
router.get('/getcomments',verifyToken, getComments);
router.get('/getcommentsByID',verifyToken, getCommentsByID);
module.exports = router