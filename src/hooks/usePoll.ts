import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Poll, Option } from '../types';

interface PollOption {
  id: string;
  text: string;
  poll_id: string;
}

export function usePoll(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPoll();
    subscribeToVotes();

    return () => {
      supabase.channel('poll_votes').unsubscribe();
    };
  }, [pollId]);

  async function fetchPoll() {
    try {
      // Try to fetch by short_id first (if it looks like a short ID - not a UUID)
      const isShortId = pollId.length < 36;
      
      let query = supabase
        .from('polls')
        .select('*, poll_options(*)');
      
      if (isShortId) {
        query = query.eq('short_id', pollId);
      } else {
        query = query.eq('id', pollId);
      }
      
      const { data: pollData, error: pollError } = await query.single();

      if (pollError) throw pollError;

      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('option_id, ip_address')
        .eq('poll_id', pollData.id);

      if (votesError) throw votesError;

      // Get client IP
      let userIp;
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Failed to fetch IP address');
        const ipData = await response.json();
        userIp = ipData.ip;
      } catch (ipError) {
        console.error('Error fetching IP:', ipError);
        userIp = 'unknown';
      }

      // Calculate votes for each option
      const optionsWithVotes: Option[] = pollData.poll_options.map((option: PollOption) => ({
        id: option.id,
        text: option.text,
        votes: votesData.filter(vote => vote.option_id === option.id).length
      }));

      const totalVotes = votesData.length;
      const userVoted = votesData.some(vote => vote.ip_address === userIp);

      setPoll({
        id: pollData.id,
        short_id: pollData.short_id,
        question: pollData.question,
        options: optionsWithVotes,
        totalVotes,
        created_at: pollData.created_at,
        userVoted
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch poll');
      setLoading(false);
    }
  }

  function subscribeToVotes() {
    // Subscribe using the real UUID poll ID if we have it
    const subscriptionId = poll?.id || pollId;
    
    supabase
      .channel('poll_votes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${subscriptionId}`
        },
        () => {
          fetchPoll();
        }
      )
      .subscribe();
  }

  async function vote(optionId: string) {
    if (!poll) return;
    
    try {
      // Get client IP
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) throw new Error('Failed to fetch IP address');
      const ipData = await response.json();

      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: poll.id, // Use the UUID, not the short_id
          option_id: optionId,
          ip_address: ipData.ip
        });

      if (voteError) throw voteError;

      await fetchPoll();
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  }

  return { poll, loading, error, vote };
}