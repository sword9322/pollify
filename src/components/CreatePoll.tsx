import React, { useState } from 'react';
import { PlusCircle, MinusCircle, Loader2, Copy, ArrowRight } from 'lucide-react';
import { useCreatePoll } from '../hooks/useCreatePoll';
import { useNavigate } from 'react-router-dom';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollUrl, setPollUrl] = useState('');
  const [accessUrl, setAccessUrl] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { createPoll, loading, error } = useCreatePoll();
  const navigate = useNavigate();

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
      setFormErrors({});
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setFormErrors({});
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!question.trim()) {
      errors.question = 'Please enter a question';
    }
    
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      errors.options = 'Please enter at least 2 options';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await createPoll({
        question: question.trim(),
        options: options.filter(opt => opt.trim())
      });
      
      if (result?.id) {
        setPollUrl(`${window.location.origin}/poll/${result.id}`);
      }
    }
  };

  const copyPollUrl = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      alert('Poll URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setPollUrl('');
    setFormErrors({});
  };

  const handleAccessPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessUrl.trim()) {
      const pollId = accessUrl.split('/').pop();
      if (pollId) {
        navigate(`/poll/${pollId}`);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {!pollUrl ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Poll</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setFormErrors({});
                }}
                maxLength={100}
                placeholder="What's your question?"
                className={`w-full h-12 px-4 border ${formErrors.question ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-teal-500 focus:border-teal-500`}
                disabled={loading}
              />
              {formErrors.question && (
                <p className="mt-1 text-sm text-red-500">{formErrors.question}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    maxLength={50}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 h-12 px-4 border ${formErrors.options ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-teal-500 focus:border-teal-500`}
                    disabled={loading}
                  />
                  {index >= 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={loading}
                    >
                      <MinusCircle size={24} />
                    </button>
                  )}
                </div>
              ))}
              {formErrors.options && (
                <p className="text-sm text-red-500">{formErrors.options}</p>
              )}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 flex items-center text-teal-600 hover:text-teal-800 transition-colors"
                disabled={loading}
              >
                <PlusCircle size={24} className="mr-2" />
                Add Option
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full h-12 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating Poll...
                </>
              ) : (
                'Create Poll'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Poll Created!</h2>
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={pollUrl}
              readOnly
              className="flex-1 h-12 px-4 bg-gray-50 border border-gray-300 rounded-md"
            />
            <button
              onClick={copyPollUrl}
              className="h-12 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Copy size={20} />
            </button>
          </div>
          <button
            onClick={resetForm}
            className="w-full h-12 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Create Another Poll
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Access a Poll</h2>
        <form onSubmit={handleAccessPoll} className="flex gap-2">
          <input
            type="text"
            value={accessUrl}
            onChange={(e) => setAccessUrl(e.target.value)}
            placeholder="Enter Poll URL"
            className="flex-1 h-12 px-4 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            type="submit"
            className="h-12 px-6 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}