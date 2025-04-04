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
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
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
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="What's your question?"
              />
              {formErrors.question && (
                <p className="mt-1 text-sm text-red-600">{formErrors.question}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              {options.map((option, index) => (
                <div key={index} className="flex mb-2 items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700 rounded-lg"
                    >
                      <MinusCircle size={24} />
                    </button>
                  )}
                </div>
              ))}
              {formErrors.options && (
                <p className="mt-1 text-sm text-red-600">{formErrors.options}</p>
              )}
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 flex items-center text-teal-600 hover:text-teal-800"
                >
                  <PlusCircle size={20} className="mr-1" />
                  Add Option
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Poll'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Poll Created!</h2>
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={pollUrl}
              readOnly
              className="flex-1 p-4 bg-gray-50 border border-gray-300 rounded-lg"
            />
            <button
              onClick={copyPollUrl}
              className="p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Copy size={20} />
            </button>
          </div>
          <button
            onClick={resetForm}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Create Another Poll
          </button>
        </div>
      )}

      <div className="text-center mb-8 text-sm text-gray-600">
        <p>⚠️ Note: Polls without any votes will be automatically deleted after 7 days.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
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