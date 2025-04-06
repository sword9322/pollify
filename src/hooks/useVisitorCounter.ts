import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollCount = async () => {
      try {
        setLoading(true);
        
        // Fetch the total polls count
        const { data: statsData, error: fetchError } = await supabase
          .from('site_stats')
          .select('value')
          .eq('key', 'total_polls')
          .single();
          
        if (fetchError) {
          console.error('Error fetching poll count:', fetchError);
          throw fetchError;
        }
        
        console.log('Poll count:', statsData);
        if (statsData) {
          setVisitorCount(statsData.value);
        }
      } catch (err) {
        console.error('Error with poll counter:', err);
        setError('Failed to load poll count');
        
        // Set a default count if there's an error
        setVisitorCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPollCount();
  }, []);

  return { visitorCount, loading, error };
} 