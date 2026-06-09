const express = require("express");
const PracticeArea = require("../models/PracticeArea");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const areas = await PracticeArea.find({ isActive: true }).sort("order");
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const area = await PracticeArea.findOne({ slug: req.params.slug, isActive: true });
    if (!area) return res.status(404).json({ message: "Practice area not found" });
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const area = await PracticeArea.create(req.body);
    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const area = await PracticeArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return res.status(404).json({ message: "Practice area not found" });
    res.json(area);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const area = await PracticeArea.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ message: "Practice area not found" });
    res.json({ message: "Practice area deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
