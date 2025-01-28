const Comment = require("../models/comment.model");

const createComment = async(req,res)=>{
    try{
        const {content, postId, userId} = req.body;
        if(userId !== req.user.id){
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to create this comment'
            })  
        }

        const newComment = new Comment({
            content,
            postId,
            userId
        })
        await newComment.save()

        return res.status(200).json(newComment)
        
    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getPostComments = async(req,res)=>{
    try{
      const comments = await Comment.find({postId: req.params.postId}).sort({
        createdAt: -1, // sorts comments in descending order based on createdAt timesatmp
      })
      return res.status(200).json(comments)

    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const likeComment = async (req,res)=>{
 try{
    const comment = await Comment.findById(req.params.commentId);
    if(!comment){
        return res.status(400).json({
            success: false,
            message: 'Comment not found'
        })
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if(userIndex === -1){
        comment.likes.push(req.user.id);
        comment.numberOfLikes+=1;
    } else{
        comment.likes.splice(userIndex, 1);
        comment.numberOfLikes-=1;
    }
    await comment.save();
    return res.status(200).json(comment)
 } catch(error){
    return res.status(500).json({
        success: false,
        message: error.message
    })
 }
}

const editComment = async(req,res)=>{
    try{
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return res.status(400).json({
                success: false,
                message: 'Comment not found'
            })
        }
        if(comment.userId !== req.user.id && !req.user.isAdmin){
            return res.status(400).json({
                success: false,
                message: 'You are not allowed to edit this comment'
            })
        }
        const editedComment = await Comment.findByIdAndUpdate(req.params.commentId, {
            content: req.body.content
        }, {new : true} )
        return res.status(200).json(editedComment)
        
    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deleteComment = async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) {
        return res.status(400).json({
            success: false,
            message: 'No such comment exists'
        })
      }
      if (comment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'You are not allowed to delete this comment'
      })
      }
      await Comment.findByIdAndDelete(req.params.commentId);
      res.status(200).json('Comment has been deleted');
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
  };

const getComments = async(req,res)=>{
    if(!req.user.isAdmin){
        return res.status(400).json({
            success: false,
            message: 'You are not allowed to get all comments'
        })   
    }
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'desc' ? -1: 1;
        const comments = await Comment.find().sort({createdAt: sortDirection}).skip(startIndex).limit(limit);
        const totalComments = await Comment.countDocuments();
        const now  = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate());
        const lastMonthComments = await Comment.countDocuments({createdAt: {$gte: oneMonthAgo}})
        res.status(200).json({comments, totalComments, lastMonthComments});
        
    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {createComment,getPostComments,likeComment,editComment,deleteComment,getComments}