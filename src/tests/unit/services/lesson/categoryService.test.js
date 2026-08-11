import categoryService from '@/services/lesson/categoryService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import api from '@/services/axios'

describe('Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllCategories', () => {
    it('should fetch all categories successfully', async () => {
      const mockCategories = [
        { _id: '1', name: 'Grammar' },
        { _id: '2', name: 'Vocabulary' }
      ]
      api.get.mockResolvedValue({ data: { content: mockCategories } })

      const result = await categoryService.getAllCategories()

      expect(api.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual(mockCategories)
    })
  })

  describe('getCategoryById', () => {
    it('should fetch single category successfully', async () => {
      const mockCategory = { _id: '1', name: 'Grammar' }
      api.get.mockResolvedValue({ data: { content: mockCategory } })

      const result = await categoryService.getCategoryById('1')

      expect(api.get).toHaveBeenCalledWith('/categories/1')
      expect(result).toEqual(mockCategory)
    })
  })

  describe('createCategory', () => {
    it('should create new category successfully', async () => {
      const mockCategory = { _id: '1', name: 'Grammar' }
      const categoryData = { name: 'Grammar', description: 'Grammar lessons' }
      api.post.mockResolvedValue({ data: { content: mockCategory } })

      const result = await categoryService.createCategory(categoryData)

      expect(api.post).toHaveBeenCalledWith('/categories', categoryData)
      expect(result).toEqual(mockCategory)
    })
  })

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const mockCategory = { _id: '1', name: 'Updated Grammar' }
      const categoryData = { name: 'Updated Grammar' }
      api.put.mockResolvedValue({ data: { content: mockCategory } })

      const result = await categoryService.updateCategory('1', categoryData)

      expect(api.put).toHaveBeenCalledWith('/categories/1', categoryData)
      expect(result).toEqual(mockCategory)
    })
  })

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const mockResponse = { success: true }
      api.delete.mockResolvedValue({ data: mockResponse })

      const result = await categoryService.deleteCategory('1')

      expect(api.delete).toHaveBeenCalledWith('/categories/1')
      expect(result).toEqual(mockResponse)
    })
  })
})
