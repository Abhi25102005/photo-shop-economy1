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
      };
    };
  };
}

export type Resource = Database['public']['Tables']['resources']['Row'];
