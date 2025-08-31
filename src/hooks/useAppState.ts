import { useState, useCallback } from 'react';
import { MBTIResult, AppState } from '../types';

const initialState: AppState = {
  currentStep: 'input',
  githubUsername: '',
  analysisResult: null,
  error: null,
  loading: false
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  const setCurrentStep = useCallback((step: AppState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setGithubUsername = useCallback((username: string) => {
    setState(prev => ({ ...prev, githubUsername: username }));
  }, []);

  const setAnalysisResult = useCallback((result: MBTIResult | null) => {
    setState(prev => ({ ...prev, analysisResult: result }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const startAnalysis = useCallback((username: string) => {
    setState(prev => ({
      ...prev,
      githubUsername: username,
      currentStep: 'analyzing',
      loading: true,
      error: null,
      analysisResult: null
    }));
  }, []);

  const completeAnalysis = useCallback((result: MBTIResult) => {
    setState(prev => ({
      ...prev,
      currentStep: 'result',
      loading: false,
      analysisResult: result,
      error: null
    }));
  }, []);

  const failAnalysis = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      currentStep: 'input',
      loading: false,
      error,
      analysisResult: null
    }));
  }, []);

  return {
    state,
    actions: {
      setCurrentStep,
      setGithubUsername,
      setAnalysisResult,
      setError,
      setLoading,
      resetState,
      startAnalysis,
      completeAnalysis,
      failAnalysis
    }
  };
}