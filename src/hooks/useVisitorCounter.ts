import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndIncrementCounter = async () => {
      try {
        setLoading(true);
        console.log('Fetching visitor count...');
        
        // Check if this is a repeat visit using sessionStorage
        const hasVisited = sessionStorage.getItem('has_visited');
        console.log('Has visited before:', hasVisited ? 'Yes' : 'No');
        
        if (!hasVisited) {
          // Only increment if it's a new session
          console.log('Incrementing visitor count...');
          const { data, error: incrementError } = await supabase.rpc('increment_visitor_count');
          
          if (incrementError) {
            console.error('Error incrementing count:', incrementError);
            throw incrementError;
          }
          
          console.log('Increment response:', data);
          if (data !== null) {
            setVisitorCount(data);
          }
          
          // Mark this session as visited
          sessionStorage.setItem('has_visited', 'true');
        } else {
          // Just fetch the current count
          console.log('Fetching current count...');
          const { data: statsData, error: fetchError } = await supabase
            .from('site_stats')
            .select('value')
            .eq('key', 'total_visitors')
            .single();
            
          if (fetchError) {
            console.error('Error fetching count:', fetchError);
            throw fetchError;
          }
          
          console.log('Fetch response:', statsData);
          if (statsData) {
            setVisitorCount(statsData.value);
          }
        }
      } catch (err) {
        console.error('Error with visitor counter:', err);
        setError('Failed to load visitor count');
        
        // Set a default count if there's an error
        setVisitorCount(2);
      } finally {
        setLoading(false);
      }
    };

    fetchAndIncrementCounter();
  }, []);

  return { visitorCount, loading, error };
} 