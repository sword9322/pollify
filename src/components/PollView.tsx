import React, { useEffect, useState } from 'react';
import { Share2, Loader2, PlusCircle, Copy, Twitter, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePoll } from '../hooks/usePoll';

export default function PollView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { poll, loading, error, vote } = usePoll(id!);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (poll && poll.totalVotes === 0 && poll.created_at) {
      const updateTimeRemaining = () => {
        const createdDate = new Date(poll.created_at);
        const sevenDaysFromCreation = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = sevenDaysFromCreation.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Poll will be deleted soon');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [poll]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Poll link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: poll?.question || 'Poll',
        text: `Vote on this poll: ${poll?.question}`,
        url: window.location.href,
      });
    } catch {
      // Fallback to copy to clipboard if Web Share API is not available
      handleCopyLink();
    }
  };

  const handleShareToX = () => {
    const text = encodeURIComponent(`Vote on this poll: ${poll?.question}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
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
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="text-red-600">
          {error || 'Poll not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <PlusCircle size={20} />
          Create New Poll
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 p-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            title="Copy to clipboard"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 p-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            title="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleShareToX}
            className="flex items-center gap-2 p-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            title="Share on X"
          >
            <Twitter size={20} />
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{poll.question}</h1>
        
        {poll.totalVotes === 0 && timeRemaining && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <Clock size={18} className="text-amber-600" />
            <span className="text-amber-800 text-sm">{timeRemaining}</span>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 
              ? Math.round((option.votes / poll.totalVotes) * 100) 
              : 0;

            return (
              <div key={option.id} className="relative">
                <button
                  onClick={() => vote(option.id)}
                  disabled={poll.userVoted}
                  className={`w-full p-4 text-left rounded-lg transition-colors relative z-10 ${
                    poll.userVoted 
                      ? 'bg-gray-50'
                      : 'hover:bg-teal-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option.text}</span>
                    {poll.userVoted && (
                      <span className="text-gray-600 ml-2">
                        {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage}%)
                      </span>
                    )}
                  </div>
                  {poll.userVoted && (
                    <div 
                      className="absolute left-0 top-0 h-full bg-teal-100 rounded-lg opacity-30 z-0"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          <span>Total votes: <span className="font-medium">{poll.totalVotes}</span></span>
        </div>
      </div>
    </div>
  );
}