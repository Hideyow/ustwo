import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // adjust if your client lives elsewhere
import type { Mood } from '@/types/schemas';

export interface IdeaItem {
    id: string;
    title: string;
    category: Mood;
    completed: boolean;
    proposedBy: string;
    notes?: string;
}

interface IdeaRow {
    id: string;
    title: string;
    category: Mood;
    completed: boolean;
    proposed_by: string;
    notes: string | null;
}

const toItem = (r: IdeaRow): IdeaItem => ({
    id: r.id,
    title: r.title,
    category: r.category,
    completed: r.completed,
    proposedBy: r.proposed_by,
    notes: r.notes ?? '',
});

export function useIdeas() {
    const [ideas, setIdeas] = useState<IdeaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIdeas = useCallback(async () => {
        const { data, error: err } = await supabase
            .from('ideas')
            .select('*')
            .order('created_at', { ascending: false });

        if (err) {
            setError(err.message);
        } else {
            setIdeas((data as IdeaRow[]).map(toItem));
            setError(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchIdeas();

        // Realtime: any insert/update/delete by either partner refreshes the list
        const channel = supabase
            .channel('ideas-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
                fetchIdeas();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchIdeas]);

    const addIdea = useCallback(
        async (idea: Omit<IdeaItem, 'id' | 'completed'>) => {
            const { error: err } = await supabase.from('ideas').insert({
                title: idea.title,
                category: idea.category,
                proposed_by: idea.proposedBy,
                notes: idea.notes ?? '',
            });
            if (err) throw err;
            await fetchIdeas();
        },
        [fetchIdeas],
    );

    const toggleComplete = useCallback(
        async (id: string, completed: boolean) => {
            const { error: err } = await supabase.from('ideas').update({ completed }).eq('id', id);
            if (err) throw err;
            await fetchIdeas();
        },
        [fetchIdeas],
    );

    const deleteIdea = useCallback(
        async (id: string) => {
            const { error: err } = await supabase.from('ideas').delete().eq('id', id);
            if (err) throw err;
            await fetchIdeas();
        },
        [fetchIdeas],
    );

    return { ideas, loading, error, addIdea, toggleComplete, deleteIdea };
}