import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * VocabularyWordsForm - User-friendly form for managing vocabulary words
 * Replaces the JSON textarea input
 */
const VocabularyWordsForm = ({ words = [], onChange }) => {
  const [currentWord, setCurrentWord] = useState({
    word: '',
    meaning: '',
    exampleSentence: '',
    audioUrl: '',
    imageUrl: '',
  })

  const handleAddWord = () => {
    if (!currentWord.word.trim() || !currentWord.meaning.trim()) {
      return
    }

    onChange([...words, { ...currentWord }])
    setCurrentWord({
      word: '',
      meaning: '',
      exampleSentence: '',
      audioUrl: '',
      imageUrl: '',
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
          <h4 className="font-semibold text-sm">Add Vocabulary Word</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="word" className="text-sm">
                Word <span className="text-red-500">*</span>
              </Label>
              <Input
                id="word"
                value={currentWord.word}
                onChange={(e) => setCurrentWord({ ...currentWord, word: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Hello"
              />
            </div>

            <div>
              <Label htmlFor="meaning" className="text-sm">
                Meaning <span className="text-red-500">*</span>
              </Label>
              <Input
                id="meaning"
                value={currentWord.meaning}
                onChange={(e) => setCurrentWord({ ...currentWord, meaning: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="e.g., A greeting"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="exampleSentence" className="text-sm">
              Example Sentence (Optional)
            </Label>
            <Input
              id="exampleSentence"
              value={currentWord.exampleSentence}
              onChange={(e) => setCurrentWord({ ...currentWord, exampleSentence: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Hello, how are you?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="audioUrl" className="text-sm">
                Audio URL (Optional)
              </Label>
              <Input
                id="audioUrl"
                value={currentWord.audioUrl}
                onChange={(e) => setCurrentWord({ ...currentWord, audioUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-sm">
                Image URL (Optional)
              </Label>
              <Input
                id="imageUrl"
                value={currentWord.imageUrl}
                onChange={(e) => setCurrentWord({ ...currentWord, imageUrl: e.target.value })}
                placeholder="https://..."
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
            Add Word
          </Button>
        </CardContent>
      </Card>

      {/* Words List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          Vocabulary Words ({words.length})
          {words.length === 0 && <span className="text-red-500">*</span>}
        </h4>
        
        {words.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg bg-brand-gray/5">
            <p className="text-brand-gray text-sm">No words added yet. Add at least one word to continue.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {words.map((word, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-5 w-5 text-brand-gray mt-1 flex-shrink-0" />
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-brand-navy">{word.word}</p>
                          <p className="text-sm text-brand-gray">{word.meaning}</p>
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
                      
                      {word.exampleSentence && (
                        <p className="text-sm italic text-brand-gray">
                          💬 "{word.exampleSentence}"
                        </p>
                      )}
                      
                      <div className="flex gap-3 text-xs text-brand-gray">
                        {word.audioUrl && (
                          <span className="flex items-center gap-1">
                            🔊 Audio available
                          </span>
                        )}
                        {word.imageUrl && (
                          <span className="flex items-center gap-1">
                            🖼️ Image available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VocabularyWordsForm
