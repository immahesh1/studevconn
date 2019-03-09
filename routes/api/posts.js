const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');

//Profile model
const Profile = require('../../models/Profile');

//Validator
const validatePostInput = require('../../validation/post');

//@route    GET api/posts/test
//@desc     Test posts route
//@access   Public
router.get('/test', (req, res) => res.json({ msg: 'Hello!, from Posts' }));

//@route    GET api/posts/
//@desc     Get all post
//@access   Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ noPostFound: 'No post found with that id' })
    );
});

//@route    GET api/posts/:id
//@desc     Get all post by id
//@access   Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'No post found with that id' })
    );
});

//@route    POST api/posts/
//@desc     Create post
//@access   Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //validation
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

//@route    DELETE api/posts/:id
//@desc     Delete post
//@access   Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          //DELETE
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res
            .status(404)
            .json({ postnotfound: 'No post found for this profile' })
        );
    });
  }
);

//@route    POST api/posts/like:id
//@desc     Like post
//@access   Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check if user has already liked the post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post' });
          }

          //add user id into like array
          post.likes.unshift({ user: req.user.id });
          //save post to database
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

//@route    POST api/posts/unlike:id
//@desc     unlike post
//@access   Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check if user has already liked the post
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'You have not yet liked this post' });
          }

          //Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //splice out of array
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

//@route    POST api/posts/comment/:id
//@desc     Add comment to the post
//@access   Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //validation
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        //add comment to array
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'Post not found' }));
  }
);

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Remove comment from post
//@access   Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exists' });
        }

        //Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice out of the array
        post.comments.splice(removeIndex, 1);

        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(400).json({ postnotfound: 'Post not found' }));
  }
);
module.exports = router;
