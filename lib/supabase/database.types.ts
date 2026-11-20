export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRow = {
  id: string;
  full_name: string;
  username: string | null;
  college: string | null;
  education: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  availability: string | null;
  avatar_url: string | null;
  created_at: string;
  role: "student" | "company" | "admin";
};

export type CompanyRow = { id: string; owner_id: string | null; name: string; logo_url: string | null; description: string; industry: string; tech: string[]; website: string | null; location: string | null; created_at: string };
export type TaskRow = { id: string; company_id: string; title: string; description: string; domain: string; role: string; skills: string[]; difficulty: "Beginner" | "Intermediate" | "Advanced"; est_hours: number; deadline: string | null; deliverables: string; evaluation_criteria: string; created_at: string };
export type SubmissionRow = { id: string; task_id: string; user_id: string; content: string; link_url: string | null; status: "submitted" | "reviewed"; feedback: string | null; score: number | null; created_at: string };

export type IdeaStage = "idea" | "planning" | "building" | "testing" | "launched";

export type IdeaRow = {
  id: string;
  owner_id: string;
  title: string;
  problem: string;
  solution: string;
  target_users: string;
  domain: string;
  skills_needed: string[];
  team_size: number;
  stage: IdeaStage;
  created_at: string;
  updated_at: string;
};

export type TeamRow = {
  id: string;
  name: string;
  description: string;
  idea_id: string | null;
  owner_id: string;
  open_roles: Json;
  size_limit: number;
  created_at: string;
  updated_at: string;
};

export type JoinRequestStatus = "pending" | "accepted" | "rejected";

export type TeamMemberRow = {
  team_id: string;
  user_id: string;
  role: "owner" | "member";
  created_at: string;
};

export type JoinRequestRow = {
  id: string;
  team_id: string;
  user_id: string;
  message: string;
  status: JoinRequestStatus;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name?: string;
          username?: string | null;
          college?: string | null;
          education?: string | null;
          bio?: string | null;
          skills?: string[];
          interests?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          availability?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          username?: string | null;
          college?: string | null;
          education?: string | null;
          bio?: string | null;
          skills?: string[];
          interests?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          availability?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: IdeaRow;
        Insert: {
          id?: string;
          owner_id?: string;
          title: string;
          problem: string;
          solution: string;
          target_users: string;
          domain: string;
          skills_needed?: string[];
          team_size?: number;
          stage?: IdeaStage;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          problem?: string;
          solution?: string;
          target_users?: string;
          domain?: string;
          skills_needed?: string[];
          team_size?: number;
          stage?: IdeaStage;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: TeamRow;
        Insert: {
          id?: string;
          name: string;
          description: string;
          idea_id?: string | null;
          owner_id?: string;
          open_roles?: Json;
          size_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          idea_id?: string | null;
          owner_id?: string;
          open_roles?: Json;
          size_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: {
          team_id: string;
          user_id: string;
          role?: "owner" | "member";
          created_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          created_at?: string;
        };
        Relationships: [];
      };
      join_requests: {
        Row: JoinRequestRow;
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          message?: string;
          status?: JoinRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          message?: string;
          status?: JoinRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: { Row: CompanyRow; Insert: Omit<CompanyRow, "id" | "created_at"> & { id?: string; created_at?: string }; Update: Partial<Omit<CompanyRow, "id" | "created_at">>; Relationships: [] };
      tasks: { Row: TaskRow; Insert: Omit<TaskRow, "id" | "created_at"> & { id?: string; created_at?: string }; Update: Partial<Omit<TaskRow, "id" | "created_at">>; Relationships: [] };
      submissions: { Row: SubmissionRow; Insert: Omit<SubmissionRow, "id" | "created_at" | "status" | "feedback" | "score"> & { id?: string; created_at?: string; status?: "submitted" | "reviewed"; feedback?: string | null; score?: number | null }; Update: Partial<SubmissionRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      handle_team_join_request: {
        Args: { p_request_id: string; p_decision: JoinRequestStatus };
        Returns: undefined;
      };
    };
    Enums: {
      idea_stage: IdeaStage;
      join_request_status: JoinRequestStatus;
      submission_status: "submitted" | "reviewed";
    };
    CompositeTypes: Record<string, never>;
  };
};
