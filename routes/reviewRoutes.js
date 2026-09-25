const express = require('express');
const reviewController = require('../controlers/reviewController');
const authController = require('../controlers/authController');

const router = express.Router({ mergeParams: true }); // mergeParams is used to access the params from the parent router

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

// router
//   .route('/:id')
//   .get(reviewController.getReview)
//   .patch(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.updateReview,
//   )
//   .delete(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.deleteReview,
//   );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user'),
    reviewController.deleteReview,
  );

module.exports = router;
