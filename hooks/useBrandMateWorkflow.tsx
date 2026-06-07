"use client";

import type { GeneratePostValues } from "@/components/forms/GeneratePostForm";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import {
  generatePost,
  saveBrandProfile,
  storeLesson,
  submitHumanFeedback,
  updatePostTitle,
} from "@/lib/brandmate/actions";
import { summarizePostTitle } from "@/lib/sessions/summarize-title";
import type {
  BrandProfile,
  HumanFeedbackType,
  PostAttempt,
} from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ViewMode = "home" | "studio";
export type WorkflowPhase =
  | "idle"
  | "generating"
  | "awaiting_feedback"
  | "feedback_done"
  | "preview_ready";

export interface SavedPostView {
  attempt: PostAttempt;
  weaveTraceId?: string;
}

interface BrandMateWorkflowValue {
  viewMode: ViewMode;
  phase: WorkflowPhase;
  lastAttempt: PostAttempt | null;
  weaveTraceId: string | undefined;
  pendingLesson: {
    lesson: string;
    scoreBefore: number;
    topic: string;
    humanFeedback: HumanFeedbackType;
  } | null;
  lessonStored: boolean;
  selectedPost: SavedPostView | null;
  error: string | null;
  setViewMode: (mode: ViewMode) => void;
  setSelectedPost: (post: SavedPostView | null) => void;
  startNewPost: () => Promise<void>;
  openPostInHome: (post: SavedPostView) => void;
  createProfile: (profile: BrandProfile) => Promise<void>;
  runGenerate: (values: GeneratePostValues) => Promise<void>;
  submitFeedback: (feedback: HumanFeedbackType) => Promise<void>;
  approveStoreLesson: () => Promise<void>;
  skipStoreLesson: () => void;
  openPreview: () => void;
  clearError: () => void;
}

const BrandMateWorkflowContext =
  createContext<BrandMateWorkflowValue | null>(null);

interface WorkflowProviderProps {
  children: ReactNode;
  brandProfile: BrandProfile;
  setBrandProfile: React.Dispatch<React.SetStateAction<BrandProfile>>;
  onSessionsReload: () => Promise<void>;
  onCreateSession: () => Promise<string | null>;
}

