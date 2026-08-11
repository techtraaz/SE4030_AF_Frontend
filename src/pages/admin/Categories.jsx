import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toastService } from '@/services/toastService'
import categoryService from '@/services/lesson/categoryService'
import useAuth from '@/hooks/useAuth'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  icon: z.string().optional(),
})

/**
 * Categories Page - Manage lesson categories
 * Accessible by both Admins and Content Contributors
 */
const Categories = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
    }
  })

  // Validate user role on mount (Admin only)
  useEffect(() => {
    if (!user) {
      toastService.error('Please log in to access this page')
      navigate('/')
      return
    }
    
    if (user.role !== 'ADMIN') {
      toastService.error('This page is only accessible to administrators')
      navigate('/admin/dashboard')
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (error) {
      toastService.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    reset({ name: '', slug: '', description: '', icon: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    reset()
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, data)
        toastService.success('Category updated successfully')
      } else {
        await categoryService.createCategory(data)
        toastService.success('Category created successfully')
      }
      
      await fetchCategories()
      closeModal()
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This may affect existing lessons.')) {
      return
    }

    try {
      await categoryService.deleteCategory(categoryId)
      toastService.success('Category deleted successfully')
      await fetchCategories()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    register('slug').onChange({ target: { value: slug } })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Lesson Categories</h1>
          <p className="text-brand-gray mt-1">
            Manage categories for organizing lessons
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center mb-4">
              No categories yet. Create your first category to organize lessons.
            </p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-brand-navy">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </CardTitle>
                    <p className="text-xs text-brand-gray mt-1">
                      Slug: {category.slug}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => openEditModal(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(category._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-brand-gray line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input 
                id="name" 
                {...register('name')} 
                onChange={(e) => {
                  register('name').onChange(e)
                  if (!editingCategory) handleNameChange(e)
                }}
                placeholder="e.g., Grammar, Vocabulary"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug * (URL-friendly)</Label>
              <Input 
                id="slug" 
                {...register('slug')} 
                placeholder="e.g., grammar-basics"
                disabled={!!editingCategory}
              />
              {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
              <p className="text-xs text-brand-gray mt-1">Auto-generated from name. Use lowercase and hyphens only.</p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this category"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon (Emoji or Unicode)</Label>
              <Input 
                id="icon" 
                {...register('icon')} 
                placeholder="📚"
                maxLength={4}
              />
              <p className="text-xs text-brand-gray mt-1">Optional: Add an emoji or icon</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Categories
