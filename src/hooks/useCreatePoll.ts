import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CreatePollData } from '../types';

export function useCreatePoll() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPoll({ question, options }: CreatePollData) {
    setLoading(true);
    setError(null);

    try {
      // Insert poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({ question })
        .select()
        .single();

      if (pollError) throw pollError;

      // Insert options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(
          options.map(text => ({
            poll_id: pollData.id,
            text
          }))
        );

      if (optionsError) throw optionsError;

      // Use short_id for the URL if available, otherwise fall back to uuid
      const pollId = pollData.short_id || pollData.id;
      navigate(`/poll/${pollId}`);
      return { ...pollData, displayId: pollId };
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to create poll');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createPoll, loading, error };
}