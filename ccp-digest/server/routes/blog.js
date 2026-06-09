const express = require("express");
const BlogPost = require("../models/BlogPost");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const posts = await BlogPost.find(filter)
      .populate("author", "name")
      .sort("-publishedAt");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
