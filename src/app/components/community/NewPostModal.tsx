import { useState } from 'react';
import { X, Plus, HelpCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { createCommunityPost, getCategoryInfo, type PostCategory } from '@/app/data/communityPosts';
import { TextEditor } from './TextEditor';
import { toast } from 'sonner';
import { useUser } from '@/app/contexts/UserContext';
import { supabase } from '@/app/lib/supabase';

const TEMPLATE = `**Context:** [age/gender, current medication, duration]

**Main Symptoms:**
-

**TCM Diagnosis:**


**Treatment Applied:**


**Evolution/Result:**


**Question/Doubt:**
`;

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const userContext = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category] = useState<PostCategory>('discussion'); // Fixed category
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  const handleUseTemplate = () => {
    setContent(TEMPLATE);
    setShowTemplate(false);
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please complete the title and content');
      return;
    }

    console.log('📤 Submitting new post...');

    // Get user from UserContext or directly from Supabase session
    let userForPost = userContext.userId ? {
      id: userContext.userId,
      name: userContext.name,
      isAdmin: userContext.isAdmin
    } : undefined;

    // If userContext.userId is null, try to get it from Supabase session directly
    if (!userForPost) {
      console.log('⚠️ UserContext.userId is null, checking Supabase session...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('✅ Found Supabase session:', session.user.id);

        // Get user name from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          userForPost = {
            id: session.user.id,
            name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
            isAdmin: userProfile.role === 'admin'
          };
          console.log('✅ Got user from Supabase:', userForPost);
        }
      }
    }

    console.log('👤 User for post:', userForPost);

    createCommunityPost({
      title: title.trim(),
      content: content.trim(),
      category,
      symptoms: symptoms.length > 0 ? symptoms : undefined
    }, userForPost);

    toast.success('Post published successfully!');

    // Reset form
    setTitle('');
    setContent('');
    setSymptoms([]);
    setSymptomInput('');
    setShowTemplate(false);

    onClose();
  };

  const handleClose = () => {
    if (title || content) {
      if (confirm('Discard changes?')) {
        setTitle('');
        setContent('');
        setSymptoms([]);
        setSymptomInput('');
        setShowTemplate(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Create new post
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-2xl font-semibold text-gray-900">
              New Post
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g.: Menstrual pain + abdominal distension"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Post Description <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTemplate(!showTemplate)}
                    className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Use template
                  </button>
                </div>

                {showTemplate && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 mb-2">
                      Do you want to use a suggested template? You can modify it or write freely.
                    </p>
                    <button
                      type="button"
                      onClick={handleUseTemplate}
                      className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Insert template
                    </button>
                  </div>
                )}

                <TextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Describe your post: patient context, symptoms, TCM diagnosis, treatment applied, evolution, questions or doubts..."
                  minHeight="300px"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use the formatting buttons above for **bold**, *italic*, and <u>underline</u>
                </p>
              </div>

              {/* Symptoms (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Symptoms (optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Add tags to facilitate search and filtering
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSymptom();
                      }
                    }}
                    placeholder="E.g.: Menstrual pain"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSymptom}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200"
                      >
                        <span className="text-sm">{symptom}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSymptom(symptom)}
                          className="hover:bg-teal-100 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> When publishing your post, other professionals will be able to read and respond with their
                  suggestions. Make sure not to include information that could identify your patient.
                </p>
              </div>
            </div>
          </form>

          {/* Footer with Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Publish Post
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
