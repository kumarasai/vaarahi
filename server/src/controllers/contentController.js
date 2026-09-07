const Content = require('../models/Content');

// @desc    Get homepage dynamic content
// @route   GET /api/content/:key
// @access  Public
exports.getContent = async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    res.json({ success: true, content: content ? content.value : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update homepage dynamic content
// @route   POST /api/content/:key
// @access  Private (Admin/Sub-Admin only)
exports.updateContent = async (req, res) => {
  try {
    const { value } = req.body;
    let content = await Content.findOne({ key: req.params.key });

    if (content) {
      content.value = value;
      await content.save();
    } else {
      content = await Content.create({
        key: req.params.key,
        value
      });
    }

    res.json({ success: true, content: content.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
