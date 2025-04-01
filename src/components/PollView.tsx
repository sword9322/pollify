import React from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { usePoll } from '../hooks/usePoll';

export default function PollView() {
  const { id } = useParams<{ id: string }>();
  const { poll, loading, error, vote } = usePoll(id!);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: poll?.question || 'Poll',
        text: `Vote on this poll: ${poll?.question}`,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      alert('Poll link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto flex items-center justify-center p-12">
        <Loader2 size={40} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          {error || 'Poll not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{poll.question}</h1>
      
      <div className="space-y-4">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;

          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => vote(option.id)}
                disabled={poll.userVoted}
                className={`w-full p-4 text-left rounded-md transition-colors relative z-10 ${
                  poll.userVoted 
                    ? 'bg-gray-100 cursor-default'
                    : 'hover:bg-teal-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{option.text}</span>
                  {poll.userVoted && (
                    <span className="text-gray-600">
                      {option.votes} votes ({percentage}%)
                    </span>
                  )}
                </div>
                {poll.userVoted && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-teal-100 rounded-md opacity-20 z-0"
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <span>Total votes: {poll.totalVotes}</span>
        <button
          onClick={handleShare}
          className="flex items-center text-teal-600 hover:text-teal-800"
        >
          <Share2 size={20} className="mr-2" />
          Share Poll
        </button>
      </div>
    </div>
  );
}