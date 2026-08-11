import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Globe,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import ConfirmationModal from '@/components/shared/ConfirmationModal'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import { toastService } from '@/services/toastService'

/**
 * Settings - Admin-only page for managing platform configuration
 * Allows CRUD operations on course levels and languages
 */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('levels')
  const [loading, setLoading] = useState(true)
  
  // Course Levels State
  const [levels, setLevels] = useState([])
  const [levelDialog, setLevelDialog] = useState({ open: false, mode: 'create', data: null })
  const [levelForm, setLevelForm] = useState({ name: '', description: '' })
  const [levelDeleteModal, setLevelDeleteModal] = useState({ open: false, item: null })
  
  // Languages State
  const [languages, setLanguages] = useState([])
  const [languageDialog, setLanguageDialog] = useState({ open: false, mode: 'create', data: null })
  const [languageForm, setLanguageForm] = useState({ name: '', code: '', nativeName: '' })
  const [languageDeleteModal, setLanguageDeleteModal] = useState({ open: false, item: null })
  
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [levelsData, languagesData] = await Promise.all([
        courseLevelService.getAllLevels(),
        languageService.getAllLanguages()
      ])
      setLevels(levelsData)
      setLanguages(languagesData)
    } catch (error) {
      toastService.error('Failed to load settings')
      console.error('Failed to fetch settings data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ==================== COURSE LEVELS ====================

  const openLevelDialog = (mode, data = null) => {
    setLevelDialog({ open: true, mode, data })
    if (mode === 'edit' && data) {
      setLevelForm({ name: data.name, description: data.description || '' })
    } else {
      setLevelForm({ name: '', description: '' })
    }
  }

  const closeLevelDialog = () => {
    setLevelDialog({ open: false, mode: 'create', data: null })
    setLevelForm({ name: '', description: '' })
  }

  const handleLevelSubmit = async (e) => {
    e.preventDefault()
    
    if (!levelForm.name.trim()) {
      toastService.error('Level name is required')
      return
    }

    try {
      setProcessing(true)
      
      if (levelDialog.mode === 'create') {
        const newLevel = await courseLevelService.createLevel(levelForm)
        setLevels([...levels, newLevel])
        toastService.success('Course level created successfully')
      } else {
        const updated = await courseLevelService.updateLevel(levelDialog.data._id, levelForm)
        setLevels(levels.map(l => l._id === updated._id ? updated : l))
        toastService.success('Course level updated successfully')
      }
      
      closeLevelDialog()
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Failed to save course level')
      console.error('Failed to save level:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleLevelDelete = async () => {
    try {
      setProcessing(true)
      await courseLevelService.deleteLevel(levelDeleteModal.item._id)
      setLevels(levels.filter(l => l._id !== levelDeleteModal.item._id))
      toastService.success('Course level deleted successfully')
      setLevelDeleteModal({ open: false, item: null })
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Failed to delete course level')
      console.error('Failed to delete level:', error)
    } finally {
      setProcessing(false)
    }
  }

  // ==================== LANGUAGES ====================

  const openLanguageDialog = (mode, data = null) => {
    setLanguageDialog({ open: true, mode, data })
    if (mode === 'edit' && data) {
      setLanguageForm({ 
        name: data.name, 
        code: data.code || '', 
        nativeName: data.nativeName || '' 
      })
    } else {
      setLanguageForm({ name: '', code: '', nativeName: '' })
    }
  }

  const closeLanguageDialog = () => {
    setLanguageDialog({ open: false, mode: 'create', data: null })
    setLanguageForm({ name: '', code: '', nativeName: '' })
  }

  const handleLanguageSubmit = async (e) => {
    e.preventDefault()
    
    if (!languageForm.name.trim()) {
      toastService.error('Language name is required')
      return
    }

    try {
      setProcessing(true)
      
      if (languageDialog.mode === 'create') {
        const newLanguage = await languageService.createLanguage(languageForm)
        setLanguages([...languages, newLanguage])
        toastService.success('Language created successfully')
      } else {
        const updated = await languageService.updateLanguage(languageDialog.data._id, languageForm)
        setLanguages(languages.map(l => l._id === updated._id ? updated : l))
        toastService.success('Language updated successfully')
      }
      
      closeLanguageDialog()
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Failed to save language')
      console.error('Failed to save language:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleLanguageDelete = async () => {
    try {
      setProcessing(true)
      await languageService.deleteLanguage(languageDeleteModal.item._id)
      setLanguages(languages.filter(l => l._id !== languageDeleteModal.item._id))
      toastService.success('Language deleted successfully')
      setLanguageDeleteModal({ open: false, item: null })
    } catch (error) {
      toastService.error(error.response?.data?.message || 'Failed to delete language')
      console.error('Failed to delete language:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage course levels and languages
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Course Levels
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Languages
          </TabsTrigger>
        </TabsList>

        {/* Course Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Course Levels ({levels.length})
            </h2>
            <Button onClick={() => openLevelDialog('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Level
            </Button>
          </div>

          {levels.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No course levels defined yet.</p>
                  <p className="text-sm mt-1">Add your first level to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {levels.map((level) => (
                <Card key={level._id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{level.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLevelDialog('edit', level)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLevelDeleteModal({ open: true, item: level })}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {level.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Languages ({languages.length})
            </h2>
            <Button onClick={() => openLanguageDialog('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>

          {languages.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No languages defined yet.</p>
                  <p className="text-sm mt-1">Add your first language to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {languages.map((language) => (
                <Card key={language._id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span>{language.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLanguageDialog('edit', language)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLanguageDeleteModal({ open: true, item: language })}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {language.code && (
                      <p className="text-sm text-muted-foreground">
                        Code: <span className="font-mono">{language.code}</span>
                      </p>
                    )}
                    {language.nativeName && (
                      <p className="text-sm text-muted-foreground">
                        Native: {language.nativeName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Course Level Dialog */}
      <Dialog open={levelDialog.open} onOpenChange={closeLevelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {levelDialog.mode === 'create' ? 'Add Course Level' : 'Edit Course Level'}
            </DialogTitle>
            <DialogDescription>
              {levelDialog.mode === 'create' 
                ? 'Create a new course difficulty level' 
                : 'Update the course level details'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLevelSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="level-name">Name *</Label>
                <Input
                  id="level-name"
                  placeholder="e.g., Beginner, Intermediate, Advanced"
                  value={levelForm.name}
                  onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level-description">Description</Label>
                <Input
                  id="level-description"
                  placeholder="Optional description"
                  value={levelForm.description}
                  onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeLevelDialog}
                disabled={processing}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={languageDialog.open} onOpenChange={closeLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {languageDialog.mode === 'create' ? 'Add Language' : 'Edit Language'}
            </DialogTitle>
            <DialogDescription>
              {languageDialog.mode === 'create' 
                ? 'Create a new language option' 
                : 'Update the language details'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLanguageSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="language-name">Name *</Label>
                <Input
                  id="language-name"
                  placeholder="e.g., English, Spanish, French"
                  value={languageForm.name}
                  onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language-code">Language Code</Label>
                <Input
                  id="language-code"
                  placeholder="e.g., en, es, fr"
                  value={languageForm.code}
                  onChange={(e) => setLanguageForm({ ...languageForm, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language-native">Native Name</Label>
                <Input
                  id="language-native"
                  placeholder="e.g., English, Español, Français"
                  value={languageForm.nativeName}
                  onChange={(e) => setLanguageForm({ ...languageForm, nativeName: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeLanguageDialog}
                disabled={processing}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Level Delete Confirmation */}
      <ConfirmationModal
        isOpen={levelDeleteModal.open}
        onClose={() => setLevelDeleteModal({ open: false, item: null })}
        onConfirm={handleLevelDelete}
        title="Delete Course Level"
        message={`Are you sure you want to delete "${levelDeleteModal.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isProcessing={processing}
      />

      {/* Language Delete Confirmation */}
      <ConfirmationModal
        isOpen={languageDeleteModal.open}
        onClose={() => setLanguageDeleteModal({ open: false, item: null })}
        onConfirm={handleLanguageDelete}
        title="Delete Language"
        message={`Are you sure you want to delete "${languageDeleteModal.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isProcessing={processing}
      />
    </div>
  )
}
