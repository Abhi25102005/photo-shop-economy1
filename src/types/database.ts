export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: {
          id: string;
          title: string;
          subject: string;
          semester: number;
          branch: string;
          college: string;
          type: string;
          year: number;
          file_url: string;
          user_id: string;
          votes: number;
          downloads: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject: string;
          semester: number;
          branch: string;
          college: string;
          type: string;
          year: number;
          file_url: string;
          user_id: string;
          votes?: number;
          downloads?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subject?: string;
          semester?: number;
          branch?: string;
          college?: string;
          type?: string;
          year?: number;
          file_url?: string;
          user_id?: string;
          votes?: number;
          downloads?: number;
          created_at?: string;
        };
        Relationships: {
          foreignKeyName: string;
          columns: string[];
          referencedRelation: string;
          referencedColumns: string[];
        }[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Resource = Database['public']['Tables']['resources']['Row'];
