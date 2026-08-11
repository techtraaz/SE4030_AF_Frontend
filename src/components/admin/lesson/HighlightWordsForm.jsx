import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'

/**
 * HighlightWordsForm - User-friendly form for managing highlight words
 * Replaces the JSON textarea input
 */
const HighlightWordsForm = ({ words = [], onChange }) => {
  const [currentWord, setCurrentWord] = useState({
    word: '',
    meaning: '',
    translation: '',
  })

  const handleAddWord = () => {
    if (!currentWord.word.trim() || !currentWord.meaning.trim()) {
      return
    }

    onChange([...words, { ...currentWord }])
    setCurrentWord({
      word: '',
      meaning: '',
      translation: '',
    })
  }

  const handleDeleteWord = (index) => {
    onChange(words.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentWord.word && currentWord.meaning) {
      e.preventDefault()
      handleAddWord()
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Word Form */}
      <Card className="bg-brand-gray/5">
        <CardContent className="p-4 space-y-3">
          <h4 className="font-semibold text-sm">Add Highlight Word (Optional)</h4>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hw-word" className="text-sm">
                Word
              </Label>
              <Input
                id="hw-word"
                value={currentWord.word}
                onChange={(e) => setCurrentWord({ ...currentWord, word: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., hello"
              />
            </div>

            <div>
              <Label htmlFor="hw-meaning" className="text-sm">
                Meaning
              </Label>
              <Input
                id="hw-meaning"
                value={currentWord.meaning}
                onChange={(e) => setCurrentWord({ ...currentWord, meaning: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., greeting"
              />
            </div>

            <div>
              <Label htmlFor="hw-translation" className="text-sm">
                Translation
              </Label>
              <Input
                id="hw-translation"
                value={currentWord.translation}
                onChange={(e) => setCurrentWord({ ...currentWord, translation: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., नमस्ते"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddWord}
            disabled={!currentWord.word.trim() || !currentWord.meaning.trim()}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Highlight Word
          </Button>
        </CardContent>
      </Card>

      {/* Words List */}
      {words.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Highlight Words ({words.length})</h4>
          <div className="grid grid-cols-1 gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-brand-blue/5 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <span className="font-semibold text-brand-navy">{word.word}</span>
                  <span className="text-brand-gray mx-2">→</span>
                  <span className="text-brand-gray">{word.meaning}</span>
                  {word.translation && (
                    <>
                      <span className="text-brand-gray mx-2">→</span>
                      <span className="text-brand-gray italic">{word.translation}</span>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteWord(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HighlightWordsForm
