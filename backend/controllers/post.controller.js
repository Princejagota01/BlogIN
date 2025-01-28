const Post = require("../models/post.model.js");

const create = async(req,res)=>{
    try{
        if(!req.user.isAdmin){
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to create a post'
            })
        }
            if(!req.body.title || !req.body.content){
                return res.status(403).json({
                    success: false,
                    message: 'Please provide all required details'
                })
            }
            const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
    const savedPost = await newPost.save();
    res.status(200).json(savedPost)
        } 
        catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getposts = async(req,res)=>{
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });

    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deletePost = async(req,res)=>{
  try{
    if(!req.user.isAdmin || req.user.id !== req.params.userId){
      return res.status(400).json({
        success: false,
        message: 'You are not allowed to delete this post'
    })
    }
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({
      success: true,
      message: 'Post has been deleted successfully'
    })
  } catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
  })
  }
}

const updatePost = async(req,res)=>{
  try{
    if(!req.user.isAdmin || req.user.id !== req.params.userId){
      return res.status(400).json({
        success: false,
        message: 'You are not allowed to update this post'
    })
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId,{
      $set:{
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image
      }
    },{new:true})
    res.status(200).json(updatedPost)
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
  })
  }
}

module.exports = {create,getposts, deletePost,updatePost}