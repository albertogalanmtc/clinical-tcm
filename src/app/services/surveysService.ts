import { supabase } from '../lib/supabase';

export interface SurveyQuestion {
  question: string;
  options: string[];
  allowFreeText?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  status: 'active' | 'inactive' | 'draft';
  start_date?: string;
  end_date?: string;
  show_results: boolean;
  thank_you_message?: string;
  thank_you_emoji?: string;
  show_thank_you_emoji?: boolean;
  display_order?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  answers: string[];
  created_at: string;
}

export const surveysService = {
  async getActiveSurveys(): Promise<Survey[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active surveys:', error);
      return [];
    }

    // Filter by date in JavaScript for now
    const filtered = (data || []).filter(survey => {
      const startValid = !survey.start_date || new Date(survey.start_date) <= new Date(now);
      const endValid = !survey.end_date || new Date(survey.end_date) >= new Date(now);
      return startValid && endValid;
    });

    return filtered;
  },

  async getAllSurveys(): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all surveys:', error);
      return [];
    }

    return data || [];
  },

  async updateSurveyOrder(surveyId: string, newOrder: number): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .update({ display_order: newOrder })
      .eq('id', surveyId);

    if (error) {
      console.error('Error updating survey order:', error);
      return false;
    }

    return true;
  },

  async getSurveyById(id: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching survey:', error);
      return null;
    }

    return data;
  },

  async createSurvey(survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Promise<Survey | null> {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('surveys')
      .insert([{
        ...survey,
        created_by: session?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating survey:', error);
      return null;
    }

    return data;
  },

  async updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey:', error);
      return null;
    }

    return data;
  },

  async deleteSurvey(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting survey:', error);
      return false;
    }

    return true;
  },

  // Survey responses
  async hasUserResponded(surveyId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  },

  async submitResponse(surveyId: string, userId: string, answers: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('survey_responses')
      .insert([{
        survey_id: surveyId,
        user_id: userId,
        answers
      }]);

    if (error) {
      console.error('Error submitting survey response:', error);
      return false;
    }

    return true;
  },

  async getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching survey responses:', error);
      return [];
    }

    return data || [];
  },

  async getSurveyStats(surveyId: string): Promise<{
    totalResponses: number;
    questionStats: { question: string; answers: Record<string, number> }[];
  } | null> {
    const survey = await this.getSurveyById(surveyId);
    if (!survey) return null;

    const responses = await this.getSurveyResponses(surveyId);

    const questionStats = survey.questions.map((q, qIndex) => {
      const answerCounts: Record<string, number> = {};

      responses.forEach(response => {
        const answer = response.answers[qIndex];
        if (answer) {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      return {
        question: q.question,
        answers: answerCounts
      };
    });

    return {
      totalResponses: responses.length,
      questionStats
    };
  }
};