export function BrandMateWorkflowProvider({
  children,
  brandProfile,
  setBrandProfile,
  onSessionsReload,
  onCreateSession,
}: WorkflowProviderProps) {
  const {
    persistAttempt,
    activeSessionId,
    sessionsEnabled,
    setThreads,
    setActiveSessionId,
    threads,
  } = useChatSessionContext();

  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [phase, setPhase] = useState<WorkflowPhase>("idle");
  const [lastAttempt, setLastAttempt] = useState<PostAttempt | null>(null);
  const [weaveTraceId, setWeaveTraceId] = useState<string | undefined>();
  const [pendingLesson, setPendingLesson] = useState<{
    lesson: string;
    scoreBefore: number;
    topic: string;
    humanFeedback: HumanFeedbackType;
  } | null>(null);
  const [lessonStored, setLessonStored] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SavedPostView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attemptCounterRef = useRef(1);

  const startNewPost = useCallback(async () => {
    setError(null);
    setPhase("idle");
    setLastAttempt(null);
    setWeaveTraceId(undefined);
    setPendingLesson(null);
    setLessonStored(false);
    setSelectedPost(null);
    setViewMode("studio");

    const sessionId = await onCreateSession();
    if (sessionId) setActiveSessionId(sessionId);
  }, [onCreateSession, setActiveSessionId]);

  const openPostInHome = useCallback((post: SavedPostView) => {
    setSelectedPost(post);
    setViewMode("home");
    setPhase("idle");
  }, []);

  const createProfile = useCallback(
    async (profile: BrandProfile) => {
      setBrandProfile(profile);
      let sessionId = activeSessionId;
      if (!sessionId && sessionsEnabled) {
        sessionId = await onCreateSession();
      }
      await saveBrandProfile(profile, sessionId, sessionsEnabled);
    },
    [
      activeSessionId,
      onCreateSession,
      sessionsEnabled,
      setBrandProfile,
    ]
  );

  const runGenerate = useCallback(
    async (values: GeneratePostValues) => {
      if (!brandProfile.name || !brandProfile.niche) {
        throw new Error("Create your profile first.");
      }
      setError(null);
      setPhase("generating");
      setPendingLesson(null);
      setLessonStored(false);

      try {
        const data = await generatePost({
          topic: values.topic,
          brandProfile,
          attemptNumber: attemptCounterRef.current,
          format: values.format,
          includeImage: values.includeImage,
          slideCount: values.slideCount,
          branding: values.branding,
        });

        setLastAttempt(data.attempt);
        setWeaveTraceId(data.weaveTraceId);
        await persistAttempt({
          attempt: data.attempt,
          weaveTraceId: data.weaveTraceId,
        });

        if (activeSessionId && sessionsEnabled) {
          const title = summarizePostTitle(values.topic);
          await updatePostTitle(activeSessionId, title);
          setThreads(
            threads.map((t) =>
              t.id === activeSessionId ? { ...t, title } : t
            )
          );
        }

        setPhase("awaiting_feedback");
        await onSessionsReload();
      } catch (err) {
        setPhase("idle");
        const msg = err instanceof Error ? err.message : "Generation failed";
        setError(msg);
        throw err;
      }
    },
    [
      activeSessionId,
      brandProfile,
      onSessionsReload,
      persistAttempt,
      sessionsEnabled,
      setThreads,
      threads,
    ]
  );

  const submitFeedback = useCallback(
    async (feedback: HumanFeedbackType) => {
      if (!lastAttempt) return;
      setError(null);
      setPhase("generating");
      try {
        const lesson = await submitHumanFeedback(
          lastAttempt,
          feedback,
          lastAttempt.topic
        );
        setPendingLesson(lesson);
        setPhase("feedback_done");
      } catch (err) {
        setPhase("awaiting_feedback");
        setError(err instanceof Error ? err.message : "Feedback failed");
      }
    },
    [lastAttempt]
  );

  const approveStoreLesson = useCallback(async () => {
    if (!pendingLesson) return;
    setError(null);
    try {
      await storeLesson(
        brandProfile,
        pendingLesson.topic,
        pendingLesson.lesson,
        pendingLesson.scoreBefore,
        pendingLesson.humanFeedback
      );
      setLessonStored(true);
      setPhase("preview_ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to store lesson");
    }
  }, [brandProfile, pendingLesson]);

  const skipStoreLesson = useCallback(() => {
    setPhase("preview_ready");
  }, []);

  const openPreview = useCallback(() => {
    if (!lastAttempt) return;
    const post: SavedPostView = {
      attempt: lastAttempt,
      weaveTraceId,
    };
    setSelectedPost(post);
    setViewMode("home");
    setPhase("idle");
  }, [lastAttempt, weaveTraceId]);

  const value = useMemo(
    () => ({
      viewMode,
      phase,
      lastAttempt,
      weaveTraceId,
      pendingLesson,
      lessonStored,
      selectedPost,
      error,
      setViewMode,
      setSelectedPost,
      startNewPost,
      openPostInHome,
      createProfile,
      runGenerate,
      submitFeedback,
      approveStoreLesson,
      skipStoreLesson,
      openPreview,
      clearError: () => setError(null),
    }),
    [
      viewMode,
      phase,
      lastAttempt,
      weaveTraceId,
      pendingLesson,
      lessonStored,
      selectedPost,
      error,
      startNewPost,
      openPostInHome,
      createProfile,
      runGenerate,
      submitFeedback,
      approveStoreLesson,
      skipStoreLesson,
      openPreview,
    ]
  );

  return (
    <BrandMateWorkflowContext.Provider value={value}>
      {children}
    </BrandMateWorkflowContext.Provider>
  );
}

export function useBrandMateWorkflow(): BrandMateWorkflowValue {
  const ctx = useContext(BrandMateWorkflowContext);
  if (!ctx) {
    throw new Error(
      "useBrandMateWorkflow requires BrandMateWorkflowProvider"
    );
  }
  return ctx;
}
