import asyncHandler from '../middleware/asyncHandler.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

/**
 * @desc    Fetch all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400);
    return next(new Error('Please provide category name and description'));
  }

  const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

  if (categoryExists) {
    res.status(400);
    return next(new Error('Category already exists'));
  }

  const category = new Category({
    name,
    description,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const category = await Category.findById(req.params.id);

  if (category) {
    if (name) {
      // Check if duplicate name exists elsewhere
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });
      if (duplicate) {
        res.status(400);
        return next(new Error('Another category already has this name'));
      }

      // If category name changes, we should also update any products associated with the old category name string
      const oldName = category.name;
      category.name = name;
      await Product.updateMany({ category: oldName }, { category: name });
    }

    category.description = description ?? category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    return next(new Error('Category not found'));
  }
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Optional check: are there products in this category? Let's check.
    // If there are products, we can block deletion or allow it but warn, let's allow it but warn, or just allow it.
    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(404);
    return next(new Error('Category not found'));
  }
});

export {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
